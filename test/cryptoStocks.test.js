const { parseYahooSymbol, isCryptoFont } = require('../src/backend/services/quotes');
const { mapWatchlistPage, mapInvestedPage, clampPageSize } = require('../src/backend/services/cryptoStocks');

describe('parseYahooSymbol', () => {
  test('reads ticker from Yahoo Finance URL', () => {
    expect(parseYahooSymbol(
      'https://es.finance.yahoo.com/quote/GMEXICOB.MX/',
      'GMEXICO/B',
      'BMV'
    )).toBe('GMEXICOB.MX');
  });

  test('builds BMV ticker from Notion symbol', () => {
    expect(parseYahooSymbol(null, 'GMEXICO/B', 'BMV')).toBe('GMEXICOB.MX');
  });

  test('builds crypto ticker as USD pair', () => {
    expect(parseYahooSymbol(null, 'BTC', 'crypto')).toBe('BTC-USD');
    expect(parseYahooSymbol(null, 'BTCUSD', 'crypto')).toBe('BTC-USD');
    expect(parseYahooSymbol(null, 'BTC-USD', 'crypto')).toBe('BTC-USD');
  });
});

describe('isCryptoFont', () => {
  test('detects crypto fonts', () => {
    expect(isCryptoFont('crypto')).toBe(true);
    expect(isCryptoFont('Criptomonedes')).toBe(true);
    expect(isCryptoFont('BMV')).toBe(false);
  });
});

describe('convertNativePriceToUsd', () => {
  const { convertNativePriceToUsd, normalizeQuoteCurrency } = require('../src/backend/services/quotes');

  test('treats Yahoo USD and stablecoins as USD', () => {
    expect(normalizeQuoteCurrency('usd')).toBe('USD');
    expect(normalizeQuoteCurrency('USDT')).toBe('USD');
  });

  test('keeps USD quotes unchanged', async () => {
    await expect(convertNativePriceToUsd(12.43, 'USD')).resolves.toMatchObject({
      priceUsd: 12.43,
      nativePrice: 12.43,
      currency: 'USD',
      converted: false,
    });
  });

  test('converts Yahoo MXN BMV prices with Banxico-style FIX', async () => {
    const converted = await convertNativePriceToUsd(216.39, 'MXN', 17.4);
    expect(converted.currency).toBe('MXN');
    expect(converted.converted).toBe(true);
    expect(converted.nativePrice).toBe(216.39);
    expect(converted.fxRate).toBe(17.4);
    expect(converted.priceUsd).toBeCloseTo(12.436206896551, 10);
  });

  test('rejects unknown currencies instead of writing them as USD', async () => {
    await expect(convertNativePriceToUsd(100, 'EUR')).rejects.toThrow(/Unsupported quote currency EUR/);
  });
});

describe('normalizeCoinSymbol', () => {
  const { normalizeCoinSymbol, isCryptoAsset } = require('../src/backend/services/quotes');

  test('strips USD pair suffixes', () => {
    expect(normalizeCoinSymbol('BTC-USD')).toBe('btc');
    expect(normalizeCoinSymbol('BTCUSD')).toBe('btc');
    expect(normalizeCoinSymbol('BTCUSD-USD')).toBe('btc');
    expect(normalizeCoinSymbol('ETH/USDT')).toBe('eth');
    expect(normalizeCoinSymbol('sol')).toBe('sol');
  });

  test('does not pick Batcat when resolving Bitcoin', () => {
    const { resolveCoinGeckoCoin } = require('../src/backend/services/quotes');
    const list = [
      { id: 'batcat', symbol: 'btc', name: 'Batcat' },
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
      { id: 'wrapped-bitcoin', symbol: 'wbtc', name: 'Wrapped Bitcoin' },
    ];
    expect(resolveCoinGeckoCoin(list, {
      symbol: 'BTCUSD',
      name: 'Bitcoin USD (BTC-USD)',
      yahooSymbol: 'BTC-USD',
    }).id).toBe('bitcoin');

    expect(resolveCoinGeckoCoin(
      [{ id: 'batcat', symbol: 'btc', name: 'Batcat', market_cap_rank: 4000 }],
      { symbol: 'BTCUSD', name: 'Bitcoin USD (BTC-USD)', yahooSymbol: 'BTC-USD' }
    ).id).toBe('bitcoin');
  });

  test('treats crypto sector as a crypto asset', () => {
    expect(isCryptoAsset('BMV', 'accions')).toBe(false);
    expect(isCryptoAsset('', 'cripto')).toBe(true);
  });
});

