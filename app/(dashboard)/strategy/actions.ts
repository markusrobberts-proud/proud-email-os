"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireRole } from "@/lib/rbac"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { recordAudit } from "@/lib/audit"

const Schema = z.object({
  sectionId: z.string().uuid(),
  body: z.string().max(40000),
})

export async function updateStrategySection(formData: FormData) {
  const user = await requireRole("strategist")
  const parsed = Schema.safeParse({
    sectionId: formData.get("sectionId"),
    body: formData.get("body"),
  })
  if (!parsed.success) return

  const supabase = await createSupabaseServerClient()

  const { data: existing } = await supabase
    .from("proud_strategy_sections")
    .select("body")
    .eq("id", parsed.data.sectionId)
    .maybeSingle()

  if (existing?.body) {
    await supabase.from("proud_strategy_revisions").insert({
      section_id: parsed.data.sectionId,
      body: existing.body,
      edited_by_user_id: user.id,
    })
  }

  await supabase
    .from("proud_strategy_sections")
    .update({ body: parsed.data.body, updated_by_user_id: user.id })
    .eq("id", parsed.data.sectionId)

  await recordAudit({
    userId: user.id,
    entityType: "strategy_section",
    entityId: parsed.data.sectionId,
    action: "update",
  })

  revalidatePath("/strategy")
}
