"use client";

import { useState, useCallback, useEffect } from "react";
import { Activity, Loader2 } from "lucide-react";
import MonitoringTable from "@/components/admin/Monitoring/MonitoringTable";
import MonitoringForm from "@/components/admin/Monitoring/MonitoringForm";
import MonitoringActions from "@/components/admin/Monitoring/MonitoringActions";
import GrowthChart from "@/components/admin/Monitoring/GrowthChart";
import MonitoringTimeline from "@/components/admin/Monitoring/MonitoringTimeline";
import type { MonitoringRecord } from "@/lib/monitoring/types";

interface TegakanOption {
  id: string;
  kode_tegakan: string;
}

export default function MonitoringPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<MonitoringRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [tegakanList, setTegakanList] = useState<TegakanOption[]>([]);
  const [selectedTegakanId, setSelectedTegakanId] = useState("");
  const [loadingTegakan, setLoadingTegakan] = useState(true);

  const [chartData, setChartData] = useState<
    { tanggal: string; tinggi_cm: number; diameter_cm: number | null }[]
  >([]);
  const [timelineData, setTimelineData] = useState<MonitoringRecord[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const selectedKode =
    tegakanList.find((t) => t.id === selectedTegakanId)?.kode_tegakan ?? "";

  useEffect(() => {
    async function fetchTegakan() {
      try {
        const res = await fetch("/api/tegakan?limit=1000");
        if (res.ok) {
          const data = await res.json();
          const list: TegakanOption[] = (data.data ?? []).map(
            (t: { id: string; kode_tegakan: string }) => ({
              id: t.id,
              kode_tegakan: t.kode_tegakan,
            })
          );
          setTegakanList(list);
        }
      } catch {
        console.error("Gagal memuat tegakan");
      } finally {
        setLoadingTegakan(false);
      }
    }
    fetchTegakan();
  }, []);

  useEffect(() => {
    if (!selectedTegakanId) {
      setChartData([]);
      setTimelineData([]);
      return;
    }

    async function fetchDetail() {
      setLoadingDetail(true);
      try {
        const [chartRes, timelineRes] = await Promise.all([
          fetch(`/api/monitoring?tegakan_id=${selectedTegakanId}&limit=1000&sortBy=tanggal&sortOrder=asc`),
          fetch(`/api/monitoring?tegakan_id=${selectedTegakanId}&limit=1000&sortBy=tanggal&sortOrder=desc`),
        ]);

        if (chartRes.ok) {
          const chartJson = await chartRes.json();
          setChartData(chartJson.data ?? []);
        }
        if (timelineRes.ok) {
          const timelineJson = await timelineRes.json();
          setTimelineData(timelineJson.data ?? []);
        }
      } catch {
        console.error("Gagal memuat detail monitoring");
      } finally {
        setLoadingDetail(false);
      }
    }

    fetchDetail();
  }, [selectedTegakanId, refreshKey]);

  const handleAdd = useCallback(() => {
    setEditRecord(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((record: MonitoringRecord) => {
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green-medium/10">
              <Activity className="size-5 text-brand-green-medium" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Monitoring Pertumbuhan
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pantau pertumbuhan mangrove per tegakan secara berkala.
          </p>
        </div>
        <MonitoringActions
          onAdd={handleAdd}
          tegakan_id={selectedTegakanId || undefined}
        />
      </div>

      {/* Tegakan Selector */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800 p-4">
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Pilih Tegakan
        </label>
        {loadingTegakan ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            Memuat tegakan...
          </div>
        ) : (
          <select
            value={selectedTegakanId}
            onChange={(e) => setSelectedTegakanId(e.target.value)}
            className="max-w-xs w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20"
          >
            <option value="">Semua Tegakan</option>
            {tegakanList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.kode_tegakan}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Growth Chart */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800 p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Grafik Pertumbuhan{selectedKode ? ` — ${selectedKode}` : ""}
        </h3>
        {loadingDetail ? (
          <div className="flex h-[280px] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-brand-green-medium" />
          </div>
        ) : (
          <GrowthChart
            data={chartData}
            kode_tegakan={selectedKode}
          />
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800 p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Riwayat Monitoring{selectedKode ? ` — ${selectedKode}` : ""}
        </h3>
        {loadingDetail ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-brand-green-medium" />
          </div>
        ) : (
          <MonitoringTimeline data={timelineData} />
        )}
      </div>

      {/* Table */}
      <MonitoringTable
        key={refreshKey}
        tegakan_id={selectedTegakanId || undefined}
        onEdit={handleEdit}
      />

      {/* Form Modal */}
      <MonitoringForm
        open={formOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        editRecord={editRecord}
        preselectedTegakanId={selectedTegakanId || undefined}
      />
    </div>
  );
}
