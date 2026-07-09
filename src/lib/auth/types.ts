import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "guest";

export interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  isAdmin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
