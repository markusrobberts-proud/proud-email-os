import { requireRole } from "@/lib/rbac"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader, PageShell } from "@/components/layout/page-header"

type AuditRow = {
  id: number
  user_id: string | null
  brand_id: string | null
  entity_type: string
  entity_id: string | null
  action: string
  meta: Record<string, unknown> | null
  created_at: string
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.round(diff / 1000)
  if (s < 60) return "just now"
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString()
}

export default async function AuditLogPage() {
  await requireRole("admin")
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)
  const rows = (data ?? []) as AuditRow[]

  const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean))) as string[]
  const brandIds = Array.from(new Set(rows.map((r) => r.brand_id).filter(Boolean))) as string[]

  const [{ data: users }, { data: brands }] = await Promise.all([
    userIds.length > 0
      ? supabase.from("users").select("id,email,display_name").in("id", userIds)
      : Promise.resolve({ data: [] }),
    brandIds.length > 0
      ? supabase.from("brands").select("id,name,slug").in("id", brandIds)
      : Promise.resolve({ data: [] }),
  ])

  const userMap = new Map(
    (users ?? []).map((u: { id: string; email: string; display_name: string | null }) => [u.id, u]),
  )
  const brandMap = new Map(
    (brands ?? []).map((b: { id: string; name: string; slug: string }) => [b.id, b]),
  )

  return (
    <PageShell>
      <PageHeader
        eyebrow="Admin"
        title="Audit log"
        description="Every mutation across the platform. For trust and traceability."
      />

      {rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nothing logged yet</CardTitle>
            <CardDescription>Create a brand or generate a calendar to see activity.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {rows.map((row, idx) => {
              const user = row.user_id ? userMap.get(row.user_id) : null
              const brand = row.brand_id ? brandMap.get(row.brand_id) : null
              return (
                <div
                  key={row.id}
                  className={`flex items-start justify-between gap-4 px-5 py-3 text-[13px] ${
                    idx === rows.length - 1 ? "" : "border-b border-[#E5E5EA]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{user?.display_name || user?.email || "system"}</span>
                      <code className="text-[11px] bg-[#F5F5F7] px-1.5 py-0.5 rounded text-[#6E6E73]">{row.action}</code>
                      <span className="text-[#86868B]">on</span>
                      <span className="capitalize">{row.entity_type.replace(/_/g, " ")}</span>
                      {brand && (
                        <>
                          <span className="text-[#86868B]">·</span>
                          <span>{brand.name}</span>
                        </>
                      )}
                    </div>
                    {row.meta && Object.keys(row.meta).length > 0 && (
                      <div className="text-[11px] text-[#86868B] mt-0.5 truncate font-mono">
                        {JSON.stringify(row.meta)}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-[#86868B] shrink-0">{relativeTime(row.created_at)}</div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </PageShell>
  )
}
