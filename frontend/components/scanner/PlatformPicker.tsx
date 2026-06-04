"use client"

import { ExternalLink, Clipboard } from "lucide-react"
import { PLATFORMS } from "@/lib/platforms"

interface Props {
  platformId: string
  onChange: (id: string) => void
}

export function PlatformPicker({ platformId, onChange }: Props) {
  const current = PLATFORMS.find((p) => p.id === platformId) ?? PLATFORMS[0]
  const isClipboard = !!current.clipboard

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 hidden sm:block whitespace-nowrap">Open in</span>
      <div className="relative flex items-center">
        <span className="absolute left-2.5 text-gray-500 pointer-events-none">
          {isClipboard
            ? <Clipboard className="w-3 h-3" />
            : <ExternalLink className="w-3 h-3" />
          }
        </span>
        <select
          value={platformId}
          onChange={(e) => onChange(e.target.value)}
          className="pl-7 pr-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:border-green-500 cursor-pointer appearance-none"
        >
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}{p.clipboard ? " (copies symbol)" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
