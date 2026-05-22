"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireApprovedUser } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { recordAudit } from "@/lib/audit"

const NoteSchema = z.object({
  brandId: z.string().uuid(),
  title: z.string().min(2).max(255),
  content: z.string().min(2).max(40000),
  sourceType: z.enum([
    "manual_note", "brand_guide", "strategy_doc", "meeting_notes", "campaign_debrief",
  ]),
})

export async function addManualKnowledgeNote(formData: FormData) {
  const user = await requireApprovedUser()
  const parsed = NoteSchema.safeParse({
    brandId: formData.get("brandId"),
    title: formData.get("title"),
    content: formData.get("content"),
    sourceType: formData.get("sourceType"),
  })
  if (!parsed.success) return

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("knowledge_items")
    .insert({
      brand_id: parsed.data.brandId,
      source_type: parsed.data.sourceType,
      title: parsed.data.title,
      content: parsed.data.content,
      review_status: "approved",
      added_by_user_id: user.id,
    })
    .select("id")
    .single()

  await recordAudit({
    userId: user.id,
    brandId: parsed.data.brandId,
    entityType: "knowledge_item",
    entityId: data?.id ?? null,
    action: "create",
    meta: { source_type: parsed.data.sourceType, title: parsed.data.title },
  })

  revalidatePath("/knowledge")
  revalidatePath(`/brands`)
}

const ReviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
})

export async function setKnowledgeReviewStatus(formData: FormData) {
  const user = await requireApprovedUser()
  const parsed = ReviewSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  })
  if (!parsed.success) return

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("knowledge_items")
    .update({ review_status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("brand_id")
    .single()

  await recordAudit({
    userId: user.id,
    brandId: data?.brand_id ?? null,
    entityType: "knowledge_item",
    entityId: parsed.data.id,
    action: `review_${parsed.data.status}`,
  })

  revalidatePath("/knowledge")
}

const DeleteSchema = z.object({ id: z.string().uuid() })

export async function deleteKnowledgeItem(formData: FormData) {
  const user = await requireApprovedUser()
  const parsed = DeleteSchema.safeParse({ id: formData.get("id") })
  if (!parsed.success) return

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("knowledge_items")
    .select("brand_id")
    .eq("id", parsed.data.id)
    .maybeSingle()

  await supabase.from("knowledge_items").delete().eq("id", parsed.data.id)

  await recordAudit({
    userId: user.id,
    brandId: data?.brand_id ?? null,
    entityType: "knowledge_item",
    entityId: parsed.data.id,
    action: "delete",
  })

  revalidatePath("/knowledge")
}
