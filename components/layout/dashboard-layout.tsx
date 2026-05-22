import Link from "next/link"
import {
  Calendar,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Mail,
  BarChart3,
  Settings,
} from "lucide-react"
import { Sidebar } from "./sidebar"
import { SignOutButton } from "./sign-out-button"
import type { AppUser } from "@/lib/auth"

const NAV = [
  { href: "/", label: "Brands", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/knowledge", label: "Knowledge Bank", icon: BookOpen },
  { href: "/strategy", label: "Proud Strategy", icon: Sparkles },
  { href: "/klaviyo", label: "Klaviyo", icon: Mail },
  { href: "/eom", label: "EOM Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function DashboardLayout({ user, children }: { user: AppUser; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-b from-white via-neutral-50 to-neutral-100">
      <Sidebar nav={NAV} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/60 bg-white/60 backdrop-blur-md flex items-center justify-end px-8 gap-4">
          <div className="text-right">
            <div className="text-sm font-medium">{user.displayName ?? user.email}</div>
            <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
          </div>
          <SignOutButton />
        </header>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
