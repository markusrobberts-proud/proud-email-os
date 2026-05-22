import { requireUser } from "@/lib/auth"
import { SignOutButton } from "@/components/layout/sign-out-button"

export default async function AwaitingApprovalPage() {
  const user = await requireUser()

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-neutral-50 to-neutral-100 px-6">
      <div className="w-full max-w-md text-center">
        <div className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
          Proud Email OS
        </div>
        <h1 className="text-2xl font-semibold mt-2">You're signed in</h1>
        <p className="text-sm text-muted-foreground mt-4">
          Welcome, {user.displayName ?? user.email}. Your account is awaiting approval from an admin.
          You'll get access as soon as a role is assigned.
        </p>
        <div className="mt-8">
          <SignOutButton />
        </div>
      </div>
    </main>
  )
}
