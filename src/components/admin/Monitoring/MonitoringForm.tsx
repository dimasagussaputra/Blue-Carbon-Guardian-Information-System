"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import {
  monitoringSchema,
  KONDISI_OPTIONS,
  type MonitoringFormData,
  type MonitoringRecord,
} from "@/lib/monitoring/types";

interface TegakanOption {
  id: string;
  kode_tegakan: string;
}

interface MonitoringFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRecord?: MonitoringRecord | null;
  preselectedTegakanId?: string;
}

function FormContent({
  editRecord,
  preselectedTegakanId,
  onClose,
  onSuccess,
}: {
  editRecord?: MonitoringRecord | null;
  preselectedTegakanId?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(
    editRecord?.foto_url ?? null
  );
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [tegakanOptions, setTegakanOptions] = useState<TegakanOption[]>([]);
  const [loadingTegakan, setLoadingTegakan] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MonitoringFormData>({
    resolver: zodResolver(monitoringSchema),
    defaultValues: {
      tegakan_id: editRecord?.tegakan_id ?? preselectedTegakanId ?? "",
      tanggal: editRecord?.tanggal ?? new Date().toISOString().split("T")[0],
      tinggi_cm: editRecord?.tinggi_cm ?? undefined as unknown as number,
      diameter_cm: editRecord?.diameter_cm ?? undefined as unknown as number,
      health_status: (editRecord?.health_status as "hidup" | "mati" | "stres" | "sakit") ?? "hidup",
      catatan: editRecord?.catatan ?? "",
    },
  });

  useEffect(() => {
    async function fetchTegakan() {
      setLoadingTegakan(true);
      try {
        const res = await fetch("/api/tegakan?limit=1000");
        if (res.ok) {
          const data = await res.json();
          setTegakanOptions(data.data ?? []);
        }
      } catch {
        console.error("Gagal memuat tegakan");
      } finally {
        setLoadingTegakan(false);
      }
    }
    fetchTegakan();
  }, []);

  async function handleUploadFoto(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/monitoring/upload", {
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

  async function onSubmit(data: MonitoringFormData) {
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
        ? `/api/monitoring/${editRecord.id}`
        : "/api/monitoring";
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
          ? "Data monitoring berhasil diperbarui"
          : "Data monitoring berhasil ditambahkan"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan data monitoring"
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tanggal
          </label>
          <input
            type="date"
            {...register("tanggal")}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.tanggal && (
            <p className="mt-1 text-xs text-red-500">
              {errors.tanggal.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {editRecord ? "Kode Tegakan" : "Tegakan"}
          </label>
          {editRecord ? (
            <input
              type="text"
              value={editRecord.kode_tegakan}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-400"
            />
          ) : (
            <select
              {...register("tegakan_id")}
              disabled={!!preselectedTegakanId}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 disabled:dark:bg-slate-700 disabled:dark:text-slate-400"
            >
              <option value="">
                {loadingTegakan ? "Memuat..." : "Pilih Tegakan"}
              </option>
              {tegakanOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.kode_tegakan}
                </option>
              ))}
            </select>
          )}
          {errors.tegakan_id && (
            <p className="mt-1 text-xs text-red-500">
              {errors.tegakan_id.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tinggi (cm)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("tinggi_cm", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.tinggi_cm && (
            <p className="mt-1 text-xs text-red-500">
              {errors.tinggi_cm.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Diameter (cm)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00 (opsional)"
            {...register("diameter_cm", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.diameter_cm && (
            <p className="mt-1 text-xs text-red-500">
              {errors.diameter_cm.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Kondisi
        </label>
        <div className="flex flex-wrap gap-3">
          {KONDISI_OPTIONS.map((kondisi) => (
            <label
              key={kondisi}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition hover:bg-slate-50 has-[:checked]:border-brand-green-medium has-[:checked]:bg-brand-green-medium/5 dark:border-slate-700 dark:hover:bg-slate-700/50"
            >
              <input
                type="radio"
                value={kondisi}
                {...register("health_status")}
                className="size-4 accent-brand-green-medium"
              />
              <span className="capitalize text-slate-700 dark:text-slate-300">
                {kondisi === "hidup"
                  ? "Hidup"
                  : kondisi === "mati"
                    ? "Mati"
                    : kondisi === "stres"
                      ? "Stres"
                      : "Sakit"}
              </span>
            </label>
          ))}
        </div>
        {errors.health_status && (
          <p className="mt-1 text-xs text-red-500">
            {errors.health_status.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Foto
        </label>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/50">
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
          Catatan
        </label>
        <textarea
          rows={3}
          placeholder="Catatan monitoring..."
          {...register("catatan")}
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
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

export default function MonitoringForm({
  open,
  onClose,
  onSuccess,
  editRecord,
  preselectedTegakanId,
}: MonitoringFormProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-brand-blue-deep/60 backdrop-blur-sm"
        aria-label="Tutup"
      />
      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {editRecord
              ? `Edit Monitoring - ${editRecord.kode_tegakan}`
              : "Tambah Monitoring Baru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <X className="size-5" />
          </button>
        </div>

        <div key={editRecord?.id ?? "create"}>
          <FormContent
            editRecord={editRecord}
            preselectedTegakanId={preselectedTegakanId}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  );
}
