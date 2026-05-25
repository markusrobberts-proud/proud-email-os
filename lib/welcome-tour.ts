import type { Role } from "./auth"

export type TourStep = {
  /** Short title (under 8 words). */
  title: string
  /** One or two sentences. Keep it tight. */
  body: string
  /** Optional CTA at the bottom of the step. */
  cta?: { label: string; href: string }
  /** Lucide icon name (lowercase) so the modal can pick it. */
  icon:
    | "sparkles"
    | "calendar"
    | "bookopen"
    | "users"
    | "bell"
    | "shield"
    | "filetext"
    | "compass"
    | "eye"
    | "mail"
}

/**
 * Returns the steps that a given role should see in the welcome tour
 * (and on the /guide page). Designed so the actor reads exactly what's
 * relevant to their day-to-day, no more.
 *
 * Each role has 4-6 steps. The last one always points at /guide so
 * users know they can come back for the full reference.
 */
export function tourFor(role: Role): { intro: string; steps: TourStep[] } {
  switch (role) {
    case "super_admin":
      return {
        intro: "You can see and do everything. Use View As in Settings to feel what each role experiences.",
        steps: [
          {
            icon: "sparkles",
            title: "PUNCH is Proud's email OS",
            body: "Plans monthly calendars, drafts copy + briefs with Claude, structures client approvals. Per-brand knowledge bank in context on every generation.",
          },
          {
            icon: "shield",
            title: "You're a super admin",
            body: "You're not constrained by brand-scoping. The deploy-status strip up top is yours only. The View As card in Settings lets you preview admin / strategist / designer / viewer.",
            cta: { label: "Open Settings", href: "/settings" },
          },
          {
            icon: "bell",
            title: "The bell is your queue",
            body: "Client approvals, briefs ready, new sign-ups, forwarded emails — all of it. Pinned to your sidebar. Polls every 30s.",
          },
          {
            icon: "calendar",
            title: "Start at Brands → Calendar",
            body: "Pick a brand, hit Plan next month, fill cadence + a short brief. Claude proposes the calendar, you approve, then generate copy + briefs.",
            cta: { label: "Go to Brands", href: "/brands" },
          },
          {
            icon: "bookopen",
            title: "Knowledge bank shapes every generation",
            body: "Per-brand: docs, scraped pages, forwarded emails. Per-org: Proud Strategy. Keep this fresh; Claude reads it on every prompt.",
            cta: { label: "Proud Strategy", href: "/strategy" },
          },
          {
            icon: "filetext",
            title: "Come back for the full guide anytime",
            body: "Open /guide from Settings to read the longer walk-through, role by role.",
            cta: { label: "Open the guide", href: "/guide" },
          },
        ],
      }

    case "admin":
      return {
        intro: "You run the platform: users, brands, audit log. No client-facing approvals, that's the strategist.",
        steps: [
          {
            icon: "sparkles",
            title: "PUNCH is Proud's email OS",
            body: "Plans monthly calendars, drafts copy + briefs with Claude, structures client approvals.",
          },
          {
            icon: "users",
            title: "Team management lives in Settings",
            body: "New sign-ups land as Pending. You promote them to a role. Brand-specific scoping for designers/viewers happens on each brand's settings page.",
            cta: { label: "Open Team settings", href: "/settings/team" },
          },
          {
            icon: "calendar",
            title: "Strategists drive the campaign work",
            body: "Plan next month → calendar → copy → briefs → client approval link. You can do all of it too, but it's not your daily lane.",
            cta: { label: "Go to Brands", href: "/brands" },
          },
          {
            icon: "bell",
            title: "Bell pings on org events",
            body: "New user awaiting approval, brand created, client actions on shared plans. Audit log in Settings has the long view.",
          },
          {
            icon: "filetext",
            title: "The /guide page has the full reference",
            body: "Per-role walkthrough you can share with anyone you promote.",
            cta: { label: "Open the guide", href: "/guide" },
          },
        ],
      }

    case "strategist":
      return {
        intro: "You own the plan → copy → brief pipeline, end to end. Designers pick up the briefs after.",
        steps: [
          {
            icon: "sparkles",
            title: "Welcome to PUNCH",
            body: "Claude plans + drafts campaigns grounded in Proud Strategy plus each brand's knowledge bank. You shape both.",
          },
          {
            icon: "compass",
            title: "Start with Proud Strategy",
            body: "Section-by-section editor that feeds every brand's generation. Keep it sharp. Anything sitewide goes here.",
            cta: { label: "Edit Proud Strategy", href: "/strategy" },
          },
          {
            icon: "calendar",
            title: "Plan a campaign in five steps",
            body: "Brand → Calendar → Plan next month → name + cadence + brief → Generate. Approve, then generate copy, then briefs. Each step locks in your decisions before the next.",
            cta: { label: "Open Brands", href: "/brands" },
          },
          {
            icon: "bookopen",
            title: "Knowledge bank is the secret sauce",
            body: "Add notes, upload docs, forward emails to <brand>@kb.punch.studio. You approve what makes it into Claude's context.",
          },
          {
            icon: "mail",
            title: "Share with the client",
            body: "From a finished plan, generate a tokenised approval link. Clients approve / request changes / comment per email. You see their actions in the bell.",
          },
          {
            icon: "filetext",
            title: "Full reference at /guide",
            body: "Come back anytime if you forget a step.",
            cta: { label: "Open the guide", href: "/guide" },
          },
        ],
      }

    case "designer":
      return {
        intro: "You own briefs end-to-end. Strategists hand you a finished plan; you ship it.",
        steps: [
          {
            icon: "sparkles",
            title: "Welcome to PUNCH",
            body: "Claude drafts the brief from the calendar + copy. You refine it, edit details, and export to Asana when ready.",
          },
          {
            icon: "bell",
            title: "Your trigger is 'Briefs ready'",
            body: "When a strategist finishes generating, you get a bell notification linking straight to the plan. No need to chase anyone.",
          },
          {
            icon: "calendar",
            title: "Open a plan, work the briefs",
            body: "Each email in the plan has a Brief section. Click Edit to refine layout / imagery / colour / sender notes. Save when you're done.",
            cta: { label: "Open Brands", href: "/brands" },
          },
          {
            icon: "filetext",
            title: "Export to Asana",
            body: "One click on a finished email creates a task in the designated Asana workspace with the full brief in the description.",
          },
          {
            icon: "bookopen",
            title: "Add to the knowledge bank",
            body: "Reference layouts, brand assets, anything that helps Claude get the brief right next time. Goes in via Brand → Knowledge bank.",
          },
          {
            icon: "filetext",
            title: "Full reference at /guide",
            body: "Come back anytime for the longer walkthrough.",
            cta: { label: "Open the guide", href: "/guide" },
          },
        ],
      }

    case "client":
      return {
        intro: "Welcome to PUNCH. You'll see the campaigns Proud is putting together for your brand, and you can approve them right here.",
        steps: [
          {
            icon: "sparkles",
            title: "This is your brand's workspace",
            body: "Proud Creative drafts your monthly email campaigns here, with Claude in the loop. You get a clean view of what's coming and approve it without juggling email threads.",
          },
          {
            icon: "calendar",
            title: "Find your campaigns in the sidebar",
            body: "Pick your brand from the switcher, then Calendar. Each row is a month. Click in to see every email, in send order, with subject lines, copy, and design notes.",
            cta: { label: "Open Brands", href: "/brands" },
          },
          {
            icon: "mail",
            title: "Approve, request changes, or comment",
            body: "On any campaign that's ready for you, you'll see approve / request-changes / comment buttons per email. Your reply goes straight to the strategist.",
          },
          {
            icon: "bell",
            title: "The bell catches you up",
            body: "We'll ping you here when a new month is ready for review. No more inbox archaeology.",
          },
          {
            icon: "filetext",
            title: "Lost? The guide is always here",
            body: "Hit How to use PUNCH in the sidebar anytime to revisit this.",
            cta: { label: "Open the guide", href: "/guide" },
          },
        ],
      }

    case "pending":
    default:
      return {
        intro: "You'll see this guide as soon as an admin approves you.",
        steps: [],
      }
  }
}
