import { requireRole } from "@/lib/rbac"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader, PageShell } from "@/components/layout/page-header"
import { CreateBrandForm } from "./create-brand-form"

export default async function NewBrandPage() {
  await requireRole("strategist")

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        eyebrow="Brand workspace"
        title="Add a new brand"
        description="We'll seed a knowledge bank from the website and stand up a workspace. You can edit any of this later."
      />
      <Card>
        <CardHeader>
          <CardTitle>Brand details</CardTitle>
          <CardDescription>Anything left blank can be filled in once you're inside.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateBrandForm />
        </CardContent>
      </Card>
    </PageShell>
  )
}
