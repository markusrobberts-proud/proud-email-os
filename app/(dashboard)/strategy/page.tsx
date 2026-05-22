import { requireApprovedUser } from "@/lib/auth"
import { canEditStrategy } from "@/lib/rbac"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StrategySectionEditor } from "./section-editor"

type StrategySection = {
  id: string
  section_key: string
  title: string
  body: string | null
  position: number
}

export default async function StrategyPage() {
  const user = await requireApprovedUser()
  const editable = canEditStrategy(user.role)

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("proud_strategy_sections")
    .select("id,section_key,title,body,position")
    .order("position", { ascending: true })

  const sections = (data ?? []) as StrategySection[]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Org-wide</div>
        <h1 className="text-2xl font-semibold tracking-tight">Proud Strategy</h1>
        <p className="text-sm text-muted-foreground mt-1">
          The living document Claude reads first, every time. {editable ? "Click any section to edit." : "Read-only — strategists and admins can edit."}
        </p>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No sections yet</CardTitle>
            <CardDescription>
              The initial migration should have seeded these — re-run it if missing.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        sections.map((s) => (
          <Card key={s.id} className="glass">
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {editable ? (
                <StrategySectionEditor sectionId={s.id} initialBody={s.body ?? ""} />
              ) : (
                <p className="text-sm whitespace-pre-wrap">
                  {s.body || <span className="italic text-muted-foreground">Empty</span>}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
