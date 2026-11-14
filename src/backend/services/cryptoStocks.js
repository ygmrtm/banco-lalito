const { Client } = require('@notionhq/client');
const {
    getFromCache,
    setToCache,
    getCacheVersion,
    bumpCacheVersion,
} = require('../controllers/cache');
const { getQuoteUsd, getUsdMxn, mexicoTodayISO, mexicoStartOfTodayISO, parseYahooSymbol } = require('./quotes');
const { addNotionPageToDatabase } = require('../controllers/notion');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const LIST_TTL_SECONDS = 3600;
const NOTION_WRITE_DELAY_MS = 1500;

function watchlistDatabaseId() {
    return process.env.DATABASE_CSW_ID || process.env.DATABASE_TVW_ID || '';
}

function investedDatabaseId() {
    return process.env.DATABASE_CSI_ID || '';
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function textOf(property) {
    if (!property) return null;
    if (property.type === 'title') return property.title?.[0]?.plain_text || null;
    if (property.type === 'rich_text') return property.rich_text?.[0]?.plain_text || null;
    if (property.type === 'select') return property.select?.name || null;
    if (property.type === 'status') return property.status?.name || null;
    if (property.type === 'url') return property.url || null;
    if (property.type === 'formula') {
        if (property.formula?.type === 'string') return property.formula.string;
        if (property.formula?.type === 'number') return property.formula.number;
        if (property.formula?.type === 'boolean') return property.formula.boolean;
        return null;
    }
    if (property.type === 'unique_id') {
        const prefix = property.unique_id?.prefix || '';
        const number = property.unique_id?.number;
        return number == null ? null : `${prefix}${prefix ? '-' : ''}${number}`;
    }
    return null;
}

function numberOf(property) {
    if (!property) return null;
    if (property.type === 'number') return property.number;
    if (property.type === 'formula' && property.formula?.type === 'number') {
        return property.formula.number;
    }
    if (property.type === 'rollup') {
        if (property.rollup?.type === 'number') return property.rollup.number;
        if (property.rollup?.type === 'array') {
            const first = property.rollup.array?.[0];
            if (typeof first === 'number') return first;
            if (first?.type === 'number') return first.number;
            if (first?.number != null) return first.number;
        }
    }
    return null;
}

function mapWatchlistPage(page) {
    const properties = page.properties || {};
    const symbol = textOf(properties['símbol']);
    const font = textOf(properties.font);
    const yahooUrl = textOf(properties['yahoo!finance']);
    return {
        id: page.id,
        name: textOf(properties.nom),
        symbol,
        yahooSymbol: parseYahooSymbol(yahooUrl, symbol, font),
        priceUsd: numberOf(properties['preu actual usd']),
        estat: textOf(properties.estat),
        sector: textOf(properties.sector),
        font,
        yahooFinance: yahooUrl,
        lastEditedTime: page.last_edited_time,
        url: page.url,
    };
}

function mapInvestedPage(page) {
    const properties = page.properties || {};
    return {
        id: page.id,
        name: textOf(properties.Name),
        uniqueId: textOf(properties.ID),
        symbol: textOf(properties.symbol),
        usdToMxActual: numberOf(properties['1$usd a $mx actual']),
        usdToMxCompra: numberOf(properties['1$usd a $mx compra']),
        priceUsd: numberOf(properties['precio actual en $usd']),
        priceMx: numberOf(properties['precio actual en mx']),
        shares: numberOf(properties['acciones en poseción']),
        done: textOf(properties.done),
        lastEditedTime: page.last_edited_time,
        url: page.url,
        watchlistIds: (properties['stocks.watchlist.db']?.relation || []).map((item) => item.id),
    };
}

function clampPageSize(value) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return 20;
    return Math.min(Math.max(parsed, 1), 100);
}

function buildWatchlistFilter({ sector, estat, font, q }) {
    const and = [];
    if (sector) and.push({ property: 'sector', select: { equals: sector } });
    if (estat) and.push({ property: 'estat', status: { equals: estat } });
    if (font) and.push({ property: 'font', select: { equals: font } });
    if (q) {
        and.push({
            or: [
                { property: 'símbol', rich_text: { contains: q } },
                { property: 'nom', title: { contains: q } },
            ],
        });
    }
    if (and.length === 0) return undefined;
    return and.length === 1 ? and[0] : { and };
}

function buildInvestedFilter({ symbol, open, q }) {
    const and = [];
    if (symbol) and.push({ property: 'symbol', select: { equals: symbol } });
    if (open === 'true' || open === true) {
        and.push({ property: 'done', formula: { checkbox: { equals: false } } });
    } else if (open === 'false' || open === false) {
        and.push({ property: 'done', formula: { checkbox: { equals: true } } });
    }
    if (q) and.push({ property: 'Name', title: { contains: q } });
    if (and.length === 0) return undefined;
    return and.length === 1 ? and[0] : { and };
}

