import { UserDashboardLayout } from "@/components/dashboard/user-dashboard-layout";

export default function UserDashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
