import { createClient } from "@/lib/supabase/server";
import type { GaleriRecord, KategoriGaleri } from "./types";

export async function getGaleriList(
  kategori?: KategoriGaleri | ""
): Promise<{ data: GaleriRecord[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("galeri")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (kategori) {
    query = query.eq("kategori", kategori);
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return { data: (data as GaleriRecord[]) || [], total: count || 0 };
}

export async function createGaleri(
  record: Pick<GaleriRecord, "kategori" | "judul" | "deskripsi" | "file_path" | "public_url">
): Promise<GaleriRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("galeri")
    .insert(record)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as GaleriRecord;
}

export async function updateGaleri(
  id: string,
  data: Partial<Pick<GaleriRecord, "judul" | "deskripsi" | "tanggal" | "kategori">>
): Promise<GaleriRecord> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("galeri")
    .update(data)
    .eq("id", id);

  if (error) throw new Error(error.message);

  const { data: updated, error: fetchError } = await supabase
    .from("galeri")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  return updated as GaleriRecord;
}

export async function deleteGaleri(id: string): Promise<void> {
  const supabase = await createClient();

  const { data: record, error: fetchError } = await supabase
    .from("galeri")
    .select("file_path")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const { error: storageError } = await supabase.storage
    .from("galeri")
    .remove([record.file_path]);

  if (storageError && !storageError.message?.includes("not found")) {
    throw new Error(storageError.message);
  }

  const { error: deleteError } = await supabase
    .from("galeri")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}
