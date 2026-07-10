"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  KATEGORI_GALERI,
  LABEL_KATEGORI,
} from "@/lib/galeri/types";
import type { KategoriGaleri, GaleriRecord } from "@/lib/galeri/types";

interface GaleriEditFormProps {
  open: boolean;
  record: GaleriRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GaleriEditForm({
  open,
  record,
  onClose,
  onSuccess,
}: GaleriEditFormProps) {
  const [judul, setJudul] = useState(record?.judul ?? "");
  const [deskripsi, setDeskripsi] = useState(record?.deskripsi ?? "");
  const [tanggal, setTanggal] = useState(record?.tanggal?.slice(0, 10) ?? "");
  const [kategori, setKategori] = useState<KategoriGaleri>(record?.kategori ?? "before");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!record) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/galeri/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul, deskripsi, tanggal, kategori }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Foto berhasil diperbarui");
      onSuccess();
      onClose();
    } catch {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !record) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-brand-blue-deep/60 backdrop-blur-sm"
        aria-label="Tutup"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative mx-4 w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-slate-800"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Edit Foto
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
          {/* Preview */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <img
              src={record.public_url}
              alt={record.judul}
              className="max-h-48 w-full object-contain bg-slate-50 dark:bg-slate-900"
            />
          </div>

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
              onChange={(e) => setKategori(e.target.value as KategoriGaleri)}
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
              disabled={saving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
