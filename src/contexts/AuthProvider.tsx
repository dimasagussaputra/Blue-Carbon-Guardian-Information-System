"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { getUserRole, isAdmin } from "@/lib/auth/roles";
import type { AuthState, LoginCredentials } from "@/lib/auth/types";

interface AuthContextValue extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapAuthError(message: string): string {
  const msgLower = message.toLowerCase();

  if (
    msgLower.includes("invalid login credentials") ||
    msgLower.includes("invalid_credentials") ||
    (msgLower.includes("invalid") && msgLower.includes("credential"))
  ) {
    return "Email atau password salah.";
  }
  if (msgLower.includes("email not confirmed")) {
    return "Email belum diverifikasi. Periksa inbox Anda.";
  }
  if (msgLower.includes("too many requests") || msgLower.includes("rate limit")) {
    return "Terlalu banyak percobaan. Coba lagi nanti.";
  }

  return `Gagal masuk: ${message}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(
    async ({ email, password, rememberMe = true }: LoginCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: mapAuthError(error.message) };
      }

      const signedInUser = data.user;
      if (!isAdmin(signedInUser)) {
        await supabase.auth.signOut();
        return { error: "Akun ini tidak memiliki akses admin." };
      }

      if (!rememberMe) {
        sessionStorage.setItem("bcg_session_only", "1");
      } else {
        sessionStorage.removeItem("bcg_session_only");
      }

      return { error: null };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    sessionStorage.removeItem("bcg_session_only");
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.location.href = AUTH_ROUTES.login;
  }, [supabase]);

  const role = getUserRole(user);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      role,
      isLoading,
      isAdmin: role === "admin",
      signIn,
      signOut,
    }),
    [user, session, role, isLoading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
