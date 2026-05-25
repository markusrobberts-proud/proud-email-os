"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { setKnowledgeReviewStatus, deleteKnowledgeItem } from "./actions"

export function KnowledgeReviewActions({
  id,
  status,
  canReview = true,
  canDelete = true,
}: {
  id: string
  status: "pending_review" | "approved" | "rejected"
  canReview?: boolean
  canDelete?: boolean
}) {
  const [pending, startTransition] = useTransition()

  function act(action: () => Promise<void>) {
    startTransition(async () => {
      await action()
    })
  }

  if (!canReview && !canDelete) return null

  return (
    <div className="flex items-center gap-1">
      {canReview && status !== "approved" && (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            act(async () => {
              const fd = new FormData()
              fd.set("id", id)
              fd.set("status", "approved")
              await setKnowledgeReviewStatus(fd)
            })
          }
        >
          Approve
        </Button>
      )}
      {canReview && status !== "rejected" && (
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() =>
            act(async () => {
              const fd = new FormData()
              fd.set("id", id)
              fd.set("status", "rejected")
              await setKnowledgeReviewStatus(fd)
            })
          }
        >
          Reject
        </Button>
      )}
      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() =>
            act(async () => {
              const fd = new FormData()
              fd.set("id", id)
              await deleteKnowledgeItem(fd)
            })
          }
        >
          Delete
        </Button>
      )}
    </div>
  )
}
