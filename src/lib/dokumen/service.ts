import { createClient } from "@/lib/supabase/server";
import type { DokumenRecord, KategoriDokumen } from "./types";

export async function getDokumenList(
  kategori?: KategoriDokumen | ""
): Promise<{ data: DokumenRecord[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("dokumen")
    .select("*", { count: "exact" })
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

  const { data: record, error: fetchError } = await supabase
    .from("dokumen")
    .select("file_path")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const { error: storageError } = await supabase.storage
    .from("dokumen")
    .remove([record.file_path]);

  if (storageError && !storageError.message?.includes("not found")) {
    throw new Error(storageError.message);
  }

  const { error: deleteError } = await supabase
    .from("dokumen")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}
