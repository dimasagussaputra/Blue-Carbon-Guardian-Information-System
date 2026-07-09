"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, Plus, Loader2, Check } from "lucide-react";

interface KualitasAirActionsProps {
  onAdd: () => void;
  area_id?: string;
  start_date?: string;
  end_date?: string;
}

export default function KualitasAirActions({
  onAdd,
  area_id,
  start_date,
  end_date,
}: KualitasAirActionsProps) {
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelDone, setExcelDone] = useState(false);

  async function handleExport() {
    setExcelLoading(true);
    setExcelDone(false);

    try {
      const params = new URLSearchParams();
      if (area_id) params.set("area_id", area_id);
      if (start_date) params.set("start_date", start_date);
      if (end_date) params.set("end_date", end_date);

      const res = await fetch(`/api/kualitas-air/export?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal export");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BCG-KualitasAir-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExcelDone(true);
      setTimeout(() => setExcelDone(false), 2000);
    } catch {
      toast.error("Gagal mengexport data. Coba lagi.");
    } finally {
      setExcelLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
      >
        <Plus className="size-4" />
        Tambah Data
      </button>

      <button
        type="button"
        onClick={handleExport}
        disabled={excelLoading}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {excelLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : excelDone ? (
          <Check className="size-4 text-brand-green-medium" />
        ) : (
          <FileSpreadsheet className="size-4" />
        )}
        {excelLoading ? "Mengunduh..." : excelDone ? "Selesai" : "Export Excel"}
      </button>
    </div>
  );
}
