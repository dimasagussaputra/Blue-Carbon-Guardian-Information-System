import AdminShell from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = getUserRole(user);

  return (
    <AdminShell userEmail={user?.email} userRole={role}>
      {children}
    </AdminShell>
  );
}
