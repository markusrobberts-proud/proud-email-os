"use client"

import { useState, useTransition } from "react"
import { Share2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createApprovalLink } from "./share-actions"

export function ShareButton({ planId }: { planId: string }) {
  const [open, setOpen] = useState(false)
  const [expiry, setExpiry] = useState("14")
  const [pending, startTransition] = useTransition()
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function reset() {
    setUrl(null)
    setError(null)
    setCopied(false)
  }

  function onGenerate() {
    setError(null)
    const fd = new FormData()
    fd.set("planId", planId)
    fd.set("expiresInDays", expiry)
    startTransition(async () => {
      const r = await createApprovalLink(fd)
      if (!r.ok) {
        setError(r.error)
        return
      }
      setUrl(r.url)
    })
  }

  function copyToClipboard() {
    if (!url) return
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Share2 /> Share with client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share calendar for approval</DialogTitle>
          <DialogDescription>
            Generates a tokenised link. The client can approve, request changes, or leave comments per email.
          </DialogDescription>
        </DialogHeader>

        {!url && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="expiry">Link expires</Label>
              <select
                id="expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-[13px]"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="0">Never</option>
              </select>
            </div>
            {error && <p className="text-[12px] text-[#FF3B30]">{error}</p>}
          </div>
        )}

        {url && (
          <div className="space-y-3">
            <div className="text-[12px] text-[#6E6E73]">
              Share this link with the client. Their actions land in real time.
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#F5F5F7] rounded-lg">
              <code className="text-[11.5px] text-[#1D1D1F] flex-1 truncate">{url}</code>
              <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <Check /> Copied
                  </>
                ) : (
                  <>
                    <Copy /> Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-[11px] text-[#86868B]">
              {expiry === "0" ? "No expiry." : `Expires in ${expiry} days.`} The client can print the page to PDF from the link.
            </p>
          </div>
        )}

        <DialogFooter>
          {!url ? (
            <Button onClick={onGenerate} disabled={pending}>
              {pending ? "Generating..." : "Generate link"}
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setOpen(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
