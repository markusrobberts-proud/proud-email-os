# PUNCH

Proud Creative's email-marketing OS. Plans monthly calendars, drafts copy and design briefs, and structures client approvals, powered by Claude with each brand's knowledge bank as context.

Production: [punch-email-os.vercel.app](https://punch-email-os.vercel.app)

Spec docs live in the parent folder (`../Proud Creative - Email Studio.md`, `../proud-email-os-phase-2-spec.md`).

## Stack

- **Next.js 16** (App Router, RSC, Server Actions) + Turbopack
- **Tailwind CSS 4** + shadcn/ui, Apple-OS / liquid-glass aesthetic
- **Clerk** for auth (Google SSO + email magic link)
- **Supabase** Postgres + Storage. Service-role client on the server, RLS off; access control is enforced at the application layer via `lib/rbac.ts`.
- **Vercel AI Gateway** → Anthropic (Opus for reasoning, Sonnet for drafting, Haiku for parsing)
- **Resend** inbound webhook for forwarded-email ingestion
- **Vercel** hosting (Sydney region)

## Roles

| Role | What they can do |
|---|---|
| **super_admin** | Everything. Plus impersonate other roles (Settings → View as) and see the deploy banner. |
| **admin** | Everything except super_admin features. Manages users + brands. |
| **strategist** | Org-wide read/write. Edits Proud Strategy, plans calendars, generates copy, approves campaigns. |
| **designer** | Owns briefs end to end for **assigned brands**. Edits + exports briefs to Asana. Read-only on strategy and copy. |
| **viewer** | Read-only on **assigned brands**. Good for account managers. |
| **pending** | Default for new sign-ups. Bounced to `/awaiting-approval` until an admin promotes them. |

Designers and viewers are scoped to brands they're a member of (`brand_members` table). Strategist+ is org-wide by design.

## Adding a teammate

The flow is self-signup + admin promote:

1. Send them `https://punch-email-os.vercel.app/sign-in`.
2. They sign in (Google SSO if their email is on a Google Workspace, otherwise email magic link via Clerk).
3. Clerk webhook seeds a row in `public.users` with `role=pending`. An "awaiting approval" notification goes to admins.
4. An admin opens **Settings → Team**, finds them in the list, and picks their role.
5. They refresh and they're in.

Only a real super_admin can hand out (or revoke) the `super_admin` role.

## How the agency works in PUNCH

1. **Brand setup** (strategist+). Create the brand, paste the website URL, optionally run "Auto-fill from URL". Background scrape + AI brand-profile extraction lands raw pages + a brand-profile doc into the knowledge bank.
2. **Knowledge bank**. Designers and strategists upload reference docs (PDFs, briefs, meeting notes). The brand has a forwarding inbox at `<brand-slug>@kb.punch.studio`. Email anything there and it lands as pending-review. Strategists approve / reject / delete.
3. **Plan a campaign** (strategist+). `/brands/<slug>/calendar` → "Plan next month". Pick the name, month, cadence (per-week + total emails auto-calc), format mix. Claude generates the calendar, you approve, then generate copy and briefs.
4. **Designer hand-off**. Designers see "Briefs ready" notifications, work the briefs, export to Asana with one click. They can inline-edit briefs but not copy.
5. **Client approval**. Strategists generate a tokenised approval link. Client approves / requests changes / comments per email. The team sees those actions in the bell + the plan page within 8 seconds.

## Notifications

The bell in the sidebar pings on:

- Client approve / request-changes / comment
- Calendar approved (designers)
- Briefs ready for a plan (designers)
- New email forwarded to a brand inbox (strategist+)
- New user awaiting approval (admins)
- Your role changed (you)
- Website scrape complete (the strategist who triggered it)

Audit-worthy noise (edits, exports, brand-creates) stays in `/settings/audit` instead.

## Local development

```bash
cp .env.example .env.local   # fill in keys
pnpm install
pnpm dev                     # http://localhost:3000
```

Get keys from:
- Clerk dashboard → application keys
- Supabase project settings → API
- Anthropic console (or leave AI features off)

## Database

Migrations in `supabase/migrations/`. Apply via Supabase SQL editor or `supabase db push`:

| Migration | Purpose |
|---|---|
| `0001_init.sql` | Full schema + initial Proud Strategy sections |
| `0002_storage.sql` | `knowledge-files` bucket + policies |
| `0003_super_admin.sql` | Adds `super_admin` to the `user_role` enum + `is_admin()` helper. Run as two separate queries (the `alter type` line first, the function second). |
| `0004_clerk.sql` | Migrates user IDs from uuid to text for Clerk. Destructive on first run. Has an idempotency guard so a re-run fails with a clear error instead of wiping data. |
| `0005_plan_cadence.sql` | Drops the one-plan-per-brand-per-month constraint and adds `emails_per_week` + `total_emails` columns. |
| `0006_notifications.sql` | In-app notifications table + indexes. |

## Folder layout

```
app/(auth)/{sign-in, sign-up, awaiting-approval}
app/(dashboard)/{brands, calendar, knowledge, strategy, settings, notifications, eom, klaviyo}
app/(public)/approval/[token]
app/api/{inbound/email, webhooks/clerk}
components/{ui, layout}
lib/{auth, rbac, brands, campaigns, dashboard, notifications, audit, ai, knowledge, supabase}
proxy.ts                       # Next 16 middleware (Clerk + x-pathname header)
supabase/migrations/*.sql
```

## Operational checklist

Before the team starts using the production deployment, confirm:

- All six migrations applied in order in Supabase
- Clerk dashboard: production app keys set in Vercel env, webhook endpoint pointing at `/api/webhooks/clerk` subscribed to `user.created`, `user.updated`, `user.deleted`
- `INBOUND_EMAIL_WEBHOOK_TOKEN` set (the inbound route fails closed without it)
- `ANTHROPIC_API_KEY` set (or AI Gateway equivalents)
- One super_admin in the `users` table (`update public.users set role = 'super_admin' where email = '<you>@proudaspunch.studio'` if there isn't one yet)
- For inbound email: DNS for `kb.punch.studio` (MX + Resend verification), Resend route POSTing to `/api/inbound/email` with `Authorization: Bearer <token>`
- Optional: `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` to light up the super-admin deploy banner
