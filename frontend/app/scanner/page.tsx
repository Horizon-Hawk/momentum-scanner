"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ScannerTable } from "@/components/scanner/ScannerTable";
import { FilterPanel } from "@/components/scanner/FilterPanel";
import { StatsBar } from "@/components/scanner/StatsBar";
import { PlatformPicker } from "@/components/scanner/PlatformPicker";
import { ColumnPicker } from "@/components/scanner/ColumnPicker";
import { usePlatform } from "@/hooks/usePlatform";
import { useColumns } from "@/hooks/useColumns";
import { applyClientFilters } from "@/lib/filterUtils";
import { type ScannerResult, type FilterConfig, MOMENTUM_DEFAULTS } from "@/lib/types";
import { ExternalLink } from "lucide-react";

const FREE_ROW_CAP = 10;
const FREE_REFRESH_MS = 15 * 60 * 1000; // 15 minutes

export default function ScannerPage() {
  const [allResults, setAllResults] = useState<ScannerResult[]>([]);
  const [filters, setFilters] = useState<FilterConfig>(MOMENTUM_DEFAULTS);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nextRefresh, setNextRefresh] = useState<number>(FREE_REFRESH_MS / 1000);

  const { platform, platformId, setPlatform } = usePlatform();
  const { columns, toggle, moveUp, moveDown, reset } = useColumns();
  const supabase = createClient();

  const fetchResults = useCallback(() => {
    supabase
      .from("scanner_results")
      .select("*")
      .order("rvol", { ascending: false })
      .then(({ data }) => {
        setAllResults(data ?? []);
        setLoading(false);
        setNextRefresh(FREE_REFRESH_MS / 1000);
      });
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("tier")
        .eq("user_id", data.user.id)
        .single();
      setIsPro(sub?.tier === "pro");
    });
  }, []);

  // Initial fetch
  useEffect(() => { fetchResults(); }, []);

  // Pro: Realtime subscription
  useEffect(() => {
    if (!isPro) return;
    const channel = supabase
      .channel("scanner-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scanner_results" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setAllResults((prev) =>
              prev.filter((r) => r.ticker !== (payload.old as any).ticker)
            );
          } else {
            const row = payload.new as ScannerResult;
            setAllResults((prev) => {
              const idx = prev.findIndex((r) => r.ticker === row.ticker);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = row;
                return next;
              }
              return [...prev, row];
            });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isPro]);

  // Free: 15-min periodic refresh + countdown
  useEffect(() => {
    if (isPro) return;
    const refreshTimer = setInterval(fetchResults, FREE_REFRESH_MS);
    const countdownTimer = setInterval(() => {
      setNextRefresh((n) => (n <= 1 ? FREE_REFRESH_MS / 1000 : n - 1));
    }, 1000);
    return () => {
      clearInterval(refreshTimer);
      clearInterval(countdownTimer);
    };
  }, [isPro, fetchResults]);

  const displayed = useMemo(() => {
    const filtered = applyClientFilters(allResults, filters);
    const sorted = [...filtered].sort((a, b) => b.rvol - a.rvol);
    return isPro ? sorted : sorted.slice(0, FREE_ROW_CAP);
  }, [allResults, filters, isPro]);

  const fmtCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Momentum Scanner</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Price $1–$20 · float ≤20M · gap ≥10% · RVOL ≥5×
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PlatformPicker platformId={platformId} onChange={setPlatform} />
          <ColumnPicker columns={columns} onToggle={toggle} onMoveUp={moveUp} onMoveDown={moveDown} onReset={reset} />
          <button
            onClick={() => window.open("/live", "scanner-popout", "width=720,height=700,resizable=yes,scrollbars=yes")}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-100 border border-gray-700 hover:border-gray-500 px-2.5 py-1.5 rounded-md transition-colors"
            title="Pop out scanner"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Pop out
          </button>
          <div className="flex items-center gap-1.5 text-xs">
            {isPro ? (
              <span className="flex items-center gap-1.5 text-green-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-gray-600" />
                Refreshes in {fmtCountdown(nextRefresh)}
              </span>
            )}
          </div>
        </div>
      </div>

      <StatsBar count={displayed.length} />

      <div className="mt-4 flex gap-5 items-start">
        <FilterPanel filters={filters} onChange={setFilters} isPro={isPro} />

        <div className="flex-1 flex flex-col gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <ScannerTable results={displayed} isPro={isPro} platform={platform} columns={columns} />
          </div>

          {!isPro && !loading && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Top {Math.min(FREE_ROW_CAP, displayed.length)} results · refreshes in {fmtCountdown(nextRefresh)}
              </p>
              <a
                href="/pricing"
                className="text-sm bg-green-500 hover:bg-green-400 text-gray-950 font-semibold px-4 py-1.5 rounded transition-colors"
              >
                Upgrade for live — $29/mo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
