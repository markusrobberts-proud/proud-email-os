import { requireRole } from "@/lib/rbac"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateBrandForm } from "./create-brand-form"

export default async function NewBrandPage() {
  await requireRole("strategist")

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Add a new brand</h1>
        <p className="text-sm text-muted-foreground mt-1">
          We'll seed a knowledge bank from the website and stand up a workspace for the brand.
        </p>
      </div>
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Brand details</CardTitle>
          <CardDescription>You can edit any of this later.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateBrandForm />
        </CardContent>
      </Card>
    </div>
  )
}
