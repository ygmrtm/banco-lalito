// TradingView Widget Functions
// This file contains all TradingView-related functionality

// Template strings for each sector
const templates = {
    stocks: `<!DOCTYPE html>
    <html data-pagefind-ignore=all data-theme=light lang=en>
        <head>
            <meta charset=UTF-8>
            <meta content="width=device-width,initial-scale=1" name=viewport>
                <title>Banc Lalito 🍂 | Stocks | Informació</title>
                <link rel="icon" href="/public/front-end/images/favicon.ico">
                <style>
                :root .stvb-brand[data-astro-cid-pkzv2hgs]{--stvb-color:#2962ff;--stvb-color-hover:#1e53e5;--stvb-color-active:#1848cc;--stvb-color-text:#fff;--stvb-color-hover-text:#fff;--stvb-color-active-text:#fff}:root .stvb-black[data-astro-cid-pkzv2hgs]{--stvb-color:#131722;--stvb-color-hover:#2a2e39;--stvb-color-active:#434651;--stvb-color-text:#fff;--stvb-color-hover-text:#fff;--stvb-color-active-text:#fff}:root[data-theme=dark] .stvb-black[data-astro-cid-pkzv2hgs]{--stvb-color:#fff;--stvb-color-hover:#f0f3fa;--stvb-color-active:#d1d4dc;--stvb-color-text:#131722;--stvb-color-hover-text:#131722;--stvb-color-active-text:#131722}:root .stvb-gray[data-astro-cid-pkzv2hgs]{--stvb-color:#f0f3fa;--stvb-color-hover:#e0e3eb;--stvb-color-active:#d1d4dc;--stvb-color-text:#131722;--stvb-color-hover-text:#131722;--stvb-color-active-text:#131722}:root .stvb-gray[data-astro-cid-pkzv2hgs].stvb-secondary{--stvb-color:#e0e3eb;--stvb-color-hover:#f0f3fa;--stvb-color-active:#e0e3eb}:root[data-theme=dark] .stvb-gray[data-astro-cid-pkzv2hgs]{--stvb-color:#2a2e39;--stvb-color-hover:#363a45;--stvb-color-active:#434651;--stvb-color-text:#fff;--stvb-color-hover-text:#fff;--stvb-color-active-text:#fff}:root[data-theme=dark] .stvb-gray[data-astro-cid-pkzv2hgs].stvb-secondary{--stvb-color:#434651;--stvb-color-hover:#2a2e39;--stvb-color-active:#363a45;--stvb-color-text:#d1d4dc}.stvb-base[data-astro-cid-pkzv2hgs]{display:inline-flex;flex-direction:row;align-items:center;font-style:normal;font-size:16px;line-height:24px}.stvb-base[data-astro-cid-pkzv2hgs]:focus-visible{outline-color:var(--tv-blue-500);outline-width:2px;outline-offset:4px}button[data-astro-cid-pkzv2hgs].stvb-base{border:none}.stvb-icon[data-astro-cid-pkzv2hgs]{--arrow-fill-color:var(--stvb-color-text)}.stvb-icon-force-color[data-astro-cid-pkzv2hgs]{color:var(--stvb-color-text)!important}.stvb-force-no-border[data-astro-cid-pkzv2hgs]{border:none!important}.stvb-small[data-astro-cid-pkzv2hgs]{height:34px;border-radius:6px;padding-inline:12px;font-weight:400;letter-spacing:-.317px}.stvb-medium[data-astro-cid-pkzv2hgs]{height:40px;border-radius:8px;padding-inline:16px;font-weight:510;letter-spacing:-.32px}.stvb-primary[data-astro-cid-pkzv2hgs]{background-color:var(--stvb-color);color:var(--stvb-color-text)}.stvb-secondary[data-astro-cid-pkzv2hgs]{background-color:transparent;color:var(--stvb-color)}.stvb-secondary[data-astro-cid-pkzv2hgs],button[data-astro-cid-pkzv2hgs].stvb-base.stvb-secondary{border-style:solid;border-width:1px;border-color:var(--stvb-color)}.stvb-primary[data-astro-cid-pkzv2hgs]:hover,.stvb-secondary[data-astro-cid-pkzv2hgs]:hover{color:var(--stvb-color-hover-text);background-color:var(--stvb-color-hover)}.stvb-primary[data-astro-cid-pkzv2hgs]:active,.stvb-secondary[data-astro-cid-pkzv2hgs]:active{color:var(--stvb-color-active-text);background-color:var(--stvb-color-active)}.stvb-base[data-astro-cid-pkzv2hgs].stvb-icon.stvb-medium{padding:6px}.stvb-base[data-astro-cid-pkzv2hgs].stvb-icon.stvb-small{padding:3px}.stvb-pointer[data-astro-cid-pkzv2hgs]{cursor:pointer}*,:after,:before{box-sizing:border-box}*{margin:0}body{line-height:1.5;-webkit-font-smoothing:antialiased}canvas,img,picture,svg,video{display:block;max-width:100%}button,input,select,textarea{font:inherit}h1,h2,h3,h4,h5,h6,p{overflow-wrap:break-word}#__next,#root{isolation:isolate}a{text-decoration:none}header[data-astro-cid-rafkve5z]{display:flex;width:100%;align-items:center;border-bottom:1px solid #e0e3eb;justify-content:space-between;padding:8px var(--gap-size);flex-direction:row;z-index:1}:root[data-theme=dark] header[data-astro-cid-rafkve5z]{border-bottom:1px solid #2a2e39}:root{--gap-size:32px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,Trebuchet MS,Roboto,Ubuntu,sans-serif;color:#000}:root[data-theme=dark]{color:#fff}*{box-sizing:border-box}body{margin:0;padding:0;display:flex;flex-direction:column;align-items:center;background:#fff}:root[data-theme=dark] body{background:#000}#powered-by-tv p{margin:0;font-size:12px;color:#0009}:root[data-theme=dark] #powered-by-tv p{color:#fff9}main{display:grid;width:100%;padding:0 calc(var(--gap-size) * .5);max-width:960px;grid-template-columns:1fr 1fr;grid-gap:var(--gap-size);margin-bottom:24px}#advanced-chart,#company-profile,#fundamental-data,#symbol-info,.span-full-grid{grid-column:span 2}#powered-by-tv,#technical-analysis,#top-stories,.span-one-column{grid-column:span 1}#advanced-chart{height:500px}#company-profile{height:390px}#fundamental-data{height:775px}#technical-analysis{height:425px}#top-stories{height:600px}#powered-by-tv{display:flex;background:#f8f9fd;border:solid 1px #e0e3eb;text-align:justify;flex-direction:column;gap:8px;font-size:14px;padding:16px;border-radius:6px}:root[data-theme=dark] #powered-by-tv svg{filter:invert()}:root[data-theme=dark] #powered-by-tv{background:#0c0e15;border:solid 1px #1e222d}#powered-by-tv a,#powered-by-tv a:visited{color:#2962ff}@media (max-width:800px){#powered-by-tv,#technical-analysis,#top-stories,.span-full-grid,main>section{grid-column:span 2}}
                </style>
            </head>
            <body>
                <style>
                #advanced-chart,#company-profile,#fundamental-data,#symbol-info,.span-full-grid{grid-column:span 2}#technical-analysis,#top-stories,.span-one-column{grid-column:span 1}#advanced-chart{height:500px}#company-profile{height:390px}#fundamental-data{height:775px}#technical-analysis{height:425px}#top-stories{height:600px}@media (max-width:800px){#technical-analysis,#top-stories,.span-full-grid,main>section{grid-column:span 2}}
                </style>
                <main>
                <section id=symbol-info>
                    <div class=tradingview-widget-container>
                    <div class=tradingview-widget-container__widget>
                    </div>
                    <script src=https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js async>
                        { "symbol": "{{SYMBOL}}", "width": "100%", "locale": "en", "colorTheme": "light", "isTransparent": true }
                    </script>
                    </div>
                </section>
                <section id=advanced-chart>
                    <div class=tradingview-widget-container style=height:100%;width:100%>
                    <div style="height:calc(100% - 32px);width:100%" id=tradingview_ae7da>
                    </div>
                    <script src=https://s3.tradingview.com/tv.js>
                    </script>
                    <script>
                        new TradingView.widget({autosize:!0,symbol:"{{SYMBOL}}",interval:"D",timezone:"Etc/UTC",theme:"light",style:"1",locale:"en",hide_side_toolbar:!1,allow_symbol_change:!0,studies:["STD;MACD"],container_id:"tradingview_ae7da"})
                    </script>
                    </div>
                </section>
                <section id=company-profile>
                    <div class=tradingview-widget-container>
                    <div class=tradingview-widget-container__widget>
                    </div>
                    <script src=https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js async>
                        { "width": "100%", "height": "100%", "colorTheme": "light", "isTransparent": true, "symbol": "{{SYMBOL}}", "locale": "en" }
                    </script>
                    </div>
                </section>
                <section id=fundamental-data>
                    <div class=tradingview-widget-container>
                    <div class=tradingview-widget-container__widget>
                    </div>
                    <script src=https://s3.tradingview.com/external-embedding/embed-widget-financials.js async>
                        { "colorTheme": "light", "isTransparent": true, "largeChartUrl": "", "displayMode": "regular", "width": "100%", "height": 775, "symbol": "{{SYMBOL}}", "locale": "en" }
                    </script>
                    </div>
                </section>
                <section id=technical-analysis>
                    <div class=tradingview-widget-container>
                    <div class=tradingview-widget-container__widget>
                    </div>
                    <script src=https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js async>
                        { "interval": "15m", "width": "100%", "isTransparent": true, "height": "100%", "symbol": "{{SYMBOL}}", "showIntervalTabs": true, "displayMode": "single", "locale": "en", "colorTheme": "light" }
                    </script>
                    </div>
                </section>
                <section id=top-stories>
                    <div class=tradingview-widget-container>
                    <div class=tradingview-widget-container__widget>
                    </div>
                    <script src=https://s3.tradingview.com/external-embedding/embed-widget-timeline.js async>
                        { "feedMode": "symbol", "symbol": "{{SYMBOL}}", "colorTheme": "light", "isTransparent": true, "displayMode": "regular", "width": "100%", "height": 600, "locale": "en" }
                    </script>
                    </div>
                </section>
                </main>
            </body>
    </html>`,
    crypto: `<!DOCTYPE html>
    <html data-pagefind-ignore=all data-theme=light lang=en>
    <head>
        <meta charset=UTF-8>
        <meta content="width=device-width,initial-scale=1" name=viewport>
            <title>Banc Lalito 🍂 | Crypto | Informació</title>
            <link rel="icon" href="/public/front-end/images/favicon.ico">
            <style>
            :root .stvb-brand[data-astro-cid-pkzv2hgs]{--stvb-color:#2962ff;--stvb-color-hover:#1e53e5;--stvb-color-active:#1848cc;--stvb-color-text:#fff;--stvb-color-hover-text:#fff;--stvb-color-active-text:#fff}:root .stvb-black[data-astro-cid-pkzv2hgs]{--stvb-color:#131722;--stvb-color-hover:#2a2e39;--stvb-color-active:#434651;--stvb-color-text:#fff;--stvb-color-hover-text:#fff;--stvb-color-active-text:#fff}:root[data-theme=dark] .stvb-black[data-astro-cid-pkzv2hgs]{--stvb-color:#fff;--stvb-color-hover:#f0f3fa;--stvb-color-active:#d1d4dc;--stvb-color-text:#131722;--stvb-color-hover-text:#131722;--stvb-color-active-text:#131722}:root .stvb-gray[data-astro-cid-pkzv2hgs]{--stvb-color:#f0f3fa;--stvb-color-hover:#e0e3eb;--stvb-color-active:#d1d4dc;--stvb-color-text:#131722;--stvb-color-hover-text:#131722;--stvb-color-active-text:#131722}:root .stvb-gray[data-astro-cid-pkzv2hgs].stvb-secondary{--stvb-color:#e0e3eb;--stvb-color-hover:#f0f3fa;--stvb-color-active:#e0e3eb}:root[data-theme=dark] .stvb-gray[data-astro-cid-pkzv2hgs]{--stvb-color:#2a2e39;--stvb-color-hover:#363a45;--stvb-color-active:#434651;--stvb-color-text:#fff;--stvb-color-hover-text:#fff;--stvb-color-active-text:#fff}:root[data-theme=dark] .stvb-gray[data-astro-cid-pkzv2hgs].stvb-secondary{--stvb-color:#434651;--stvb-color-hover:#2a2e39;--stvb-color-active:#363a45;--stvb-color-text:#d1d4dc}.stvb-base[data-astro-cid-pkzv2hgs]{display:inline-flex;flex-direction:row;align-items:center;font-style:normal;font-size:16px;line-height:24px}.stvb-base[data-astro-cid-pkzv2hgs]:focus-visible{outline-color:var(--tv-blue-500);outline-width:2px;outline-offset:4px}button[data-astro-cid-pkzv2hgs].stvb-base{border:none}.stvb-icon[data-astro-cid-pkzv2hgs]{--arrow-fill-color:var(--stvb-color-text)}.stvb-icon-force-color[data-astro-cid-pkzv2hgs]{color:var(--stvb-color-text)!important}.stvb-force-no-border[data-astro-cid-pkzv2hgs]{border:none!important}.stvb-small[data-astro-cid-pkzv2hgs]{height:34px;border-radius:6px;padding-inline:12px;font-weight:400;letter-spacing:-.317px}.stvb-medium[data-astro-cid-pkzv2hgs]{height:40px;border-radius:8px;padding-inline:16px;font-weight:510;letter-spacing:-.32px}.stvb-primary[data-astro-cid-pkzv2hgs]{background-color:var(--stvb-color);color:var(--stvb-color-text)}.stvb-secondary[data-astro-cid-pkzv2hgs]{background-color:transparent;color:var(--stvb-color)}.stvb-secondary[data-astro-cid-pkzv2hgs],button[data-astro-cid-pkzv2hgs].stvb-base.stvb-secondary{border-style:solid;border-width:1px;border-color:var(--stvb-color)}.stvb-primary[data-astro-cid-pkzv2hgs]:hover,.stvb-secondary[data-astro-cid-pkzv2hgs]:hover{color:var(--stvb-color-hover-text);background-color:var(--stvb-color-hover)}.stvb-primary[data-astro-cid-pkzv2hgs]:active,.stvb-secondary[data-astro-cid-pkzv2hgs]:active{color:var(--stvb-color-active-text);background-color:var(--stvb-color-active)}.stvb-base[data-astro-cid-pkzv2hgs].stvb-icon.stvb-medium{padding:6px}.stvb-base[data-astro-cid-pkzv2hgs].stvb-icon.stvb-small{padding:3px}.stvb-pointer[data-astro-cid-pkzv2hgs]{cursor:pointer}*,:after,:before{box-sizing:border-box}*{margin:0}body{line-height:1.5;-webkit-font-smoothing:antialiased}canvas,img,picture,svg,video{display:block;max-width:100%}button,input,select,textarea{font:inherit}h1,h2,h3,h4,h5,h6,p{overflow-wrap:break-word}#__next,#root{isolation:isolate}a{text-decoration:none}header[data-astro-cid-rafkve5z]{display:flex;width:100%;align-items:center;border-bottom:1px solid #e0e3eb;justify-content:space-between;padding:8px var(--gap-size);flex-direction:row;z-index:1}:root[data-theme=dark] header[data-astro-cid-rafkve5z]{border-bottom:1px solid #2a2e39}:root{--gap-size:32px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,Trebuchet MS,Roboto,Ubuntu,sans-serif;color:#000}:root[data-theme=dark]{color:#fff}*{box-sizing:border-box}body{margin:0;padding:0;display:flex;flex-direction:column;align-items:center;background:#fff}:root[data-theme=dark] body{background:#000}#powered-by-tv p{margin:0;font-size:12px;color:#0009}:root[data-theme=dark] #powered-by-tv p{color:#fff9}main{display:grid;width:100%;padding:0 calc(var(--gap-size) * .5);max-width:960px;grid-template-columns:1fr 1fr;grid-gap:var(--gap-size);margin-bottom:24px}#advanced-chart,#company-profile,#fundamental-data,#symbol-info,.span-full-grid{grid-column:span 2}#powered-by-tv,#technical-analysis,#top-stories,.span-one-column{grid-column:span 1}#advanced-chart{height:500px}#company-profile{height:390px}#fundamental-data{height:775px}#technical-analysis{height:425px}#top-stories{height:600px}#powered-by-tv{display:flex;background:#f8f9fd;border:solid 1px #e0e3eb;text-align:justify;flex-direction:column;gap:8px;font-size:14px;padding:16px;border-radius:6px}:root[data-theme=dark] #powered-by-tv svg{filter:invert()}:root[data-theme=dark] #powered-by-tv{background:#0c0e15;border:solid 1px #1e222d}#powered-by-tv a,#powered-by-tv a:visited{color:#2962ff}@media (max-width:800px){#powered-by-tv,#technical-analysis,#top-stories,.span-full-grid,main>section{grid-column:span 2}}
            </style>
        </head>
        <body>

            <style>
            #advanced-chart,#company-profile,#crypto-heatmap,#crypto-mkt-screener,#symbol-info,.span-full-grid{grid-column:span 2}#powered-by-tv,#technical-analysis,#top-stories,.span-one-column{grid-column:span 1}#advanced-chart,#crypto-heatmap,#crypto-mkt-screener{height:500px}#company-profile{height:250px}#technical-analysis{height:425px}#top-stories{height:600px}@media (max-width:800px){#technical-analysis,#top-stories,.span-full-grid,main>section{grid-column:span 2}}
            </style>
            <main is:raw>
            <section id=symbol-info>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js async>
                    { "symbol": "{{SYMBOL}}", "width": "100%", "locale": "en", "colorTheme": "light", "isTransparent": true }
                </script>
                </div>
            </section>
            <section id=advanced-chart>
                <div class=tradingview-widget-container style=height:100%;width:100%>
                <div style="height:calc(100% - 32px);width:100%" id=tradingview_ae7da>
                </div>
                <script src=https://s3.tradingview.com/tv.js>
                </script>
                <script>
                    new TradingView.widget({autosize:!0,symbol:"{{SYMBOL}}",interval:"D",timezone:"Etc/UTC",theme:"light",style:"1",locale:"en",hide_side_toolbar:!1,allow_symbol_change:!0,studies:["STD;MACD"],container_id:"tradingview_ae7da"})
                </script>
                </div>
            </section>
            <section id=company-profile>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js async>
                    { "width": "100%", "height": "100%", "colorTheme": "light", "isTransparent": true, "symbol": "{{SYMBOL}}", "locale": "en" }
                </script>
                </div>
            </section>
            <section id=technical-analysis>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js async>
                    { "interval": "15m", "width": "100%", "isTransparent": true, "height": "100%", "symbol": "{{SYMBOL}}", "showIntervalTabs": true, "displayMode": "single", "locale": "en", "colorTheme": "light" }
                </script>
                </div>
            </section>
            <section id=top-stories>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-timeline.js async>
                    { "feedMode": "symbol", "symbol": "{{SYMBOL}}", "colorTheme": "light", "isTransparent": true, "displayMode": "regular", "width": "100%", "height": 600, "locale": "en" }
                </script>
                </div>
            </section>
            <section id=crypto-heatmap>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js async>
                    { "dataSource": "Crypto", "blockSize": "market_cap_calc", "blockColor": "change", "locale": "en", "symbolUrl": "", "colorTheme": "light", "hasTopBar": false, "isDataSetEnabled": false, "isZoomEnabled": true, "hasSymbolTooltip": true, "width": "100%", "height": "100%" }
                </script>
                </div>
            </section>
            <section id=crypto-mkt-screener>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <div class=tradingview-widget-copyright>
                    <a href=https://www.tradingview.com/ rel="noopener nofollow" target=_blank>
                    <span class=blue-text>
                        Track all markets on TradingView
                    </span>
                    </a>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-screener.js async>
                    { "width": "100%", "height": "100%", "defaultColumn": "overview", "screener_type": "crypto_mkt", "displayCurrency": "USD", "colorTheme": "light", "locale": "en" }
                </script>
                </div>
            </section>
            </main>
        </body>
        </html>`,
    forex: `<!DOCTYPE html>
    <html data-pagefind-ignore=all data-theme=light lang=en>
    <head>
        <meta charset=UTF-8>
        <meta content="width=device-width,initial-scale=1" name=viewport>
            <title>Banc Lalito 🍂 | Forex | Informació</title>
            <link rel="icon" href="/public/front-end/images/favicon.ico">
            <style>
            :root .stvb-brand[data-astro-cid-pkzv2hgs]{--stvb-color:#2962ff;--stvb-color-hover:#1e53e5;--stvb-color-active:#1848cc;--stvb-color-text:#fff;--stvb-color-hover-text:#fff;--stvb-color-active-text:#fff}:root .stvb-black[data-astro-cid-pkzv2hgs]{--stvb-color:#131722;--stvb-color-hover:#2a2e39;--stvb-color-active:#434651;--stvb-color-text:#fff;--stvb-color-hover-text:#fff;--stvb-color-active-text:#fff}:root[data-theme=dark] .stvb-black[data-astro-cid-pkzv2hgs]{--stvb-color:#fff;--stvb-color-hover:#f0f3fa;--stvb-color-active:#d1d4dc;--stvb-color-text:#131722;--stvb-color-hover-text:#131722;--stvb-color-active-text:#131722}:root .stvb-gray[data-astro-cid-pkzv2hgs]{--stvb-color:#f0f3fa;--stvb-color-hover:#e0e3eb;--stvb-color-active:#d1d4dc;--stvb-color-text:#131722;--stvb-color-hover-text:#131722;--stvb-color-active-text:#131722}:root .stvb-gray[data-astro-cid-pkzv2hgs].stvb-secondary{--stvb-color:#e0e3eb;--stvb-color-hover:#f0f3fa;--stvb-color-active:#e0e3eb}:root[data-theme=dark] .stvb-gray[data-astro-cid-pkzv2hgs]{--stvb-color:#2a2e39;--stvb-color-hover:#363a45;--stvb-color-active:#434651;--stvb-color-text:#fff;--stvb-color-hover-text:#fff;--stvb-color-active-text:#fff}:root[data-theme=dark] .stvb-gray[data-astro-cid-pkzv2hgs].stvb-secondary{--stvb-color:#434651;--stvb-color-hover:#2a2e39;--stvb-color-active:#363a45;--stvb-color-text:#d1d4dc}.stvb-base[data-astro-cid-pkzv2hgs]{display:inline-flex;flex-direction:row;align-items:center;font-style:normal;font-size:16px;line-height:24px}.stvb-base[data-astro-cid-pkzv2hgs]:focus-visible{outline-color:var(--tv-blue-500);outline-width:2px;outline-offset:4px}button[data-astro-cid-pkzv2hgs].stvb-base{border:none}.stvb-icon[data-astro-cid-pkzv2hgs]{--arrow-fill-color:var(--stvb-color-text)}.stvb-icon-force-color[data-astro-cid-pkzv2hgs]{color:var(--stvb-color-text)!important}.stvb-force-no-border[data-astro-cid-pkzv2hgs]{border:none!important}.stvb-small[data-astro-cid-pkzv2hgs]{height:34px;border-radius:6px;padding-inline:12px;font-weight:400;letter-spacing:-.317px}.stvb-medium[data-astro-cid-pkzv2hgs]{height:40px;border-radius:8px;padding-inline:16px;font-weight:510;letter-spacing:-.32px}.stvb-primary[data-astro-cid-pkzv2hgs]{background-color:var(--stvb-color);color:var(--stvb-color-text)}.stvb-secondary[data-astro-cid-pkzv2hgs]{background-color:transparent;color:var(--stvb-color)}.stvb-secondary[data-astro-cid-pkzv2hgs],button[data-astro-cid-pkzv2hgs].stvb-base.stvb-secondary{border-style:solid;border-width:1px;border-color:var(--stvb-color)}.stvb-primary[data-astro-cid-pkzv2hgs]:hover,.stvb-secondary[data-astro-cid-pkzv2hgs]:hover{color:var(--stvb-color-hover-text);background-color:var(--stvb-color-hover)}.stvb-primary[data-astro-cid-pkzv2hgs]:active,.stvb-secondary[data-astro-cid-pkzv2hgs]:active{color:var(--stvb-color-active-text);background-color:var(--stvb-color-active)}.stvb-base[data-astro-cid-pkzv2hgs].stvb-icon.stvb-medium{padding:6px}.stvb-base[data-astro-cid-pkzv2hgs].stvb-icon.stvb-small{padding:3px}.stvb-pointer[data-astro-cid-pkzv2hgs]{cursor:pointer}*,:after,:before{box-sizing:border-box}*{margin:0}body{line-height:1.5;-webkit-font-smoothing:antialiased}canvas,img,picture,svg,video{display:block;max-width:100%}button,input,select,textarea{font:inherit}h1,h2,h3,h4,h5,h6,p{overflow-wrap:break-word}#__next,#root{isolation:isolate}a{text-decoration:none}header[data-astro-cid-rafkve5z]{display:flex;width:100%;align-items:center;border-bottom:1px solid #e0e3eb;justify-content:space-between;padding:8px var(--gap-size);flex-direction:row;z-index:1}:root[data-theme=dark] header[data-astro-cid-rafkve5z]{border-bottom:1px solid #2a2e39}:root{--gap-size:32px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,Trebuchet MS,Roboto,Ubuntu,sans-serif;color:#000}:root[data-theme=dark]{color:#fff}*{box-sizing:border-box}body{margin:0;padding:0;display:flex;flex-direction:column;align-items:center;background:#fff}:root[data-theme=dark] body{background:#000}#powered-by-tv p{margin:0;font-size:12px;color:#0009}:root[data-theme=dark] #powered-by-tv p{color:#fff9}main{display:grid;width:100%;padding:0 calc(var(--gap-size) * .5);max-width:960px;grid-template-columns:1fr 1fr;grid-gap:var(--gap-size);margin-bottom:24px}#advanced-chart,#company-profile,#fundamental-data,#symbol-info,.span-full-grid{grid-column:span 2}#powered-by-tv,#technical-analysis,#top-stories,.span-one-column{grid-column:span 1}#advanced-chart{height:500px}#company-profile{height:390px}#fundamental-data{height:775px}#technical-analysis{height:425px}#top-stories{height:600px}#powered-by-tv{display:flex;background:#f8f9fd;border:solid 1px #e0e3eb;text-align:justify;flex-direction:column;gap:8px;font-size:14px;padding:16px;border-radius:6px}:root[data-theme=dark] #powered-by-tv svg{filter:invert()}:root[data-theme=dark] #powered-by-tv{background:#0c0e15;border:solid 1px #1e222d}#powered-by-tv a,#powered-by-tv a:visited{color:#2962ff}@media (max-width:800px){#powered-by-tv,#technical-analysis,#top-stories,.span-full-grid,main>section{grid-column:span 2}}
            </style>
        </head>
        <body>

            <style>
            #advanced-chart,#company-profile,#economic-calendar,#forex-cross-rates,#symbol-info,.span-full-grid{grid-column:span 2}#powered-by-tv,#technical-analysis,#top-stories,.span-one-column{grid-column:span 1}#advanced-chart,#economic-calendar,#forex-cross-rates{height:500px}#company-profile{height:250px}#technical-analysis{height:425px}#top-stories{height:600px}@media (max-width:800px){#technical-analysis,#top-stories,.span-full-grid,main>section{grid-column:span 2}}
            </style>
            <main>
            <section id=symbol-info>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js async>
                    { "symbol": "{{SYMBOL}}", "width": "100%", "locale": "en", "colorTheme": "light", "isTransparent": true }
                </script>
                </div>
            </section>
            <section id=advanced-chart>
                <div class=tradingview-widget-container style=height:100%;width:100%>
                <div style="height:calc(100% - 32px);width:100%" id=tradingview_ae7da>
                </div>
                <script src=https://s3.tradingview.com/tv.js>
                </script>
                <script>
                    new TradingView.widget({autosize:!0,symbol:"{{SYMBOL}}",interval:"D",timezone:"Etc/UTC",theme:"light",style:"1",locale:"en",hide_side_toolbar:!1,allow_symbol_change:!0,container_id:"tradingview_ae7da"})
                </script>
                </div>
            </section>
            <section id=company-profile>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js async>
                    { "width": "100%", "height": "100%", "colorTheme": "light", "isTransparent": true, "symbol": "{{SYMBOL}}", "locale": "en" }
                </script>
                </div>
            </section>
            <section id=technical-analysis>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js async>
                    { "interval": "15m", "width": "100%", "isTransparent": true, "height": "100%", "symbol": "{{SYMBOL}}", "showIntervalTabs": true, "displayMode": "single", "locale": "en", "colorTheme": "light" }
                </script>
                </div>
            </section>
            <section id=top-stories>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-timeline.js async>
                    { "feedMode": "symbol", "symbol": "{{SYMBOL}}", "colorTheme": "light", "isTransparent": true, "displayMode": "regular", "width": "100%", "height": 600, "locale": "en" }
                </script>
                </div>
            </section>
            <section id=economic-calendar>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-events.js async>
                    { "width": "100%", "height": "100%", "colorTheme": "light", "isTransparent": false, "locale": "en", "importanceFilter": "-1,0,1", "countryFilter": "us,eu,it,nz,ch,au,fr,jp,za,tr,ca,de,mx,es,gb" }
                </script>
                </div>
            </section>
            <section id=forex-cross-rates>
                <div class=tradingview-widget-container>
                <div class=tradingview-widget-container__widget>
                </div>
                <div class=tradingview-widget-copyright>
                    <a href=https://www.tradingview.com/ rel="noopener nofollow" target=_blank>
                    <span class=blue-text>
                        Track all markets on TradingView
                    </span>
                    </a>
                </div>
                <script src=https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js async>
                    { "width": "100%", "height": "100%", "currencies": [ "EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD" ], "isTransparent": false, "colorTheme": "light", "locale": "en" }
                </script>
                </div>
            </section>
            </main>
        </body>
        </html>`
};

