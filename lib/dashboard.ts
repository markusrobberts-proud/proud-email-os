import { createSupabaseServerClient } from "./supabase/server"

export type AuditEntry = {
  id: number
  user_id: string | null
  brand_id: string | null
  entity_type: string
  entity_id: string | null
  action: string
  meta: Record<string, unknown> | null
  created_at: string
}

export type PlanSummary = {
  id: string
  brand_id: string
  name: string
  month: number
  year: number
  status: string
  created_at: string
}

export type EmailQueueItem = {
  id: string
  plan_id: string
  brand_id: string
  scheduled_date: string | null
  subject_line: string | null
  theme: string | null
  format: "text" | "designed" | "sms"
  copy_status: string
  brief_status: string
  asana_task_id: string | null
}

export type PendingKnowledge = {
  id: string
  brand_id: string
  title: string
  source_type: string
  created_at: string
}

export type ClientFeedback = {
  campaign_email_id: string | null
  action: string
  comment: string | null
  acted_at: string
  brand_id: string | null
  brand_name: string | null
  plan_id: string | null
}

export type DashboardData = {
  recentAudit: AuditEntry[]
  activePlans: PlanSummary[]
  pendingKnowledge: PendingKnowledge[]
  designQueue: EmailQueueItem[]
  recentClientFeedback: ClientFeedback[]
  counts: {
    activePlans: number
    pendingKnowledge: number
    designQueue: number
    completeThisMonth: number
    teamSize: number
    pendingTeam: number
  }
  strategyUpdatedAt: string | null
}

/** Single batched fetch of everything the dashboard needs across roles. */
export async function loadDashboardData(): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    auditRes,
    plansRes,
    knowledgeRes,
    designRes,
    feedbackRes,
    completeRes,
    teamRes,
    pendingTeamRes,
    strategyRes,
  ] = await Promise.all([
    supabase
      .from("audit_log")
      .select("id,user_id,brand_id,entity_type,entity_id,action,meta,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("campaign_plans")
      .select("id,brand_id,name,month,year,status,created_at")
      .in("status", ["draft", "pending_review", "calendar_approved", "copy_done"])
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("knowledge_items")
      .select("id,brand_id,title,source_type,created_at")
      .eq("review_status", "pending_review")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("campaign_emails")
      .select("id,plan_id,brand_id,scheduled_date,subject_line,theme,format,copy_status,brief_status,asana_task_id")
      .eq("brief_status", "done")
      .is("asana_task_id", null)
      .order("scheduled_date", { ascending: true })
      .limit(20),
    supabase
      .from("approval_actions")
      .select("campaign_email_id,action,comment,acted_at,approval_links(brand_id,plan_id,brands(name))")
      .order("acted_at", { ascending: false })
      .limit(10),
    supabase
      .from("campaign_plans")
      .select("id", { count: "exact", head: true })
      .eq("status", "complete")
      .gte("approved_at", monthStart),
    supabase.from("users").select("id", { count: "exact", head: true }).neq("role", "pending"),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "pending"),
    supabase
      .from("proud_strategy_sections")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1),
  ])

  // Supabase types nested foreign-key joins as arrays even when 1:1, so coerce via unknown.
  const rawFeedback = (feedbackRes.data ?? []) as unknown as Array<{
    campaign_email_id: string | null
    action: string
    comment: string | null
    acted_at: string
    approval_links:
      | { brand_id: string | null; plan_id: string | null; brands: { name: string | null } | { name: string | null }[] | null }
      | { brand_id: string | null; plan_id: string | null; brands: { name: string | null } | { name: string | null }[] | null }[]
      | null
  }>
  const recentClientFeedback: ClientFeedback[] = rawFeedback.map((r) => {
    const link = Array.isArray(r.approval_links) ? r.approval_links[0] ?? null : r.approval_links
    const brands = link ? (Array.isArray(link.brands) ? link.brands[0] ?? null : link.brands) : null
    return {
      campaign_email_id: r.campaign_email_id,
      action: r.action,
      comment: r.comment,
      acted_at: r.acted_at,
      brand_id: link?.brand_id ?? null,
      brand_name: brands?.name ?? null,
      plan_id: link?.plan_id ?? null,
    }
  })

  return {
    recentAudit: (auditRes.data ?? []) as AuditEntry[],
    activePlans: (plansRes.data ?? []) as PlanSummary[],
    pendingKnowledge: (knowledgeRes.data ?? []) as PendingKnowledge[],
    designQueue: (designRes.data ?? []) as EmailQueueItem[],
    recentClientFeedback,
    counts: {
      activePlans: plansRes.data?.length ?? 0,
      pendingKnowledge: knowledgeRes.data?.length ?? 0,
      designQueue: designRes.data?.length ?? 0,
      completeThisMonth: completeRes.count ?? 0,
      teamSize: teamRes.count ?? 0,
      pendingTeam: pendingTeamRes.count ?? 0,
    },
    strategyUpdatedAt: (strategyRes.data?.[0] as { updated_at?: string } | undefined)?.updated_at ?? null,
  }
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.round(diff / 1000)
  if (s < 60) return "just now"
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

export function describeAuditAction(entry: AuditEntry): string {
  const noun = entry.entity_type.replace(/_/g, " ")
  const verbs: Record<string, string> = {
    create: "created",
    update: "updated",
    delete: "deleted",
    approve_calendar: "approved calendar for",
    generate_calendar: "generated calendar for",
    generate_copy: "generated copy for",
    regenerate_copy: "regenerated copy for",
    generate_brief: "generated brief for",
    edit_copy: "edited copy on",
    edit_brief: "edited brief on",
    export_asana: "exported to Asana",
    scrape_website: "scraped website for",
    upload_file: "uploaded a file to",
    review_approved: "approved a knowledge item on",
    review_rejected: "rejected a knowledge item on",
    update_role: "changed a teammate's role",
    invite: "invited a teammate",
    create_approval_link: "shared an approval link for",
  }
  const verb = verbs[entry.action] ?? entry.action.replace(/_/g, " ")
  return `${verb} ${noun}`
}
