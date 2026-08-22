import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <AdminShell userName={user.name}>{children}</AdminShell>;
}
