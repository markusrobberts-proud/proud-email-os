"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { setKnowledgeReviewStatus, deleteKnowledgeItem } from "./actions"

export function KnowledgeReviewActions({
  id,
  status,
}: {
  id: string
  status: "pending_review" | "approved" | "rejected"
}) {
  const [pending, startTransition] = useTransition()

  function act(action: () => Promise<void>) {
    startTransition(async () => {
      await action()
    })
  }

  return (
    <div className="flex items-center gap-1">
      {status !== "approved" && (
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
      {status !== "rejected" && (
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
    </div>
  )
}
