import { requireApprovedUser } from "@/lib/auth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const user = await requireApprovedUser()
  return <DashboardLayout user={user}>{children}</DashboardLayout>
}
