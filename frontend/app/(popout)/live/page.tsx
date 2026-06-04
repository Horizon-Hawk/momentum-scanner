"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ScannerTable } from "@/components/scanner/ScannerTable";
import { PlatformPicker } from "@/components/scanner/PlatformPicker";
import { StatsBar } from "@/components/scanner/StatsBar";
import { usePlatform } from "@/hooks/usePlatform";
import { useColumns } from "@/hooks/useColumns";
import { type ScannerResult, MOMENTUM_DEFAULTS } from "@/lib/types";
import { applyClientFilters } from "@/lib/filterUtils";

const FREE_REFRESH_MS = 15 * 60 * 1000;

export default function LivePopout() {
  const [allResults, setAllResults] = useState<ScannerResult[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [nextRefresh, setNextRefresh] = useState<number>(FREE_REFRESH_MS / 1000);
  const { platform, platformId, setPlatform } = usePlatform();
  const { columns } = useColumns();
  const supabase = createClient();

  const fetchResults = useCallback(() => {
    supabase
      .from("scanner_results")
      .select("*")
      .order("rvol", { ascending: false })
      .then(({ data }) => {
        setAllResults(data ?? []);
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

  useEffect(() => { fetchResults(); }, []);

  // Pro: Realtime
  useEffect(() => {
    if (!isPro) return;
    const channel = supabase
      .channel("scanner-live-popout")
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

  // Free: 15-min refresh + countdown
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
    const filtered = applyClientFilters(allResults, MOMENTUM_DEFAULTS);
    const sorted = [...filtered].sort((a, b) => b.rvol - a.rvol);
    return isPro ? sorted : sorted.slice(0, 10);
  }, [allResults, isPro]);

  const fmtCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <StatsBar count={displayed.length} compact />
          {isPro ? (
            <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              Refreshes in {fmtCountdown(nextRefresh)}
            </span>
          )}
        </div>
        <PlatformPicker platformId={platformId} onChange={setPlatform} />
      </div>

      <div className="flex-1 overflow-auto">
        <ScannerTable results={displayed} isPro={isPro} platform={platform} columns={columns} compact />
      </div>
    </div>
  );
}