function loadTradingViewHTML(sector, symbol) {
    // Generate TradingView URL: https://www.tradingview.com/symbols/{symbol}/
    // Replace : with -
    const formattedSymbol = symbol.replace(':', '-');
    const url = `https://www.tradingview.com/symbols/${formattedSymbol}/`;

    // Open in new tab
    window.open(url, '_blank');
}

function embedTradingViewWidget(sector, symbol, name) {
    loadTradingViewHTML(sector, symbol);
}

function stocksEmbedTradingViewWidget(symbol, name) {
    const widgetDiv = document.getElementById('tradingview-widget');

    // Create main container with grid layout
    const main = document.createElement('main');
    main.style.cssText = `
        display: grid;
        width: 100%;
        padding: 0 calc(var(--gap-size, 32px) * 0.5);
        max-width: 960px;
        grid-template-columns: 1fr 1fr;
        grid-gap: var(--gap-size, 32px);
        margin-bottom: 24px;
    `;

    // Symbol Info
    const symbolInfo = document.createElement('section');
    symbolInfo.id = 'symbol-info';
    const symbolInfoContainer = document.createElement('div');
    symbolInfoContainer.className = 'tradingview-widget-container';
    const symbolInfoWidget = document.createElement('div');
    symbolInfoWidget.className = 'tradingview-widget-container__widget';
    symbolInfoContainer.appendChild(symbolInfoWidget);
    symbolInfo.appendChild(symbolInfoContainer);

    // Advanced Chart
    const advancedChart = document.createElement('section');
    advancedChart.id = 'advanced-chart';
    advancedChart.style.height = '500px';
    const advancedChartContainer = document.createElement('div');
    advancedChartContainer.className = 'tradingview-widget-container';
    advancedChartContainer.style.cssText = 'height:100%;width:100%';
    const advancedChartWidget = document.createElement('div');
    advancedChartWidget.style.cssText = 'height:calc(100% - 32px);width:100%';
    advancedChartWidget.id = 'tradingview_advanced_chart';
    advancedChartContainer.appendChild(advancedChartWidget);
    advancedChart.appendChild(advancedChartContainer);

    // Company Profile
    const companyProfile = document.createElement('section');
    companyProfile.id = 'company-profile';
    companyProfile.style.height = '390px';
    const companyProfileContainer = document.createElement('div');
    companyProfileContainer.className = 'tradingview-widget-container';
    const companyProfileWidget = document.createElement('div');
    companyProfileWidget.className = 'tradingview-widget-container__widget';
    companyProfileContainer.appendChild(companyProfileWidget);
    companyProfile.appendChild(companyProfileContainer);

    // Fundamental Data
    const fundamentalData = document.createElement('section');
    fundamentalData.id = 'fundamental-data';
    fundamentalData.style.height = '775px';
    const fundamentalDataContainer = document.createElement('div');
    fundamentalDataContainer.className = 'tradingview-widget-container';
    const fundamentalDataWidget = document.createElement('div');
    fundamentalDataWidget.className = 'tradingview-widget-container__widget';
    fundamentalDataContainer.appendChild(fundamentalDataWidget);
    fundamentalData.appendChild(fundamentalDataContainer);

    // Technical Analysis
    const technicalAnalysis = document.createElement('section');
    technicalAnalysis.id = 'technical-analysis';
    technicalAnalysis.style.height = '425px';
    const technicalAnalysisContainer = document.createElement('div');
    technicalAnalysisContainer.className = 'tradingview-widget-container';
    const technicalAnalysisWidget = document.createElement('div');
    technicalAnalysisWidget.className = 'tradingview-widget-container__widget';
    technicalAnalysisContainer.appendChild(technicalAnalysisWidget);
    technicalAnalysis.appendChild(technicalAnalysisContainer);

    // Top Stories
    const topStories = document.createElement('section');
    topStories.id = 'top-stories';
    topStories.style.height = '600px';
    const topStoriesContainer = document.createElement('div');
    topStoriesContainer.className = 'tradingview-widget-container';
    const topStoriesWidget = document.createElement('div');
    topStoriesWidget.className = 'tradingview-widget-container__widget';
    topStoriesContainer.appendChild(topStoriesWidget);
    topStories.appendChild(topStoriesContainer);

    // Append all sections to main
    main.appendChild(symbolInfo);
    main.appendChild(advancedChart);
    main.appendChild(companyProfile);
    main.appendChild(fundamentalData);
    main.appendChild(technicalAnalysis);
    main.appendChild(topStories);

    widgetDiv.appendChild(main);

    // Load scripts after DOM elements are created
    loadStocksScripts(symbol);
}

