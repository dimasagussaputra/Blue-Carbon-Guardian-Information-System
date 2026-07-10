"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  User,
  KeyRound,
  Shield,
  Clock,
  Loader2,
  Check,
  Save,
  AlertTriangle,
  Eye,
  EyeOff,
  LogOut,
  History,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { ActivityLog } from "@/components/ui/ActivityLog";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function SettingsPage() {
  const supabase = createClient();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [fullName, setFullName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileDone, setProfileDone] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordDone, setPasswordDone] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      setUser(userData.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
        setFullName((profileData as Profile).full_name ?? "");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSaveProfile() {
    if (!user) return;
    setError("");
    setProfileSaving(true);
    setProfileDone(false);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: fullName || null })
        .eq("id", user.id);

      if (updateError) throw new Error(updateError.message);

      setProfile((prev) => prev ? { ...prev, full_name: fullName || null } : prev);
      setProfileDone(true);
      setTimeout(() => setProfileDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword() {
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Semua field password harus diisi");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setPasswordSaving(true);
    setPasswordDone(false);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? "",
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Password saat ini salah");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw new Error(updateError.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordDone(true);
      setTimeout(() => setPasswordDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah password");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleLogoutAll() {
    if (!confirm("Logout dari semua perangkat? Anda akan diarahkan ke halaman login.")) return;

    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-brand-green-medium" />
      </div>
    );
  }

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green-medium/10">
              <Settings className="size-5 text-brand-green-medium" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Settings
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pengaturan akun dan preferensi admin
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Profil Admin ── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
              <User className="size-4 text-slate-500 dark:text-slate-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Profil Admin
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-green-medium focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Email
              </label>
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Role
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700">
                  <Shield className="size-4 text-brand-green-medium" />
                  <span className="font-medium capitalize text-slate-800 dark:text-slate-200">
                    {profile?.role ?? "-"}
                  </span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Bergabung Sejak
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700">
                  <Clock className="size-4 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {joinDate}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profileSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : profileDone ? (
                <Check className="size-4" />
              ) : (
                <Save className="size-4" />
              )}
              {profileSaving ? "Menyimpan..." : profileDone ? "Tersimpan!" : "Simpan Profil"}
            </button>
          </div>
        </div>

        {/* ── Ubah Password ── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
              <KeyRound className="size-4 text-slate-500 dark:text-slate-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Ubah Password
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-sm text-slate-800 focus:border-brand-green-medium focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-green-medium focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-green-medium focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>

            <button
              type="button"
              onClick={handleChangePassword}
              disabled={passwordSaving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              {passwordSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : passwordDone ? (
                <Check className="size-4 text-brand-green-medium" />
              ) : (
                <KeyRound className="size-4" />
              )}
              {passwordSaving ? "Mengubah..." : passwordDone ? "Berhasil!" : "Ubah Password"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Activity Log ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
            <History className="size-4 text-slate-500 dark:text-slate-400" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Riwayat Aktivitas
          </h2>
        </div>
        <ActivityLog />
      </div>

      {/* ── Sesi & Keamanan ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
            <Shield className="size-4 text-slate-500 dark:text-slate-400" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Sesi & Keamanan
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-700/30">
            <div className="flex items-center gap-3">
              <LogOut className="size-4 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Logout dari Semua Perangkat
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Akhiri semua sesi aktif kecuali sesi saat ini
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogoutAll}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Logout All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
