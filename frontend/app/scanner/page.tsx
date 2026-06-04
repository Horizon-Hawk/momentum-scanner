"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { ScannerTable } from "@/components/scanner/ScannerTable";
import { FilterPanel } from "@/components/scanner/FilterPanel";
import { StatsBar } from "@/components/scanner/StatsBar";
import { type ScannerResult, type FilterConfig, ROSS_CAMERON_DEFAULTS } from "@/lib/types";

function applyClientFilters(results: ScannerResult[], f: FilterConfig): ScannerResult[] {
  return results.filter((r) => {
    if (r.price < f.min_price || r.price > f.max_price) return false;
    if (r.float_shares && r.float_shares / 1_000_000 > f.max_float_millions) return false;
    if (r.gap_pct < f.min_gap_pct) return false;
    if (r.rvol < f.min_rvol) return false;
    return true;
  });
}

export default function ScannerPage() {
  const [allResults, setAllResults] = useState<ScannerResult[]>([]);
  const [filters, setFilters] = useState<FilterConfig>(ROSS_CAMERON_DEFAULTS);
  const [isPro, setIsPro] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Check subscription tier
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

  useEffect(() => {
    // Seed with current data
    supabase
      .from("scanner_results")
      .select("*")
      .order("rvol", { ascending: false })
      .then(({ data }) => setAllResults(data ?? []));

    // Live subscription
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
  }, []);

  const displayed = useMemo(() => {
    const filtered = isPro ? applyClientFilters(allResults, filters) : allResults;
    return [...filtered].sort((a, b) => b.rvol - a.rvol);
  }, [allResults, filters, isPro]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-100">Momentum Scanner</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Ross Cameron presets — price $1–$20 · float ≤20M · gap ≥10% · RVOL ≥5×
        </p>
      </div>

      <StatsBar count={displayed.length} />

      <div className="mt-4 flex gap-5 items-start">
        <FilterPanel filters={filters} onChange={setFilters} isPro={isPro} />

        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <ScannerTable results={displayed} isPro={isPro} />
        </div>
      </div>
    </div>
  );
}
