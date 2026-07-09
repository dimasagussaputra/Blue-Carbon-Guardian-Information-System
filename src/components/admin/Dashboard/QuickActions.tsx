"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  FileSpreadsheet,
  Loader2,
  Check,
} from "lucide-react";

export default function QuickActions() {
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
      const res = await fetch(`/api/dashboard/export?format=${format}`);
      if (!res.ok) throw new Error("Gagal export");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BCG-Report-${Date.now()}.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      alert("Gagal mengexport data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/admin/inventarisasi-tegakan"
        className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
      >
        <Plus className="size-4" />
        Tambah Data
      </Link>

      <button
        type="button"
        onClick={() => handleExport("pdf")}
        disabled={pdfLoading}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
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
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
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
