"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { headers } from "next/headers"
import { createSupabaseServiceClient } from "@/lib/supabase/server"
import { hashApprovalToken } from "@/lib/approval"

const ActionSchema = z.object({
  token: z.string().min(1),
  emailId: z.string().uuid(),
  action: z.enum(["approve", "request_changes", "comment"]),
  comment: z.string().max(4000).optional().or(z.literal("")),
})

export type ApprovalActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function recordApprovalAction(formData: FormData): Promise<ApprovalActionResult> {
  const parsed = ActionSchema.safeParse({
    token: formData.get("token"),
    emailId: formData.get("emailId"),
    action: formData.get("action"),
    comment: formData.get("comment") || "",
  })
  if (!parsed.success) return { ok: false, error: "Invalid input" }
  if (parsed.data.action === "comment" && !parsed.data.comment) {
    return { ok: false, error: "Comment is required" }
  }

  const service = createSupabaseServiceClient()
  const tokenHash = hashApprovalToken(parsed.data.token)

  const { data: link } = await service
    .from("approval_links")
    .select("id, plan_id, brand_id, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle()

  if (!link) return { ok: false, error: "Invalid approval link" }
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return { ok: false, error: "This approval link has expired" }
  }

  // Make sure the email actually belongs to the linked plan.
  const { data: email } = await service
    .from("campaign_emails")
    .select("id")
    .eq("id", parsed.data.emailId)
    .eq("plan_id", link.plan_id)
    .maybeSingle()
  if (!email) return { ok: false, error: "Email not in this plan" }

  const h = await headers()
  await service.from("approval_actions").insert({
    approval_link_id: link.id,
    campaign_email_id: parsed.data.emailId,
    action: parsed.data.action,
    comment: parsed.data.comment || null,
    client_ip: h.get("x-forwarded-for") ?? null,
    client_user_agent: h.get("user-agent") ?? null,
  })

  revalidatePath(`/approval/${parsed.data.token}`)
  return { ok: true }
}
