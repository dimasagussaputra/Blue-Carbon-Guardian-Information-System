import { createClient } from "@/lib/supabase/server";
import type { TegakanListParams, TegakanListResponse, TegakanRecord } from "./types";
import { extractKodeZona, transformTegakanRow } from "./types";

export async function getTegakanList(
  params: TegakanListParams
): Promise<TegakanListResponse> {
  const supabase = await createClient();
  const {
    search,
    status,
    spesies,
    sortBy = "kode_tegakan",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = params;

  let query = supabase
    .from("tegakan")
    .select("*, area_monitoring(nama)", { count: "exact" })
    .is("deleted_at", null);

  if (search) {
    query = query.or(
      `kode_tegakan.ilike.%${search}%,spesies.ilike.%${search}%`
    );
  }

  if (status) {
    query = query.eq("health_status", status);
  }

  if (spesies) {
    query = query.eq("spesies", spesies);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(from, to);

  if (error) {
    console.error("Error fetching tegakan list:", error);
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  return {
    data: ((data ?? []) as Record<string, unknown>[]).map(transformTegakanRow),
    total: count ?? 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

export async function getTegakanById(id: string): Promise<TegakanRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tegakan")
    .select("*, area_monitoring(nama)")
    .eq("id", id)
    .single();

  if (!data) return null;
  return transformTegakanRow(data as Record<string, unknown>);
}

export async function generateKodeTegakan(zonaNama: string): Promise<string> {
  const kodeZona = extractKodeZona(zonaNama);
  const supabase = await createClient();
  const { data } = await supabase
    .from("tegakan")
    .select("kode_tegakan")
    .ilike("kode_tegakan", `MKG-${kodeZona}-%`)
    .is("deleted_at", null)
    .order("kode_tegakan", { ascending: false })
    .limit(1);

  const lastCode = data?.[0]?.kode_tegakan;
  let lastNum = 0;
  if (lastCode) {
    const parts = lastCode.split("-");
    lastNum = parseInt(parts[parts.length - 1], 10) || 0;
  }
  const nextNum = lastNum + 1;
  return `MKG-${kodeZona}-${String(nextNum).padStart(3, "0")}`;
}

export async function createTegakan(data: {
  kode_tegakan: string;
  tanggal: string;
  area_id: string;
  latitude: number;
  longitude: number;
  spesies: string;
  health_status: string;
  foto_url?: string | null;
  keterangan?: string | null;
}): Promise<TegakanRecord | null> {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("tegakan")
    .insert({
      kode_tegakan: data.kode_tegakan,
      tanggal: data.tanggal,
      area_id: data.area_id,
      latitude: data.latitude,
      longitude: data.longitude,
      spesies: data.spesies,
      health_status: data.health_status,
      foto_url: data.foto_url ?? null,
      keterangan: data.keterangan ?? null,
    })
    .select("*, area_monitoring(nama)")
    .single();

  if (error) {
    console.error("Error creating tegakan:", error);
    throw new Error(error.message);
  }

  return transformTegakanRow(record as Record<string, unknown>);
}

export async function updateTegakan(
  id: string,
  data: {
    tanggal: string;
    area_id: string;
    latitude: number;
    longitude: number;
    spesies: string;
    health_status: string;
    foto_url?: string | null;
    keterangan?: string | null;
  }
): Promise<TegakanRecord | null> {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("tegakan")
    .update({
      tanggal: data.tanggal,
      area_id: data.area_id,
      latitude: data.latitude,
      longitude: data.longitude,
      spesies: data.spesies,
      health_status: data.health_status,
      foto_url: data.foto_url ?? null,
      keterangan: data.keterangan ?? null,
    })
    .eq("id", id)
    .select("*, area_monitoring(nama)")
    .single();

  if (error) {
    console.error("Error updating tegakan:", error);
    throw new Error(error.message);
  }

  return transformTegakanRow(record as Record<string, unknown>);
}

export async function deleteTegakan(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tegakan")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting tegakan:", error);
    throw new Error(error.message);
  }
}

export async function getAllTegakanForExport(
  params: Pick<TegakanListParams, "search" | "status" | "spesies">
): Promise<TegakanRecord[]> {
  const supabase = await createClient();
  const { search, status, spesies } = params;

  let query = supabase
    .from("tegakan")
    .select("*, area_monitoring(nama)")
    .is("deleted_at", null);

  if (search) {
    query = query.or(
      `kode_tegakan.ilike.%${search}%,spesies.ilike.%${search}%`
    );
  }

  if (status) {
    query = query.eq("health_status", status);
  }

  if (spesies) {
    query = query.eq("spesies", spesies);
  }

  const { data } = await query.order("kode_tegakan", { ascending: true });
  return ((data ?? []) as Record<string, unknown>[]).map(transformTegakanRow);
}
