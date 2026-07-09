"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Download,
  Eye,
  FileSpreadsheet,
  File,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  KATEGORI_DOKUMEN,
  LABEL_KATEGORI,
} from "@/lib/dokumen/types";
import type { DokumenRecord, KategoriDokumen } from "@/lib/dokumen/types";
import DokumenUpload from "./DokumenUpload";
import DokumenPreview from "./DokumenPreview";
import {
  formatFileSize,
  formatDate,
  getFileIconColor,
  getFileBadgeColor,
  getFileExtension,
  getKategoriBadgeColor,
  isPDF,
  isXLSX,
} from "./utils";

const FILTERS: { tag: KategoriDokumen | "all"; label: string }[] = [
  { tag: "all", label: "Semua" },
  ...KATEGORI_DOKUMEN.map((k) => ({ tag: k, label: LABEL_KATEGORI[k] })),
];

function FileIcon({ record }: { record: DokumenRecord }) {
  const colorClass = getFileIconColor(record.file_type);
  if (isXLSX(record.file_type)) {
    return <FileSpreadsheet className={`size-8 ${colorClass}`} />;
  }
  if (isPDF(record.file_type)) {
    return <FileText className={`size-8 ${colorClass}`} />;
  }
  return <File className={`size-8 ${colorClass}`} />;
}

export default function DokumenList() {
  const [records, setRecords] = useState<DokumenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<KategoriDokumen | "all">("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<DokumenRecord | null>(
    null
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("kategori", filter);
      const res = await fetch(`/api/dokumen?${params.toString()}`);
      const result = await res.json();
      setRecords(result.data || []);
    } catch {
      toast.error("Gagal memuat data dokumen");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/dokumen/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setDeleteConfirm(null);
      fetchData();
      toast.success("Dokumen berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus dokumen");
    } finally {
      setDeleting(false);
    }
  }

  const filteredRecords = useMemo(
    () =>
      filter === "all"
        ? records
        : records.filter((r) => r.kategori === filter),
    [records, filter]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green-medium/10">
              <FileText className="size-5 text-brand-green-medium" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Dokumen
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Arsip dokumen laporan, proposal, SOP, dan dokumentasi terkait
            program.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
        >
          <Plus className="size-4" />
          Upload Dokumen
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((btn) => (
          <button
            key={btn.tag}
            onClick={() => setFilter(btn.tag)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filter === btn.tag
                ? "bg-brand-green-dark text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-brand-green-medium" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
            <FileText className="size-8 text-slate-300 dark:text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Belum ada dokumen
            {filter !== "all"
              ? ` dengan kategori "${LABEL_KATEGORI[filter]}"`
              : ""}
            .
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Klik &quot;Upload Dokumen&quot; untuk mengupload dokumen baru.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <th className="px-4 py-3 sm:px-6">File</th>
                  <th className="px-4 py-3 sm:px-6">Kategori</th>
                  <th className="hidden px-4 py-3 sm:table-cell sm:px-6">
                    Ukuran
                  </th>
                  <th className="hidden px-4 py-3 md:table-cell sm:px-6">
                    Tanggal Upload
                  </th>
                  <th className="px-4 py-3 sm:px-6">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                <AnimatePresence mode="popLayout">
                  {filteredRecords.map((record) => (
                    <motion.tr
                      key={record.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    >
                      <td className="px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                          <FileIcon record={record} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                              {record.judul}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {record.deskripsi || record.judul}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${getKategoriBadgeColor(record.kategori)}`}
                        >
                          {LABEL_KATEGORI[record.kategori]}
                        </span>
                        <span
                          className={`ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${getFileBadgeColor(record.file_type)}`}
                        >
                          {getFileExtension(record.file_type)}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-slate-600 dark:text-slate-400 sm:table-cell sm:px-6">
                        {formatFileSize(record.file_size)}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-slate-600 dark:text-slate-400 md:table-cell sm:px-6">
                        {formatDate(record.created_at)}
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewRecord(record)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-green-medium dark:hover:bg-slate-700"
                            title="Pratinjau"
                          >
                            <Eye className="size-4" />
                          </button>
                          <a
                            href={record.public_url}
                            download
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-500 dark:hover:bg-slate-700"
                            title="Download"
                          >
                            <Download className="size-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(record.id)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-700"
                            title="Hapus"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <DokumenUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          setUploadOpen(false);
          fetchData();
        }}
      />

      {/* Preview Modal */}
      <DokumenPreview
        record={previewRecord}
        onClose={() => setPreviewRecord(null)}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <button
            type="button"
            onClick={() => !deleting && setDeleteConfirm(null)}
            className="absolute inset-0 bg-brand-blue-deep/60 backdrop-blur-sm"
            aria-label="Tutup"
          />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle className="size-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Hapus Dokumen
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Dokumen yang dihapus tidak dapat dikembalikan.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
