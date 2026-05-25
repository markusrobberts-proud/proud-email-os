"use client"

import { useEffect, useRef } from "react"
import { checkApprovalStatus } from "./poll-actions"

/**
 * Lightweight client component that polls every 5 seconds while the
 * user sits on /awaiting-approval. The moment an admin assigns them a
 * role, we hard-navigate to "/" so the (dashboard) layout boots fresh
 * instead of trying to swap into the same segment.
 *
 * Pauses while the tab is hidden so we're not burning Supabase reads.
 */
export function ApprovalPoller() {
  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false
    let timer: ReturnType<typeof setTimeout> | null = null

    async function tick() {
      if (document.hidden) {
        if (!cancelled.current) timer = setTimeout(tick, 4000)
        return
      }
      try {
        const res = await checkApprovalStatus()
        if (!cancelled.current && res.approved) {
          // Hard navigation so we leave the (auth) layout and re-enter
          // the (dashboard) one with the fresh role.
          window.location.href = "/"
          return
        }
      } catch {
        // Soft-fail. Keep polling.
      }
      if (!cancelled.current) timer = setTimeout(tick, 5000)
    }

    timer = setTimeout(tick, 5000)
    return () => {
      cancelled.current = true
      if (timer) clearTimeout(timer)
    }
  }, [])

  return null
}
