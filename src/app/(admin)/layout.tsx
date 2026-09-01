import { AdminLayout } from "@/components/dashboard/admin-layout";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
