import { cache } from "react"
import { createSupabaseServerClient } from "./supabase/server"
import { getUser } from "./auth"

export type Brand = {
  id: string
  slug: string
  name: string
  industry: string | null
  website_url: string | null
  primary_color: string | null
  scrape_status: "pending" | "running" | "done" | "error"
  status: "active" | "inactive"
}

/**
 * Brands the current user can read.
 *
 * Strategist / admin / super_admin see every active brand (matches the
 * org-wide spec). Designer + client are scoped to brands they're members
 * of, so the sidebar + brand grid only show what they're meant to work on.
 *
 * Unauthenticated callers and pending users see nothing.
 */
export const listAccessibleBrands = cache(async (): Promise<Brand[]> => {
  const user = await getUser()
  if (!user || user.role === "pending") return []

  const supabase = await createSupabaseServerClient()
  const orgWide =
    user.role === "super_admin" || user.role === "admin" || user.role === "strategist"

  if (orgWide) {
    const { data, error } = await supabase
      .from("brands")
      .select("id,slug,name,industry,website_url,primary_color,scrape_status,status")
      .eq("status", "active")
      .order("name", { ascending: true })
    if (error) return []
    return (data ?? []) as Brand[]
  }

  // Designer / client: only brands they're a member of.
  const { data: memberships } = await supabase
    .from("brand_members")
    .select("brand_id")
    .eq("user_id", user.id)
  const brandIds = (memberships ?? []).map((m: { brand_id: string }) => m.brand_id)
  if (brandIds.length === 0) return []

  const { data, error } = await supabase
    .from("brands")
    .select("id,slug,name,industry,website_url,primary_color,scrape_status,status")
    .in("id", brandIds)
    .eq("status", "active")
    .order("name", { ascending: true })
  if (error) return []
  return (data ?? []) as Brand[]
})

export const getBrandBySlug = cache(async (slug: string) => {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
  if (error) return null
  return data
})

export function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64)
}
