"use client";

import { useEffect, useState } from "react";
import {
  DatabaseBackup,
  Download,
  Upload,
  Loader2,
  Check,
  AlertTriangle,
  Info,
  Table2,
} from "lucide-react";

interface TableCounts {
  [key: string]: number;
}

interface RestoreResult {
  success: boolean;
  restored: Record<string, number>;
  totalRows: number;
  errors?: string[];
}

const TABLE_LABELS: Record<string, string> = {
  area_monitoring: "Area Monitoring",
  spesies: "Spesies",
  tegakan: "Tegakan",
  monitoring: "Monitoring",
  penyulaman: "Penyulaman",
  kualitas_air: "Kualitas Air",
  blue_carbon_calculations: "Blue Carbon",
  galeri: "Galeri",
  dokumen: "Dokumen",
};

export default function BackupRestorePage() {
  const [counts, setCounts] = useState<TableCounts | null>(null);
  const [countsLoading, setCountsLoading] = useState(true);

  const [backupLoading, setBackupLoading] = useState(false);
  const [backupDone, setBackupDone] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setCountsLoading(true);
      try {
        const res = await fetch("/api/backup/tables");
        if (!res.ok) throw new Error("Gagal memuat informasi tabel");
        const json = await res.json();
        if (!cancelled) setCounts(json.counts);
      } catch {
        if (!cancelled) setError("Gagal memuat ringkasan data");
      } finally {
        if (!cancelled) setCountsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleBackup() {
    setError("");
    setBackupLoading(true);
    setBackupDone(false);

    try {
      const res = await fetch("/api/backup/export");
      if (!res.ok) throw new Error("Gagal mengexport backup");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BCG-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupDone(true);
      setTimeout(() => setBackupDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal backup");
    } finally {
      setBackupLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setRestoreResult(null);
    setError("");

    if (f && !f.name.endsWith(".json")) {
      setError("Hanya file JSON yang didukung");
      setFile(null);
    }
  }

  async function handleRestore() {
    if (!file) return;

    setError("");
    setRestoreLoading(true);
    setShowConfirm(false);
    setRestoreResult(null);

    try {
      const text = await file.text();
      const res = await fetch("/api/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal merestore data");

      setRestoreResult(json);
      try {
        const refetch = await fetch("/api/backup/tables");
        if (refetch.ok) {
          const json2 = await refetch.json();
          setCounts(json2.counts);
        }
      } catch { /* silent */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal restore");
    } finally {
      setRestoreLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green-medium/10">
              <DatabaseBackup className="size-5 text-brand-green-medium" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Backup & Restore
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Cadangkan dan pulihkan seluruh data sistem Blue Carbon Guardian
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Ringkasan Data ── */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-2">
            <Table2 className="size-4 text-brand-green-medium" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Ringkasan Data
            </h2>
          </div>

          {countsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-slate-400" />
            </div>
          ) : counts ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(counts).map(([table, count]) => (
                <div
                  key={table}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-700/30"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {TABLE_LABELS[table] ?? table}
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {count < 0 ? (
                      <span className="text-xs text-slate-400">N/A</span>
                    ) : (
                      `${count.toLocaleString("id-ID")} record`
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-slate-400">
              Gagal memuat data
            </p>
          )}
        </div>

        {/* ── Info Card ── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-800">
          <div className="mb-3 flex items-center gap-2">
            <Info className="size-4 text-brand-green-medium" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Informasi
            </h2>
          </div>
          <ul className="space-y-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            <li className="flex gap-2">
              <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-green-medium" />
              Backup mencakup 9 tabel data konservasi
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-green-medium" />
              File backup adalah JSON (dapat dibaca)
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-green-medium" />
              Restore akan mengganti seluruh data yang ada
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
              Operasi restore tidak dapat dibatalkan
            </li>
          </ul>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Backup */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-800">
          <h2 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Backup Database
          </h2>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            Download seluruh data sebagai file JSON
          </p>
          <button
            type="button"
            onClick={handleBackup}
            disabled={backupLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {backupLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : backupDone ? (
              <Check className="size-4" />
            ) : (
              <Download className="size-4" />
            )}
            {backupLoading
              ? "Mengexport..."
              : backupDone
                ? "Selesai!"
                : "Backup Database"}
          </button>
        </div>

        {/* Restore */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-800">
          <h2 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Restore Data
          </h2>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            Pulihkan data dari file backup JSON
          </p>

          <label className="mb-3 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-500 transition hover:border-brand-green-medium/50 hover:bg-brand-green-medium/5 dark:border-slate-600 dark:bg-slate-700/30 dark:text-slate-400">
            <Upload className="size-4" />
            <span className="flex-1 truncate">
              {file ? file.name : "Pilih file backup JSON..."}
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={!file || restoreLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {restoreLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {restoreLoading ? "Merestore..." : "Restore Data"}
          </button>
        </div>
      </div>

      {/* ── Konfirmasi Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              Konfirmasi Restore
            </h3>
            <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
              Tindakan ini akan <strong>menghapus dan mengganti</strong> seluruh
              data yang ada dengan data dari file backup.
            </p>
            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
              Pastikan Anda telah membackup data saat ini sebelum melanjutkan.
              Operasi ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRestore}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Ya, Restore Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hasil Restore ── */}
      {restoreResult && (
        <div className="rounded-2xl border border-brand-green-medium/30 bg-brand-green-medium/5 p-5 dark:border-brand-green-medium/20 dark:bg-brand-green-medium/10">
          <div className="mb-3 flex items-center gap-2">
            <Check className="size-5 text-brand-green-medium" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Restore Berhasil
            </h3>
          </div>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {Object.entries(restoreResult.restored).map(([table, count]) => (
              <div
                key={table}
                className="flex items-center justify-between rounded-lg bg-white/50 px-3 py-1.5 text-xs dark:bg-slate-700/30"
              >
                <span className="text-slate-600 dark:text-slate-400">
                  {TABLE_LABELS[table] ?? table}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {count.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Total {restoreResult.totalRows.toLocaleString("id-ID")} record
            berhasil direstore.
          </p>
          {restoreResult.errors && restoreResult.errors.length > 0 && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
              <strong className="block mb-1">Peringatan:</strong>
              {restoreResult.errors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
