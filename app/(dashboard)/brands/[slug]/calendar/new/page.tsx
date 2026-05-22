import { notFound } from "next/navigation"
import { requireRole } from "@/lib/rbac"
import { getBrandBySlug } from "@/lib/brands"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader, PageShell } from "@/components/layout/page-header"
import { NewPlanForm } from "./new-plan-form"

export default async function NewPlanPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole("strategist")
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) notFound()

  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        eyebrow={brand.name}
        title="Plan next month"
        description="Set cadence targets and any strategic direction. Claude will draft the calendar against Proud Strategy plus this brand's knowledge bank."
      />

      <Card>
        <CardHeader>
          <CardTitle>Plan details</CardTitle>
          <CardDescription>You can regenerate the calendar after creating the plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewPlanForm
            brandId={brand.id}
            brandSlug={brand.slug}
            defaultMonth={nextMonth.getMonth() + 1}
            defaultYear={nextMonth.getFullYear()}
          />
        </CardContent>
      </Card>
    </PageShell>
  )
}
