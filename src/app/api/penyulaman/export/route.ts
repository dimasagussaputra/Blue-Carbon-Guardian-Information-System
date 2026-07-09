import { NextRequest, NextResponse } from "next/server";
import { getAllPenyulamanForExport } from "@/lib/penyulaman/service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "pdf";

    const records = await getAllPenyulamanForExport({
      search: searchParams.get("search") ?? undefined,
      gelombang: searchParams.get("gelombang") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    const rows = records.map((r) => [
      new Date(r.tanggal).toLocaleDateString("id-ID"),
      `Gel. ${r.gelombang}`,
      r.spesies,
      String(r.jumlah_bibit),
      r.jumlah_hidup !== null ? String(r.jumlah_hidup) : "-",
      r.survival_rate !== null ? `${r.survival_rate}%` : "-",
      `${r.latitude}, ${r.longitude}`,
      r.status,
    ]);

    if (format === "excel") {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        [
          "Tanggal",
          "Gelombang",
          "Spesies",
          "Jumlah Bibit",
          "Jumlah Hidup",
          "Survival Rate",
          "Koordinat",
          "Status",
        ],
        ...rows,
      ]);

      XLSX.utils.book_append_sheet(wb, ws, "Penyulaman");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename=BCG-Penyulaman-${Date.now()}.xlsx`,
        },
      });
    }

    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text("Laporan Penyulaman Mangrove", 14, 20);
    doc.setFontSize(10);
    doc.text(`BCG — ${new Date().toLocaleDateString("id-ID")}`, 14, 28);

    autoTable(doc, {
      startY: 36,
      head: [
        [
          "Tanggal",
          "Gelombang",
          "Spesies",
          "Jml Bibit",
          "Jml Hidup",
          "Survival",
          "Koordinat",
          "Status",
        ],
      ],
      body: rows,
      styles: { fontSize: 8 },
    });

    const pdfBuf = Buffer.from(doc.output("arraybuffer"));
    return new NextResponse(pdfBuf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=BCG-Penyulaman-${Date.now()}.pdf`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengexport data" },
      { status: 500 }
    );
  }
}
