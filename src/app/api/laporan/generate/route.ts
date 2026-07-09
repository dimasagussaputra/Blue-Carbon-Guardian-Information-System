import { NextRequest, NextResponse } from "next/server";
import { getLaporanData } from "@/lib/laporan/service";
import type { LaporanConfig } from "@/lib/laporan/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type RGB = [number, number, number];

const BRAND_GREEN: RGB = [16, 185, 129];
const BRAND_GREEN_DARK: RGB = [6, 78, 59];
const BRAND_BLUE: RGB = [52, 152, 219];
const TEXT_DARK: RGB = [30, 41, 59];
const TEXT_MUTED: RGB = [100, 116, 139];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = body as LaporanConfig;

    if (!config.startDate || !config.endDate) {
      return NextResponse.json(
        { error: "Periode laporan harus diisi" },
        { status: 400 }
      );
    }

    const data = await getLaporanData(config);

    if (config.format === "excel") {
      return generateExcelResponse(data, config);
    }

    return generatePDFResponse(data, config);
  } catch (err) {
    console.error("Laporan generate error:", err);
    return NextResponse.json(
      { error: "Gagal generate laporan" },
      { status: 500 }
    );
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getToday(): string {
  return new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getLastY(doc: jsPDF): number {
  const autoTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable;
  const lastY = (doc as unknown as { lastY?: number }).lastY;
  return autoTable?.finalY ?? lastY ?? 50;
}

function setLastY(doc: jsPDF, y: number) {
  (doc as unknown as { lastY?: number }).lastY = y;
}

// ─── PDF ──────────────────────────────────────────────────────────────────

function generatePDFResponse(
  data: Awaited<ReturnType<typeof getLaporanData>>,
  config: LaporanConfig
) {
  const doc = new jsPDF("p", "mm", "a4");
  const { sections } = config;

  // ── Cover ──
  drawCover(doc, config);

  // ── Statistik & Grafik ──
  if (sections.statistik && data.kpi.totalTegakan > 0) {
    addPage(doc);
    drawSectionHeader(doc, "Statistik & Grafik");
    drawKPITable(doc, data);
    if (data.survivalRateTrend.length > 0) drawBarChart(doc, "Tren Survival Rate (%)", data.survivalRateTrend.map((s) => s.bulan), data.survivalRateTrend.map((s) => s.rate), BRAND_GREEN);
    if (data.speciesDistribution.length > 0) drawSpeciesTable(doc, data);
    if (data.penyulamanPerBulan.length > 0) drawBarChart(doc, "Penyulaman per Bulan (Jumlah Bibit)", data.penyulamanPerBulan.map((p) => p.bulan), data.penyulamanPerBulan.map((p) => p.bibit), BRAND_BLUE);
    if (data.monitoringActivity.length > 0) drawActivityChart(doc, data);
    if (data.waterQualityTrend.length > 0) drawWaterTable(doc, data);
  }

  // ── Inventarisasi ──
  if (sections.inventarisasi && data.tegakan.length > 0) {
    addPage(doc);
    drawSectionHeader(doc, "Inventarisasi Tegakan");
    autoTable(doc, {
      startY: getLastY(doc),
      head: [["Kode", "Spesies", "Zona", "Status"]],
      body: data.tegakan.map((t) => [t.kode_tegakan, t.spesies, t.zona, t.health_status]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: BRAND_GREEN, fontSize: 8, textColor: 255 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    });
  }

  // ── Monitoring & Penyulaman ──
  if (sections.monitoring) {
    if (data.monitoringRecords.length > 0) {
      addPage(doc);
      drawSectionHeader(doc, "Monitoring");
      autoTable(doc, {
        startY: getLastY(doc),
        head: [["Tanggal", "Kode Tegakan", "Tinggi (cm)", "Diameter (cm)", "Kondisi", "Survia"]],
        body: data.monitoringRecords.map((m) => [
          m.tanggal,
          m.kode_tegakan,
          m.tinggi_cm.toString(),
          m.diameter_cm?.toString() ?? "-",
          m.health_status,
          m.survia ? "Ya" : "Tidak",
        ]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: BRAND_GREEN, fontSize: 7, textColor: 255 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
      });
    }

    if (data.penyulamanRecords.length > 0) {
      addPage(doc);
      drawSectionHeader(doc, "Penyulaman");
      autoTable(doc, {
        startY: getLastY(doc),
        head: [["Tanggal", "Gel.", "Spesies", "Bibit", "Hidup", "SR (%)", "Status"]],
        body: data.penyulamanRecords.map((p) => [
          p.tanggal,
          `G${p.gelombang}`,
          p.spesies,
          p.jumlah_bibit.toString(),
          p.jumlah_hidup?.toString() ?? "-",
          p.survival_rate?.toString() ?? "-",
          p.status,
        ]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: BRAND_GREEN, fontSize: 7, textColor: 255 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
      });
    }

    if (data.kualitasAirRecords.length > 0) {
      addPage(doc);
      drawSectionHeader(doc, "Kualitas Air");
      autoTable(doc, {
        startY: getLastY(doc),
        head: [["Tanggal", "Lokasi", "pH", "DO (mg/L)", "Salinitas (ppt)", "TSS (mg/L)", "Suhu (°C)"]],
        body: data.kualitasAirRecords.map((k) => [
          k.tanggal,
          k.lokasi,
          k.ph.toString(),
          k.do_mgl.toString(),
          k.salinitas_ppt.toString(),
          k.tss_mgl.toString(),
          k.suhu_c.toString(),
        ]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: BRAND_GREEN, fontSize: 7, textColor: 255 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
      });
    }
  }

  // ── Blue Carbon ──
  if (sections.blueCarbon && data.blueCarbonRecords.length > 0) {
    addPage(doc);
    drawSectionHeader(doc, "Blue Carbon");
    autoTable(doc, {
      startY: getLastY(doc),
      head: [["Tanggal", "Lokasi", "Area (ha)", "Biomassa (kg)", "Karbon (kg)", "CO2 Ekuiv. (kg)", "Nilai Ekonomi (Rp)"]],
      body: data.blueCarbonRecords.map((b) => [
        b.created_at?.slice(0, 10) ?? "-",
        b.lokasi ?? "-",
        b.area_ha.toString(),
        Math.round(b.biomassa_kg).toLocaleString("id-ID"),
        Math.round(b.karbon_kg).toLocaleString("id-ID"),
        Math.round(b.co2_ekuivalen).toLocaleString("id-ID"),
        Math.round(b.nilai_ekonomi_idr).toLocaleString("id-ID"),
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: BRAND_GREEN, fontSize: 7, textColor: 255 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    });

    const totalKarbon = data.blueCarbonRecords.reduce((s, b) => s + b.karbon_kg, 0);
    const totalNilai = data.blueCarbonRecords.reduce((s, b) => s + b.nilai_ekonomi_idr, 0);
    const totalArea = data.blueCarbonRecords.reduce((s, b) => s + b.area_ha, 0);
    const lastY = (getLastY(doc)) + 10;

    autoTable(doc, {
      startY: lastY,
      head: [["Ringkasan Blue Carbon", "Nilai"]],
      body: [
        ["Total Area", `${totalArea.toFixed(2)} ha`],
        ["Total Karbon", `${Math.round(totalKarbon).toLocaleString("id-ID")} kg`],
        ["Total CO2 Ekuivalen", `${Math.round(data.blueCarbonRecords.reduce((s, b) => s + b.co2_ekuivalen, 0)).toLocaleString("id-ID")} kg`],
        ["Total Nilai Ekonomi", `Rp ${Math.round(totalNilai).toLocaleString("id-ID")}`],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: BRAND_GREEN_DARK, fontSize: 9, textColor: 255 },
    });
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="BCG-Laporan-${Date.now()}.pdf"`,
    },
  });
}

function addPage(doc: jsPDF) {
  doc.addPage();
  drawFooter(doc);
}

function drawFooter(doc: jsPDF) {
  const pageH = 297;
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    `Blue Carbon Guardian — Laporan KKN — ${getToday()}`,
    14,
    pageH - 10
  );
  doc.text(
    `Halaman ${(doc as unknown as { getCurrentPageInfo?: () => { pageNumber: number } }).getCurrentPageInfo?.().pageNumber ?? ""}`,
    196,
    pageH - 10,
    { align: "right" }
  );
  doc.setDrawColor(200, 200, 200);
  doc.line(14, pageH - 13, 196, pageH - 13);
}

function drawCover(doc: jsPDF, config: LaporanConfig) {
  const pageH = 297;
  const cx = 105;

  doc.setFillColor(5, 20, 36);
  doc.rect(0, 0, 210, pageH, "F");

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(28);
  doc.text("BLUE CARBON", cx, 100, { align: "center" });
  doc.text("GUARDIAN", cx, 125, { align: "center" });

  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(60, 135, 150, 135);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("LAPORAN MONITORING KAWASAN", cx, 155, { align: "center" });
  doc.text("MANGROVE MANGKANG", cx, 172, { align: "center" });

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(11);
  doc.text(`Periode: ${formatDate(config.startDate)} – ${formatDate(config.endDate)}`, cx, 205, { align: "center" });
  doc.text(`Tanggal Cetak: ${getToday()}`, cx, 220, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Program KKN — Blue Carbon Guardian Information System", cx, 260, { align: "center" });
}

function drawSectionHeader(doc: jsPDF, title: string) {
  const y = 20;
  doc.setFillColor(16, 185, 129);
  doc.rect(14, y - 4, 3, 12, "F");
  doc.setFontSize(14);
  doc.setTextColor(...TEXT_DARK);
  doc.text(title, 21, y + 4);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y + 10, 196, y + 10);
  setLastY(doc, y + 16);
}

function drawKPITable(doc: jsPDF, data: Awaited<ReturnType<typeof getLaporanData>>) {
  const { kpi } = data;
  const startY = getLastY(doc);

  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);
  doc.text("Ringkasan KPI", 14, startY);

  autoTable(doc, {
    startY: startY + 4,
    head: [["Indikator", "Nilai"]],
    body: [
      ["Total Tegakan", kpi.totalTegakan.toString()],
      ["Tegakan Hidup", kpi.tegankanHidup.toString()],
      ["Tegakan Mati", kpi.tegankanMati.toString()],
      ["Survival Rate", `${kpi.survivalRate}%`],
      ["Total Penyulaman", kpi.totalPenyulaman.toString()],
      ["Total Sampling Air", kpi.totalSamplingAir.toString()],
      ["Total Blue Carbon", `${kpi.totalBlueCarbon.toLocaleString("id-ID")} kg`],
      ["Total Monitoring", kpi.totalMonitoring.toString()],
      ["Area Monitoring", `${kpi.totalArea} zona`],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: BRAND_GREEN, textColor: 255, fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 60, halign: "right" } },
  });
}

function drawBarChart(
  doc: jsPDF,
  title: string,
  labels: string[],
  values: number[],
  color: [number, number, number]
) {
  const startY = getLastY(doc) + 12;
  const pageH = 297;

  if (startY > pageH - 70) {
    doc.addPage();
    drawFooter(doc);
  }

  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);
  doc.text(title, 14, startY);

  const chartX = 30;
  const chartY = startY + 8;
  const chartW = 150;
  const chartH = 55;
  const chartLeft = chartX;
  const chartBottom = chartY + chartH;
  const chartRight = chartX + chartW;

  const maxVal = Math.max(...values, 1);
  const barCount = labels.length;
  const gap = chartW / barCount;
  const barWidth = Math.min(gap * 0.6, 12);
  const scale = chartH / maxVal;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(chartLeft, chartY, chartLeft, chartBottom);
  doc.line(chartLeft, chartBottom, chartRight, chartBottom);

  doc.setFillColor(color[0], color[1], color[2]);

  for (let i = 0; i < barCount; i++) {
    const barH = values[i] * scale;
    const barX = chartLeft + i * gap + (gap - barWidth) / 2;
    const barY = chartBottom - barH;
    doc.rect(barX, barY, barWidth, barH, "F");

    doc.setFontSize(6);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(labels[i], barX + barWidth / 2, chartBottom + 4, { align: "center" });

    doc.setFontSize(7);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(String(values[i]), barX + barWidth / 2, barY - 2, { align: "center" });
  }

  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const val = Math.round((maxVal * i) / steps);
    const yPos = chartBottom - (val / maxVal) * chartH;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(chartLeft, yPos, chartRight, yPos);
    doc.setFontSize(6);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(String(val), chartLeft - 3, yPos + 2, { align: "right" });
  }
}

function drawActivityChart(
  doc: jsPDF,
  data: Awaited<ReturnType<typeof getLaporanData>>
) {
  const labels = data.monitoringActivity.map((a) => a.bulan);
  const monValues = data.monitoringActivity.map((a) => a.monitoring);
  const penValues = data.monitoringActivity.map((a) => a.penyulaman);
  const allValues = [...monValues, ...penValues];
  const maxVal = Math.max(...allValues, 1);

  const startY = getLastY(doc) + 12;
  const pageH = 297;
  if (startY > pageH - 70) {
    doc.addPage();
    drawFooter(doc);
  }

  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);
  doc.text("Aktivitas Monitoring & Penyulaman", 14, startY);

  const chartX = 30;
  const chartY = startY + 8;
  const chartW = 140;
  const chartH = 55;
  const chartLeft = chartX;
  const chartBottom = chartY + chartH;

  const barCount = labels.length;
  const gap = chartW / barCount;
  const barWidth = Math.min(gap * 0.25, 6);
  const scale = chartH / maxVal;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(chartLeft, chartY, chartLeft, chartBottom);
  doc.line(chartLeft, chartBottom, chartRight(chartLeft, chartW), chartBottom);

  for (let i = 0; i < barCount; i++) {
    const xBase = chartLeft + i * gap;

    const h1 = monValues[i] * scale;
    doc.setFillColor(BRAND_GREEN[0], BRAND_GREEN[1], BRAND_GREEN[2]);
    doc.rect(xBase + gap * 0.15, chartBottom - h1, barWidth, h1, "F");

    const h2 = penValues[i] * scale;
    doc.setFillColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
    doc.rect(xBase + gap * 0.55, chartBottom - h2, barWidth, h2, "F");

    doc.setFontSize(6);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(labels[i], xBase + gap * 0.5, chartBottom + 4, { align: "center" });
  }

  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const val = Math.round((maxVal * i) / steps);
    const yPos = chartBottom - (val / maxVal) * chartH;
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(chartLeft, yPos, chartRight(chartLeft, chartW), yPos);
    doc.setFontSize(6);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(String(val), chartLeft - 3, yPos + 2, { align: "right" });
  }

  doc.setFontSize(6);
  doc.setFillColor(BRAND_GREEN[0], BRAND_GREEN[1], BRAND_GREEN[2]);
  doc.rect(chartLeft + 5, chartBottom + 12, 4, 3, "F");
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Monitoring", chartLeft + 11, chartBottom + 14.5);

  doc.setFillColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
  doc.rect(chartLeft + 35, chartBottom + 12, 4, 3, "F");
  doc.text("Penyulaman", chartLeft + 41, chartBottom + 14.5);
}

function chartRight(left: number, w: number) {
  return left + w;
}

function drawSpeciesTable(
  doc: jsPDF,
  data: Awaited<ReturnType<typeof getLaporanData>>
) {
  const startY = getLastY(doc) + 12;
  const pageH = 297;
  if (startY > pageH - 60) {
    doc.addPage();
    drawFooter(doc);
  }

  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);
  doc.text("Distribusi Spesies", 14, startY);

  autoTable(doc, {
    startY: startY + 4,
    head: [["Spesies", "Jumlah", "Persentase"]],
    body: data.speciesDistribution.map((s) => [
      s.name,
      s.value.toString(),
      `${Math.round((s.value / data.kpi.totalTegakan) * 100)}%`,
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: BRAND_GREEN, textColor: 255, fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 30, halign: "center" }, 2: { cellWidth: 30, halign: "center" } },
  });
}

function drawWaterTable(
  doc: jsPDF,
  data: Awaited<ReturnType<typeof getLaporanData>>
) {
  const startY = getLastY(doc) + 12;
  const pageH = 297;
  if (startY > pageH - 60) {
    doc.addPage();
    drawFooter(doc);
  }

  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);
  doc.text("Tren Kualitas Air (Rata-rata Bulanan)", 14, startY);

  autoTable(doc, {
    startY: startY + 4,
    head: [["Bulan", "pH", "DO (mg/L)", "Salinitas (ppt)", "TSS (mg/L)", "Suhu (°C)"]],
    body: data.waterQualityTrend.map((w) => [
      w.bulan,
      w.ph.toString(),
      w.do.toString(),
      w.salinitas.toString(),
      w.tss.toString(),
      w.suhu.toString(),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: BRAND_GREEN, fontSize: 8, textColor: 255 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
  });
}

// ─── EXCEL ─────────────────────────────────────────────────────────────────

function generateExcelResponse(
  data: Awaited<ReturnType<typeof getLaporanData>>,
  config: LaporanConfig
) {
  const wb = XLSX.utils.book_new();
  const { sections } = config;

  if (sections.statistik) {
    const kpiSheet = XLSX.utils.json_to_sheet([
      { Indikator: "Total Tegakan", Nilai: data.kpi.totalTegakan },
      { Indikator: "Tegakan Hidup", Nilai: data.kpi.tegankanHidup },
      { Indikator: "Tegakan Mati", Nilai: data.kpi.tegankanMati },
      { Indikator: "Survival Rate", Nilai: `${data.kpi.survivalRate}%` },
      { Indikator: "Total Penyulaman", Nilai: data.kpi.totalPenyulaman },
      { Indikator: "Total Sampling Air", Nilai: data.kpi.totalSamplingAir },
      { Indikator: "Total Blue Carbon (kg)", Nilai: data.kpi.totalBlueCarbon },
      { Indikator: "Total Monitoring", Nilai: data.kpi.totalMonitoring },
      { Indikator: "Area Monitoring", Nilai: `${data.kpi.totalArea} zona` },
    ]);
    XLSX.utils.book_append_sheet(wb, kpiSheet, "Ringkasan KPI");

    if (data.speciesDistribution.length > 0) {
      const speciesSheet = XLSX.utils.json_to_sheet(
        data.speciesDistribution.map((s) => ({ Spesies: s.name, Jumlah: s.value }))
      );
      XLSX.utils.book_append_sheet(wb, speciesSheet, "Distribusi Spesies");
    }

    if (data.survivalRateTrend.length > 0) {
      const srSheet = XLSX.utils.json_to_sheet(
        data.survivalRateTrend.map((s) => ({
          Bulan: s.bulan,
          "Total Tegakan": s.total,
          Hidup: s.hidup,
          "Survival Rate (%)": s.rate,
        }))
      );
      XLSX.utils.book_append_sheet(wb, srSheet, "Survival Rate");
    }

    if (data.penyulamanPerBulan.length > 0) {
      const penSheet = XLSX.utils.json_to_sheet(
        data.penyulamanPerBulan.map((p) => ({
          Bulan: p.bulan,
          "Jumlah Kegiatan": p.jumlah,
          "Total Bibit": p.bibit,
        }))
      );
      XLSX.utils.book_append_sheet(wb, penSheet, "Penyulaman per Bulan");
    }

    if (data.waterQualityTrend.length > 0) {
      const wqSheet = XLSX.utils.json_to_sheet(
        data.waterQualityTrend.map((w) => ({
          Bulan: w.bulan,
          pH: w.ph,
          "DO (mg/L)": w.do,
          "Salinitas (ppt)": w.salinitas,
          "TSS (mg/L)": w.tss,
          "Suhu (°C)": w.suhu,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wqSheet, "Kualitas Air");
    }

    if (data.monitoringActivity.length > 0) {
      const actSheet = XLSX.utils.json_to_sheet(
        data.monitoringActivity.map((a) => ({
          Bulan: a.bulan,
          Monitoring: a.monitoring,
          Penyulaman: a.penyulaman,
        }))
      );
      XLSX.utils.book_append_sheet(wb, actSheet, "Aktivitas");
    }
  }

  if (sections.inventarisasi && data.tegakan.length > 0) {
    const tegSheet = XLSX.utils.json_to_sheet(
      data.tegakan.map((t) => ({
        "Kode Tegakan": t.kode_tegakan,
        Tanggal: t.tanggal,
        Spesies: t.spesies,
        Zona: t.zona,
        Latitude: t.latitude,
        Longitude: t.longitude,
        Status: t.health_status,
        Keterangan: t.keterangan ?? "",
      }))
    );
    XLSX.utils.book_append_sheet(wb, tegSheet, "Inventarisasi Tegakan");
  }

  if (sections.monitoring) {
    if (data.monitoringRecords.length > 0) {
      const monSheet = XLSX.utils.json_to_sheet(
        data.monitoringRecords.map((m) => ({
          Tanggal: m.tanggal,
          "Kode Tegakan": m.kode_tegakan,
          "Tinggi (cm)": m.tinggi_cm,
          "Diameter (cm)": m.diameter_cm ?? "",
          Kondisi: m.health_status,
          Survia: m.survia ? "Ya" : "Tidak",
          Catatan: m.catatan ?? "",
        }))
      );
      XLSX.utils.book_append_sheet(wb, monSheet, "Monitoring");
    }

    if (data.penyulamanRecords.length > 0) {
      const penSheet = XLSX.utils.json_to_sheet(
        data.penyulamanRecords.map((p) => ({
          Tanggal: p.tanggal,
          Gelombang: p.gelombang,
          Spesies: p.spesies,
          "Jumlah Bibit": p.jumlah_bibit,
          "Jumlah Hidup": p.jumlah_hidup ?? "",
          "Survival Rate (%)": p.survival_rate ?? "",
          Status: p.status,
          Keterangan: p.keterangan ?? "",
        }))
      );
      XLSX.utils.book_append_sheet(wb, penSheet, "Penyulaman");
    }

    if (data.kualitasAirRecords.length > 0) {
      const kaSheet = XLSX.utils.json_to_sheet(
        data.kualitasAirRecords.map((k) => ({
          Tanggal: k.tanggal,
          Lokasi: k.lokasi,
          "Titik Sampling": k.titik_sampling ?? "",
          pH: k.ph,
          "DO (mg/L)": k.do_mgl,
          "Salinitas (ppt)": k.salinitas_ppt,
          "TSS (mg/L)": k.tss_mgl,
          "Suhu (°C)": k.suhu_c,
          Latitude: k.latitude,
          Longitude: k.longitude,
          Keterangan: k.keterangan ?? "",
        }))
      );
      XLSX.utils.book_append_sheet(wb, kaSheet, "Kualitas Air");
    }
  }

  if (sections.blueCarbon && data.blueCarbonRecords.length > 0) {
    const bcSheet = XLSX.utils.json_to_sheet(
      data.blueCarbonRecords.map((b) => ({
        Tanggal: b.created_at?.slice(0, 10) ?? "",
        Lokasi: b.lokasi ?? "",
        "Area (ha)": b.area_ha,
        "Tipe Mangrove": b.mangrove_type,
        Metode: b.metode,
        "Biomassa (kg)": Math.round(b.biomassa_kg),
        "Karbon (kg)": Math.round(b.karbon_kg),
        "CO2 Ekuivalen (kg)": Math.round(b.co2_ekuivalen),
        "Nilai Ekonomi (USD)": Math.round(b.nilai_ekonomi),
        "Nilai Ekonomi (IDR)": Math.round(b.nilai_ekonomi_idr),
      }))
    );
    XLSX.utils.book_append_sheet(wb, bcSheet, "Blue Carbon");
  }

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="BCG-Laporan-${Date.now()}.xlsx"`,
    },
  });
}
