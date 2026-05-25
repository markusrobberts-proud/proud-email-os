"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const BRAND_DEFAULT_ACCENT = "#1D1D1F"

/**
 * Pulls a favicon URL for the brand's website via Google's favicon
 * service. Falls back to the colored initials chip when we have no URL
 * or the image fails to load. Returning null hostname signals "no try".
 */
function faviconUrlFor(websiteUrl: string | null | undefined, sizePx: number): string | null {
  if (!websiteUrl) return null
  try {
    const host = new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`).hostname
    if (!host) return null
    // sz=64 is the smallest tier Google still serves crisp on retina at 24px.
    const sz = Math.max(32, sizePx * 2)
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${sz}`
  } catch {
    return null
  }
}

function brandInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

/**
 * BrandIcon: shows the brand's real favicon when we have a website,
 * else a colored chip with the brand's initials. Use this everywhere we'd
 * previously have hand-rolled an initials square so brand chrome looks
 * coherent across the app.
 *
 * Sizes:
 *   - sm: ~20px (sidebar switcher rows + brand chips in line copy)
 *   - md: ~32px (brand list cards, dashboard tiles)
 *   - lg: ~44px (header / hero placements, rare)
 */
export function BrandIcon({
  name,
  websiteUrl,
  primaryColor,
  size = "sm",
  className,
}: {
  name: string
  websiteUrl?: string | null
  primaryColor?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const sizePx = size === "lg" ? 44 : size === "md" ? 36 : 20
  const dimensionClasses =
    size === "lg" ? "w-11 h-11 text-[13px]" : size === "md" ? "w-9 h-9 text-[11px]" : "w-5 h-5 text-[9px]"
  const rounded = size === "sm" ? "rounded-md" : "rounded-lg"

  const url = faviconUrlFor(websiteUrl, sizePx)
  const [failed, setFailed] = useState(false)

  if (!url || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center font-semibold text-white shrink-0",
          dimensionClasses,
          rounded,
          className,
        )}
        style={{ background: primaryColor || BRAND_DEFAULT_ACCENT }}
        aria-label={name}
      >
        {brandInitials(name)}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-white shrink-0 overflow-hidden border border-[#E5E5EA]",
        dimensionClasses,
        rounded,
        className,
      )}
      aria-label={name}
    >
      {/* Plain img to skip next/image domain config + svg-vs-png ambiguity from
          Google's favicon endpoint. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        width={sizePx}
        height={sizePx}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-contain"
      />
    </div>
  )
}
