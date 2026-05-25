"use server"

import { revalidateTag } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { createSupabaseServiceClient } from "@/lib/supabase/server"
import { USER_CACHE_TAG } from "@/lib/auth"

/**
 * Cheap polling endpoint used by the awaiting-approval page. We bypass
 * the cached `getUser()` helper and read role straight from Postgres so
 * the moment an admin promotes someone, the next poll catches it. We
 * also bust the user-profile cache so the next layout render sees the
 * new role too.
 */
export async function checkApprovalStatus(): Promise<{
  approved: boolean
  role: string | null
}> {
  const { userId } = await auth()
  if (!userId) return { approved: false, role: null }

  const supabase = createSupabaseServiceClient()
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  const role = (data?.role as string | null) ?? null
  if (role && role !== "pending") {
    // Pre-emptively bust the cached profile so the dashboard layout
    // picks up the new role without a stale read.
    revalidateTag(USER_CACHE_TAG, "default")
    return { approved: true, role }
  }
  return { approved: false, role }
}
