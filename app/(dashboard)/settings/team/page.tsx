import { requireRole } from "@/lib/rbac"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, initialsFromName } from "@/components/ui/avatar"
import { PageHeader, PageShell } from "@/components/layout/page-header"
import { RoleSelect } from "./role-select"

type UserRow = {
  id: string
  email: string
  display_name: string | null
  role: "super_admin" | "admin" | "strategist" | "designer" | "viewer" | "pending"
  created_at: string
}

const ROLE_COLOURS: Record<string, string> = {
  super_admin: "#0A4B91",
  admin: "#1D1D1F",
  strategist: "#2D4F6B",
  designer: "#8B5A2B",
  viewer: "#6E6E73",
  pending: "#B45309",
}

export default async function TeamPage() {
  const admin = await requireRole("admin")
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("users")
    .select("id,email,display_name,role,created_at")
    .order("created_at", { ascending: true })
  const users = (data ?? []) as UserRow[]
  const pendingCount = users.filter((u) => u.role === "pending").length

  return (
    <PageShell>
      <PageHeader
        eyebrow="Admin"
        title="Team"
        description="Invite teammates, change roles, deactivate accounts."
        actions={
          pendingCount > 0 ? (
            <Badge variant="warning">{pendingCount} pending</Badge>
          ) : undefined
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How to add a teammate</CardTitle>
          <CardDescription>
            Auth is Clerk. Self-signup keeps the flow simple, no invite emails to manage.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-[13px] text-[#1D1D1F]">
          <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
            <li>Send them the sign-in link: <code className="text-[12.5px] bg-[#F5F5F7] px-1.5 py-0.5 rounded">{process.env.NEXT_PUBLIC_APP_URL ?? "https://punch-email-os.vercel.app"}/sign-in</code></li>
            <li>They sign in with Google SSO (proudaspunch.studio works out of the box) or email magic link.</li>
            <li>They land on a "Pending approval" screen. Come back here and pick their role below.</li>
            <li>They refresh and they're in.</li>
          </ol>
        </CardContent>
      </Card>

      <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-3">Members</div>
      <Card>
        <CardContent className="p-0">
          {users.map((u, idx) => (
            <div
              key={u.id}
              className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
                idx === users.length - 1 ? "" : "border-b border-[#E5E5EA]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  initials={initialsFromName(u.display_name ?? u.email)}
                  color={ROLE_COLOURS[u.role]}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">
                    {u.display_name || u.email.split("@")[0]}
                    {u.id === admin.id && <span className="text-[11px] text-[#86868B] ml-2">(you)</span>}
                  </div>
                  <div className="text-[12px] text-[#86868B] truncate">{u.email}</div>
                </div>
              </div>
              <RoleSelect
                userId={u.id}
                currentRole={u.role}
                isSelf={u.id === admin.id}
                canAssignSuperAdmin={admin.actualRole === "super_admin"}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  )
}
