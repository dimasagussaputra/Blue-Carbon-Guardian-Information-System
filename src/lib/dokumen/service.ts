import { createClient } from "@/lib/supabase/server";
import type { DokumenRecord, KategoriDokumen } from "./types";

export async function getDokumenList(
  kategori?: KategoriDokumen | ""
): Promise<{ data: DokumenRecord[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("dokumen")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (kategori) {
    query = query.eq("kategori", kategori);
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return { data: (data as DokumenRecord[]) || [], total: count || 0 };
}

export async function createDokumen(
  record: Pick<
    DokumenRecord,
    "kategori" | "judul" | "deskripsi" | "file_path" | "file_type" | "file_size" | "public_url"
  >
): Promise<DokumenRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dokumen")
    .insert(record)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DokumenRecord;
}

export async function deleteDokumen(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("dokumen")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
