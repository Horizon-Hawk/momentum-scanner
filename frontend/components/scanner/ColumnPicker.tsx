"use client"

import { useState } from "react"
import { Settings2, ChevronUp, ChevronDown, RotateCcw } from "lucide-react"
import { ALL_COLUMNS, type ColumnState } from "@/lib/columns"

interface Props {
  columns: ColumnState[]
  onToggle: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onReset: () => void
}

export function ColumnPicker({ columns, onToggle, onMoveUp, onMoveDown, onReset }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-xs border px-2.5 py-1.5 rounded-md transition-colors ${
          open
            ? "border-green-500 text-green-400"
            : "border-gray-700 text-gray-400 hover:text-gray-100 hover:border-gray-500"
        }`}
        title="Customize columns"
      >
        <Settings2 className="w-3.5 h-3.5" />
        Columns
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-50 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-300">Columns</span>
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="space-y-0.5">
              {columns.map((col, idx) => {
                const def = ALL_COLUMNS.find((c) => c.id === col.id)
                if (!def) return null
                const isLocked = !!def.locked

                return (
                  <div key={col.id} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-gray-800">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      disabled={isLocked}
                      onChange={() => !isLocked && onToggle(col.id)}
                      className="accent-green-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    <span className={`flex-1 text-xs ${isLocked ? "text-gray-500" : "text-gray-200"}`}>
                      {def.label}
                    </span>
                    {!isLocked && (
                      <div className="flex flex-col">
                        <button
                          onClick={() => onMoveUp(col.id)}
                          disabled={idx <= 1}
                          className="text-gray-600 hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onMoveDown(col.id)}
                          disabled={idx === columns.length - 1}
                          className="text-gray-600 hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
