"use server"

import { revalidateTag } from "next/cache"
import { requireApprovedUser, USER_CACHE_TAG } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Marks the welcome tour as seen for the current user so the modal
 * stops popping. Bust the profile cache so the next page render
 * reflects the change immediately.
 */
export async function dismissWelcomeTour(): Promise<{ ok: boolean }> {
  const user = await requireApprovedUser()
  const supabase = await createSupabaseServerClient()
  await supabase
    .from("users")
    .update({ welcome_seen_at: new Date().toISOString() })
    .eq("id", user.id)
  revalidateTag(USER_CACHE_TAG, "default")
  return { ok: true }
}

/**
 * Lets a user re-trigger the tour from the /guide page. Sets the
 * timestamp back to null.
 */
export async function resetWelcomeTour(): Promise<{ ok: boolean }> {
  const user = await requireApprovedUser()
  const supabase = await createSupabaseServerClient()
  await supabase.from("users").update({ welcome_seen_at: null }).eq("id", user.id)
  revalidateTag(USER_CACHE_TAG, "default")
  return { ok: true }
}
