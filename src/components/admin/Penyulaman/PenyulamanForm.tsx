"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import {
  penyulamanSchema,
  STATUS_OPTIONS,
  type PenyulamanFormData,
  type PenyulamanRecord,
} from "@/lib/penyulaman/types";

const SPESIES_OPTIONS = [
  "Rhizophora mucronata",
  "Avicennia marina",
  "Sonneratia alba",
  "Rhizophora apiculata",
  "Bruguiera gymnorhiza",
];

interface PenyulamanFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRecord?: PenyulamanRecord | null;
}

function FormContent({
  editRecord,
  onClose,
  onSuccess,
}: {
  editRecord?: PenyulamanRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(
    editRecord?.foto_url ?? null
  );
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PenyulamanFormData>({
    resolver: zodResolver(penyulamanSchema),
    defaultValues: {
      tanggal: editRecord?.tanggal ?? new Date().toISOString().split("T")[0],
      gelombang: editRecord?.gelombang ?? 1,
      spesies: editRecord?.spesies ?? "",
      jumlah_bibit: editRecord?.jumlah_bibit ?? undefined as unknown as number,
      jumlah_hidup: editRecord?.jumlah_hidup ?? undefined as unknown as number,
      latitude: editRecord?.latitude ?? undefined as unknown as number,
      longitude: editRecord?.longitude ?? undefined as unknown as number,
      status: (editRecord?.status as "baik" | "rusak" | "mati") ?? "baik",
      keterangan: editRecord?.keterangan ?? "",
    },
  });

  const jumlahBibit = watch("jumlah_bibit");
  const jumlahHidup = watch("jumlah_hidup");

  const survivalDisplay =
    jumlahBibit && jumlahHidup !== null && jumlahHidup !== undefined
      ? `${Math.round((Number(jumlahHidup) / Number(jumlahBibit)) * 100)}%`
      : "-";

  async function handleUploadFoto(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/penyulaman/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal upload");

      const data = await res.json();
      return data.url;
    } catch {
      toast.error("Gagal mengupload foto");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: PenyulamanFormData) {
    setSubmitting(true);
    try {
      let fotoUrl = editRecord?.foto_url ?? null;

      if (fotoFile) {
        const uploadedUrl = await handleUploadFoto(fotoFile);
        if (uploadedUrl) {
          fotoUrl = uploadedUrl;
        }
      }

      const payload = { ...data, foto_url: fotoUrl };

      const url = editRecord
        ? `/api/penyulaman/${editRecord.id}`
        : "/api/penyulaman";
      const method = editRecord ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal menyimpan data");
      }

      onSuccess();
      onClose();
      toast.success(
        editRecord
          ? "Data penyulaman berhasil diperbarui"
          : "Data penyulaman berhasil ditambahkan"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan data penyulaman"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const handleFotoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
      }
    },
    []
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tanggal
          </label>
          <input
            type="date"
            {...register("tanggal")}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          />
          {errors.tanggal && (
            <p className="mt-1 text-xs text-red-500">
              {errors.tanggal.message}
            </p>
          )}
        </div>

        <div className="w-full sm:w-40">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Gelombang
          </label>
          <select
            {...register("gelombang", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          >
            <option value={1}>Gelombang 1</option>
            <option value={2}>Gelombang 2</option>
          </select>
          {errors.gelombang && (
            <p className="mt-1 text-xs text-red-500">
              {errors.gelombang.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Spesies
        </label>
        <select
          {...register("spesies")}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
        >
          <option value="">Pilih Spesies</option>
          {SPESIES_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.spesies && (
          <p className="mt-1 text-xs text-red-500">
            {errors.spesies.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Jumlah Bibit
          </label>
          <input
            type="number"
            min={1}
            placeholder="200"
            {...register("jumlah_bibit", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          />
          {errors.jumlah_bibit && (
            <p className="mt-1 text-xs text-red-500">
              {errors.jumlah_bibit.message}
            </p>
          )}
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Jumlah Hidup
          </label>
          <input
            type="number"
            min={0}
            placeholder="185"
            {...register("jumlah_hidup", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          />
          {errors.jumlah_hidup && (
            <p className="mt-1 text-xs text-red-500">
              {errors.jumlah_hidup.message}
            </p>
          )}
        </div>
      </div>

      {jumlahBibit > 0 && (
        <div className="rounded-xl bg-brand-green-medium/5 px-4 py-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Survival Rate:{" "}
            <span className="font-semibold text-brand-green-dark">
              {survivalDisplay}
            </span>
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            placeholder="-6.98..."
            {...register("latitude", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          />
          {errors.latitude && (
            <p className="mt-1 text-xs text-red-500">
              {errors.latitude.message}
            </p>
          )}
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            placeholder="110.3..."
            {...register("longitude", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          />
          {errors.longitude && (
            <p className="mt-1 text-xs text-red-500">
              {errors.longitude.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Status
        </label>
        <select
          {...register("status")}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        {errors.status && (
          <p className="mt-1 text-xs text-red-500">
            {errors.status.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Foto
        </label>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <Upload className="size-4" />
            {uploading ? "Mengupload..." : "Pilih Foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFotoChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {fotoPreview && (
            <div className="relative">
              <img
                src={fotoPreview}
                alt="Preview"
                className="h-14 w-14 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setFotoPreview(null);
                  setFotoFile(null);
                }}
                className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Keterangan
        </label>
        <textarea
          rows={3}
          placeholder="Catatan tambahan..."
          {...register("keterangan")}
          className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-slate-800"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {editRecord ? "Simpan Perubahan" : "Tambah Data"}
        </button>
      </div>
    </form>
  );
}

export default function PenyulamanForm({
  open,
  onClose,
  onSuccess,
  editRecord,
}: PenyulamanFormProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-brand-blue-deep/60 backdrop-blur-sm"
        aria-label="Tutup"
      />
      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {editRecord
              ? "Edit Data Penyulaman"
              : "Tambah Data Penyulaman"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="size-5" />
          </button>
        </div>

        <div key={editRecord?.id ?? "create"}>
          <FormContent
            editRecord={editRecord}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  );
}
