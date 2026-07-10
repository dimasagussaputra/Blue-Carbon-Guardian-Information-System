"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LABEL_KATEGORI } from "@/lib/galeri/types";
import type { GaleriRecord, KategoriGaleri } from "@/lib/galeri/types";

interface GaleriLightboxProps {
  records: GaleriRecord[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDelete: (id: string) => void;
  onEdit: (record: GaleriRecord) => void;
}

export default function GaleriLightbox({
  records,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onDelete,
  onEdit,
}: GaleriLightboxProps) {
  const record = records[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrev();
          break;
        case "ArrowRight":
          onNext();
          break;
      }
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const kategoriColor: Record<KategoriGaleri, string> = {
    before: "bg-amber-500",
    after: "bg-emerald-500",
    monitoring: "bg-blue-500",
    penyulaman: "bg-purple-500",
    edukasi: "bg-cyan-500",
    clean_up: "bg-rose-500",
  };

  return (
    <AnimatePresence>
      {record && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-brand-blue-deep/90 backdrop-blur-sm"
            aria-label="Tutup"
          />

          <div className="relative z-10 mx-4 flex w-full max-w-5xl flex-col gap-4 lg:flex-row lg:items-start">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed lg:left-[-60px]"
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="size-6" />
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={currentIndex === records.length - 1}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed lg:right-[-60px]"
              aria-label="Selanjutnya"
            >
              <ChevronRight className="size-6" />
            </button>

            <motion.div
              key={record.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="relative flex-1 overflow-hidden rounded-2xl bg-black/40"
            >
              <img
                src={record.public_url}
                alt={LABEL_KATEGORI[record.kategori as KategoriGaleri]}
                className="max-h-[75vh] w-full object-contain"
              />
            </motion.div>

            <div className="w-full shrink-0 lg:w-72">
              <div className="rounded-2xl bg-white p-5 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${kategoriColor[record.kategori as KategoriGaleri] || "bg-slate-500"}`}
                  >
                    {LABEL_KATEGORI[record.kategori as KategoriGaleri]}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-green-medium/10 hover:text-brand-green-medium dark:text-slate-500 dark:hover:bg-brand-green-medium/20 dark:hover:text-brand-green-light"
                      title="Edit foto"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(record.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      title="Hapus foto"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {record.judul && (
                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">
                    {record.judul}
                  </h3>
                )}

                {record.deskripsi && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {record.deskripsi}
                  </p>
                )}

                {record.tanggal && (
                  <p className="mt-2 text-xs font-medium text-brand-green-medium dark:text-brand-green-light">
                    {new Date(record.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}

              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-xs text-white/50">
            {currentIndex + 1} / {records.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
