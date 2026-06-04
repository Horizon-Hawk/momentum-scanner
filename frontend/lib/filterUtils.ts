import { type ScannerResult, type FilterConfig } from "./types";

export function applyClientFilters(results: ScannerResult[], f: FilterConfig): ScannerResult[] {
  return results.filter((r) => {
    if (r.price < f.min_price || r.price > f.max_price) return false;
    if (r.float_shares && r.float_shares / 1_000_000 > f.max_float_millions) return false;
    if (r.gap_pct < f.min_gap_pct) return false;
    if (r.rvol < f.min_rvol) return false;
    return true;
  });
}
