"use client";

import { Lock, RotateCcw } from "lucide-react";
import { type FilterConfig, ROSS_CAMERON_DEFAULTS } from "@/lib/types";

interface Props {
  filters: FilterConfig;
  onChange: (f: FilterConfig) => void;
  isPro: boolean;
}

function Field({
  label,
  tip,
  value,
  onChange,
  disabled,
  prefix = "",
  suffix = "",
  step = "1",
  min = "0",
}: {
  label: string;
  tip: string;
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  prefix?: string;
  suffix?: string;
  step?: string;
  min?: string;
}) {
  return (
    <label className="flex flex-col gap-1" title={tip}>
      <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
        {label}
        {disabled && <Lock className="w-3 h-3 text-gray-600" />}
      </span>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-gray-500 text-sm">{prefix}</span>}
        <input
          type="number"
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm font-mono text-gray-100 focus:outline-none focus:border-green-500 disabled:opacity-40 disabled:cursor-not-allowed"
          value={value}
          step={step}
          min={min}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
        {suffix && <span className="text-gray-500 text-sm">{suffix}</span>}
      </div>
    </label>
  );
}

export function FilterPanel({ filters, onChange, isPro }: Props) {
  const locked = !isPro;

  const set = (key: keyof FilterConfig) => (v: number) =>
    onChange({ ...filters, [key]: v });

  return (
    <aside className="w-64 shrink-0 bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col gap-4 self-start sticky top-20">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-200">Filters</h2>
        <button
          onClick={() => onChange(ROSS_CAMERON_DEFAULTS)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-400 transition-colors"
          title="Reset to Ross Cameron defaults"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Price</p>
        <div className="flex items-center gap-2">
          <Field label="Min" tip="Minimum price" value={filters.min_price} onChange={set("min_price")} disabled={locked} prefix="$" step="0.50" min="0" />
          <Field label="Max" tip="Maximum price" value={filters.max_price} onChange={set("max_price")} disabled={locked} prefix="$" step="1" min="0" />
        </div>
      </div>

      <Field
        label="Float max (M)"
        tip="Maximum float in millions of shares. Small float = easier for price to move."
        value={filters.max_float_millions}
        onChange={set("max_float_millions")}
        disabled={locked}
        suffix="M"
        step="1"
      />

      <Field
        label="Gap % min"
        tip="Minimum gap from previous close. Ross Cameron looks for ≥10%."
        value={filters.min_gap_pct}
        onChange={set("min_gap_pct")}
        disabled={locked}
        suffix="%"
        step="1"
      />

      <Field
        label="RVOL min"
        tip="Minimum relative volume (today's pace vs 20-day average). 5x = 5× normal volume."
        value={filters.min_rvol}
        onChange={set("min_rvol")}
        disabled={locked}
        suffix="x"
        step="0.5"
      />

      {locked && (
        <div className="mt-2 p-3 rounded-md bg-gray-800 border border-gray-700 text-center">
          <Lock className="w-4 h-4 text-gray-500 mx-auto mb-1.5" />
          <p className="text-xs text-gray-400 mb-2">Custom filters require Pro</p>
          <a
            href="/pricing"
            className="block text-xs bg-green-500 hover:bg-green-400 text-gray-950 font-semibold px-3 py-1.5 rounded transition-colors"
          >
            Upgrade — $29/mo
          </a>
        </div>
      )}

      <div className="pt-2 border-t border-gray-800">
        <p className="text-xs text-gray-600 font-medium mb-1.5">Ross Cameron Defaults</p>
        <ul className="text-xs text-gray-500 space-y-0.5">
          <li>Price: $1 – $20</li>
          <li>Float: ≤ 20M shares</li>
          <li>Gap: ≥ 10%</li>
          <li>RVOL: ≥ 5×</li>
        </ul>
      </div>
    </aside>
  );
}
