"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Gagal memuat data. Silakan coba lagi.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="size-8 text-red-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-brand-blue-dark hover:bg-brand-blue-medium transition-colors"
        >
          <RefreshCw className="size-3.5" />
          Coba Lagi
        </button>
      )}
    </div>
  );
}
