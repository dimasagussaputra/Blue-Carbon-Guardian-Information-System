import { createClient } from "@/lib/supabase/server";
import type {
  PenyulamanListParams,
  PenyulamanListResponse,
  PenyulamanRecord,
  PenyulamanStats,
} from "./types";
import { transformPenyulamanRow } from "./types";

export async function getPenyulamanList(
  params: PenyulamanListParams
): Promise<PenyulamanListResponse> {
  const supabase = await createClient();
  const {
    search,
    gelombang,
    status,
    sortBy = "tanggal",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  let query = supabase
    .from("penyulaman")
    .select("*", { count: "exact" })
    .is("deleted_at", null);

  if (search) {
    query = query.or(`spesies.ilike.%${search}%,keterangan.ilike.%${search}%`);
  }

  if (gelombang) {
    query = query.eq("gelombang", Number(gelombang));
  }

  if (status) {
    query = query.eq("status", status);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(from, to);

  if (error) {
    console.error("Error fetching penyulaman list:", error);
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  return {
    data: ((data ?? []) as Record<string, unknown>[]).map(transformPenyulamanRow),
    total: count ?? 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

export async function getPenyulamanById(
  id: string
): Promise<PenyulamanRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("penyulaman")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) return null;
  return transformPenyulamanRow(data as Record<string, unknown>);
}

export async function getPenyulamanStats(
  gelombang?: string
): Promise<PenyulamanStats> {
  const supabase = await createClient();

  let baseQuery = supabase.from("penyulaman").select(
    "jumlah_bibit, jumlah_hidup, gelombang",
    { count: "exact" }
  ).is("deleted_at", null);

  if (gelombang) {
    baseQuery = baseQuery.eq("gelombang", Number(gelombang));
  }

  const { data, count } = await baseQuery;

  const records = (data ?? []) as {
    jumlah_bibit: number;
    jumlah_hidup: number | null;
    gelombang: number;
  }[];

  const total_kegiatan = count ?? 0;
  const total_bibit = records.reduce(
    (sum, r) => sum + Number(r.jumlah_bibit),
    0
  );
  const total_hidup = records.reduce(
    (sum, r) => sum + (r.jumlah_hidup ? Number(r.jumlah_hidup) : 0),
    0
  );
  const survival_rate = total_bibit > 0 ? Math.round((total_hidup / total_bibit) * 100) : null;

  const gel1 = records.filter((r) => r.gelombang === 1);
  const gel2 = records.filter((r) => r.gelombang === 2);

  return {
    total_kegiatan,
    total_bibit,
    total_hidup,
    survival_rate,
    total_gelombang_1: gel1.length,
    total_bibit_gelombang_1: gel1.reduce((s, r) => s + Number(r.jumlah_bibit), 0),
    total_gelombang_2: gel2.length,
    total_bibit_gelombang_2: gel2.reduce((s, r) => s + Number(r.jumlah_bibit), 0),
  };
}

export async function createPenyulaman(data: {
  tanggal: string;
  gelombang: number;
  spesies: string;
  jumlah_bibit: number;
  jumlah_hidup?: number | null;
  latitude: number;
  longitude: number;
  foto_url?: string | null;
  status: string;
  keterangan?: string | null;
}): Promise<PenyulamanRecord | null> {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("penyulaman")
    .insert({
      tanggal: data.tanggal,
      gelombang: data.gelombang,
      spesies: data.spesies,
      jumlah_bibit: data.jumlah_bibit,
      jumlah_hidup: data.jumlah_hidup ?? null,
      latitude: data.latitude,
      longitude: data.longitude,
      foto_url: data.foto_url ?? null,
      status: data.status,
      keterangan: data.keterangan ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating penyulaman:", error);
    throw new Error(error.message);
  }

  return transformPenyulamanRow(record as Record<string, unknown>);
}

export async function updatePenyulaman(
  id: string,
  data: {
    tanggal: string;
    gelombang: number;
    spesies: string;
    jumlah_bibit: number;
    jumlah_hidup?: number | null;
    latitude: number;
    longitude: number;
    foto_url?: string | null;
    status: string;
    keterangan?: string | null;
  }
): Promise<PenyulamanRecord | null> {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("penyulaman")
    .update({
      tanggal: data.tanggal,
      gelombang: data.gelombang,
      spesies: data.spesies,
      jumlah_bibit: data.jumlah_bibit,
      jumlah_hidup: data.jumlah_hidup ?? null,
      latitude: data.latitude,
      longitude: data.longitude,
      foto_url: data.foto_url ?? null,
      status: data.status,
      keterangan: data.keterangan ?? null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating penyulaman:", error);
    throw new Error(error.message);
  }

  return transformPenyulamanRow(record as Record<string, unknown>);
}

export async function deletePenyulaman(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("penyulaman")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting penyulaman:", error);
    throw new Error(error.message);
  }
}

export async function getAllPenyulamanForExport(
  params: Pick<PenyulamanListParams, "search" | "gelombang" | "status">
): Promise<PenyulamanRecord[]> {
  const supabase = await createClient();
  const { search, gelombang, status } = params;

  let query = supabase
    .from("penyulaman")
    .select("*")
    .is("deleted_at", null);

  if (search) {
    query = query.or(`spesies.ilike.%${search}%,keterangan.ilike.%${search}%`);
  }

  if (gelombang) {
    query = query.eq("gelombang", Number(gelombang));
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query.order("tanggal", { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map(transformPenyulamanRow);
}
