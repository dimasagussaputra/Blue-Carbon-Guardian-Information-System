"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, FileSpreadsheet, Plus, Loader2, Check } from "lucide-react";

interface PenyulamanActionsProps {
  onAdd: () => void;
  gelombang?: string;
  status?: string;
}

export default function PenyulamanActions({
  onAdd,
  gelombang,
  status,
}: PenyulamanActionsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);
  const [excelDone, setExcelDone] = useState(false);

  async function handleExport(format: "pdf" | "excel") {
    const setLoading = format === "pdf" ? setPdfLoading : setExcelLoading;
    const setDone = format === "pdf" ? setPdfDone : setExcelDone;

    setLoading(true);
    setDone(false);

    try {
      const params = new URLSearchParams();
      params.set("format", format);
      if (gelombang) params.set("gelombang", gelombang);
      if (status) params.set("status", status);

      const res = await fetch(`/api/penyulaman/export?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal export");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BCG-Penyulaman-${Date.now()}.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      toast.error("Gagal mengexport data. Coba lagi.");
    } finally {
      setLoading(false);
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
        onClick={() => handleExport("pdf")}
        disabled={pdfLoading}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pdfLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : pdfDone ? (
          <Check className="size-4 text-brand-green-medium" />
        ) : (
          <FileText className="size-4" />
        )}
        {pdfLoading ? "Mengunduh..." : pdfDone ? "Selesai" : "Export PDF"}
      </button>

      <button
        type="button"
        onClick={() => handleExport("excel")}
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
