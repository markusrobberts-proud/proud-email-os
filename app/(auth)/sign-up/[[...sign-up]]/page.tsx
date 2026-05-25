import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#1D1D1F] mb-4">
            <span className="text-white font-semibold text-[15px]">P</span>
          </div>
          <div className="text-[11px] font-semibold tracking-widest uppercase text-[#86868B]">
            Proud Creative
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight mt-1" style={{ letterSpacing: "-0.02em" }}>
            Join Email OS
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-3">An admin will activate your account once you're in.</p>
        </div>
        <SignUp appearance={{ elements: { rootBox: "w-full", card: "glass-strong rounded-2xl" } }} />
      </div>
    </main>
  )
}
