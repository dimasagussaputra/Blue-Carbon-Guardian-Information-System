import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TABLES = [
  "tegakan",
  "monitoring",
  "penyulaman",
  "kualitas_air",
  "blue_carbon_calculations",
  "galeri",
  "dokumen",
  "area_monitoring",
] as const;

const TABLE_LABELS: Record<string, string> = {
  tegakan: "Tegakan",
  monitoring: "Monitoring",
  penyulaman: "Penyulaman",
  kualitas_air: "Kualitas Air",
  blue_carbon_calculations: "Blue Carbon",
  galeri: "Galeri",
  dokumen: "Dokumen",
  area_monitoring: "Area Monitoring",
};

export async function GET() {
  try {
    const supabase = await createClient();
    const result: Record<string, { records: Record<string, unknown>[]; total: number }> = {};

    for (const table of TABLES) {
      const { data, count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: false })
        .not("deleted_at", "is", null);

      if (error) {
        console.error(`Error fetching deleted records from ${table}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        result[table] = {
          records: data as Record<string, unknown>[],
          total: count ?? data.length,
        };
      }
    }

    return NextResponse.json({ tables: result, tableLabels: TABLE_LABELS });
  } catch (err) {
    console.error("Error fetching sampah data:", err);
    return NextResponse.json({ error: "Gagal memuat data sampah" }, { status: 500 });
  }
}
