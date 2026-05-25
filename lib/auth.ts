import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import { createSupabaseServiceClient } from "./supabase/server"

export type Role = "super_admin" | "admin" | "strategist" | "designer" | "viewer" | "pending"

export type AppUser = {
  id: string
  email: string
  displayName: string | null
  /** Effective role after any super_admin "view as" impersonation. UI + server-action gates read this. */
  role: Role
  /** The real role from the DB. Use this to decide who can toggle view-as. */
  actualRole: Role
  /** The role being previewed, if any. */
  viewingAs: Role | null
}

export const VIEW_AS_COOKIE = "proud-email-os.view-as"

const IMPERSONABLE_ROLES: Role[] = ["admin", "strategist", "designer", "viewer"]

/**
 * Resolves the signed-in Clerk user, reads the public.users profile, and
 * applies any super-admin "view as" impersonation.
 *
 * Fast path: when a public.users row already exists, this never calls
 * Clerk's currentUser() (a ~200ms network round trip). It only falls back
 * to Clerk when the row is missing (first sign-in before the
 * /api/webhooks/clerk handler has provisioned the row).
 *
 * `cache()` memoises per request so the layout and page share one round trip.
 */
export const getUser = cache(async (): Promise<AppUser | null> => {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createSupabaseServiceClient()
  const { data: profile } = await supabase
    .from("users")
    .select("id, email, display_name, role")
    .eq("id", userId)
    .maybeSingle()

  let actualRole: Role
  let email: string
  let displayName: string | null

  if (profile) {
    actualRole = ((profile.role as Role) ?? "pending") as Role
    email = profile.email as string
    displayName = (profile.display_name as string | null) ?? null
  } else {
    // First-sign-in fallback: provision the row inline so the user isn't
    // stuck. The Clerk webhook also does this, race-protects against the
    // webhook arriving after the first request.
    const clerk = await currentUser()
    if (!clerk) return null
    email = clerk.primaryEmailAddress?.emailAddress ?? clerk.emailAddresses[0]?.emailAddress ?? ""
    displayName =
      [clerk.firstName, clerk.lastName].filter(Boolean).join(" ").trim() ||
      clerk.username ||
      null
    await supabase
      .from("users")
      .upsert({ id: userId, email, display_name: displayName, role: "pending" })
    actualRole = "pending"
  }

  // Only a real super_admin can impersonate another role.
  let viewingAs: Role | null = null
  if (actualRole === "super_admin") {
    const cookieStore = await cookies()
    const v = cookieStore.get(VIEW_AS_COOKIE)?.value
    if (v && (IMPERSONABLE_ROLES as string[]).includes(v)) {
      viewingAs = v as Role
    }
  }

  const role = viewingAs ?? actualRole

  return {
    id: userId,
    email,
    displayName,
    role,
    actualRole,
    viewingAs,
  }
})

export async function requireUser(): Promise<AppUser> {
  const user = await getUser()
  if (!user) redirect("/sign-in")
  return user
}

export async function requireApprovedUser(): Promise<AppUser> {
  const user = await requireUser()
  if (user.role === "pending") redirect("/awaiting-approval")
  return user
}

/** Only the real super_admin can change impersonation. */
export async function requireSuperAdmin(): Promise<AppUser> {
  const user = await requireApprovedUser()
  if (user.actualRole !== "super_admin") redirect("/")
  return user
}
