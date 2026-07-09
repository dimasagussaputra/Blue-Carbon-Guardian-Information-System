import { NextRequest, NextResponse } from "next/server";
import { getAllKualitasAirForExport } from "@/lib/kualitas-air/service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const records = await getAllKualitasAirForExport({
      search: searchParams.get("search") ?? undefined,
      area_id: searchParams.get("area_id") ?? undefined,
      start_date: searchParams.get("start_date") ?? undefined,
      end_date: searchParams.get("end_date") ?? undefined,
    });

    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();

    const header = [
      "Tanggal",
      "Lokasi",
      "Titik Sampling",
      "pH",
      "DO (mg/L)",
      "Salinitas (ppt)",
      "TSS (mg/L)",
      "Suhu (°C)",
      "Latitude",
      "Longitude",
      "Catatan",
    ];

    const rows = records.map((r) => [
      new Date(r.tanggal).toLocaleDateString("id-ID"),
      r.lokasi,
      r.titik_sampling ?? "-",
      r.ph,
      r.do_mgl,
      r.salinitas_ppt,
      r.tss_mgl,
      r.suhu_c,
      r.latitude,
      r.longitude,
      r.keterangan ?? "-",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Kualitas Air");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=BCG-KualitasAir-${Date.now()}.xlsx`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengexport data" },
      { status: 500 }
    );
  }
}
