"use client"

import { useState, useTransition } from "react"
import { Check, MessageCircle, AlertCircle, Mail, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { recordApprovalAction } from "./actions"

type Email = {
  id: string
  sequence_number: number
  scheduled_date: string | null
  theme: string | null
  email_type: string | null
  format: "text" | "designed" | "sms"
  target_segment: string | null
  strategic_rationale: string | null
  subject_line: string | null
  preview_text: string | null
  body_headline: string | null
  body_copy: string | null
  cta_text: string | null
  cta_url: string | null
  sms_body: string | null
  sender_identity: string | null
  layout_template: string | null
  design_brief: string | null
  imagery_notes: string | null
  colour_notes: string | null
  latestAction: { action: string; comment: string | null; acted_at: string } | null
}

export function ClientApprovalCard({ email, token }: { email: Email; token: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [commentOpen, setCommentOpen] = useState(false)
  const [comment, setComment] = useState("")
  const [acknowledged, setAcknowledged] = useState<string | null>(null)

  function act(action: "approve" | "request_changes" | "comment") {
    setError(null)
    const fd = new FormData()
    fd.set("token", token)
    fd.set("emailId", email.id)
    fd.set("action", action)
    if (action === "comment") fd.set("comment", comment)
    startTransition(async () => {
      const r = await recordApprovalAction(fd)
      if (!r.ok) {
        setError(r.error)
        return
      }
      setAcknowledged(action)
      if (action === "comment") {
        setComment("")
        setCommentOpen(false)
      }
    })
  }

  const status = email.latestAction?.action ?? null

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] flex items-center justify-center shrink-0">
            {email.format === "sms" ? (
              <MessageSquare className="size-4 text-[#6E6E73]" />
            ) : (
              <Mail className="size-4 text-[#6E6E73]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <FormatBadge format={email.format} />
              {email.target_segment && <span className="text-[12px] text-[#86868B]">{email.target_segment}</span>}
              {status && <StatusBadge status={status} />}
            </div>
            <div className="text-[12px] text-[#86868B] mt-1">
              {email.scheduled_date
                ? new Date(email.scheduled_date).toLocaleDateString("en-AU", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "Date TBD"}
              {email.theme && ` · ${email.theme}`}
            </div>
          </div>
        </div>

        {email.subject_line && (
          <div className="mb-3">
            <div className="text-[11px] uppercase tracking-widest text-[#86868B]">Subject</div>
            <div className="text-[15px] font-medium mt-0.5">{email.subject_line}</div>
            {email.preview_text && (
              <div className="text-[12px] text-[#86868B] mt-0.5">{email.preview_text}</div>
            )}
          </div>
        )}

        {email.body_headline && (
          <div className="mb-2">
            <div className="text-[11px] uppercase tracking-widest text-[#86868B]">Headline</div>
            <p className="text-[14px] mt-0.5">{email.body_headline}</p>
          </div>
        )}

        {email.body_copy && (
          <div className="mb-2">
            <div className="text-[11px] uppercase tracking-widest text-[#86868B]">Body</div>
            <p className="text-[13.5px] whitespace-pre-wrap leading-relaxed mt-0.5">{email.body_copy}</p>
          </div>
        )}

        {(email.cta_text || email.cta_url) && (
          <div className="mb-2">
            <div className="text-[11px] uppercase tracking-widest text-[#86868B]">CTA</div>
            <p className="text-[13.5px] mt-0.5">
              {email.cta_text}
              {email.cta_url && <span className="text-[#6E6E73]"> · {email.cta_url}</span>}
            </p>
          </div>
        )}

        {email.sms_body && (
          <div className="mb-2">
            <div className="text-[11px] uppercase tracking-widest text-[#86868B]">SMS</div>
            <p className="text-[13.5px] mt-0.5">{email.sms_body}</p>
          </div>
        )}

        {email.strategic_rationale && (
          <div className="mb-2">
            <div className="text-[11px] uppercase tracking-widest text-[#86868B]">Why this email</div>
            <p className="text-[12.5px] text-[#6E6E73] mt-0.5 leading-relaxed">{email.strategic_rationale}</p>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E5E5EA] no-print flex-wrap">
          <Button
            size="sm"
            variant={status === "approve" ? "secondary" : "primary"}
            disabled={pending}
            onClick={() => act("approve")}
          >
            <Check /> {status === "approve" ? "Approved" : "Approve"}
          </Button>
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => act("request_changes")}>
            <AlertCircle /> Request changes
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setCommentOpen((v) => !v)}>
            <MessageCircle /> Comment
          </Button>
          {acknowledged && <span className="text-[12px] text-[#6E6E73]">Recorded. Thank you.</span>}
          {error && <span className="text-[12px] text-[#FF3B30]">{error}</span>}
        </div>

        {commentOpen && (
          <div className="mt-3 space-y-2 no-print">
            <Textarea
              rows={3}
              placeholder="Add a note for the Proud team..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={pending || !comment.trim()} onClick={() => act("comment")}>
                Send comment
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCommentOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {email.latestAction?.comment && (
          <div className="mt-3 p-3 bg-[#F5F5F7] rounded-lg text-[12px] text-[#1D1D1F]">
            <div className="text-[10px] uppercase tracking-wider text-[#86868B] mb-1">Last comment</div>
            {email.latestAction.comment}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FormatBadge({ format }: { format: "text" | "designed" | "sms" }) {
  if (format === "sms") return <Badge variant="info">SMS</Badge>
  if (format === "text") return <Badge variant="neutral">Text</Badge>
  return <Badge variant="accent">Designed</Badge>
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approve") return <Badge variant="success">Approved</Badge>
  if (status === "request_changes") return <Badge variant="warning">Changes requested</Badge>
  return <Badge variant="neutral">{status}</Badge>
}
