import { getDashboardData } from "@/lib/dashboard/service";
import DashboardPage from "@/components/admin/Dashboard/DashboardPage";

export const metadata = {
  title: "Dashboard | Admin BCG",
};

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return <DashboardPage data={data} />;
}
