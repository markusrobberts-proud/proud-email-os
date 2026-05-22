"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireRole } from "@/lib/rbac"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { recordAudit } from "@/lib/audit"
import { generateApprovalToken, hashApprovalToken } from "@/lib/approval"

const ShareSchema = z.object({
  planId: z.string().uuid(),
  expiresInDays: z.coerce.number().int().min(0).max(365).optional(),
})

export type ShareResult = { ok: true; url: string } | { ok: false; error: string }

export async function createApprovalLink(formData: FormData): Promise<ShareResult> {
  const user = await requireRole("strategist")
  const parsed = ShareSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { ok: false, error: "Invalid input" }

  const supabase = await createSupabaseServerClient()
  const { data: plan } = await supabase
    .from("campaign_plans")
    .select("brand_id, name")
    .eq("id", parsed.data.planId)
    .single()
  if (!plan) return { ok: false, error: "Plan not found" }

  const token = generateApprovalToken()
  const tokenHash = hashApprovalToken(token)
  const expiresAt = parsed.data.expiresInDays && parsed.data.expiresInDays > 0
    ? new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { error } = await supabase.from("approval_links").insert({
    brand_id: plan.brand_id,
    plan_id: parsed.data.planId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_by_user_id: user.id,
  })

  if (error) return { ok: false, error: error.message }

  await recordAudit({
    userId: user.id,
    brandId: plan.brand_id as string,
    entityType: "campaign_plan",
    entityId: parsed.data.planId,
    action: "create_approval_link",
    meta: { expires_in_days: parsed.data.expiresInDays ?? null },
  })

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return { ok: true, url: `${origin}/approval/${token}` }
}
