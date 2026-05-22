import { requireApprovedUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const BRANDS = [
  { name: "Walnut Melbourne", industry: "Fashion", status: "Active · MVP guinea pig" },
  { name: "Genuins", industry: "Footwear", status: "Onboarding in Phase 2B" },
  { name: "Proud Coffee Co", industry: "F&B", status: "Onboarding in Phase 2B" },
]

export default async function BrandsPage() {
  const user = await requireApprovedUser()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Brands</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {user.displayName ?? user.email.split("@")[0]}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BRANDS.map((brand) => (
          <Card key={brand.name} className="glass">
            <CardHeader>
              <CardTitle className="text-base">{brand.name}</CardTitle>
              <CardDescription>{brand.industry}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{brand.status}</p>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed bg-white/40">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">+ Add brand</CardTitle>
            <CardDescription>Provision a new brand workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Wired up in Week 2.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