async function queryDatabasePage({ databaseId, filter, sorts, cursor, pageSize }) {
    const query = {
        database_id: databaseId,
        page_size: pageSize,
    };
    if (filter) query.filter = filter;
    if (sorts) query.sorts = sorts;
    if (cursor) query.start_cursor = cursor;
    return notion.databases.query(query);
}

async function queryAllPages(databaseId, filter, sorts) {
    const results = [];
    let cursor;
    do {
        const response = await queryDatabasePage({
            databaseId,
            filter,
            sorts,
            cursor,
            pageSize: 100,
        });
        results.push(...response.results);
        cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);
    return results;
}

async function listWatchlist({ sector, estat, font, q, cursor, pageSize }) {
    const databaseId = watchlistDatabaseId();
    if (!databaseId) throw new Error('DATABASE_CSW_ID or DATABASE_TVW_ID is required');

    const version = await getCacheVersion('csw');
    const cacheKey = `bnc:csw:${version}:list:${sector || ''}:${estat || ''}:${font || ''}:${q || ''}:${cursor || ''}:${pageSize}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    const response = await queryDatabasePage({
        databaseId,
        filter: buildWatchlistFilter({ sector, estat, font, q }),
        sorts: [{ property: 'nom', direction: 'ascending' }],
        cursor,
        pageSize,
    });

    const payload = {
        results: response.results.map(mapWatchlistPage),
        has_more: Boolean(response.has_more),
        next_cursor: response.next_cursor || null,
    };
    await setToCache(cacheKey, payload, LIST_TTL_SECONDS);
    return payload;
}

async function listInvested({ symbol, open, q, cursor, pageSize }) {
    const databaseId = investedDatabaseId();
    if (!databaseId) throw new Error('DATABASE_CSI_ID is required');

    const version = await getCacheVersion('csi');
    const cacheKey = `bnc:csi:${version}:list:${symbol || ''}:${open || ''}:${q || ''}:${cursor || ''}:${pageSize}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    const response = await queryDatabasePage({
        databaseId,
        filter: buildInvestedFilter({ symbol, open, q }),
        sorts: [{ property: 'Ultima Actualización', direction: 'descending' }],
        cursor,
        pageSize,
    });

    const payload = {
        results: response.results.map(mapInvestedPage),
        has_more: Boolean(response.has_more),
        next_cursor: response.next_cursor || null,
    };
    await setToCache(cacheKey, payload, LIST_TTL_SECONDS);
    return payload;
}

async function refreshWatchlistById(pageId, options = {}) {
    const bumpCache = options.bumpCache !== false;
    const page = await notion.pages.retrieve({ page_id: pageId });
    const mapped = mapWatchlistPage(page);
    const previousPrice = mapped.priceUsd;
    const quote = await getQuoteUsd({
        font: mapped.font,
        sector: mapped.sector,
        yahooUrl: mapped.yahooFinance,
        symbol: mapped.symbol,
        name: mapped.name,
        force: options.force !== false,
    });
    const priceUsd = quote.priceUsd;

    await notion.pages.update({
        page_id: pageId,
        properties: {
            'preu actual usd': { number: priceUsd },
        },
    });
    if (bumpCache) {
        await bumpCacheVersion('csw');
        await bumpCacheVersion('csi');
    }

    return {
        id: pageId,
        symbol: mapped.symbol,
        name: mapped.name,
        previousPriceUsd: previousPrice,
        priceUsd,
        nativePrice: quote.nativePrice,
        currency: quote.currency,
        converted: quote.converted,
        fxRate: quote.fxRate || null,
        source: quote.source,
        coinId: quote.coinId || null,
        yahooSymbol: quote.yahooSymbol || mapped.yahooSymbol || null,
    };
}

function isNotionUuid(value) {
    return /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(String(value || ''));
}

async function resolveInvestedPageId(idOrUnique) {
    if (!idOrUnique) throw new Error('id is required');
    if (isNotionUuid(idOrUnique)) return idOrUnique;

    const match = String(idOrUnique).match(/^([A-Za-z]+)-?(\d+)$/);
    if (!match || !investedDatabaseId()) {
        return idOrUnique;
    }

    const response = await queryDatabasePage({
        databaseId: investedDatabaseId(),
        filter: { property: 'ID', unique_id: { equals: Number(match[2]) } },
        pageSize: 5,
    });
    const prefix = match[1].toUpperCase();
    const page = response.results.find((item) => {
        const uniqueId = textOf(item.properties?.ID) || '';
        return uniqueId.toUpperCase().startsWith(prefix);
    }) || response.results[0];

    if (!page) {
        throw new Error(`Invested page ${idOrUnique} not found`);
    }
    return page.id;
}

