import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-neutral-50 to-neutral-100 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
            Proud Creative
          </div>
          <h1 className="text-3xl font-semibold mt-2">Email OS</h1>
          <p className="text-sm text-muted-foreground mt-3">
            Sign in with your team email — we'll send you a magic link.
          </p>
        </div>
        <div className="glass rounded-2xl p-8">
          <LoginForm />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Internal tool. New here? Ask an admin to invite you.
        </p>
      </div>
    </main>
  )
}
