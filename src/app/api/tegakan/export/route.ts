import { NextRequest, NextResponse } from "next/server";
import { getAllTegakanForExport } from "@/lib/tegakan/service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "pdf";

    const params = {
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      spesies: searchParams.get("spesies") ?? undefined,
    };

    const data = await getAllTegakanForExport(params);

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

function generatePDF(
  data: Awaited<ReturnType<typeof getAllTegakanForExport>>
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Blue Carbon Guardian", 14, 20);
  doc.setFontSize(10);
  doc.text(
    `Laporan Inventarisasi Tegakan - ${new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    14,
    28
  );

  doc.setFontSize(14);
  doc.text("Data Tegakan Mangrove", 14, 40);

  const rows = data.map((t) => [
    t.kode_tegakan,
    t.tanggal,
    t.zona,
    t.spesies,
    t.health_status === "hidup" ? "Hidup" : "Mati",
    t.keterangan ?? "-",
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["Kode", "Tanggal", "Zona", "Spesies", "Status", "Keterangan"]],
    body: rows,
  });

  let lastY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 50;
  lastY += 10;
  doc.setFontSize(10);
  doc.text(`Total Data: ${data.length}`, 14, lastY);

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="BCG-Tegakan-${Date.now()}.pdf"`,
    },
  });
}

function generateExcel(
  data: Awaited<ReturnType<typeof getAllTegakanForExport>>
) {
  const wb = XLSX.utils.book_new();

  const sheetData = data.map((t) => ({
    "Kode Tegakan": t.kode_tegakan,
    Tanggal: t.tanggal,
    Zona: t.zona,
    Latitude: t.latitude,
    Longitude: t.longitude,
    Spesies: t.spesies,
    Status: t.health_status === "hidup" ? "Hidup" : "Mati",
    Keterangan: t.keterangan ?? "",
  }));

  const sheet = XLSX.utils.json_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, sheet, "Tegakan");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="BCG-Tegakan-${Date.now()}.xlsx"`,
    },
  });
}
