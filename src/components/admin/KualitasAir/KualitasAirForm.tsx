"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import {
  kualitasAirSchema,
  type KualitasAirFormData,
  type KualitasAirRecord,
} from "@/lib/kualitas-air/types";

interface AreaOption {
  id: string;
  nama: string;
}

interface KualitasAirFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRecord?: KualitasAirRecord | null;
}

function FormContent({
  editRecord,
  onClose,
  onSuccess,
}: {
  editRecord?: KualitasAirRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KualitasAirFormData>({
    resolver: zodResolver(kualitasAirSchema),
    defaultValues: {
      tanggal: editRecord?.tanggal ?? new Date().toISOString().split("T")[0],
      area_id: editRecord?.area_id ?? "",
      titik_sampling: editRecord?.titik_sampling ?? "",
      ph: editRecord?.ph ?? undefined as unknown as number,
      do_mgl: editRecord?.do_mgl ?? undefined as unknown as number,
      salinitas_ppt: editRecord?.salinitas_ppt ?? undefined as unknown as number,
      tss_mgl: editRecord?.tss_mgl ?? undefined as unknown as number,
      suhu_c: editRecord?.suhu_c ?? undefined as unknown as number,
      latitude: editRecord?.latitude ?? undefined as unknown as number,
      longitude: editRecord?.longitude ?? undefined as unknown as number,
      keterangan: editRecord?.keterangan ?? "",
    },
  });

  useEffect(() => {
    async function fetchAreas() {
      setLoadingAreas(true);
      try {
        const res = await fetch("/api/area-monitoring");
        if (res.ok) {
          const data = await res.json();
          setAreaOptions(data);
        }
      } catch {
        console.error("Gagal memuat lokasi");
      } finally {
        setLoadingAreas(false);
      }
    }
    fetchAreas();
  }, []);

  async function onSubmit(data: KualitasAirFormData) {
    setSubmitting(true);
    try {
      const url = editRecord
        ? `/api/kualitas-air/${editRecord.id}`
        : "/api/kualitas-air";
      const method = editRecord ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal menyimpan data");
      }

      onSuccess();
      onClose();
      toast.success(
        editRecord
          ? "Data kualitas air berhasil diperbarui"
          : "Data kualitas air berhasil ditambahkan"
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan data kualitas air"
      );
    } finally {
      setSubmitting(false);
    }
  }

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

        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Titik Sampling
          </label>
          <input
            type="text"
            placeholder="TS-A1"
            {...register("titik_sampling")}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Lokasi
        </label>
        {loadingAreas ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-400 dark:text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            Memuat lokasi...
          </div>
        ) : (
          <select
            {...register("area_id")}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          >
            <option value="">Pilih Lokasi</option>
            {areaOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama}
              </option>
            ))}
          </select>
        )}
        {errors.area_id && (
          <p className="mt-1 text-xs text-red-500">
            {errors.area_id.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            pH
          </label>
          <input
            type="number"
            step="any"
            placeholder="7.2"
            {...register("ph", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          />
          {errors.ph && (
            <p className="mt-1 text-xs text-red-500">
              {errors.ph.message}
            </p>
          )}
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            DO (mg/L)
          </label>
          <input
            type="number"
            step="any"
            placeholder="5.8"
            {...register("do_mgl", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          />
          {errors.do_mgl && (
            <p className="mt-1 text-xs text-red-500">
              {errors.do_mgl.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Salinitas (ppt)
          </label>
          <input
            type="number"
            step="any"
            placeholder="30"
            {...register("salinitas_ppt", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          />
          {errors.salinitas_ppt && (
            <p className="mt-1 text-xs text-red-500">
              {errors.salinitas_ppt.message}
            </p>
          )}
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            TSS (mg/L)
          </label>
          <input
            type="number"
            step="any"
            placeholder="45"
            {...register("tss_mgl", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          />
          {errors.tss_mgl && (
            <p className="mt-1 text-xs text-red-500">
              {errors.tss_mgl.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Suhu (°C)
          </label>
          <input
            type="number"
            step="any"
            placeholder="29.5"
            {...register("suhu_c", { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:bg-slate-800"
          />
          {errors.suhu_c && (
            <p className="mt-1 text-xs text-red-500">
              {errors.suhu_c.message}
            </p>
          )}
        </div>

        <div className="flex-1" />
      </div>

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
          Catatan
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
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {editRecord ? "Simpan Perubahan" : "Tambah Data"}
        </button>
      </div>
    </form>
  );
}

export default function KualitasAirForm({
  open,
  onClose,
  onSuccess,
  editRecord,
}: KualitasAirFormProps) {
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
              ? "Edit Data Kualitas Air"
              : "Tambah Data Kualitas Air"}
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
