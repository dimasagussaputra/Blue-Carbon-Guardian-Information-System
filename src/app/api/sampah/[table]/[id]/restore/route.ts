import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TABLES = [
  "tegakan", "monitoring", "penyulaman", "kualitas_air",
  "blue_carbon_calculations", "galeri", "dokumen", "area_monitoring",
];

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  try {
    const { table, id } = await params;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: "Tabel tidak valid" }, { status: 400 });
    }

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { error } = await supabase
      .from(table)
      .update({ deleted_at: null })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memulihkan data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
