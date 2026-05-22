"use client"

import { useActionState } from "react"
import { createBrandAction, type BrandFormState } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const initial: BrandFormState = { ok: false }

export function CreateBrandForm() {
  const [state, formAction, pending] = useActionState(createBrandAction, initial)
  const fe = state?.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Brand name" name="name" required error={fe.name} placeholder="Walnut Melbourne" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Website" name="website_url" error={fe.website_url} placeholder="https://..." />
        <Field label="Industry" name="industry" error={fe.industry} placeholder="Fashion" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Contact name" name="contact_name" error={fe.contact_name} />
        <Field label="Contact email" name="contact_email" error={fe.contact_email} type="email" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Primary colour" name="primary_color" error={fe.primary_color} placeholder="#0a0a0a" />
        <Field label="Secondary colour" name="secondary_color" error={fe.secondary_color} placeholder="#f5f5f5" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Heading font" name="font_heading" error={fe.font_heading} />
        <Field label="Body font" name="font_body" error={fe.font_body} />
      </div>
      <TextareaField label="Tone of voice" name="tone_of_voice" error={fe.tone_of_voice} />
      <TextareaField label="Target audience" name="target_audience" error={fe.target_audience} />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create brand"}</Button>
    </form>
  )
}

function Field({
  label, name, error, required, type = "text", placeholder,
}: {
  label: string
  name: string
  error?: string
  required?: boolean
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
      <Input id={name} name={name} type={type} required={required} placeholder={placeholder} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function TextareaField({ label, name, error }: { label: string; name: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} rows={3} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
