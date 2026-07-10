import { createClient } from "@/lib/supabase/server";
import type { GaleriRecord, KategoriGaleri, GaleriListResponse } from "./types";

export async function getGaleriList(
  kategori?: KategoriGaleri | "",
  page = 1,
  limit = 12
): Promise<GaleriListResponse> {
  const supabase = await createClient();

  let query = supabase
    .from("galeri")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (kategori) {
    query = query.eq("kategori", kategori);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: (data as GaleriRecord[]) || [],
    total: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

export async function getGaleriById(id: string): Promise<GaleriRecord> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("galeri")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) throw new Error(error.message);

  return data as GaleriRecord;
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

  const { error } = await supabase
    .from("galeri")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