function loadStocksScripts(symbol) {
    // Get the widget container sections
    const symbolInfoSection = document.getElementById('symbol-info');
    const companyProfileSection = document.getElementById('company-profile');
    const fundamentalDataSection = document.getElementById('fundamental-data');
    const technicalAnalysisSection = document.getElementById('technical-analysis');
    const topStoriesSection = document.getElementById('top-stories');

    // Symbol Info Script - append right after its container
    if (symbolInfoSection) {
        const symbolInfoScript = document.createElement('script');
        symbolInfoScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
        symbolInfoScript.async = true;
        symbolInfoScript.crossOrigin = 'anonymous';
        symbolInfoScript.innerHTML = JSON.stringify({
            "symbol": symbol,
            "width": "100%",
            "locale": "en",
            "colorTheme": "light",
            "isTransparent": true
        });
        symbolInfoSection.appendChild(symbolInfoScript);
    }

    // Advanced Chart Scripts
    const tvScript = document.createElement('script');
    tvScript.src = 'https://s3.tradingview.com/tv.js';
    tvScript.async = true;
    tvScript.crossOrigin = 'anonymous';
    document.head.appendChild(tvScript);

    tvScript.onload = function() {
        new TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: "D",
            timezone: "Etc/UTC",
            theme: "light",
            style: "1",
            locale: "en",
            hide_side_toolbar: false,
            allow_symbol_change: true,
            studies: ["STD;MACD"],
            container_id: "tradingview_advanced_chart"
        });
    };

    // Company Profile Script - append right after its container
    if (companyProfileSection) {
        const companyProfileScript = document.createElement('script');
        companyProfileScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
        companyProfileScript.async = true;
        companyProfileScript.crossOrigin = 'anonymous';
        companyProfileScript.innerHTML = JSON.stringify({
            "width": "100%",
            "height": "100%",
            "colorTheme": "light",
            "isTransparent": true,
            "symbol": symbol,
            "locale": "en"
        });
        companyProfileSection.appendChild(companyProfileScript);
    }

    // Fundamental Data Script - append right after its container
    if (fundamentalDataSection) {
        const fundamentalScript = document.createElement('script');
        fundamentalScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js';
        fundamentalScript.async = true;
        fundamentalScript.crossOrigin = 'anonymous';
        fundamentalScript.innerHTML = JSON.stringify({
            "colorTheme": "light",
            "isTransparent": true,
            "largeChartUrl": "",
            "displayMode": "regular",
            "width": "100%",
            "height": 775,
            "symbol": symbol,
            "locale": "en"
        });
        fundamentalDataSection.appendChild(fundamentalScript);
    }

    // Technical Analysis Script - append right after its container
    if (technicalAnalysisSection) {
        const technicalScript = document.createElement('script');
        technicalScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
        technicalScript.async = true;
        technicalScript.crossOrigin = 'anonymous';
        technicalScript.innerHTML = JSON.stringify({
            "interval": "15m",
            "width": "100%",
            "isTransparent": true,
            "height": "100%",
            "symbol": symbol,
            "showIntervalTabs": true,
            "displayMode": "single",
            "locale": "en",
            "colorTheme": "light"
        });
        technicalAnalysisSection.appendChild(technicalScript);
    }

    // Top Stories Script - append right after its container
    if (topStoriesSection) {
        const timelineScript = document.createElement('script');
        timelineScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
        timelineScript.async = true;
        timelineScript.crossOrigin = 'anonymous';
        timelineScript.innerHTML = JSON.stringify({
            "feedMode": "symbol",
            "symbol": symbol,
            "colorTheme": "light",
            "isTransparent": true,
            "displayMode": "regular",
            "width": "100%",
            "height": 600,
            "locale": "en"
        });
        topStoriesSection.appendChild(timelineScript);
    }
}

