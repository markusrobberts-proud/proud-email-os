import { requireUser } from "@/lib/auth"
import { SignOutButton } from "@/components/layout/sign-out-button"

export default async function AwaitingApprovalPage() {
  const user = await requireUser()

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#1D1D1F] mb-4">
            <span className="text-white font-semibold text-[15px]">P</span>
          </div>
          <div className="text-[11px] font-semibold tracking-widest uppercase text-[#86868B]">
            PUNCH
          </div>
        </div>
        <div className="glass-strong rounded-2xl p-7 text-center">
          <h1 className="text-[20px] font-semibold tracking-display">You're signed in</h1>
          <p className="text-[13px] text-[#6E6E73] mt-3 leading-relaxed">
            Welcome, {user.displayName ?? user.email}. Your account is awaiting approval from an admin. You'll get access as soon as a role is assigned.
          </p>
          <div className="mt-7 flex justify-center">
            <SignOutButton />
          </div>
        </div>
      </div>
    </main>
  )
}
