import { requireApprovedUser } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { listAccessibleBrands } from "@/lib/brands"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KnowledgeReviewActions } from "./review-actions"
import { AddNoteDialog } from "./add-note-dialog"

type KnowledgeRow = {
  id: string
  brand_id: string
  title: string
  source_type: string
  review_status: "pending_review" | "approved" | "rejected"
  created_at: string
}

export default async function KnowledgeBankPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; status?: string }>
}) {
  await requireApprovedUser()
  const params = await searchParams
  const brands = await listAccessibleBrands()
  const brandFilter = params.brand
  const statusFilter = params.status ?? "all"

  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("knowledge_items")
    .select("id,brand_id,title,source_type,review_status,created_at")
    .order("created_at", { ascending: false })
    .limit(100)
  if (brandFilter) query = query.eq("brand_id", brandFilter)
  if (statusFilter !== "all") query = query.eq("review_status", statusFilter)

  const { data } = await query
  const items = (data ?? []) as KnowledgeRow[]
  const brandById = new Map(brands.map((b) => [b.id, b]))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Bank</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Everything Claude reads. Pending items need a review before they enter AI context.
          </p>
        </div>
        <AddNoteDialog brands={brands.map((b) => ({ id: b.id, name: b.name }))} />
      </div>

      <Filters brands={brands.map((b) => ({ id: b.id, name: b.name }))} brandFilter={brandFilter} statusFilter={statusFilter} />

      {items.length === 0 ? (
        <Card><CardHeader><CardTitle className="text-base">Nothing here yet</CardTitle><CardDescription>Add a manual note to seed the bank.</CardDescription></CardHeader></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const brand = brandById.get(item.brand_id)
            return (
              <Card key={item.id}>
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{brand?.name ?? "Unknown brand"}</span>
                      <span>·</span>
                      <span className="capitalize">{item.source_type.replace(/_/g, " ")}</span>
                      <span>·</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={item.review_status} />
                    <KnowledgeReviewActions id={item.id} status={item.review_status} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: KnowledgeRow["review_status"] }) {
  const variant = status === "approved" ? "success" : status === "rejected" ? "destructive" : "warning"
  const label = status.replace(/_/g, " ")
  return <Badge variant={variant} className="capitalize">{label}</Badge>
}

function Filters({
  brands,
  brandFilter,
  statusFilter,
}: {
  brands: { id: string; name: string }[]
  brandFilter?: string
  statusFilter: string
}) {
  const params = (overrides: Record<string, string | undefined>) => {
    const u = new URLSearchParams()
    const merged = { brand: brandFilter, status: statusFilter, ...overrides }
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "all") u.set(k, v)
    })
    const qs = u.toString()
    return `/knowledge${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Filter:</span>
      <FilterPill href={params({ status: "all" })} active={statusFilter === "all"}>All</FilterPill>
      <FilterPill href={params({ status: "pending_review" })} active={statusFilter === "pending_review"}>Pending</FilterPill>
      <FilterPill href={params({ status: "approved" })} active={statusFilter === "approved"}>Approved</FilterPill>
      <FilterPill href={params({ status: "rejected" })} active={statusFilter === "rejected"}>Rejected</FilterPill>
      <span className="text-muted-foreground ml-4">Brand:</span>
      <FilterPill href={params({ brand: undefined })} active={!brandFilter}>All</FilterPill>
      {brands.map((b) => (
        <FilterPill key={b.id} href={params({ brand: b.id })} active={brandFilter === b.id}>
          {b.name}
        </FilterPill>
      ))}
    </div>
  )
}

function FilterPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={`rounded-full px-3 py-1 text-xs transition-colors ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70 hover:bg-muted/80"
      }`}
    >
      {children}
    </a>
  )
}
