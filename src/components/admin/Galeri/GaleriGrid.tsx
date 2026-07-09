"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Images,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  KATEGORI_GALERI,
  LABEL_KATEGORI,
} from "@/lib/galeri/types";
import type { GaleriRecord, KategoriGaleri } from "@/lib/galeri/types";
import GaleriLightbox from "./GaleriLightbox";
import GaleriUpload from "./GaleriUpload";

const FILTERS: { tag: KategoriGaleri | "all"; label: string }[] = [
  { tag: "all", label: "Semua" },
  ...KATEGORI_GALERI.map((k) => ({ tag: k, label: LABEL_KATEGORI[k] })),
];

const kategoriBadgeColor: Record<KategoriGaleri, string> = {
  before: "bg-amber-500",
  after: "bg-emerald-500",
  monitoring: "bg-blue-500",
  penyulaman: "bg-purple-500",
  edukasi: "bg-cyan-500",
  clean_up: "bg-rose-500",
};

export default function GaleriGrid() {
  const [records, setRecords] = useState<GaleriRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<KategoriGaleri | "all">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("kategori", filter);
      const res = await fetch(`/api/galeri?${params.toString()}`);
      const result = await res.json();
      setRecords(result.data || []);
    } catch {
      toast.error("Gagal memuat data galeri");
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
      const res = await fetch(`/api/galeri/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setDeleteConfirm(null);
      setLightboxIndex(null);
      fetchData();
      toast.success("Foto berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus foto");
    } finally {
      setDeleting(false);
    }
  }

  const filteredRecords =
    filter === "all"
      ? records
      : records.filter((r) => r.kategori === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green-medium/10">
              <Images className="size-5 text-brand-green-medium" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Galeri Kegiatan KKN
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Unggah dan kelola foto dokumentasi kegiatan konservasi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
        >
          <Plus className="size-4" />
          Tambah Foto
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

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-brand-green-medium" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
            <Images className="size-8 text-slate-300 dark:text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Belum ada foto{filter !== "all" ? ` dengan kategori "${LABEL_KATEGORI[filter]}"` : ""}.
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Klik &quot;Tambah Foto&quot; untuk mengupload foto baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredRecords.map((record, idx) => {
              const globalIdx = records.findIndex(
                (r) => r.id === record.id
              );
              return (
                <motion.div
                    key={record.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-150 bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Lightbox trigger */}
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(globalIdx)}
                      className="absolute inset-0 z-10"
                      aria-label="Lihat foto"
                    >
                      {/* Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url('${record.public_url}')` }}
                      />

                      {/* Dark overlay base */}
                      <div className="absolute inset-0 bg-brand-blue-deep/40 group-hover:bg-brand-green-deep/60 transition-colors duration-300" />
                    </button>

                    {/* Kategori badge */}
                    <div className="absolute left-3 top-3 z-20">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                          kategoriBadgeColor[record.kategori]
                        }`}
                      >
                        {LABEL_KATEGORI[record.kategori]}
                      </span>
                    </div>

                    {/* Bottom overlay — expands upward on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-brand-blue-deep/95 to-transparent pt-12 group-hover:from-brand-green-deep/95 group-hover:pt-[45%] transition-all duration-300 z-20 pointer-events-none">
                      <div className="flex flex-col justify-end text-white">
                        <h3 className="font-bold text-sm sm:text-base leading-tight">
                          {record.judul || LABEL_KATEGORI[record.kategori]}
                        </h3>
                        {record.tanggal && (
                          <p className="text-[11px] font-medium text-brand-green-light mt-0.5">
                            {new Date(record.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300">
                          <div className="overflow-hidden">
                            <p className="text-[11px] text-slate-300 leading-relaxed pt-2 line-clamp-2">
                              {record.deskripsi || ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(record.id);
                      }}
                      className="absolute right-2 top-2 z-20 rounded-full bg-white/80 p-1.5 text-slate-500 opacity-0 shadow-sm backdrop-blur-sm transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-red-900/30"
                      title="Hapus"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <GaleriLightbox
          records={records}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() =>
            setLightboxIndex((i) =>
              i !== null ? Math.max(0, i - 1) : null
            )
          }
          onNext={() =>
            setLightboxIndex((i) =>
              i !== null ? Math.min(records.length - 1, i + 1) : null
            )
          }
          onDelete={(id) => setDeleteConfirm(id)}
        />
      )}

      {/* Upload Modal */}
      <GaleriUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          setUploadOpen(false);
          fetchData();
        }}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
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
                  Hapus Foto
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Foto yang dihapus tidak dapat dikembalikan.
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
