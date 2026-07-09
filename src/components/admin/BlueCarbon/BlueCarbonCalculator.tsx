"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf, Calculator, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { MANGROVE_TYPES, DEFAULT_CARBON_PRICE } from "@/lib/blue-carbon/constants";
import { blueCarbonInputSchema, type BlueCarbonInput, type BlueCarbonResult } from "@/lib/blue-carbon/types";
import { calculateBlueCarbon } from "@/lib/blue-carbon/calculator";
import BlueCarbonSummaryCards from "./BlueCarbonSummaryCards";
import BlueCarbonBreakdown from "./BlueCarbonBreakdown";
import BlueCarbonReferences from "./BlueCarbonReferences";
import BlueCarbonReportPreview from "./BlueCarbonReportPreview";

interface BlueCarbonCalculatorProps {
  onSaved: () => void;
}

export default function BlueCarbonCalculator({ onSaved }: BlueCarbonCalculatorProps) {
  const [result, setResult] = useState<BlueCarbonResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BlueCarbonInput>({
    resolver: zodResolver(blueCarbonInputSchema),
    defaultValues: {
      area_ha: undefined as unknown as number,
      mangrove_type: "rhizophora_mucronata",
      carbon_price: DEFAULT_CARBON_PRICE,
      density_per_ha: undefined,
      avg_dbh_cm: undefined,
      lokasi: "",
    },
  });

  const mangroveType = watch("mangrove_type");
  const currentConfig = MANGROVE_TYPES[mangroveType];

  function onSubmit(data: BlueCarbonInput) {
    setCalculating(true);
    try {
      const res = calculateBlueCarbon(data);
      setResult(res);
    } catch {
      toast.error("Gagal melakukan kalkulasi");
    } finally {
      setCalculating(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/blue-carbon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area_ha: result.area_ha,
          mangrove_type: result.mangrove_type,
          density_per_ha: result.density_per_ha,
          avg_dbh_cm: result.avg_dbh_cm,
          carbon_price: result.carbon_price,
          lokasi: "",
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }
      toast.success("Kalkulasi berhasil disimpan");
      setResult(null);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan kalkulasi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-6">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green-medium/10">
            <Leaf className="size-5 text-brand-green-medium" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Kalkulator Blue Carbon
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masukkan parameter untuk estimasi simpanan karbon biru
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Luas Area (ha) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Contoh: 10"
                {...register("area_ha", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20"
              />
              {errors.area_ha && (
                <p className="mt-1 text-xs text-red-500">{errors.area_ha.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Jenis Mangrove <span className="text-red-500">*</span>
              </label>
              <select
                {...register("mangrove_type")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20"
              >
                {Object.entries(MANGROVE_TYPES).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
              {errors.mangrove_type && (
                <p className="mt-1 text-xs text-red-500">{errors.mangrove_type.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Kerapatan Pohon (per ha)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                placeholder={`Default: ${currentConfig?.densityDefault ?? ""}`}
                {...register("density_per_ha", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20"
              />
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Kosongkan untuk menggunakan default ({currentConfig?.densityDefault} pohon/ha)
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Rata-rata DBH (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Kosongkan untuk estimasi sederhana"
                {...register("avg_dbh_cm", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20"
              />
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Isi untuk perhitungan allometric yang lebih akurat
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Harga Karbon ($/ton CO₂e)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                {...register("carbon_price", { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20"
              />
              {errors.carbon_price && (
                <p className="mt-1 text-xs text-red-500">{errors.carbon_price.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={calculating}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {calculating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Calculator className="size-4" />
              )}
              {calculating ? "Menghitung..." : "Hitung Estimasi"}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <>
          <BlueCarbonSummaryCards result={result} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BlueCarbonBreakdown breakdown={result.breakdown} metode={result.metode} />
            <BlueCarbonReferences referensi={result.referensi} />
          </div>
          <BlueCarbonReportPreview result={result} />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-blue-medium px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Menyimpan..." : "Simpan Kalkulasi"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
