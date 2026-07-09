"use client";

import { useState, useRef, type ChangeEvent } from "react";
import {
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  KATEGORI_GALERI,
  LABEL_KATEGORI,
} from "@/lib/galeri/types";
import type { KategoriGaleri, GaleriRecord } from "@/lib/galeri/types";

interface GaleriUploadProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (record: GaleriRecord) => void;
}

export default function GaleriUpload({
  open,
  onClose,
  onSuccess,
}: GaleriUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [kategori, setKategori] = useState<KategoriGaleri>("before");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSetFile(f);
  }

  function validateAndSetFile(f: File) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) {
      toast.error("Tipe file harus JPEG, PNG, atau WebP");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleRemoveFile() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit() {
    if (!file || !kategori) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kategori", kategori);
      formData.append("judul", judul);
      formData.append("deskripsi", deskripsi);
      formData.append("tanggal", tanggal);

      const res = await fetch("/api/galeri/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengupload");
      }

      const record: GaleriRecord = await res.json();
      toast.success("Foto berhasil diupload");
      onSuccess(record);
      handleRemoveFile();
      setKategori("before");
      setJudul("");
      setDeskripsi("");
      setTanggal(new Date().toISOString().slice(0, 10));
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengupload foto"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-brand-blue-deep/60 backdrop-blur-sm"
            aria-label="Tutup"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Upload Foto Baru
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-4 overflow-y-auto px-6 py-5">
              {/* Dropzone */}
              {!preview ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition ${
                    dragOver
                      ? "border-brand-green-medium bg-brand-green-medium/5"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                    <Upload className="size-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Klik atau tarik file ke sini
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    JPEG, PNG, WebP. Maks 5MB.
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 w-full object-contain bg-slate-50 dark:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 text-slate-600 shadow-sm backdrop-blur-sm transition hover:bg-white dark:bg-slate-800/80 dark:text-slate-300"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {/* Judul */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Judul Foto
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Masukkan judul foto..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tanggal Kegiatan
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Kategori
                </label>
                <select
                  value={kategori}
                  onChange={(e) =>
                    setKategori(e.target.value as KategoriGaleri)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {KATEGORI_GALERI.map((k) => (
                    <option key={k} value={k}>
                      {LABEL_KATEGORI[k]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Deskripsi
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  rows={3}
                  placeholder="Tulis deskripsi foto..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={uploading}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!file || !kategori || uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {uploading ? "Mengupload..." : "Upload"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
