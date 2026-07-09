"use client";

import { useState } from "react";
import {
  ClipboardList,
  FileText,
  FileSpreadsheet,
  Loader2,
  Check,
  Calendar,
  BarChart3,
  Trees,
  Activity,
  Leaf,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();

function dateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const defaultStart = dateInputValue(new Date(CURRENT_YEAR, 0, 1));
const defaultEnd = dateInputValue(new Date());

interface SectionOption {
  key: "statistik" | "inventarisasi" | "monitoring" | "blueCarbon";
  label: string;
  description: string;
  icon: typeof BarChart3;
}

const SECTIONS: SectionOption[] = [
  {
    key: "statistik",
    label: "Statistik & Grafik",
    description: "KPI, grafik tren, distribusi spesies, kualitas air",
    icon: BarChart3,
  },
  {
    key: "inventarisasi",
    label: "Inventarisasi Tegakan",
    description: "Daftar lengkap tegakan mangrove per zona",
    icon: Trees,
  },
  {
    key: "monitoring",
    label: "Monitoring & Penyulaman",
    description: "Data monitoring, penyulaman, dan kualitas air",
    icon: Activity,
  },
  {
    key: "blueCarbon",
    label: "Blue Carbon",
    description: "Kalkulasi karbon dan nilai ekonomi",
    icon: Leaf,
  },
];

export default function LaporanPage() {
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [checked, setChecked] = useState<Record<string, boolean>>({
    statistik: true,
    inventarisasi: true,
    monitoring: true,
    blueCarbon: true,
  });
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function toggleSection(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleGenerate() {
    const selectedSections = Object.entries(checked)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (selectedSections.length === 0) {
      setError("Pilih minimal satu bagian laporan");
      return;
    }

    if (!startDate || !endDate) {
      setError("Periode laporan harus diisi");
      return;
    }

    if (startDate > endDate) {
      setError("Tanggal awal tidak boleh melebihi tanggal akhir");
      return;
    }

    setError("");
    setLoading(true);
    setDone(false);

    try {
      const res = await fetch("/api/laporan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          sections: {
            statistik: checked.statistik,
            inventarisasi: checked.inventarisasi,
            monitoring: checked.monitoring,
            blueCarbon: checked.blueCarbon,
          },
          format,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error ?? "Gagal generate laporan");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BCG-Laporan-${Date.now()}.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green-medium/10">
              <ClipboardList className="size-5 text-brand-green-medium" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Laporan
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Generate dan unduh laporan lengkap monitoring kawasan mangrove Mangkang
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-700/80 dark:bg-slate-800">
        <h2 className="mb-5 text-base font-semibold text-slate-800 dark:text-slate-200">
          Konfigurasi Laporan
        </h2>

        <div className="space-y-6">
          {/* ── Periode ── */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Calendar className="size-4 text-brand-green-medium" />
              Periode Laporan
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-brand-green-medium focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
              <span className="text-sm text-slate-400">–</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-brand-green-medium focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          {/* ── Bagian Laporan ── */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <BarChart3 className="size-4 text-brand-green-medium" />
              Bagian Laporan
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isChecked = checked[section.key];
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                      isChecked
                        ? "border-brand-green-medium/40 bg-brand-green-medium/5 ring-1 ring-brand-green-medium/20"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700/50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        isChecked
                          ? "bg-brand-green-medium text-white"
                          : "bg-slate-200 text-slate-400 dark:bg-slate-600"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {section.label}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Format ── */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              {format === "pdf" ? (
                <FileText className="size-4 text-brand-green-medium" />
              ) : (
                <FileSpreadsheet className="size-4 text-brand-green-medium" />
              )}
              Format File
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  format === "pdf"
                    ? "border-brand-green-medium bg-brand-green-medium text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                <FileText className="size-4" />
                PDF
              </button>
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  format === "excel"
                    ? "border-brand-green-medium bg-brand-green-medium text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                <FileSpreadsheet className="size-4" />
                Excel
              </button>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ── Tombol Generate ── */}
          <div className="flex items-center gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : done ? (
                <Check className="size-4" />
              ) : format === "pdf" ? (
                <FileText className="size-4" />
              ) : (
                <FileSpreadsheet className="size-4" />
              )}
              {loading
                ? "Mengenerate..."
                : done
                  ? "Berhasil Diunduh!"
                  : `Generate ${format === "pdf" ? "PDF" : "Excel"}`}
            </button>
            {loading && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {format === "pdf"
                  ? "Membuat laporan PDF..."
                  : "Membuat file Excel..."}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Info Card ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-800">
        <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Tentang Laporan KKN
        </h3>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Laporan ini mencakup seluruh data monitoring kawasan mangrove
          Mangkang, termasuk inventarisasi tegakan, monitoring pertumbuhan,
          penyulaman, analisis kualitas air, dan kalkulasi blue carbon. Data
          dapat diexport dalam format PDF untuk laporan resmi atau Excel untuk
          analisis lebih lanjut.
        </p>
      </div>
    </div>
  );
}
