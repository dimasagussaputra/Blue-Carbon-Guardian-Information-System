"use client";

import { ImageIcon, Calendar, Ruler, Activity } from "lucide-react";
import type { MonitoringRecord } from "@/lib/monitoring/types";

const KONDISI_LABEL: Record<string, string> = {
  hidup: "Hidup",
  mati: "Mati",
  stres: "Stres",
  sakit: "Sakit",
};

const KONDISI_COLOR: Record<string, string> = {
  hidup: "bg-emerald-100 text-emerald-700",
  mati: "bg-red-100 text-red-700",
  stres: "bg-amber-100 text-amber-700",
  sakit: "bg-orange-100 text-orange-700",
};

interface MonitoringTimelineProps {
  data: MonitoringRecord[];
}

export default function MonitoringTimeline({
  data,
}: MonitoringTimelineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Belum ada riwayat monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {data.map((record, index) => (
        <div key={record.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Timeline line */}
          {index < data.length - 1 && (
            <div className="absolute left-[19px] top-10 h-full w-0.5 bg-slate-200 dark:bg-slate-700" />
          )}

          {/* Timeline dot */}
          <div className="relative z-10 mt-1 flex shrink-0">
            <div
              className={`flex size-10 items-center justify-center rounded-full ${
                record.health_status === "hidup"
                  ? "bg-emerald-100 text-emerald-600"
                  : record.health_status === "mati"
                    ? "bg-red-100 text-red-600"
                    : "bg-amber-100 text-amber-600"
              }`}
            >
              <Calendar className="size-4" />
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {new Date(record.tanggal).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  KONDISI_COLOR[record.health_status] ??
                  "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {KONDISI_LABEL[record.health_status] ?? record.health_status}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Ruler className="size-3.5 text-slate-400 dark:text-slate-500" />
                Tinggi: <strong>{record.tinggi_cm.toFixed(1)} cm</strong>
              </span>
              {record.diameter_cm != null && (
                <span className="inline-flex items-center gap-1">
                  <Ruler className="size-3.5 text-slate-400 dark:text-slate-500" />
                  Diameter:{" "}
                  <strong>{record.diameter_cm.toFixed(1)} cm</strong>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Activity className="size-3.5 text-slate-400 dark:text-slate-500" />
                Survia:{" "}
                <strong>{record.survia ? "Ya" : "Tidak"}</strong>
              </span>
            </div>

            {record.catatan && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{record.catatan}</p>
            )}

            {record.foto_url && (
              <a
                href={record.foto_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                <ImageIcon className="size-3.5" />
                Lihat Foto
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
