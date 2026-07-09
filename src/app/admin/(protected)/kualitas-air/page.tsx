"use client";

import { useState, useEffect, useCallback } from "react";
import { Droplets } from "lucide-react";
import KualitasAirTable from "@/components/admin/KualitasAir/KualitasAirTable";
import KualitasAirForm from "@/components/admin/KualitasAir/KualitasAirForm";
import KualitasAirActions from "@/components/admin/KualitasAir/KualitasAirActions";
import KualitasAirStats from "@/components/admin/KualitasAir/KualitasAirStats";
import KualitasAirTrendChart from "@/components/admin/KualitasAir/KualitasAirTrendChart";
import KualitasAirComparisonChart from "@/components/admin/KualitasAir/KualitasAirComparisonChart";
import type { KualitasAirRecord } from "@/lib/kualitas-air/types";
import type { KualitasAirTrendPoint, KualitasAirComparisonPoint } from "@/lib/kualitas-air/types";

export default function KualitasAirPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<KualitasAirRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [areaFilter, setAreaFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [areaOptions, setAreaOptions] = useState<{ id: string; nama: string }[]>([]);
  const [trendData, setTrendData] = useState<KualitasAirTrendPoint[]>([]);
  const [comparisonData, setComparisonData] = useState<KualitasAirComparisonPoint[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    fetch("/api/area-monitoring")
      .then((r) => r.ok && r.json())
      .then((data) => setAreaOptions(data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchCharts() {
      setLoadingCharts(true);
      try {
        const trendParams = new URLSearchParams({ trend: "true" });
        if (areaFilter) trendParams.set("area_id", areaFilter);
        if (startDate) trendParams.set("start_date", startDate);
        if (endDate) trendParams.set("end_date", endDate);

        const compParams = new URLSearchParams({ comparison: "true" });
        if (startDate) compParams.set("start_date", startDate);
        if (endDate) compParams.set("end_date", endDate);

        const [trendRes, comparisonRes] = await Promise.all([
          fetch(`/api/kualitas-air?${trendParams.toString()}`),
          fetch(`/api/kualitas-air?${compParams.toString()}`),
        ]);
        if (cancelled) return;
        if (trendRes.ok) setTrendData(await trendRes.json());
        if (comparisonRes.ok) setComparisonData(await comparisonRes.json());
      } catch {
        if (!cancelled) console.error("Gagal memuat grafik");
      } finally {
        if (!cancelled) setLoadingCharts(false);
      }
    }
    fetchCharts();
    return () => { cancelled = true; };
  }, [areaFilter, startDate, endDate]);

  const handleAdd = useCallback(() => {
    setEditRecord(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((record: KualitasAirRecord) => {
    setEditRecord(record);
    setFormOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditRecord(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-blue-light/10">
              <Droplets className="size-5 text-brand-blue-light" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Kualitas Air Pesisir
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor parameter kualitas air perairan pesisir Mangkang.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20"
          >
            <option value="">Semua Lokasi</option>
            {areaOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20"
            placeholder="Dari"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20"
            placeholder="Sampai"
          />
          <KualitasAirActions
            onAdd={handleAdd}
            area_id={areaFilter || undefined}
            start_date={startDate || undefined}
            end_date={endDate || undefined}
          />
        </div>
      </div>

      <KualitasAirStats
        key={"stats-" + refreshKey}
        area_id={areaFilter || undefined}
        start_date={startDate || undefined}
        end_date={endDate || undefined}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800 p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Tren Parameter Kualitas Air
          </h3>
          {loadingCharts ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="size-5 animate-spin rounded-full border-2 border-brand-green-medium border-t-transparent" />
            </div>
          ) : (
            <KualitasAirTrendChart data={trendData} />
          )}
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800 p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Perbandingan Antar Lokasi
          </h3>
          {loadingCharts ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="size-5 animate-spin rounded-full border-2 border-brand-green-medium border-t-transparent" />
            </div>
          ) : (
            <KualitasAirComparisonChart data={comparisonData} />
          )}
        </div>
      </div>

      <KualitasAirTable
        key={"table-" + refreshKey}
        onEdit={handleEdit}
        area_id={areaFilter || undefined}
        start_date={startDate || undefined}
        end_date={endDate || undefined}
      />

      <KualitasAirForm
        open={formOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        editRecord={editRecord}
      />
    </div>
  );
}
