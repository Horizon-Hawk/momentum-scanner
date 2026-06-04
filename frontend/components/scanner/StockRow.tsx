"use client";

import { useEffect, useRef, useState } from "react";
import { type ScannerResult } from "@/lib/types";

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtVol(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

interface Props {
  result: ScannerResult;
  rank: number;
}

export function StockRow({ result, rank }: Props) {
  const prevUpdated = useRef(result.last_updated);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (result.last_updated !== prevUpdated.current) {
      prevUpdated.current = result.last_updated;
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 1400);
      return () => clearTimeout(t);
    }
  }, [result.last_updated]);

  const gapUp = result.gap_pct >= 0;
  const priceUp = result.price >= result.prev_close;
  const rvolHot = result.rvol >= 5;
  const rvolWarm = result.rvol >= 3 && result.rvol < 5;
  const floatSmall = result.float_shares > 0 && result.float_shares / 1_000_000 <= 20;
  const floatM = result.float_shares > 0 ? (result.float_shares / 1_000_000).toFixed(1) : "—";

  const since = (() => {
    try {
      const diff = Math.floor((Date.now() - new Date(result.last_updated).getTime()) / 1000);
      if (diff < 60) return `${diff}s`;
      return `${Math.floor(diff / 60)}m`;
    } catch {
      return "—";
    }
  })();

  return (
    <tr
      className={`border-b border-gray-800 hover:bg-gray-800/40 transition-colors text-sm ${flashing ? "row-flash" : ""}`}
    >
      <td className="px-4 py-2.5 font-mono font-semibold">
        <a
          href={`https://finance.yahoo.com/quote/${result.ticker}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          {result.ticker}
        </a>
        {result.company_name && (
          <div className="text-xs text-gray-500 font-sans font-normal truncate max-w-[120px]">
            {result.company_name}
          </div>
        )}
      </td>
      <td className={`px-4 py-2.5 font-mono font-medium ${priceUp ? "text-green-400" : "text-red-400"}`}>
        ${fmt(result.price, 2)}
      </td>
      <td className="px-4 py-2.5 font-mono">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${gapUp ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
          {gapUp ? "+" : ""}{fmt(result.gap_pct, 2)}%
        </span>
      </td>
      <td className="px-4 py-2.5 font-mono">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${rvolHot ? "bg-green-500/15 text-green-400" : rvolWarm ? "bg-yellow-500/15 text-yellow-400" : "text-gray-400"}`}>
          {fmt(result.rvol, 1)}x
        </span>
      </td>
      <td className="px-4 py-2.5 font-mono text-sm">
        <span className={floatSmall ? "text-green-400" : "text-gray-400"}>
          {floatM !== "—" ? `${floatM}M` : "—"}
        </span>
      </td>
      <td className="px-4 py-2.5 font-mono text-gray-300">{fmtVol(result.volume)}</td>
      <td className="px-4 py-2.5 font-mono text-gray-300">${fmt(result.high_of_day, 2)}</td>
      <td className="px-4 py-2.5 font-mono text-gray-300">${fmt(result.low_of_day, 2)}</td>
      <td className="px-4 py-2.5 font-mono text-gray-500 text-xs">{since}</td>
    </tr>
  );
}
