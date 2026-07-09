"use client";

import { FileText, Printer, Download } from "lucide-react";
import { useRef } from "react";
import type { BlueCarbonResult } from "@/lib/blue-carbon/types";

interface BlueCarbonReportPreviewProps {
  result: BlueCarbonResult;
}

export default function BlueCarbonReportPreview({
  result,
}: BlueCarbonReportPreviewProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Laporan Blue Carbon - BCG</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 13px; }
            th { background: #f1f5f9; font-weight: 600; }
            .summary { display: flex; gap: 16px; margin-bottom: 24px; }
            .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; flex: 1; }
            .card .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
            .card .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
            .card .unit { font-size: 11px; color: #94a3b8; }
            .breakdown { margin-top: 24px; }
            .step { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
            .step .label { font-weight: 600; font-size: 13px; }
            .step .formula { font-family: monospace; font-size: 12px; color: #64748b; margin: 4px 0; }
            .step .value { font-size: 18px; font-weight: 700; }
            .step .unit { font-size: 12px; color: #94a3b8; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <h1>Laporan Estimasi Blue Carbon</h1>
          <p class="subtitle">Blue Carbon Guardian — Sistem Informasi Konservasi Mangrove Mangkang</p>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 24px;">
            Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div class="summary">
            <div class="card">
              <div class="label">Luas Area</div>
              <div class="value">${result.area_ha.toLocaleString("id-ID")}</div>
              <div class="unit">hektar</div>
            </div>
            <div class="card">
              <div class="label">Total Biomassa</div>
              <div class="value">${result.biomassa_tons.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</div>
              <div class="unit">ton</div>
            </div>
            <div class="card">
              <div class="label">Karbon</div>
              <div class="value">${result.karbon_tons.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</div>
              <div class="unit">ton C</div>
            </div>
            <div class="card">
              <div class="label">CO₂e</div>
              <div class="value">${result.co2_ekuivalen_tons.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</div>
              <div class="unit">ton CO₂e</div>
            </div>
            <div class="card">
              <div class="label">Nilai Ekonomi</div>
              <div class="value">$${result.nilai_ekonomi.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
              <div class="unit">@ $${result.carbon_price}/ton</div>
            </div>
            <div class="card">
              <div class="label">Nilai Ekonomi (IDR)</div>
              <div class="value">Rp${result.nilai_ekonomi_idr.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</div>
              <div class="unit">@ Rp${(result.carbon_price * 16500).toLocaleString("id-ID")}/ton</div>
            </div>
          </div>

          <table>
            <tr>
              <th>Parameter</th>
              <th>Nilai</th>
              <th>Satuan</th>
            </tr>
            <tr><td>Jenis Mangrove</td><td>${result.mangrove_label}</td><td>-</td></tr>
            <tr><td>Kerapatan Pohon</td><td>${result.density_per_ha ?? "-"}</td><td>pohon/ha</td></tr>
            <tr><td>Rata-rata DBH</td><td>${result.avg_dbh_cm ?? "-"}</td><td>cm</td></tr>
            <tr><td>Metode</td><td>${result.metode === "allometric" ? "Allometric (Komiyama et al. 2008)" : "IPCC Tier 1"}</td><td>-</td></tr>
            <tr><td>Biomassa</td><td>${result.biomassa_kg.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</td><td>kg</td></tr>
            <tr><td>Karbon</td><td>${result.karbon_kg.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</td><td>kg C</td></tr>
            <tr><td>CO₂ Ekuivalen</td><td>${result.co2_ekuivalen_kg.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</td><td>kg CO₂e</td></tr>
            <tr><td>Nilai Ekonomi</td><td>$${result.nilai_ekonomi.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td><td>USD</td></tr>
            <tr><td>Nilai Ekonomi (IDR)</td><td>Rp${result.nilai_ekonomi_idr.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</td><td>IDR</td></tr>
          </table>

          <div class="breakdown">
            <h3 style="font-size: 16px; margin-bottom: 12px;">Detail Perhitungan</h3>
            ${result.breakdown.map((s) => `
              <div class="step">
                <div class="label">Langkah ${s.step}: ${s.label}</div>
                <div class="formula">${s.formula}</div>
                <div class="value">${s.nilai} <span class="unit">${s.satuam}</span></div>
                ${s.sumber !== "-" ? `<div style="font-size:11px;color:#94a3b8;margin-top:4px">Sumber: ${s.sumber}</div>` : ""}
              </div>
            `).join("")}
          </div>

          <div class="footer">
            <p>Blue Carbon Guardian © ${new Date().getFullYear()} — KKN Tematik Universitas Diponegoro 2026</p>
            <p>Dokumen ini digenerate secara otomatis dari sistem BCG.</p>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
            <FileText className="size-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">
              Preview Laporan
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {result.mangrove_label} — {result.area_ha} ha
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <Printer className="size-3.5" />
            Cetak / PDF
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch(`/api/blue-carbon/export`);
                if (!res.ok) throw new Error();
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `BCG-BlueCarbon-${Date.now()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch {
                // ignore
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <Download className="size-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      <div
        ref={reportRef}
        className="rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-sm"
      >
        <div className="mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Laporan Estimasi Blue Carbon
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Blue Carbon Guardian — {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-6">
          {[
            { label: "Luas Area", value: `${result.area_ha} ha` },
            { label: "Biomassa", value: `${result.biomassa_tons.toFixed(2)} ton` },
            { label: "Karbon", value: `${result.karbon_tons.toFixed(2)} ton C` },
            { label: "CO₂e", value: `${result.co2_ekuivalen_tons.toFixed(2)} ton` },
            {
              label: "Nilai Ekonomi",
              value: `$${result.nilai_ekonomi.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            },
            {
              label: "Nilai Ekonomi (IDR)",
              value: `Rp${result.nilai_ekonomi_idr.toLocaleString("id-ID", { minimumFractionDigits: 2 })}`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-center"
            >
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="py-1.5 text-left font-medium text-slate-500 dark:text-slate-400">Parameter</th>
              <th className="py-1.5 text-right font-medium text-slate-500 dark:text-slate-400">Nilai</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 dark:text-slate-300">
            <tr className="border-b border-slate-50">
              <td className="py-1.5">Jenis Mangrove</td>
              <td className="py-1.5 text-right font-medium">{result.mangrove_label}</td>
            </tr>
            <tr className="border-b border-slate-50">
              <td className="py-1.5">Kerapatan</td>
              <td className="py-1.5 text-right font-medium">
                {result.density_per_ha ?? "-"} pohon/ha
              </td>
            </tr>
            <tr className="border-b border-slate-50">
              <td className="py-1.5">Metode</td>
              <td className="py-1.5 text-right font-medium capitalize">
                {result.metode === "allometric" ? "Allometric" : "IPCC Tier 1"}
              </td>
            </tr>
            <tr className="border-b border-slate-50">
              <td className="py-1.5">Biomassa Total</td>
              <td className="py-1.5 text-right font-medium">
                {result.biomassa_kg.toLocaleString("id-ID")} kg
              </td>
            </tr>
            <tr className="border-b border-slate-50">
              <td className="py-1.5">Simpanan Karbon</td>
              <td className="py-1.5 text-right font-medium">
                {result.karbon_kg.toLocaleString("id-ID")} kg C
              </td>
            </tr>
            <tr className="border-b border-slate-50">
              <td className="py-1.5">CO₂ Ekuivalen</td>
              <td className="py-1.5 text-right font-medium">
                {result.co2_ekuivalen_kg.toLocaleString("id-ID")} kg CO₂e
              </td>
            </tr>
            <tr>
              <td className="py-1.5 font-semibold text-slate-800 dark:text-slate-200">Nilai Ekonomi</td>
              <td className="py-1.5 text-right font-bold text-brand-green-medium">
                ${result.nilai_ekonomi.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
            </tr>
            <tr>
              <td className="py-1.5 font-semibold text-slate-800 dark:text-slate-200">Nilai Ekonomi (IDR)</td>
              <td className="py-1.5 text-right font-bold text-violet-600">
                Rp{result.nilai_ekonomi_idr.toLocaleString("id-ID", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
