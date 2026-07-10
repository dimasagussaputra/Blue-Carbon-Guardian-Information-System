import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TABLES = [
  "tegakan", "monitoring", "penyulaman", "kualitas_air",
  "blue_carbon_calculations", "galeri", "dokumen", "area_monitoring",
];

async function deleteStorageFile(table: string, filePath: string) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  let bucket: string;
  if (table === "galeri") bucket = "galeri";
  else if (table === "dokumen") bucket = "dokumen";
  else return;

  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error && !error.message?.includes("not found")) {
    console.error(`Error deleting storage file from ${bucket}:`, error);
  }
}

export async function DELETE(
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

    // Fetch file_path for storage tables before deleting
    if (table === "galeri" || table === "dokumen") {
      const { data: record, error: fetchError } = await supabase
        .from(table)
        .select("file_path")
        .eq("id", id)
        .single();

      if (!fetchError && record?.file_path) {
        await deleteStorageFile(table, record.file_path);
      }
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghapus data permanen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
