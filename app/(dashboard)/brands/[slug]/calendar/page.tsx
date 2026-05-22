import { notFound } from "next/navigation"
import Link from "next/link"
import { Plus, Sparkles } from "lucide-react"
import { requireApprovedUser } from "@/lib/auth"
import { getBrandBySlug } from "@/lib/brands"
import { listPlansForBrand } from "@/lib/campaigns"
import { MONTHS } from "@/lib/months"
import { canEditStrategy } from "@/lib/rbac"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader, PageShell } from "@/components/layout/page-header"

const STATUS_BADGE: Record<string, { variant: "neutral" | "success" | "warning" | "destructive"; label: string }> = {
  draft: { variant: "neutral", label: "Draft" },
  generating: { variant: "warning", label: "Generating..." },
  pending_review: { variant: "warning", label: "Pending review" },
  calendar_approved: { variant: "success", label: "Calendar approved" },
  copy_generating: { variant: "warning", label: "Copy generating..." },
  copy_done: { variant: "success", label: "Copy done" },
  briefs_done: { variant: "success", label: "Briefs done" },
  complete: { variant: "success", label: "Complete" },
  error: { variant: "destructive", label: "Error" },
}

export default async function BrandCalendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireApprovedUser()
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) notFound()
  const plans = await listPlansForBrand(brand.id)
  const canPlan = canEditStrategy(user.role)

  const byYear = plans.reduce<Record<number, typeof plans>>((acc, p) => {
    acc[p.year] ??= []
    acc[p.year].push(p)
    return acc
  }, {})

  return (
    <PageShell>
      <PageHeader
        eyebrow={brand.name}
        title="Campaign Calendar"
        description="One plan per month. Draft, review, approve, then move into copy and brief generation."
        actions={
          canPlan && (
            <Button asChild>
              <Link href={`/brands/${brand.slug}/calendar/new`}>
                <Plus /> Plan next month
              </Link>
            </Button>
          )
        }
      />

      {plans.length === 0 ? (
        <Card variant="glass-tinted-blue">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#007AFF] flex items-center justify-center shrink-0">
                <Sparkles className="size-5 text-white" />
              </div>
              <div>
                <CardTitle>Plan your first month</CardTitle>
                <CardDescription>
                  Give Claude cadence targets and a short brief. It'll propose a calendar grounded in Proud Strategy + this brand's knowledge bank.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          {canPlan && (
            <CardContent>
              <Button asChild>
                <Link href={`/brands/${brand.slug}/calendar/new`}>
                  <Plus /> Plan next month
                </Link>
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="space-y-10">
          {Object.entries(byYear)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, list]) => (
              <div key={year}>
                <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-3">{year}</div>
                <Card>
                  <CardContent className="p-0">
                    {list.map((p, idx) => {
                      const badge = STATUS_BADGE[p.status] ?? { variant: "neutral" as const, label: p.status }
                      return (
                        <Link
                          key={p.id}
                          href={`/brands/${brand.slug}/calendar/${p.id}`}
                          className={`flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/60 transition ${
                            idx === list.length - 1 ? "" : "border-b border-[#E5E5EA]"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-[14px] font-medium">{MONTHS[p.month - 1]}</div>
                            <div className="text-[12px] text-[#86868B] mt-0.5 truncate">{p.name}</div>
                          </div>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </Link>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            ))}
        </div>
      )}
    </PageShell>
  )
}
