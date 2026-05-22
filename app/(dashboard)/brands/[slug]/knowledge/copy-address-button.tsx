"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyAddressButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-[12px] text-[#007AFF] hover:underline inline-flex items-center gap-1"
    >
      {copied ? (
        <>
          <Check className="size-3" /> Copied
        </>
      ) : (
        <>
          <Copy className="size-3" /> Copy
        </>
      )}
    </button>
  )
}