describe('page mappers', () => {
  test('maps watchlist Notion page', () => {
    const mapped = mapWatchlistPage({
      id: 'page-1',
      url: 'https://notion.so/page-1',
      last_edited_time: '2026-10-05T20:52:00.000Z',
      properties: {
        nom: { type: 'title', title: [{ plain_text: 'Grupo México' }] },
        símbol: { type: 'rich_text', rich_text: [{ plain_text: 'GMEXICO/B' }] },
        font: { type: 'select', select: { name: 'BMV' } },
        estat: { type: 'status', status: { name: 'comprada | oberta' } },
        sector: { type: 'select', select: { name: 'accions amb dividends' } },
        'preu actual usd': { type: 'number', number: 12.43 },
        'yahoo!finance': { type: 'url', url: 'https://es.finance.yahoo.com/quote/GMEXICOB.MX/' },
      },
    });

    expect(mapped).toMatchObject({
      id: 'page-1',
      name: 'Grupo México',
      symbol: 'GMEXICO/B',
      yahooSymbol: 'GMEXICOB.MX',
      priceUsd: 12.43,
      estat: 'comprada | oberta',
      font: 'BMV',
    });
  });

  test('maps invested Notion page including rollup price', () => {
    const mapped = mapInvestedPage({
      id: 'lot-1',
      url: 'https://notion.so/lot-1',
      last_edited_time: '2026-10-05T20:21:00.000Z',
      properties: {
        Name: { type: 'title', title: [{ plain_text: 'XXXV' }] },
        ID: { type: 'unique_id', unique_id: { prefix: 'CRY', number: 87 } },
        symbol: { type: 'select', select: { name: 'GMEXICO/B' } },
        '1$usd a $mx actual': { type: 'number', number: 17.4 },
        '1$usd a $mx compra': { type: 'number', number: 17.4 },
        'precio actual en $usd': {
          type: 'rollup',
          rollup: { type: 'array', array: [{ type: 'number', number: 12.43 }] },
        },
        'precio actual en mx': { type: 'formula', formula: { type: 'number', number: 216.39 } },
        'acciones en poseción': { type: 'number', number: 9.97 },
        done: { type: 'formula', formula: { type: 'boolean', boolean: false } },
        'stocks.watchlist.db': { relation: [{ id: 'watch-1' }] },
      },
    });

    expect(mapped).toMatchObject({
      id: 'lot-1',
      name: 'XXXV',
      uniqueId: 'CRY-87',
      symbol: 'GMEXICO/B',
      usdToMxActual: 17.4,
      priceUsd: 12.43,
      priceMx: 216.39,
      done: false,
      watchlistIds: ['watch-1'],
    });
  });
});

describe('clampPageSize', () => {
  test('defaults and caps page size', () => {
    expect(clampPageSize()).toBe(20);
    expect(clampPageSize('5')).toBe(5);
    expect(clampPageSize('999')).toBe(100);
  });
});

describe('invested ids', () => {
  const { isNotionUuid } = require('../src/backend/services/cryptoStocks');

  test('recognizes Notion page UUIDs', () => {
    expect(isNotionUuid('3a5a3d23-4992-8005-9aa3-dafbd0718f03')).toBe(true);
    expect(isNotionUuid('CRY-87')).toBe(false);
  });
});

describe('parseDailyCron', () => {
  const { parseDailyCron } = require('../src/backend/services/cryptoStocks');

  test('parses weekday close schedule', () => {
    expect(parseDailyCron('30 16 * * 1-5')).toEqual({
      minute: 30,
      hour: 16,
      weekdaysOnly: true,
    });
  });
});

describe('list filters', () => {
  const {
    buildWatchlistFilter,
    buildInvestedFilter,
    staleWatchlistFilter,
  } = require('../src/backend/services/cryptoStocks');
  const { mexicoStartOfTodayISO } = require('../src/backend/services/quotes');

  test('combines watchlist filters', () => {
    expect(buildWatchlistFilter({ sector: 'accions amb dividends', font: 'BMV', q: 'GME' })).toEqual({
      and: [
        { property: 'sector', select: { equals: 'accions amb dividends' } },
        { property: 'font', select: { equals: 'BMV' } },
        {
          or: [
            { property: 'símbol', rich_text: { contains: 'GME' } },
            { property: 'nom', title: { contains: 'GME' } },
          ],
        },
      ],
    });
  });

  test('filters open and closed invested lots', () => {
    expect(buildInvestedFilter({ open: 'true' })).toEqual({
      property: 'done',
      formula: { checkbox: { equals: false } },
    });
    expect(buildInvestedFilter({ open: 'false', symbol: 'GMEXICO/B' })).toEqual({
      and: [
        { property: 'symbol', select: { equals: 'GMEXICO/B' } },
        { property: 'done', formula: { checkbox: { equals: true } } },
      ],
    });
  });

  test('stale watchlist filter uses Mexico midnight', () => {
    const filter = staleWatchlistFilter();
    const edited = filter.or.find((clause) => clause.last_edited_time);
    expect(edited.last_edited_time.before).toBe(mexicoStartOfTodayISO());
  });
});
