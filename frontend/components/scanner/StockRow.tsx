"use client";

import { useEffect, useRef, useState } from "react";
import { type ScannerResult } from "@/lib/types";
import { type Platform, openTicker } from "@/lib/platforms";
import { type ColumnDef } from "@/lib/columns";

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
  platform: Platform;
  columns: ColumnDef[];
}

function renderCell(id: string, result: ScannerResult, platform: Platform, onCopy: (e: React.MouseEvent) => void, copied: boolean) {
  const priceUp = result.price >= result.prev_close;
  const gapUp   = result.gap_pct >= 0;
  const rvolHot  = result.rvol >= 5;
  const rvolWarm = result.rvol >= 3 && result.rvol < 5;
  const floatSmall = result.float_shares > 0 && result.float_shares / 1_000_000 <= 20;
  const floatM = result.float_shares > 0 ? (result.float_shares / 1_000_000).toFixed(1) : "—";

  switch (id) {
    case "ticker":
      return (
        <td key="ticker" className="px-4 py-2.5 font-mono font-semibold">
          <button
            onClick={onCopy}
            className="relative text-green-400 hover:text-green-300 transition-colors text-left"
            title={platform.clipboard ? `Copy ${result.ticker} to clipboard` : `Open in ${platform.name}`}
          >
            {result.ticker}
            {copied && (
              <span className="absolute -top-6 left-0 bg-gray-700 text-gray-100 text-xs px-2 py-0.5 rounded whitespace-nowrap z-10">
                Copied!
              </span>
            )}
          </button>
          {result.company_name && (
            <div className="text-xs text-gray-500 font-sans font-normal truncate max-w-[120px]">
              {result.company_name}
            </div>
          )}
        </td>
      );
    case "price":
      return (
        <td key="price" className={`px-4 py-2.5 font-mono font-medium ${priceUp ? "text-green-400" : "text-red-400"}`}>
          ${fmt(result.price, 2)}
        </td>
      );
    case "gap_pct":
      return (
        <td key="gap_pct" className="px-4 py-2.5 font-mono">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${gapUp ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
            {gapUp ? "+" : ""}{fmt(result.gap_pct, 2)}%
          </span>
        </td>
      );
    case "rvol":
      return (
        <td key="rvol" className="px-4 py-2.5 font-mono">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${rvolHot ? "bg-green-500/15 text-green-400" : rvolWarm ? "bg-yellow-500/15 text-yellow-400" : "text-gray-400"}`}>
            {fmt(result.rvol, 1)}x
          </span>
        </td>
      );
    case "float":
      return (
        <td key="float" className="px-4 py-2.5 font-mono text-sm">
          <span className={floatSmall ? "text-green-400" : "text-gray-400"}>
            {floatM !== "—" ? `${floatM}M` : "—"}
          </span>
        </td>
      );
    case "volume":
      return <td key="volume" className="px-4 py-2.5 font-mono text-gray-300">{fmtVol(result.volume)}</td>;
    case "hod":
      return <td key="hod" className="px-4 py-2.5 font-mono text-gray-300">${fmt(result.high_of_day, 2)}</td>;
    case "lod":
      return <td key="lod" className="px-4 py-2.5 font-mono text-gray-300">${fmt(result.low_of_day, 2)}</td>;
    case "open":
      return <td key="open" className="px-4 py-2.5 font-mono text-gray-300">${fmt(result.open_price, 2)}</td>;
    case "prev_close":
      return <td key="prev_close" className="px-4 py-2.5 font-mono text-gray-300">${fmt(result.prev_close, 2)}</td>;
    case "sector":
      return <td key="sector" className="px-4 py-2.5 text-gray-400 text-xs truncate max-w-[100px]">{result.sector || "—"}</td>;
    case "updated": {
      let since = "—";
      try {
        const diff = Math.floor((Date.now() - new Date(result.last_updated).getTime()) / 1000);
        since = diff < 60 ? `${diff}s` : `${Math.floor(diff / 60)}m`;
      } catch {}
      return <td key="updated" className="px-4 py-2.5 font-mono text-gray-500 text-xs">{since}</td>;
    }
    default:
      return <td key={id} />;
  }
}

export function StockRow({ result, rank, platform, columns }: Props) {
  const prevUpdated = useRef(result.last_updated);
  const [flashing, setFlashing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (result.last_updated !== prevUpdated.current) {
      prevUpdated.current = result.last_updated;
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 1400);
      return () => clearTimeout(t);
    }
  }, [result.last_updated]);

  const handleTickerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const action = openTicker(result.ticker, platform);
    if (action === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <tr className={`border-b border-gray-800 hover:bg-gray-800/40 transition-colors text-sm ${flashing ? "row-flash" : ""}`}>
      {columns.map((col) => renderCell(col.id, result, platform, handleTickerClick, copied))}
    </tr>
  );
}
