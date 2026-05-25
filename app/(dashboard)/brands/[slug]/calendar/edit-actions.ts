"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireRole, requireBrandAccess } from "@/lib/rbac"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { recordAudit } from "@/lib/audit"

const CopySchema = z.object({
  emailId: z.string().uuid(),
  subject_line: z.string().max(255).optional().or(z.literal("")),
  preview_text: z.string().max(255).optional().or(z.literal("")),
  body_headline: z.string().max(255).optional().or(z.literal("")),
  body_copy: z.string().max(20000).optional().or(z.literal("")),
  cta_text: z.string().max(120).optional().or(z.literal("")),
  cta_url: z.string().max(500).optional().or(z.literal("")),
  sms_body: z.string().max(320).optional().or(z.literal("")),
})

export async function saveEmailCopy(formData: FormData) {
  const user = await requireRole("strategist")
  const parsed = CopySchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) throw new Error("Invalid copy input")

  const supabase = await createSupabaseServerClient()
  const { emailId, ...fields } = parsed.data
  const update: Record<string, string | null> = {}
  for (const [k, v] of Object.entries(fields)) update[k] = v || null
  update.copy_status = "done"

  const { data } = await supabase
    .from("campaign_emails")
    .update(update)
    .eq("id", emailId)
    .select("brand_id")
    .single()

  await recordAudit({
    userId: user.id,
    brandId: data?.brand_id ?? null,
    entityType: "campaign_email",
    entityId: emailId,
    action: "edit_copy",
  })

  revalidatePath(`/brands`)
}

const BriefSchema = z.object({
  emailId: z.string().uuid(),
  layout_template: z.string().max(255).optional().or(z.literal("")),
  imagery_notes: z.string().max(5000).optional().or(z.literal("")),
  colour_notes: z.string().max(2000).optional().or(z.literal("")),
  design_brief: z.string().max(20000).optional().or(z.literal("")),
  sender_identity: z.string().max(255).optional().or(z.literal("")),
})

export async function saveEmailBrief(formData: FormData) {
  // Designers own briefs end to end, so they can inline-edit.
  const user = await requireRole("designer")
  const parsed = BriefSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) throw new Error("Invalid brief input")

  const supabase = await createSupabaseServerClient()
  // Look up brand_id first so we can scope the write to a brand the user
  // actually has access to (strategist+ passes through automatically).
  const { data: existing } = await supabase
    .from("campaign_emails")
    .select("brand_id")
    .eq("id", parsed.data.emailId)
    .single()
  if (!existing) throw new Error("Email not found")
  await requireBrandAccess(existing.brand_id as string)

  const { emailId, ...fields } = parsed.data
  const update: Record<string, string | null> = {}
  for (const [k, v] of Object.entries(fields)) update[k] = v || null
  update.brief_status = "done"

  const { data } = await supabase
    .from("campaign_emails")
    .update(update)
    .eq("id", emailId)
    .select("brand_id")
    .single()

  await recordAudit({
    userId: user.id,
    brandId: data?.brand_id ?? null,
    entityType: "campaign_email",
    entityId: emailId,
    action: "edit_brief",
  })

  revalidatePath(`/brands`)
}
