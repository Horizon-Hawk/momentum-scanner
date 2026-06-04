export interface ScannerResult {
  ticker: string
  company_name: string
  price: number
  prev_close: number
  gap_pct: number
  volume: number
  avg_volume: number
  rvol: number
  float_shares: number
  high_of_day: number
  low_of_day: number
  open_price: number
  sector: string
  last_updated: string
}

export interface FilterConfig {
  min_price: number
  max_price: number
  max_float_millions: number
  min_gap_pct: number
  min_rvol: number
}

export const ROSS_CAMERON_DEFAULTS: FilterConfig = {
  min_price: 1,
  max_price: 20,
  max_float_millions: 20,
  min_gap_pct: 10,
  min_rvol: 5,
}

export interface Subscription {
  tier: "free" | "pro"
  status: string
  current_period_end: string | null
}
