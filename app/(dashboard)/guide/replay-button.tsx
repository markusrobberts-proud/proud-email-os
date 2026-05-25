"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resetWelcomeTour } from "@/components/layout/welcome-tour-actions"

/**
 * Lets the user re-trigger the welcome tour. Resets welcome_seen_at to
 * null, then navigates to the home page so the dashboard layout's tour
 * gate sees the new state and pops the modal.
 */
export function ReplayTourButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await resetWelcomeTour()
          router.push("/")
          router.refresh()
        })
      }
    >
      <Play /> {pending ? "Starting..." : "Replay tour"}
    </Button>
  )
}
