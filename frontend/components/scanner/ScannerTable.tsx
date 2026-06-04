"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { type ScannerResult } from "@/lib/types";
import { StockRow } from "./StockRow";

const COLUMNS = [
  { key: "ticker",      label: "Ticker",   tip: "Stock symbol" },
  { key: "price",       label: "Price",    tip: "Latest traded price" },
  { key: "gap_pct",     label: "Gap %",    tip: "Today's open vs yesterday's close" },
  { key: "rvol",        label: "RVOL",     tip: "Relative volume: today's pace vs 20-day average. 5x = 5× normal activity" },
  { key: "float_shares",label: "Float",    tip: "Shares available to trade (ex-insider). Lower = easier to move" },
  { key: "volume",      label: "Volume",   tip: "Total shares traded today" },
  { key: "high_of_day", label: "HOD",      tip: "High of day" },
  { key: "low_of_day",  label: "LOD",      tip: "Low of day" },
  { key: "last_updated",label: "Updated",  tip: "Seconds since last price update" },
];

interface Props {
  results: ScannerResult[];
  isPro: boolean;
}

const FREE_LIMIT = 10;

export function ScannerTable({ results, isPro }: Props) {
  const visible = isPro ? results : results.slice(0, FREE_LIMIT);
  const blurred = !isPro && results.length > FREE_LIMIT;

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <span className="text-2xl">📡</span>
        </div>
        <p className="text-gray-400 font-medium">Scanning markets…</p>
        <p className="text-gray-600 text-sm mt-1">
          Results appear in real time when stocks match the filters.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  title={col.tip}
                >
                  {col.label}
                  <span className="ml-1 text-gray-700 cursor-help" title={col.tip}>?</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <StockRow key={r.ticker} result={r} rank={i + 1} />
            ))}
          </tbody>
        </table>
      </div>

      {blurred && (
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-gray-950 to-transparent flex items-end justify-center pb-6">
          <div className="flex flex-col items-center gap-3">
            <Lock className="w-5 h-5 text-gray-400" />
            <p className="text-gray-300 font-medium text-sm">
              {results.length - FREE_LIMIT} more results hidden
            </p>
            <Link
              href="/pricing"
              className="bg-green-500 hover:bg-green-400 text-gray-950 font-semibold text-sm px-5 py-2 rounded-md transition-colors"
            >
              Upgrade to Pro — $29/mo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
