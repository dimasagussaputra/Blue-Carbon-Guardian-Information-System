import { NextRequest, NextResponse } from "next/server";
import { getBlueCarbonHistory } from "@/lib/blue-carbon/service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    let records;

    if (id) {
      const { getBlueCarbonById } = await import("@/lib/blue-carbon/service");
      const single = await getBlueCarbonById(id);
      records = single ? [single] : [];
    } else {
      const result = await getBlueCarbonHistory({ page: 1, limit: 1000 });
      records = result.data;
    }

    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();

    const header = [
      "Tanggal",
      "Luas Area (ha)",
      "Jenis Mangrove",
      "Kerapatan (pohon/ha)",
      "DBH (cm)",
      "Harga Karbon ($/ton)",
      "Metode",
      "Total Biomassa (kg)",
      "Total Karbon (kg)",
      "CO₂ Ekuivalen (kg)",
      "Nilai Ekonomi (USD)",
      "Nilai Ekonomi (IDR)",
    ];

    const rows = records.map((r) => [
      new Date(r.created_at).toLocaleDateString("id-ID"),
      r.area_ha,
      r.mangrove_type,
      r.density_per_ha ?? "-",
      r.avg_dbh_cm ?? "-",
      r.carbon_price,
      r.metode,
      r.biomassa_kg,
      r.karbon_kg,
      r.co2_ekuivalen,
      r.nilai_ekonomi,
      r.nilai_ekonomi_idr,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Blue Carbon");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=BCG-BlueCarbon-${Date.now()}.xlsx`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengexport data" },
      { status: 500 }
    );
  }
}
