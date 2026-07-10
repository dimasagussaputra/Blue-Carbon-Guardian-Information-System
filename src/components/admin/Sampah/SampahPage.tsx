"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Trash2,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface SampahRecord {
  id: string;
  [key: string]: unknown;
  deleted_at: string;
}

interface TableGroup {
  records: SampahRecord[];
  total: number;
}

interface SampahResponse {
  tables: Record<string, TableGroup>;
  tableLabels: Record<string, string>;
}

const LABEL_KEYS: Record<string, string> = {
  tegakan: "kode_tegakan",
  galeri: "judul",
  dokumen: "judul",
  monitoring: "id",
  penyulaman: "spesies",
  kualitas_air: "titik_sampling",
  blue_carbon_calculations: "mangrove_type",
  area_monitoring: "nama",
};

export default function SampahPage() {
  const [data, setData] = useState<SampahResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<{ table: string; id: string; label: string } | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<{ table: string; id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const fetchSampah = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sampah");
      if (!res.ok) throw new Error("Gagal memuat data");
      const json: SampahResponse = await res.json();
      setData(json);
    } catch {
      toast.error("Gagal memuat data sampah");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSampah();
  }, [fetchSampah]);

  async function handleRestore(table: string, id: string) {
    setRestoring(true);
    try {
      const res = await fetch(`/api/sampah/${table}/${id}/restore`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memulihkan");
      }
      toast.success("Data berhasil dipulihkan");
      setConfirmRestore(null);
      fetchSampah();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memulihkan data");
    } finally {
      setRestoring(false);
    }
  }

  async function handleForceDelete() {
    if (!confirmDelete) return;
    const { table, id } = confirmDelete;
    setDeleting(true);
    try {
      const res = await fetch(`/api/sampah/${table}/${id}/force`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus");
      }
      toast.success("Data berhasil dihapus permanen");
      setConfirmDelete(null);
      fetchSampah();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  }

  function getRecordLabel(table: string, record: SampahRecord): string {
    const key = LABEL_KEYS[table] || "id";
    const val = record[key];
    if (val && typeof val === "string") return val;
    return record.id.slice(0, 8) + "...";
  }

  function getRecordSummary(table: string, record: SampahRecord): string {
    switch (table) {
      case "tegakan":
        return `${record.spesies || "-"} | ${record.health_status || "-"}`;
      case "monitoring":
        return `${record.health_status || "-"} | ${record.tinggi_cm || "?"} cm`;
      case "penyulaman":
        return `${record.jumlah_bibit || 0} bibit | ${record.status || "-"}`;
      case "kualitas_air":
        return `pH: ${record.ph || "-"} | DO: ${record.do_mgl || "-"}`;
      case "blue_carbon_calculations":
        return `${record.area_ha || "?"} ha | ${record.metode || "-"}`;
      case "galeri":
        return `${(record as { kategori?: string }).kategori || "-"}`;
      case "dokumen":
        return `${(record as { kategori?: string }).kategori || "-"}`;
      case "area_monitoring":
        return `${record.luas_ha || "?"} ha`;
      default:
        return "";
    }
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  const totalDeleted = data
    ? Object.values(data.tables).reduce((sum, g) => sum + g.total, 0)
    : 0;

  const tableEntries = data ? Object.entries(data.tables) : [];
  const filteredEntries =
    selectedTable === "all"
      ? tableEntries
      : tableEntries.filter(([t]) => t === selectedTable);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/10">
              <Trash2 className="size-5 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Sampah
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Data yang telah dihapus masih tersimpan dan dapat dipulihkan kembali
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : !data || tableEntries.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
            <Trash2 className="size-8 text-slate-300 dark:text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Belum ada data yang dihapus
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Data yang dihapus dari halaman lain akan muncul di sini
          </p>
        </div>
      ) : (
        <>
          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTable("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                selectedTable === "all"
                  ? "bg-brand-green-dark text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              Semua ({totalDeleted})
            </button>
            {tableEntries.map(([table, group]) => (
              <button
                key={table}
                type="button"
                onClick={() => setSelectedTable(table)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  selectedTable === table
                    ? "bg-brand-green-dark text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                {data.tableLabels[table] || table} ({group.total})
              </button>
            ))}
          </div>

          {/* Groups */}
          <div className="space-y-4">
            {filteredEntries.map(([table, group]) => {
              const label = data.tableLabels[table] || table;

              return (
                <div
                  key={table}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800"
                >
                  {/* Table header */}
                  <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3 dark:border-slate-700">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {label}
                    </span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      {group.total}
                    </span>
                  </div>

                  {/* Records */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {group.records.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between gap-4 px-5 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                            {getRecordLabel(table, record)}
                          </p>
                          <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{getRecordSummary(table, record)}</span>
                            <span className="text-red-400">
                              Dihapus {formatDate(record.deleted_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmRestore({
                                table,
                                id: record.id,
                                label: getRecordLabel(table, record),
                              })
                            }
                            disabled={restoring}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-green-medium transition hover:bg-brand-green-medium/5 hover:border-brand-green-medium/30 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-brand-green-light dark:hover:bg-slate-600"
                            title="Pulihkan"
                          >
                            <RotateCcw className="size-3" />
                            Pulihkan
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDelete({
                                table,
                                id: record.id,
                                label: getRecordLabel(table, record),
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:border-red-200 dark:border-slate-600 dark:bg-slate-700 dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Hapus Permanen"
                          >
                            <Trash2 className="size-3" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Confirm Restore Modal */}
      {confirmRestore && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <button
            type="button"
            onClick={() => !restoring && setConfirmRestore(null)}
            className="absolute inset-0 bg-brand-blue-deep/60 backdrop-blur-sm"
            aria-label="Tutup"
          />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-brand-green-medium/10">
              <RotateCcw className="size-5 text-brand-green-medium" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              Pulihkan Data
            </h3>
            <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
              Apakah Anda ingin memulihkan data{" "}
              <strong className="text-slate-800 dark:text-slate-200">{confirmRestore.label}</strong>?
            </p>
            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
              Data akan dikembalikan ke halaman asalnya.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmRestore(null)}
                disabled={restoring}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleRestore(confirmRestore.table, confirmRestore.id)}
                disabled={restoring}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {restoring && <Loader2 className="size-4 animate-spin" />}
                Ya, Pulihkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <button
            type="button"
            onClick={() => !deleting && setConfirmDelete(null)}
            className="absolute inset-0 bg-brand-blue-deep/60 backdrop-blur-sm"
            aria-label="Tutup"
          />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="size-5 text-red-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              Hapus Permanen
            </h3>
            <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
              Data <strong className="text-slate-800 dark:text-slate-200">{confirmDelete.label}</strong>{" "}
              akan dihapus secara permanen dan tidak dapat dipulihkan kembali.
            </p>
            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleForceDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