function cryptoEmbedTradingViewWidget(symbol, name) {
    const widgetDiv = document.getElementById('tradingview-widget');

    // Create main container with grid layout
    const main = document.createElement('main');
    main.style.cssText = `
        display: grid;
        width: 100%;
        padding: 0 calc(var(--gap-size, 32px) * 0.5);
        max-width: 960px;
        grid-template-columns: 1fr 1fr;
        grid-gap: var(--gap-size, 32px);
        margin-bottom: 24px;
    `;

    // Symbol Info
    const symbolInfo = document.createElement('section');
    symbolInfo.id = 'symbol-info';
    const symbolInfoContainer = document.createElement('div');
    symbolInfoContainer.className = 'tradingview-widget-container';
    const symbolInfoWidget = document.createElement('div');
    symbolInfoWidget.className = 'tradingview-widget-container__widget';
    symbolInfoContainer.appendChild(symbolInfoWidget);
    symbolInfo.appendChild(symbolInfoContainer);

    // Advanced Chart
    const advancedChart = document.createElement('section');
    advancedChart.id = 'advanced-chart';
    advancedChart.style.height = '500px';
    const advancedChartContainer = document.createElement('div');
    advancedChartContainer.className = 'tradingview-widget-container';
    advancedChartContainer.style.cssText = 'height:100%;width:100%';
    const advancedChartWidget = document.createElement('div');
    advancedChartWidget.style.cssText = 'height:calc(100% - 32px);width:100%';
    advancedChartWidget.id = 'tradingview_crypto_chart';
    advancedChartContainer.appendChild(advancedChartWidget);
    advancedChart.appendChild(advancedChartContainer);

    // Company Profile
    const companyProfile = document.createElement('section');
    companyProfile.id = 'company-profile';
    companyProfile.style.height = '250px';
    const companyProfileContainer = document.createElement('div');
    companyProfileContainer.className = 'tradingview-widget-container';
    const companyProfileWidget = document.createElement('div');
    companyProfileWidget.className = 'tradingview-widget-container__widget';
    companyProfileContainer.appendChild(companyProfileWidget);
    companyProfile.appendChild(companyProfileContainer);

    // Technical Analysis
    const technicalAnalysis = document.createElement('section');
    technicalAnalysis.id = 'technical-analysis';
    technicalAnalysis.style.height = '425px';
    const technicalAnalysisContainer = document.createElement('div');
    technicalAnalysisContainer.className = 'tradingview-widget-container';
    const technicalAnalysisWidget = document.createElement('div');
    technicalAnalysisWidget.className = 'tradingview-widget-container__widget';
    technicalAnalysisContainer.appendChild(technicalAnalysisWidget);
    technicalAnalysis.appendChild(technicalAnalysisContainer);

    // Top Stories
    const topStories = document.createElement('section');
    topStories.id = 'top-stories';
    topStories.style.height = '600px';
    const topStoriesContainer = document.createElement('div');
    topStoriesContainer.className = 'tradingview-widget-container';
    const topStoriesWidget = document.createElement('div');
    topStoriesWidget.className = 'tradingview-widget-container__widget';
    topStoriesContainer.appendChild(topStoriesWidget);
    topStories.appendChild(topStoriesContainer);

    // Crypto Heatmap
    const cryptoHeatmap = document.createElement('section');
    cryptoHeatmap.id = 'crypto-heatmap';
    cryptoHeatmap.style.height = '500px';
    const cryptoHeatmapContainer = document.createElement('div');
    cryptoHeatmapContainer.className = 'tradingview-widget-container';
    const cryptoHeatmapWidget = document.createElement('div');
    cryptoHeatmapWidget.className = 'tradingview-widget-container__widget';
    cryptoHeatmapContainer.appendChild(cryptoHeatmapWidget);
    cryptoHeatmap.appendChild(cryptoHeatmapContainer);

    // Crypto Market Screener
    const cryptoMktScreener = document.createElement('section');
    cryptoMktScreener.id = 'crypto-mkt-screener';
    cryptoMktScreener.style.height = '500px';
    const cryptoMktScreenerContainer = document.createElement('div');
    cryptoMktScreenerContainer.className = 'tradingview-widget-container';
    const cryptoMktScreenerWidget = document.createElement('div');
    cryptoMktScreenerWidget.className = 'tradingview-widget-container__widget';
    cryptoMktScreenerContainer.appendChild(cryptoMktScreenerWidget);
    const copyrightDiv = document.createElement('div');
    copyrightDiv.className = 'tradingview-widget-copyright';
    copyrightDiv.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>';
    cryptoMktScreenerContainer.appendChild(copyrightDiv);
    cryptoMktScreener.appendChild(cryptoMktScreenerContainer);

    // Append all sections to main
    main.appendChild(symbolInfo);
    main.appendChild(advancedChart);
    main.appendChild(companyProfile);
    main.appendChild(technicalAnalysis);
    main.appendChild(topStories);
    main.appendChild(cryptoHeatmap);
    main.appendChild(cryptoMktScreener);

    widgetDiv.appendChild(main);

    // Load scripts after DOM elements are created
    loadCryptoScripts(symbol);
}

