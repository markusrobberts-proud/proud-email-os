import Link from "next/link"
import { Plus } from "lucide-react"
import { requireApprovedUser } from "@/lib/auth"
import { listAccessibleBrands } from "@/lib/brands"
import { canEditStrategy } from "@/lib/rbac"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function BrandsPage() {
  const user = await requireApprovedUser()
  const brands = await listAccessibleBrands()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Brands</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user.displayName ?? user.email.split("@")[0]}.
          </p>
        </div>
        {canEditStrategy(user.role) && (
          <Link
            href="/brands/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="size-4" /> Add brand
          </Link>
        )}
      </div>

      {brands.length === 0 ? (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">No brands yet</CardTitle>
            <CardDescription>
              {canEditStrategy(user.role)
                ? "Add your first brand to get started."
                : "An admin or strategist needs to add a brand before you can do anything here."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brands/${brand.slug}`} className="block">
              <Card className="glass hover:bg-white/90 transition-colors h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{brand.name}</CardTitle>
                      <CardDescription>{brand.industry ?? "—"}</CardDescription>
                    </div>
                    {brand.primary_color && (
                      <div
                        className="size-6 rounded-md border border-border/60"
                        style={{ background: brand.primary_color }}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant={brand.scrape_status === "done" ? "success" : "secondary"} className="capitalize">
                    {brand.scrape_status}
                  </Badge>
                  {brand.website_url && (
                    <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {brand.website_url.replace(/^https?:\/\//, "")}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
