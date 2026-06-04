export type ColumnDef = {
  id: string
  label: string
  tip: string
  defaultVisible: boolean
  locked?: boolean  // can't hide or reorder
}

export const ALL_COLUMNS: ColumnDef[] = [
  { id: "ticker",     label: "Ticker",     tip: "Stock symbol",                                          defaultVisible: true,  locked: true },
  { id: "price",      label: "Price",      tip: "Latest traded price",                                    defaultVisible: true  },
  { id: "gap_pct",    label: "Gap %",      tip: "Today's open vs yesterday's close",                      defaultVisible: true  },
  { id: "rvol",       label: "RVOL",       tip: "Relative volume vs 20-day average. 5x = 5× normal",      defaultVisible: true  },
  { id: "float",      label: "Float",      tip: "Shares available to trade. Lower = easier to move",      defaultVisible: true  },
  { id: "volume",     label: "Volume",     tip: "Total shares traded today",                              defaultVisible: true  },
  { id: "hod",        label: "HOD",        tip: "High of day",                                           defaultVisible: true  },
  { id: "lod",        label: "LOD",        tip: "Low of day",                                            defaultVisible: false },
  { id: "open",       label: "Open",       tip: "Opening price",                                         defaultVisible: false },
  { id: "prev_close", label: "Prev Close", tip: "Yesterday's closing price",                             defaultVisible: false },
  { id: "sector",     label: "Sector",     tip: "GICS sector",                                           defaultVisible: false },
  { id: "updated",    label: "Updated",    tip: "Seconds since last price update",                       defaultVisible: true  },
]

export type ColumnState = { id: string; visible: boolean }

export function defaultColumnState(): ColumnState[] {
  return ALL_COLUMNS.map((c) => ({ id: c.id, visible: c.defaultVisible }))
}

export function getVisibleColumns(state: ColumnState[]): ColumnDef[] {
  return state
    .filter((s) => s.visible)
    .map((s) => ALL_COLUMNS.find((c) => c.id === s.id)!)
    .filter(Boolean)
}