function loadCryptoScripts(symbol) {
    // Symbol Info Script
    const symbolInfoScript = document.createElement('script');
    symbolInfoScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
    symbolInfoScript.async = true;
    symbolInfoScript.crossOrigin = 'anonymous';
    symbolInfoScript.innerHTML = JSON.stringify({
        "symbol": symbol,
        "width": "100%",
        "locale": "en",
        "colorTheme": "light",
        "isTransparent": true
    });
    document.head.appendChild(symbolInfoScript);

    // Advanced Chart Scripts
    const tvScript = document.createElement('script');
    tvScript.src = 'https://s3.tradingview.com/tv.js';
    tvScript.async = true;
    tvScript.crossOrigin = 'anonymous';
    document.head.appendChild(tvScript);

    tvScript.onload = function() {
        new TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: "D",
            timezone: "Etc/UTC",
            theme: "light",
            style: "1",
            locale: "en",
            hide_side_toolbar: false,
            allow_symbol_change: true,
            studies: ["STD;MACD"],
            container_id: "tradingview_crypto_chart"
        });
    };

    // Company Profile Script
    const companyProfileScript = document.createElement('script');
    companyProfileScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
    companyProfileScript.async = true;
    companyProfileScript.crossOrigin = 'anonymous';
    companyProfileScript.innerHTML = JSON.stringify({
        "width": "100%",
        "height": "100%",
        "colorTheme": "light",
        "isTransparent": true,
        "symbol": symbol,
        "locale": "en"
    });
    document.head.appendChild(companyProfileScript);

    // Technical Analysis Script
    const technicalScript = document.createElement('script');
    technicalScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    technicalScript.async = true;
    technicalScript.crossOrigin = 'anonymous';
    technicalScript.innerHTML = JSON.stringify({
        "interval": "15m",
        "width": "100%",
        "isTransparent": true,
        "height": "100%",
        "symbol": symbol,
        "showIntervalTabs": true,
        "displayMode": "single",
        "locale": "en",
        "colorTheme": "light"
    });
    document.head.appendChild(technicalScript);

    // Top Stories Script
    const timelineScript = document.createElement('script');
    timelineScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    timelineScript.async = true;
    timelineScript.crossOrigin = 'anonymous';
    timelineScript.innerHTML = JSON.stringify({
        "feedMode": "symbol",
        "symbol": symbol,
        "colorTheme": "light",
        "isTransparent": true,
        "displayMode": "regular",
        "width": "100%",
        "height": 600,
        "locale": "en"
    });
    document.head.appendChild(timelineScript);

    // Crypto Heatmap Script
    const heatmapScript = document.createElement('script');
    heatmapScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js';
    heatmapScript.async = true;
    heatmapScript.crossOrigin = 'anonymous';
    heatmapScript.innerHTML = JSON.stringify({
        "dataSource": "Crypto",
        "blockSize": "market_cap_calc",
        "blockColor": "change",
        "locale": "en",
        "symbolUrl": "",
        "colorTheme": "light",
        "hasTopBar": false,
        "isDataSetEnabled": false,
        "isZoomEnabled": true,
        "hasSymbolTooltip": true,
        "width": "100%",
        "height": "100%"
    });
    document.head.appendChild(heatmapScript);

    // Crypto Market Screener Script
    const screenerScript = document.createElement('script');
    screenerScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    screenerScript.async = true;
    screenerScript.crossOrigin = 'anonymous';
    screenerScript.innerHTML = JSON.stringify({
        "width": "100%",
        "height": "100%",
        "defaultColumn": "overview",
        "screener_type": "crypto_mkt",
        "displayCurrency": "USD",
        "colorTheme": "light",
        "locale": "en"
    });
    document.head.appendChild(screenerScript);
}

