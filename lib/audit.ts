import { createSupabaseServerClient } from "./supabase/server"

type AuditInput = {
  userId: string | null
  brandId?: string | null
  entityType: string
  entityId?: string | null
  action: string
  meta?: Record<string, unknown>
}

export async function recordAudit(input: AuditInput): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.from("audit_log").insert({
    user_id: input.userId,
    brand_id: input.brandId ?? null,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    action: input.action,
    meta: input.meta ?? null,
  })
}
