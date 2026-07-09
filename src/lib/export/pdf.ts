import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { DashboardKPI } from "@/lib/dashboard/types";

export function generateKPIPDF(kpi: DashboardKPI, filename?: string) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Blue Carbon Guardian - Laporan Dashboard", 14, 20);

  doc.setFontSize(10);
  doc.text(
    `Tanggal: ${new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    14,
    28
  );

  doc.setFontSize(14);
  doc.text("Ringkasan KPI", 14, 40);

  autoTable(doc, {
    startY: 45,
    head: [["Indikator", "Nilai"]],
    body: [
      ["Total Tegakan", kpi.totalTegakan.toString()],
      ["Tegakan Hidup", kpi.tegankanHidup.toString()],
      ["Tegakan Mati", kpi.tegankanMati.toString()],
      ["Survival Rate", `${kpi.survivalRate}%`],
      ["Total Penyulaman", kpi.totalPenyulaman.toString()],
      ["Total Sampling Air", kpi.totalSamplingAir.toString()],
      ["Total Blue Carbon", `${kpi.totalBlueCarbon} kg`],
      ["Total Monitoring", kpi.totalMonitoring.toString()],
    ],
  });

  doc.save(filename ?? `Blue-Carbon-Guardian-Report-${Date.now()}.pdf`);
}