async function refreshInvestedById(pageId, usdMxn, options = {}) {
    const resolvedId = await resolveInvestedPageId(pageId);
    const page = await notion.pages.retrieve({ page_id: resolvedId });
    const mapped = mapInvestedPage(page);
    const fx = usdMxn || await getUsdMxn();
    const rate = typeof fx === 'number' ? fx : fx.rate;

    const bumpCache = options.bumpCache !== false;
    const watchlistIds = mapped.watchlistIds?.length
        ? mapped.watchlistIds
        : await findWatchlistIdsBySymbol(mapped.symbol);
    const properties = {
        '1$usd a $mx actual': { number: rate },
    };
    if (!mapped.watchlistIds?.length && watchlistIds.length) {
        properties['stocks.watchlist.db'] = { relation: watchlistIds.map((id) => ({ id })) };
    }
    await notion.pages.update({
        page_id: resolvedId,
        properties,
    });
    if (bumpCache) {
        await bumpCacheVersion('csi');
    }

    return {
        id: resolvedId,
        name: mapped.name,
        symbol: mapped.symbol,
        previousUsdToMx: mapped.usdToMxActual,
        usdToMxActual: rate,
        fxSource: typeof fx === 'object' ? fx.source : 'provided',
        watchlistIds,
    };
}

async function findWatchlistIdsBySymbol(symbol) {
    if (!symbol || !watchlistDatabaseId()) return [];
    const response = await queryDatabasePage({
        databaseId: watchlistDatabaseId(),
        filter: { property: 'símbol', rich_text: { equals: symbol } },
        pageSize: 1,
    });
    return response.results?.[0]?.id ? [response.results[0].id] : [];
}

function staleWatchlistFilter() {
    const startOfToday = mexicoStartOfTodayISO();
    return {
        or: [
            { property: 'estat', status: { equals: 'comprada | oberta' } },
            { property: 'estat', status: { equals: 'si en GBM+' } },
            { property: 'preu actual usd', number: { is_empty: true } },
            {
                timestamp: 'last_edited_time',
                last_edited_time: { before: startOfToday },
            },
        ],
    };
}

async function saveDailyReport(report) {
    const lines = [
        `FIX USD/MXN ${report.fx.rate} (${report.fx.source})`,
        `Watchlist actualitzats: ${report.watchlist.updated.length}`,
        `Watchlist errors: ${report.watchlist.failed.length}`,
        `Lots oberts actualitzats: ${report.invested.updated.length}`,
        `Lots oberts errors: ${report.invested.failed.length}`,
        ...report.watchlist.updated.map((item) => `📈 ${item.symbol}: ${item.previousPriceUsd} → ${item.priceUsd}`),
        ...report.watchlist.failed.map((item) => `⚠️ ${item.symbol || item.id}: ${item.error}`),
        ...report.invested.updated.map((item) => `💱 ${item.name}: ${item.previousUsdToMx} → ${item.usdToMxActual}`),
        ...report.invested.failed.map((item) => `⚠️ ${item.name || item.id}: ${item.error}`),
    ];
    const content = lines.join('\n').slice(0, 1999);
    const subject = `📈 Cierre de mercados ${report.date}`;

    if (process.env.DATABASE_NOT_ID) {
        const properties = {
            subject: { title: [{ text: { content: subject } }] },
            props: { rich_text: [{ text: { content: JSON.stringify({
                date: report.date,
                fx: report.fx,
                watchlistUpdated: report.watchlist.updated.length,
                watchlistFailed: report.watchlist.failed.length,
                investedUpdated: report.invested.updated.length,
                investedFailed: report.invested.failed.length,
            }) } }] },
            is_read: { checkbox: false },
            notification_type: { select: { name: 'email' } },
            send_date: { date: { start: report.date } },
            email_content: { rich_text: [{ text: { content } }] },
        };
        try {
            await addNotionPageToDatabase(process.env.DATABASE_NOT_ID, properties, 1);
        } catch (error) {
            console.error('Could not store daily close report in notifications DB:', error.message);
        }
    }

    if (process.env.BLOCK_STOC_LOG) {
        try {
            const heading = await notion.blocks.children.append({
                block_id: process.env.BLOCK_STOC_LOG,
                children: [
                    {
                        type: 'heading_3',
                        heading_3: {
                            rich_text: [{ type: 'text', text: { content: subject } }],
                            is_toggleable: true,
                        },
                    },
                ],
            });
            const headingId = heading.results?.[0]?.id;
            if (headingId) {
                await notion.blocks.children.append({
                    block_id: headingId,
                    children: [
                        {
                            type: 'paragraph',
                            paragraph: {
                                rich_text: [{ type: 'text', text: { content } }],
                            },
                        },
                    ],
                });
            }
        } catch (error) {
            console.error('Could not append daily close report to Moon Log:', error.message);
        }
    }

    return { subject, content };
}

