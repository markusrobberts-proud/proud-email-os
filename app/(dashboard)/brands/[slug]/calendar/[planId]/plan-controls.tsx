"use client"

import { useTransition } from "react"
import { Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  generateCalendar,
  approveCalendar,
  generateAllCopy,
  generateAllBriefs,
} from "../actions"
import type { CampaignPlan } from "@/lib/campaigns"
import { ShareButton } from "./share-button"

export function PlanControls({ plan, canEdit }: { plan: CampaignPlan; canEdit: boolean }) {
  const [pending, startTransition] = useTransition()

  function act(fn: () => Promise<void>) {
    startTransition(async () => {
      try {
        await fn()
      } catch (err) {
        console.error(err)
        alert((err as Error).message)
      }
    })
  }

  const showGenerate = ["draft", "pending_review", "error"].includes(plan.status)
  const showApprove = plan.status === "pending_review"
  const showCopy =
    ["calendar_approved", "copy_done", "briefs_done", "complete"].includes(plan.status)
  const showBriefs = ["copy_done", "briefs_done", "complete"].includes(plan.status)
  const shareable =
    ["calendar_approved", "copy_done", "briefs_done", "complete"].includes(plan.status)

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <StatusBadge status={plan.status} />
      {canEdit && (
        <>
          {showGenerate && (
            <Button
              size="sm"
              variant="accent"
              onClick={() => act(() => generateCalendar(plan.id))}
              disabled={pending}
            >
              <Sparkles />
              {plan.status === "draft" ? "Generate calendar" : "Regenerate"}
            </Button>
          )}
          {showApprove && (
            <Button size="sm" onClick={() => act(() => approveCalendar(plan.id))} disabled={pending}>
              <Check /> Approve calendar
            </Button>
          )}
          {showCopy && (
            <Button size="sm" variant="secondary" onClick={() => act(() => generateAllCopy(plan.id))} disabled={pending}>
              <Sparkles /> {plan.status === "calendar_approved" ? "Generate all copy" : "Regenerate all copy"}
            </Button>
          )}
          {showBriefs && (
            <Button size="sm" variant="secondary" onClick={() => act(() => generateAllBriefs(plan.id))} disabled={pending}>
              <Sparkles /> {plan.status === "copy_done" ? "Generate all briefs" : "Regenerate all briefs"}
            </Button>
          )}
          {shareable && <ShareButton planId={plan.id} />}
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "neutral" | "warning" | "success" | "destructive"; label: string }> = {
    draft: { variant: "neutral", label: "Draft" },
    generating: { variant: "warning", label: "Generating..." },
    pending_review: { variant: "warning", label: "Pending review" },
    calendar_approved: { variant: "success", label: "Calendar approved" },
    copy_generating: { variant: "warning", label: "Copy generating..." },
    copy_done: { variant: "success", label: "Copy done" },
    briefs_done: { variant: "success", label: "Briefs done" },
    complete: { variant: "success", label: "Complete" },
    error: { variant: "destructive", label: "Error" },
  }
  const m = map[status] ?? { variant: "neutral" as const, label: status }
  return <Badge variant={m.variant}>{m.label}</Badge>
}