function forexEmbedTradingViewWidget(symbol, name) {
    const widgetDiv = document.getElementById('tradingview-widget');

    // Create main container with grid layout
    const main = document.createElement('main');
    main.style.cssText = `
        display: grid;
        width: 100%;
        padding: 0 calc(var(--gap-size, 32px) * 0.5);
        max-width: 960px;
        grid-template-columns: 1fr 1fr;
        grid-gap: var(--gap-size, 32px);
        margin-bottom: 24px;
    `;

    // Symbol Info
    const symbolInfo = document.createElement('section');
    symbolInfo.id = 'symbol-info';
    const symbolInfoContainer = document.createElement('div');
    symbolInfoContainer.className = 'tradingview-widget-container';
    const symbolInfoWidget = document.createElement('div');
    symbolInfoWidget.className = 'tradingview-widget-container__widget';
    symbolInfoContainer.appendChild(symbolInfoWidget);
    symbolInfo.appendChild(symbolInfoContainer);

    // Advanced Chart
    const advancedChart = document.createElement('section');
    advancedChart.id = 'advanced-chart';
    advancedChart.style.height = '500px';
    const advancedChartContainer = document.createElement('div');
    advancedChartContainer.className = 'tradingview-widget-container';
    advancedChartContainer.style.cssText = 'height:100%;width:100%';
    const advancedChartWidget = document.createElement('div');
    advancedChartWidget.style.cssText = 'height:calc(100% - 32px);width:100%';
    advancedChartWidget.id = 'tradingview_forex_chart';
    advancedChartContainer.appendChild(advancedChartWidget);
    advancedChart.appendChild(advancedChartContainer);

    // Company Profile
    const companyProfile = document.createElement('section');
    companyProfile.id = 'company-profile';
    companyProfile.style.height = '250px';
    const companyProfileContainer = document.createElement('div');
    companyProfileContainer.className = 'tradingview-widget-container';
    const companyProfileWidget = document.createElement('div');
    companyProfileWidget.className = 'tradingview-widget-container__widget';
    companyProfileContainer.appendChild(companyProfileWidget);
    companyProfile.appendChild(companyProfileContainer);

    // Technical Analysis
    const technicalAnalysis = document.createElement('section');
    technicalAnalysis.id = 'technical-analysis';
    technicalAnalysis.style.height = '425px';
    const technicalAnalysisContainer = document.createElement('div');
    technicalAnalysisContainer.className = 'tradingview-widget-container';
    const technicalAnalysisWidget = document.createElement('div');
    technicalAnalysisWidget.className = 'tradingview-widget-container__widget';
    technicalAnalysisContainer.appendChild(technicalAnalysisWidget);
    technicalAnalysis.appendChild(technicalAnalysisContainer);

    // Top Stories
    const topStories = document.createElement('section');
    topStories.id = 'top-stories';
    topStories.style.height = '600px';
    const topStoriesContainer = document.createElement('div');
    topStoriesContainer.className = 'tradingview-widget-container';
    const topStoriesWidget = document.createElement('div');
    topStoriesWidget.className = 'tradingview-widget-container__widget';
    topStoriesContainer.appendChild(topStoriesWidget);
    topStories.appendChild(topStoriesContainer);

    // Economic Calendar
    const economicCalendar = document.createElement('section');
    economicCalendar.id = 'economic-calendar';
    economicCalendar.style.height = '500px';
    const economicCalendarContainer = document.createElement('div');
    economicCalendarContainer.className = 'tradingview-widget-container';
    const economicCalendarWidget = document.createElement('div');
    economicCalendarWidget.className = 'tradingview-widget-container__widget';
    economicCalendarContainer.appendChild(economicCalendarWidget);
    economicCalendar.appendChild(economicCalendarContainer);

    // Forex Cross Rates
    const forexCrossRates = document.createElement('section');
    forexCrossRates.id = 'forex-cross-rates';
    forexCrossRates.style.height = '500px';
    const forexCrossRatesContainer = document.createElement('div');
    forexCrossRatesContainer.className = 'tradingview-widget-container';
    const forexCrossRatesWidget = document.createElement('div');
    forexCrossRatesWidget.className = 'tradingview-widget-container__widget';
    forexCrossRatesContainer.appendChild(forexCrossRatesWidget);
    const copyrightDiv = document.createElement('div');
    copyrightDiv.className = 'tradingview-widget-copyright';
    copyrightDiv.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>';
    forexCrossRatesContainer.appendChild(copyrightDiv);
    forexCrossRates.appendChild(forexCrossRatesContainer);

    // Append all sections to main
    main.appendChild(symbolInfo);
    main.appendChild(advancedChart);
    main.appendChild(companyProfile);
    main.appendChild(technicalAnalysis);
    main.appendChild(topStories);
    main.appendChild(economicCalendar);
    main.appendChild(forexCrossRates);

    widgetDiv.appendChild(main);

    // Load scripts after DOM elements are created
    loadForexScripts(symbol);
}

