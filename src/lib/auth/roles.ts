import type { User } from "@supabase/supabase-js";
import type { UserRole } from "./types";

export const ADMIN_ROLE = "admin" as const;

export function getUserRole(user: User | null): UserRole {
  if (!user) return "guest";

  const role =
    user.app_metadata?.role ??
    user.user_metadata?.role ??
    "guest";

  return role === ADMIN_ROLE ? "admin" : "guest";
}

export function isAdmin(user: User | null): boolean {
  return getUserRole(user) === "admin";
}
