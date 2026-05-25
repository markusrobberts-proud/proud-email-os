"use client"

import { SignOutButton as ClerkSignOut } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  return (
    <ClerkSignOut redirectUrl="/sign-in">
      <Button variant="outline">Sign out</Button>
    </ClerkSignOut>
  )
}
