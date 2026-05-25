"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deletePlan } from "./actions"

/**
 * Tiny inline delete affordance for a row in the calendar list. We keep the
 * confirm step (type the campaign name) so a stray click doesn't wipe a
 * month of work. Strategist+ only; the parent decides whether to render it.
 */
export function PlanRowDelete({
  planId,
  brandSlug,
  campaignName,
}: {
  planId: string
  brandSlug: string
  campaignName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setConfirm("")
          setError(null)
          setOpen(true)
        }}
        className="p-1.5 rounded-md text-[#86868B] hover:text-[#D70015] hover:bg-white transition"
        aria-label={`Delete ${campaignName}`}
        title="Delete campaign"
      >
        <Trash2 className="size-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{campaignName}"?</DialogTitle>
            <DialogDescription>
              Removes the plan, all of its emails, briefs, and approval activity. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor={`confirm-${planId}`} className="text-[13px] font-medium">
              Type the campaign name to confirm
            </label>
            <input
              id={`confirm-${planId}`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={campaignName}
              autoComplete="off"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
            <p className="text-[12px] text-[#86868B]">{campaignName}</p>
            {error && <p className="text-[12px] text-[#D70015]">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending || confirm.trim().length === 0}
              onClick={() =>
                startTransition(async () => {
                  setError(null)
                  const fd = new FormData()
                  fd.set("planId", planId)
                  fd.set("brandSlug", brandSlug)
                  fd.set("confirm", confirm)
                  const res = await deletePlan(fd)
                  if (res.ok) {
                    setOpen(false)
                    router.refresh()
                  } else {
                    setError(res.error)
                  }
                })
              }
            >
              {pending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
