"use client"

import { useEffect, useState } from "react"
import { type ColumnState, defaultColumnState } from "@/lib/columns"

const STORAGE_KEY = "ms_columns"

export function useColumns() {
  const [columns, setColumns] = useState<ColumnState[]>(defaultColumnState)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: ColumnState[] = JSON.parse(stored)
        // merge: keep stored order/visibility, add any new columns at end
        const defaults = defaultColumnState()
        const merged = parsed.filter((s) => defaults.some((d) => d.id === s.id))
        const newCols = defaults.filter((d) => !parsed.some((s) => s.id === d.id))
        setColumns([...merged, ...newCols])
      }
    } catch {}
  }, [])

  const save = (next: ColumnState[]) => {
    setColumns(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const toggle = (id: string) => {
    save(columns.map((c) => c.id === id ? { ...c, visible: !c.visible } : c))
  }

  const moveUp = (id: string) => {
    const idx = columns.findIndex((c) => c.id === id)
    if (idx <= 1) return  // can't move above ticker (idx 0)
    const next = [...columns]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    save(next)
  }

  const moveDown = (id: string) => {
    const idx = columns.findIndex((c) => c.id === id)
    if (idx === 0 || idx === columns.length - 1) return
    const next = [...columns]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    save(next)
  }

  const reset = () => save(defaultColumnState())

  return { columns, toggle, moveUp, moveDown, reset }
}
