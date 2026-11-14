const { getFromCache, setToCache } = require('../controllers/cache');

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const COINGECKO_LIST_URL = 'https://api.coingecko.com/api/v3/coins/list';
const COINGECKO_SEARCH_URL = 'https://api.coingecko.com/api/v3/search';
const COINGECKO_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price';
const BANXICO_FIX_URL = 'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno';
const FX_FALLBACK_URL = 'https://open.er-api.com/v6/latest/USD';

const QUOTE_TTL_SECONDS = 3600 * 12;
const FX_TTL_SECONDS = 3600 * 24;
const COINGECKO_LIST_TTL_SECONDS = 3600 * 24 * 7;

function mexicoTodayISO() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
}

function mexicoStartOfTodayISO() {
    const date = mexicoTodayISO();
    const probe = new Date(`${date}T18:00:00.000Z`);
    const tzName = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Mexico_City',
        timeZoneName: 'longOffset',
    }).formatToParts(probe).find((part) => part.type === 'timeZoneName')?.value || 'GMT-06:00';
    const offset = tzName.replace('GMT', '').replace('UTC', '') || '-06:00';
    return `${date}T00:00:00.000${offset}`;
}

function parseYahooSymbol(yahooUrl, symbol, font) {
    if (yahooUrl) {
        const fromUrl = yahooUrl.match(/\/quote\/([^/?#]+)/i);
        if (fromUrl?.[1]) {
            return decodeURIComponent(fromUrl[1]).replace(/\/$/, '');
        }
    }

    const raw = (symbol || '').trim();
    if (!raw) return null;

    const fontName = (font || '').toLowerCase();
    if (fontName.includes('crypto') || fontName.includes('cripto')) {
        const upper = raw.toUpperCase().replace(/\//g, '');
        if (upper.endsWith('-USD')) return upper;
        if (upper.endsWith('USD') && upper.length > 3) {
            return `${upper.slice(0, -3)}-USD`;
        }
        return `${upper}-USD`;
    }

    const compact = raw.replace(/\//g, '');
    if (fontName === 'bmv' || compact.toUpperCase().endsWith('.MX')) {
        return compact.toUpperCase().endsWith('.MX') ? compact.toUpperCase() : `${compact.toUpperCase()}.MX`;
    }

    return compact.toUpperCase();
}

function isCryptoFont(font) {
    const fontName = (font || '').toLowerCase();
    return fontName.includes('crypto') || fontName.includes('cripto');
}

function isCryptoAsset(font, sector) {
    return isCryptoFont(font) || isCryptoFont(sector);
}

function normalizeCoinSymbol(symbol) {
    let value = String(symbol || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    let previous = null;
    while (value && value !== previous) {
        previous = value;
        value = value.replace(/usd[tc]?$/, '');
    }
    return value;
}

const COINGECKO_SYMBOL_IDS = {
    btc: 'bitcoin',
    eth: 'ethereum',
    sol: 'solana',
    xrp: 'ripple',
    doge: 'dogecoin',
    ada: 'cardano',
    avax: 'avalanche-2',
    matic: 'matic-network',
    pol: 'polygon-ecosystem-token',
    link: 'chainlink',
    dot: 'polkadot',
    ltc: 'litecoin',
    bnb: 'binancecoin',
    atom: 'cosmos',
    near: 'near',
    uni: 'uniswap',
    aave: 'aave',
    shib: 'shiba-inu',
    trx: 'tron',
    etc: 'ethereum-classic',
    xlm: 'stellar',
    bch: 'bitcoin-cash',
    apt: 'aptos',
    arb: 'arbitrum',
    op: 'optimism',
    sui: 'sui',
    ton: 'the-open-network',
    hbar: 'hedera-hashgraph',
    icp: 'internet-computer',
    fil: 'filecoin',
    pepe: 'pepe',
};

function coinTickersFrom({ symbol, name, yahooSymbol }) {
    const fromName = (name || '').match(/\(([A-Za-z0-9._-]+)\)/);
    return [...new Set([
        normalizeCoinSymbol(symbol),
        normalizeCoinSymbol(yahooSymbol),
        normalizeCoinSymbol(fromName?.[1]),
    ].filter(Boolean))];
}

function canonicalCoinId(hints) {
    const tickers = coinTickersFrom(hints);
    return tickers.map((ticker) => COINGECKO_SYMBOL_IDS[ticker]).find(Boolean) || null;
}

function coinSearchQuery(hints) {
    const name = (hints.name || '').replace(/\([^)]*\)/g, ' ');
    const firstWord = name.split(/[\s/]+/).find((word) => word && !/^usd[tc]?$/i.test(word));
    return firstWord || coinTickersFrom(hints)[0] || hints.symbol || '';
}

function resolveCoinGeckoCoin(list, hints) {
    const canonicalId = canonicalCoinId(hints);
    if (canonicalId) {
        return list.find((coin) => coin.id === canonicalId) || { id: canonicalId };
    }

    const tickers = coinTickersFrom(hints);
    const nameHaystack = (hints.name || '').toLowerCase();
    const firstWord = nameHaystack.split(/[\s(/]+/).find((word) => word && word !== 'usd') || '';
    const matches = list.filter((coin) => tickers.includes(normalizeCoinSymbol(coin.symbol)));

    const named = matches.filter((coin) => {
        const coinName = (coin.name || '').toLowerCase();
        if (!coinName || coinName.length < 4) return false;
        return coinName === firstWord || nameHaystack.startsWith(coinName);
    });
    const pool = named.length ? named : matches;
    if (!pool.length) {
        const byId = list.find((coin) => tickers.includes(coin.id));
        if (byId) return byId;
        throw new Error(`Ambiguous CoinGecko match for ${tickers.join(',') || hints.symbol || 'unknown'}`);
    }

    pool.sort((a, b) => (a.market_cap_rank ?? Number.MAX_SAFE_INTEGER) - (b.market_cap_rank ?? Number.MAX_SAFE_INTEGER));
    return pool[0];
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: 'application/json',
            'User-Agent': 'banco-lalito/2.4.5',
            ...(options.headers || {}),
        },
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status} for ${url}: ${body.slice(0, 200)}`);
    }
    return response.json();
}

function normalizeQuoteCurrency(currency) {
    const ccy = String(currency || '').trim().toUpperCase();
    if (!ccy) return null;
    if (ccy === 'USDT' || ccy === 'USDC' || ccy === 'USD') return 'USD';
    if (ccy === 'MXP') return 'MXN';
    return ccy;
}

async function convertNativePriceToUsd(nativePrice, currency, fxRate) {
    const quoteCurrency = normalizeQuoteCurrency(currency) || 'USD';
    if (quoteCurrency === 'USD') {
        return {
            priceUsd: nativePrice,
            nativePrice,
            currency: 'USD',
            converted: false,
        };
    }
    if (quoteCurrency === 'MXN') {
        const rate = fxRate || (await getUsdMxn()).rate;
        if (!rate) {
            throw new Error('Cannot convert MXN to USD without an FX rate');
        }
        return {
            priceUsd: nativePrice / rate,
            nativePrice,
            currency: 'MXN',
            converted: true,
            fxRate: rate,
        };
    }
    throw new Error(`Unsupported quote currency ${quoteCurrency}; only USD and MXN can be stored in preu actual usd`);
}

async function getYahooQuote(yahooSymbol) {
    const payload = await fetchJson(
        `${YAHOO_CHART_URL}/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`
    );
    const meta = payload?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice ?? meta?.previousClose ?? meta?.chartPreviousClose;
    if (typeof price !== 'number' || Number.isNaN(price)) {
        throw new Error(`Yahoo did not return a price for ${yahooSymbol}`);
    }
    return {
        nativePrice: price,
        currency: normalizeQuoteCurrency(meta?.currency),
        symbol: meta?.symbol || yahooSymbol,
        exchangeName: meta?.exchangeName || null,
    };
}

async function getCoinGeckoList() {
    const cacheKey = 'bnc:coingecko:list';
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;
    const list = await fetchJson(COINGECKO_LIST_URL);
    const compact = (list || []).map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
    }));
    await setToCache(cacheKey, compact, COINGECKO_LIST_TTL_SECONDS);
    return compact;
}

async function searchCoinGecko(hints) {
    const query = coinSearchQuery(hints);
    if (!query) return [];
    const payload = await fetchJson(`${COINGECKO_SEARCH_URL}?query=${encodeURIComponent(query)}`);
    return payload?.coins || [];
}

async function getCoinGeckoPriceUsd(symbol, name, yahooSymbol) {
    const hints = { symbol, name, yahooSymbol };
    let coin = null;
    const canonicalId = canonicalCoinId(hints);
    if (canonicalId) {
        coin = { id: canonicalId };
    } else {
        try {
            coin = resolveCoinGeckoCoin(await searchCoinGecko(hints), hints);
        } catch (error) {
            const list = await getCoinGeckoList();
            coin = resolveCoinGeckoCoin(list, hints);
        }
    }
    if (!coin?.id) {
        throw new Error(`CoinGecko id not found for symbol ${symbol}`);
    }
    console.log(`CoinGecko ${symbol || name} -> ${coin.id}`);

    const payload = await fetchJson(
        `${COINGECKO_PRICE_URL}?ids=${encodeURIComponent(coin.id)}&vs_currencies=usd`
    );
    const price = payload?.[coin.id]?.usd;
    if (typeof price !== 'number') {
        throw new Error(`CoinGecko did not return a USD price for ${coin.id}`);
    }
    return {
        priceUsd: price,
        nativePrice: price,
        currency: 'USD',
        converted: false,
        source: 'coingecko',
        coinId: coin.id,
    };
}

function quoteFromCache(cached) {
    if (typeof cached === 'number') {
        return { priceUsd: cached, nativePrice: cached, currency: 'USD', converted: false, source: 'cache' };
    }
    if (cached && typeof cached.priceUsd === 'number') return cached;
    return null;
}

async function quoteFromYahoo(yahooSymbol) {
    const yahoo = await getYahooQuote(yahooSymbol);
    const inferredCurrency = yahoo.currency
        || (String(yahooSymbol).toUpperCase().endsWith('.MX') ? 'MXN' : null)
        || (/-USD$/i.test(yahooSymbol) ? 'USD' : null);
    const converted = await convertNativePriceToUsd(yahoo.nativePrice, inferredCurrency);
    return {
        ...converted,
        source: 'yahoo',
        yahooSymbol: yahoo.symbol,
        exchangeName: yahoo.exchangeName,
    };
}

async function getQuoteUsd({ font, sector, yahooUrl, symbol, name, force = false }) {
    const yahooSymbol = parseYahooSymbol(yahooUrl, symbol, font || sector);
    const cacheKey = `bnc:quote:${(yahooSymbol || symbol || name || 'unknown').toLowerCase()}`;
    if (!force) {
        const cached = quoteFromCache(await getFromCache(cacheKey));
        if (cached) return cached;
    }

    let quote;
    if (isCryptoAsset(font, sector)) {
        try {
            quote = await getCoinGeckoPriceUsd(symbol, name, yahooSymbol);
        } catch (error) {
            if (!yahooSymbol) throw error;
            quote = await quoteFromYahoo(yahooSymbol);
        }
    } else {
        if (!yahooSymbol) {
            throw new Error(`Cannot resolve a market symbol for ${name || symbol || 'unknown'}`);
        }
        quote = await quoteFromYahoo(yahooSymbol);
    }

    await setToCache(cacheKey, quote, QUOTE_TTL_SECONDS);
    return quote;
}

async function getUsdMxnFromBanxico() {
    const token = process.env.BANXICO_TOKEN;
    if (!token) {
        throw new Error('BANXICO_TOKEN is not set');
    }
    const payload = await fetchJson(BANXICO_FIX_URL, {
        headers: { 'Bmx-Token': token },
    });
    const raw = payload?.bmx?.series?.[0]?.datos?.[0]?.dato;
    const rate = Number(raw);
    if (!rate) {
        throw new Error('Banxico FIX rate was empty');
    }
    return rate;
}

async function getUsdMxnFallback() {
    const payload = await fetchJson(FX_FALLBACK_URL);
    const rate = payload?.rates?.MXN;
    if (typeof rate !== 'number') {
        throw new Error('Fallback FX API did not return USD/MXN');
    }
    return rate;
}

async function getUsdMxn() {
    const cacheKey = `bnc:fx:usdmxn:${mexicoTodayISO()}`;
    const cached = await getFromCache(cacheKey);
    if (cached && typeof cached.rate === 'number') return cached;

    let rate;
    let source = 'banxico';
    try {
        rate = await getUsdMxnFromBanxico();
    } catch (error) {
        console.warn('Banxico FX failed, using fallback:', error.message);
        rate = await getUsdMxnFallback();
        source = 'open.er-api.com';
    }

    const payload = { rate, source, date: mexicoTodayISO() };
    await setToCache(cacheKey, payload, FX_TTL_SECONDS);
    return payload;
}

module.exports = {
    mexicoTodayISO,
    mexicoStartOfTodayISO,
    parseYahooSymbol,
    isCryptoFont,
    isCryptoAsset,
    normalizeCoinSymbol,
    resolveCoinGeckoCoin,
    normalizeQuoteCurrency,
    convertNativePriceToUsd,
    getQuoteUsd,
    getUsdMxn,
};
