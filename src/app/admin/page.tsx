import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export default function AdminIndexPage() {
  redirect(AUTH_ROUTES.dashboard);
}
