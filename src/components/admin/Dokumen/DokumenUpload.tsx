"use client";

import { useState, useRef, type ChangeEvent } from "react";
import {
  X,
  Upload,
  Loader2,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  KATEGORI_DOKUMEN,
  LABEL_KATEGORI,
} from "@/lib/dokumen/types";
import type { KategoriDokumen, DokumenRecord } from "@/lib/dokumen/types";
import { formatFileSize, getFileIconColor } from "./utils";

const ALLOWED_EXTENSIONS = ".pdf,.docx,.xlsx";
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_SIZE = 20 * 1024 * 1024;

interface DokumenUploadProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (record: DokumenRecord) => void;
}

export default function DokumenUpload({
  open,
  onClose,
  onSuccess,
}: DokumenUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [kategori, setKategori] = useState<KategoriDokumen>("proposal");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
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
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Tipe file harus PDF, DOCX, atau XLSX");
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error("Ukuran file maksimal 20MB");
      return;
    }
    setFile(f);
    if (!judul) {
      setJudul(f.name.replace(/\.[^/.]+$/, ""));
    }
  }

  function handleRemoveFile() {
    setFile(null);
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

      const res = await fetch("/api/dokumen/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengupload");
      }

      const record: DokumenRecord = await res.json();
      toast.success("Dokumen berhasil diupload");
      onSuccess(record);
      handleRemoveFile();
      setKategori("proposal");
      setJudul("");
      setDeskripsi("");
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengupload dokumen"
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
            className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Upload Dokumen Baru
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Dropzone */}
              {!file ? (
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
                    PDF, DOCX, XLSX. Maks 20MB.
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept={ALLOWED_EXTENSIONS}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className={`${getFileIconColor(file.type)}`}>
                    {file.type.includes("spreadsheet") ? (
                      <FileSpreadsheet className="size-10" />
                    ) : (
                      <FileText className="size-10" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {/* Judul */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Judul Dokumen
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Masukkan judul dokumen..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500"
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
                    setKategori(e.target.value as KategoriDokumen)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {KATEGORI_DOKUMEN.map((k) => (
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
                  placeholder="Tulis deskripsi dokumen..."
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
