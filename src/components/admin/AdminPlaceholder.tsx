"use client";

import type { LucideIcon } from "lucide-react";

interface AdminPlaceholderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export default function AdminPlaceholder({
  title,
  description = "Modul ini akan segera dikembangkan.",
  icon: Icon,
}: AdminPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green-medium/10">
                <Icon className="size-5 text-brand-green-medium" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-600 dark:bg-slate-800 sm:p-16">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
          <span className="text-2xl">🚧</span>
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dalam Pengembangan</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}
