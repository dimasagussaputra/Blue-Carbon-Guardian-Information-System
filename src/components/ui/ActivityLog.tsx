"use client";

import { useState, useEffect, useCallback } from "react";
import { History, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { ActivityLogEntry } from "@/lib/activity-log/service";

const ACTION_LABELS: Record<string, string> = {
  create: "Menambah",
  update: "Mengubah",
  delete: "Menghapus",
  restore: "Memulihkan",
  force_delete: "Menghapus Permanen",
  login: "Login",
  logout: "Logout",
  export: "Mengekspor",
  upload: "Mengunggah",
};

const ACTION_COLORS: Record<string, string> = {
  create: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  update: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  delete: "text-red-600 bg-red-50 dark:bg-red-900/20",
  restore: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  force_delete: "text-red-700 bg-red-100 dark:bg-red-900/30",
  login: "text-slate-600 bg-slate-50 dark:bg-slate-800",
  logout: "text-slate-600 bg-slate-50 dark:bg-slate-800",
  export: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
  upload: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
};

interface ActivityLogProps {
  limit?: number;
}

export function ActivityLog({ limit = 20 }: ActivityLogProps) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/activity-log?limit=${limit}&page=${page}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setLogs(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [limit, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="size-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Aktivitas Terbaru
          </h3>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"
          aria-label="Muat ulang aktivitas"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-2 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-xs text-red-400 text-center py-4">Gagal memuat aktivitas</p>
      ) : logs.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">Belum ada aktivitas</p>
      ) : (
        <>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_COLORS[log.action] ?? "text-slate-600 bg-slate-100"}`}
                >
                  {ACTION_LABELS[log.action] ?? log.action}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {log.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {log.entity_type} &middot; {formatDateTime(log.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] text-slate-400">
                {total} aktivitas
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <span className="text-[10px] text-slate-400">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  aria-label="Selanjutnya"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
