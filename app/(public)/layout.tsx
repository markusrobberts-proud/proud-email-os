// Public routes deliberately bypass the auth-gated dashboard layout.
// The aurora background still comes through via globals.css on <body>.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>
}
