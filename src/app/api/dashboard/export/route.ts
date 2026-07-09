import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard/service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "pdf";

    const data = await getDashboardData();

    if (format === "excel") {
      return generateExcel(data);
    }

    return generatePDF(data);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengexport data" },
      { status: 500 }
    );
  }
}

function generatePDF(data: Awaited<ReturnType<typeof getDashboardData>>) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Blue Carbon Guardian", 14, 20);
  doc.setFontSize(10);
  doc.text(
    `Laporan Dashboard - ${new Date().toLocaleDateString("id-ID", {
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
      ["Total Tegakan", data.kpi.totalTegakan.toString()],
      ["Tegakan Hidup", data.kpi.tegankanHidup.toString()],
      ["Tegakan Mati", data.kpi.tegankanMati.toString()],
      ["Survival Rate", `${data.kpi.survivalRate}%`],
      ["Total Penyulaman", data.kpi.totalPenyulaman.toString()],
      ["Total Sampling Air", data.kpi.totalSamplingAir.toString()],
      ["Total Blue Carbon (kg)", `${data.kpi.totalBlueCarbon} kg`],
      ["Area Monitoring", `${data.kpi.totalArea} zona`],
    ],
  });

  let lastY = (doc as any).lastAutoTable?.finalY ?? 50;

  if (data.speciesDistribution.length > 0) {
    lastY += 10;
    doc.setFontSize(14);
    doc.text("Distribusi Spesies", 14, lastY);

    autoTable(doc, {
      startY: lastY + 5,
      head: [["Spesies", "Jumlah"]],
      body: data.speciesDistribution.map((s) => [s.name, s.value.toString()]),
    });

    lastY = (doc as any).lastAutoTable?.finalY ?? lastY;
  }

  if (data.penyulamanPerBulan.length > 0) {
    lastY += 10;
    doc.setFontSize(14);
    doc.text("Penyulaman per Bulan", 14, lastY);

    autoTable(doc, {
      startY: lastY + 5,
      head: [["Bulan", "Jumlah Kegiatan", "Total Bibit"]],
      body: data.penyulamanPerBulan.map((p) => [
        p.bulan,
        p.jumlah.toString(),
        p.bibit.toString(),
      ]),
    });
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="BCG-Report-${Date.now()}.pdf"`,
    },
  });
}

function generateExcel(data: Awaited<ReturnType<typeof getDashboardData>>) {
  const wb = XLSX.utils.book_new();

  const kpiSheet = XLSX.utils.json_to_sheet([
    { Indikator: "Total Tegakan", Nilai: data.kpi.totalTegakan },
    { Indikator: "Tegakan Hidup", Nilai: data.kpi.tegankanHidup },
    { Indikator: "Tegakan Mati", Nilai: data.kpi.tegankanMati },
    { Indikator: "Survival Rate", Nilai: `${data.kpi.survivalRate}%` },
    { Indikator: "Total Penyulaman", Nilai: data.kpi.totalPenyulaman },
    { Indikator: "Total Sampling Air", Nilai: data.kpi.totalSamplingAir },
    { Indikator: "Total Blue Carbon (kg)", Nilai: data.kpi.totalBlueCarbon },
    { Indikator: "Area Monitoring", Nilai: `${data.kpi.totalArea} zona` },
  ]);
  XLSX.utils.book_append_sheet(wb, kpiSheet, "KPI");

  if (data.speciesDistribution.length > 0) {
    const speciesSheet = XLSX.utils.json_to_sheet(
      data.speciesDistribution.map((s) => ({ Spesies: s.name, Jumlah: s.value }))
    );
    XLSX.utils.book_append_sheet(wb, speciesSheet, "Distribusi Spesies");
  }

  if (data.penyulamanPerBulan.length > 0) {
    const penyulamanSheet = XLSX.utils.json_to_sheet(
      data.penyulamanPerBulan.map((p) => ({
        Bulan: p.bulan,
        "Jumlah Kegiatan": p.jumlah,
        "Total Bibit": p.bibit,
      }))
    );
    XLSX.utils.book_append_sheet(wb, penyulamanSheet, "Penyulaman");
  }

  if (data.waterQualityTrend.length > 0) {
    const waterSheet = XLSX.utils.json_to_sheet(
      data.waterQualityTrend.map((w) => ({
        Bulan: w.bulan,
        pH: w.ph,
        "DO (mg/L)": w.do,
        "Salinitas (ppt)": w.salinitas,
        "TSS (mg/L)": w.tss,
        "Suhu (°C)": w.suhu,
      }))
    );
    XLSX.utils.book_append_sheet(wb, waterSheet, "Kualitas Air");
  }

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="BCG-Report-${Date.now()}.xlsx"`,
    },
  });
}
