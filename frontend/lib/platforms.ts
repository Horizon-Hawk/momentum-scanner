export type Platform = {
  id: string
  name: string
  url?: string       // {ticker} placeholder; undefined = clipboard only
  clipboard?: boolean
}

export const PLATFORMS: Platform[] = [
  { id: "tradingview",  name: "TradingView",         url: "https://www.tradingview.com/chart/?symbol={ticker}" },
  { id: "finviz",       name: "Finviz",               url: "https://finviz.com/quote.ashx?t={ticker}" },
  { id: "yahoo",        name: "Yahoo Finance",         url: "https://finance.yahoo.com/quote/{ticker}" },
  { id: "webull",       name: "Webull",               url: "https://app.webull.com/stocks/{ticker}" },
  { id: "robinhood",    name: "Robinhood",            url: "https://robinhood.com/stocks/{ticker}" },
  { id: "moomoo",       name: "Moomoo",               url: "https://www.moomoo.com/stock/{ticker}" },
  { id: "tc2000",       name: "TC2000",               clipboard: true },
  { id: "thinkorswim",  name: "Thinkorswim",          clipboard: true },
  { id: "ibkr",         name: "Interactive Brokers",  clipboard: true },
  { id: "das",          name: "DAS Trader",           clipboard: true },
  { id: "lightspeed",   name: "Lightspeed",           clipboard: true },
  { id: "tradestation", name: "TradeStation",         clipboard: true },
]

export const DEFAULT_PLATFORM_ID = "tradingview"

export function getPlatform(id: string): Platform {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0]
}

export function openTicker(ticker: string, platform: Platform): "opened" | "copied" {
  if (platform.url) {
    window.open(platform.url.replace("{ticker}", ticker), "_blank", "noopener,noreferrer")
    return "opened"
  }
  navigator.clipboard.writeText(ticker).catch(() => {})
  return "copied"
}
