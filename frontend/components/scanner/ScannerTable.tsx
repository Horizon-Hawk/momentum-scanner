"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { type ScannerResult } from "@/lib/types";
import { type Platform } from "@/lib/platforms";
import { type ColumnState, getVisibleColumns } from "@/lib/columns";
import { StockRow } from "./StockRow";

interface Props {
  results: ScannerResult[];
  isPro: boolean;
  platform: Platform;
  columns: ColumnState[];
  compact?: boolean;
}

const FREE_LIMIT = 10;

export function ScannerTable({ results, isPro, platform, columns, compact }: Props) {
  const visible = isPro ? results : results.slice(0, FREE_LIMIT);
  const blurred = !compact && !isPro && results.length > FREE_LIMIT;
  const visibleCols = getVisibleColumns(columns);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <span className="text-2xl">📡</span>
        </div>
        <p className="text-gray-400 font-medium">Scanning markets…</p>
        <p className="text-gray-600 text-sm mt-1">
          Results appear when stocks match the filters.
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
              {visibleCols.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  title={col.tip}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <StockRow key={r.ticker} result={r} rank={i + 1} platform={platform} columns={visibleCols} />
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
