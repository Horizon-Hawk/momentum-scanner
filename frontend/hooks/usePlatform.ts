"use client"

import { useEffect, useState } from "react"
import { type Platform, DEFAULT_PLATFORM_ID, getPlatform } from "@/lib/platforms"

const STORAGE_KEY = "ms_chart_platform"

export function usePlatform() {
  const [platformId, setPlatformId] = useState<string>(DEFAULT_PLATFORM_ID)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setPlatformId(stored)
  }, [])

  const set = (id: string) => {
    setPlatformId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  return { platform: getPlatform(platformId), platformId, setPlatform: set }
}
