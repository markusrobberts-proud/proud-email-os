"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type NavItem = { href: string; label: string; icon: LucideIcon }

export function Sidebar({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 border-r border-border/60 bg-white/40 backdrop-blur-md flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border/60">
        <Link href="/" className="block">
          <div className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
            Proud Creative
          </div>
          <div className="text-base font-semibold leading-tight">Email OS</div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-foreground/70 hover:bg-neutral-100 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 text-[11px] text-muted-foreground border-t border-border/60">
        Phase 2A · MVP
      </div>
    </aside>
  )
}
