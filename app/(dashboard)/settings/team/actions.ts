"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"
import { requireRole } from "@/lib/rbac"
import { USER_CACHE_TAG } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { recordAudit } from "@/lib/audit"
import { notify } from "@/lib/notifications"

// Clerk user IDs look like "user_2xY7..." rather than UUIDs.
const RoleSchema = z.object({
  userId: z.string().min(1).max(128),
  role: z.enum(["super_admin", "admin", "strategist", "designer", "client", "pending"]),
})

export async function updateUserRole(formData: FormData) {
  const admin = await requireRole("admin")
  const parsed = RoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  })
  if (!parsed.success) throw new Error("Invalid input")
  // Only a real super_admin can hand out the super_admin role.
  if (parsed.data.role === "super_admin" && admin.actualRole !== "super_admin") {
    throw new Error("Only a super admin can assign super admin.")
  }
  if (parsed.data.userId === admin.id && parsed.data.role !== admin.actualRole) {
    throw new Error("You can't change your own role.")
  }

  const supabase = await createSupabaseServerClient()

  // Demoting a super_admin requires being a super_admin yourself. Without
  // this, a regular admin could lock out the only person who can hand out
  // super_admin or impersonate other roles.
  const { data: existing } = await supabase
    .from("users")
    .select("role")
    .eq("id", parsed.data.userId)
    .maybeSingle()
  if (existing?.role === "super_admin" && admin.actualRole !== "super_admin") {
    throw new Error("Only a super admin can change a super admin's role.")
  }

  await supabase.from("users").update({ role: parsed.data.role }).eq("id", parsed.data.userId)

  await recordAudit({
    userId: admin.id,
    entityType: "user",
    entityId: parsed.data.userId,
    action: "update_role",
    meta: { new_role: parsed.data.role },
  })

  // Tell the user their role changed (skip if they just got moved to
  // pending: they'll be bounced to /awaiting-approval and won't see the
  // bell anyway).
  if (parsed.data.role !== "pending") {
    const pretty = parsed.data.role.replace(/_/g, " ")
    await notify({
      recipients: [parsed.data.userId],
      kind: "role_changed",
      title: `Your role is now ${pretty}`,
      body: `${admin.displayName ?? admin.email} updated your access level.`,
      link: "/settings",
      entityType: "user",
      entityId: parsed.data.userId,
      actorUserId: admin.id,
    })
  }

  revalidateTag(USER_CACHE_TAG, "default")
  revalidatePath("/settings/team")
}

/**
 * No inviteUser action lives here. Auth is Clerk, and the flow is:
 *
 *   1. Teammate visits NEXT_PUBLIC_APP_URL/sign-in and signs in (Google
 *      SSO or email magic link via Clerk).
 *   2. The Clerk webhook seeds a row in public.users with role=pending.
 *   3. They land on /awaiting-approval until an admin promotes them
 *      via updateUserRole above.
 *
 * If we later switch to Clerk's invitations API, add the action here.
 */
