"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { GitBranch, ExternalLink } from "lucide-react"
import {
  deploymentStateLabel,
  shortRelativeTime,
  type DeploymentStatus,
} from "@/lib/deployment-status"

const TONE_DOT: Record<string, string> = {
  ready: "bg-[#30D158]",
  building: "bg-[#FFA940] animate-pulse",
  error: "bg-[#FF3B30]",
  neutral: "bg-[#86868B]",
}

const TONE_TEXT: Record<string, string> = {
  ready: "text-[#166D2F]",
  building: "text-[#8B5A00]",
  error: "text-[#A8160C]",
  neutral: "text-[#1D1D1F]",
}

/**
 * Live deployment banner. Triggers a server-component refresh on a tick
 * so the DeploymentBanner server component re-renders with fresh Vercel
 * state without requiring a manual page reload.
 *
 * Why router.refresh and not a custom poll: the previous implementation
 * called a Server Action with a try/catch that swallowed all errors,
 * which meant any auth or network hiccup left the banner silently stale
 * until next reload. router.refresh is harder to get wrong: Next fetches
 * the layout fresh, the server component reads its (short-cached) Vercel
 * status, the dot/SHA/relative-time updates without any client logic.
 */
export function DeploymentBannerView({ initial }: { initial: DeploymentStatus }) {
  const router = useRouter()
  // Tick every second so the "Xs ago" label stays honest between refreshes.
  const [, setTick] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    // Faster cadence while a build is in flight so the "Live" flip lands
    // within a few seconds of the build completing.
    const buildInFlight =
      initial.state === "BUILDING" || initial.state === "QUEUED" || initial.state === "INITIALIZING"
    const refreshIntervalMs = buildInFlight ? 4000 : 10000

    function schedule() {
      if (cancelled) return
      intervalRef.current = setTimeout(() => {
        if (document.hidden) {
          // Skip refresh while tab is hidden; reschedule cheap.
          schedule()
          return
        }
        router.refresh()
        schedule()
      }, refreshIntervalMs)
    }
    schedule()

    return () => {
      cancelled = true
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
    // `initial.state` so when the server re-renders us with a new state,
    // we reschedule at the appropriate cadence (build-in-flight vs idle).
  }, [router, initial.state])

  // 1s clock so the "Xs ago" stays honest between refreshes.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const { label, tone } = deploymentStateLabel(initial.state)
  const sha = initial.commitSha?.slice(0, 7)
  const age = initial.createdAt ? shortRelativeTime(initial.createdAt) : null
  const href = initial.inspectorUrl ?? "#"

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="w-full bg-white/70 backdrop-blur-md border-b border-[#E5E5EA] px-6 py-1.5 flex items-center justify-center gap-3 text-[11.5px] hover:bg-white transition group"
    >
      <span className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${TONE_DOT[tone]}`} />
        <span className={`font-medium ${TONE_TEXT[tone]}`}>{label}</span>
      </span>
      {sha && (
        <span className="flex items-center gap-1 text-[#6E6E73]">
          <GitBranch className="size-3" />
          <code className="text-[10.5px] font-mono">{sha}</code>
        </span>
      )}
      {initial.commitMessage && (
        <span className="text-[#86868B] truncate max-w-[420px] hidden sm:inline">
          {initial.commitMessage.split("\n")[0]}
        </span>
      )}
      {age && <span className="text-[#86868B]">· {age}</span>}
      <ExternalLink className="size-3 text-[#C7C7CC] opacity-0 group-hover:opacity-100 transition" />
    </a>
  )
}