function loadForexScripts(symbol) {
    // Symbol Info Script
    const symbolInfoScript = document.createElement('script');
    symbolInfoScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
    symbolInfoScript.async = true;
    symbolInfoScript.crossOrigin = 'anonymous';
    symbolInfoScript.innerHTML = JSON.stringify({
        "symbol": symbol,
        "width": "100%",
        "locale": "en",
        "colorTheme": "light",
        "isTransparent": true
    });
    document.head.appendChild(symbolInfoScript);

    // Advanced Chart Scripts
    const tvScript = document.createElement('script');
    tvScript.src = 'https://s3.tradingview.com/tv.js';
    tvScript.async = true;
    tvScript.crossOrigin = 'anonymous';
    document.head.appendChild(tvScript);

    tvScript.onload = function() {
        new TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: "D",
            timezone: "Etc/UTC",
            theme: "light",
            style: "1",
            locale: "en",
            hide_side_toolbar: false,
            allow_symbol_change: true,
            container_id: "tradingview_forex_chart"
        });
    };

    // Company Profile Script
    const companyProfileScript = document.createElement('script');
    companyProfileScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
    companyProfileScript.async = true;
    companyProfileScript.crossOrigin = 'anonymous';
    companyProfileScript.innerHTML = JSON.stringify({
        "width": "100%",
        "height": "100%",
        "colorTheme": "light",
        "isTransparent": true,
        "symbol": symbol,
        "locale": "en"
    });
    document.head.appendChild(companyProfileScript);

    // Technical Analysis Script
    const technicalScript = document.createElement('script');
    technicalScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    technicalScript.async = true;
    technicalScript.crossOrigin = 'anonymous';
    technicalScript.innerHTML = JSON.stringify({
        "interval": "15m",
        "width": "100%",
        "isTransparent": true,
        "height": "100%",
        "symbol": symbol,
        "showIntervalTabs": true,
        "displayMode": "single",
        "locale": "en",
        "colorTheme": "light"
    });
    document.head.appendChild(technicalScript);

    // Top Stories Script
    const timelineScript = document.createElement('script');
    timelineScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    timelineScript.async = true;
    timelineScript.crossOrigin = 'anonymous';
    timelineScript.innerHTML = JSON.stringify({
        "feedMode": "symbol",
        "symbol": symbol,
        "colorTheme": "light",
        "isTransparent": true,
        "displayMode": "regular",
        "width": "100%",
        "height": 600,
        "locale": "en"
    });
    document.head.appendChild(timelineScript);

    // Economic Calendar Script
    const eventsScript = document.createElement('script');
    eventsScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    eventsScript.async = true;
    eventsScript.crossOrigin = 'anonymous';
    eventsScript.innerHTML = JSON.stringify({
        "width": "100%",
        "height": "100%",
        "colorTheme": "light",
        "isTransparent": false,
        "locale": "en",
        "importanceFilter": "-1,0,1",
        "countryFilter": "us,eu,it,nz,ch,au,fr,jp,za,tr,ca,de,mx,es,gb"
    });
    document.head.appendChild(eventsScript);

    // Forex Cross Rates Script
    const crossRatesScript = document.createElement('script');
    crossRatesScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js';
    crossRatesScript.async = true;
    crossRatesScript.crossOrigin = 'anonymous';
    crossRatesScript.innerHTML = JSON.stringify({
        "width": "100%",
        "height": "100%",
        "currencies": ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"],
        "isTransparent": false,
        "colorTheme": "light",
        "locale": "en"
    });
    document.head.appendChild(crossRatesScript);
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        embedTradingViewWidget,
        stocksEmbedTradingViewWidget,
        cryptoEmbedTradingViewWidget,
        forexEmbedTradingViewWidget
    };
}