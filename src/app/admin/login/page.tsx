import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login Admin | Blue Carbon Guardian",
  description: "Masuk ke panel admin Blue Carbon Guardian",
};

function LoginFormFallback() {
  return (
    <div className="flex h-48 items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-brand-green-medium border-t-transparent" />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blue-deep via-brand-blue-dark to-brand-green-deep px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 transition hover:text-white"
          >
            <Leaf className="size-6 text-brand-green-light" />
            <span className="text-lg font-semibold tracking-tight">
              Blue Carbon Guardian
            </span>
          </Link>
          <p className="mt-2 text-sm text-white/60">Panel Admin</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-black/20">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Masuk Admin</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Gunakan kredensial admin untuk mengakses dashboard.
            </p>
          </div>

          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 transition hover:text-brand-green-medium"
            >
              <ArrowLeft className="size-3.5" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          Hanya pengguna dengan role admin yang dapat masuk.
        </p>
      </div>
    </div>
  );
}