async function runDailyClose() {
    if (!watchlistDatabaseId()) {
        throw new Error('DATABASE_CSW_ID or DATABASE_TVW_ID is required');
    }
    if (!investedDatabaseId()) {
        throw new Error('DATABASE_CSI_ID is required');
    }

    const date = mexicoTodayISO();
    const report = {
        date,
        fx: { rate: null, source: null },
        watchlist: { updated: [], failed: [] },
        invested: { updated: [], failed: [] },
    };

    report.fx = await getUsdMxn();

    const staleWatchlist = await queryAllPages(
        watchlistDatabaseId(),
        staleWatchlistFilter(),
        [{ timestamp: 'last_edited_time', direction: 'ascending' }]
    );
    for (const page of staleWatchlist) {
        const mapped = mapWatchlistPage(page);
        try {
            const updated = await refreshWatchlistById(page.id, { bumpCache: false });
            report.watchlist.updated.push(updated);
            await sleep(NOTION_WRITE_DELAY_MS);
        } catch (error) {
            report.watchlist.failed.push({
                id: page.id,
                symbol: mapped.symbol,
                name: mapped.name,
                error: error.message,
            });
        }
    }

    const openInvested = await queryAllPages(
        investedDatabaseId(),
        { property: 'done', formula: { checkbox: { equals: false } } },
        [{ property: 'Ultima Actualización', direction: 'ascending' }]
    );
    for (const page of openInvested) {
        const mapped = mapInvestedPage(page);
        try {
            const updated = await refreshInvestedById(page.id, report.fx, { bumpCache: false });
            report.invested.updated.push(updated);
            await sleep(NOTION_WRITE_DELAY_MS);
        } catch (error) {
            report.invested.failed.push({
                id: page.id,
                name: mapped.name,
                symbol: mapped.symbol,
                error: error.message,
            });
        }
    }

    await bumpCacheVersion('csw');
    await bumpCacheVersion('csi');
    report.notification = await saveDailyReport(report);
    return report;
}

function parseDailyCron(expression) {
    const raw = expression || '30 16 * * 1-5';
    const [minute, hour, , , dow] = raw.trim().split(/\s+/);
    return {
        minute: Number(minute),
        hour: Number(hour),
        weekdaysOnly: !dow || dow === '1-5',
    };
}

function startDailyCloseScheduler() {
    if (process.env.NODE_ENV === 'test' || process.env.CRYPTO_STOCKS_CRON === 'false') {
        console.log('Crypto/stocks cron disabled');
        return;
    }
    const timezone = process.env.CRYPTO_STOCKS_CRON_TZ || 'America/Mexico_City';
    const { minute, hour, weekdaysOnly } = parseDailyCron(process.env.CRYPTO_STOCKS_CRON);
    let lastRunDate = null;

    setInterval(async () => {
        const dateKey = new Date().toLocaleDateString('en-CA', { timeZone: timezone });
        const parts = Object.fromEntries(
            new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23',
            }).formatToParts(new Date()).map((part) => [part.type, part.value])
        );
        const isWeekend = parts.weekday === 'Sat' || parts.weekday === 'Sun';
        if (weekdaysOnly && isWeekend) return;
        if (Number(parts.hour) !== hour || Number(parts.minute) !== minute) return;
        if (lastRunDate === dateKey) return;

        lastRunDate = dateKey;
        console.log('Running crypto/stocks daily close job');
        try {
            const report = await runDailyClose();
            console.log('Daily close finished', {
                watchlist: report.watchlist.updated.length,
                invested: report.invested.updated.length,
                failed: report.watchlist.failed.length + report.invested.failed.length,
            });
        } catch (error) {
            console.error('Daily close job failed:', error);
        }
    }, 30 * 1000);

    console.log(`Crypto/stocks cron scheduled: ${hour}:${String(minute).padStart(2, '0')} ${timezone}${weekdaysOnly ? ' weekdays' : ''}`);
}

module.exports = {
    mapWatchlistPage,
    mapInvestedPage,
    listWatchlist,
    listInvested,
    refreshWatchlistById,
    refreshInvestedById,
    runDailyClose,
    clampPageSize,
    startDailyCloseScheduler,
    parseDailyCron,
    buildWatchlistFilter,
    buildInvestedFilter,
    staleWatchlistFilter,
    resolveInvestedPageId,
    isNotionUuid,
};
