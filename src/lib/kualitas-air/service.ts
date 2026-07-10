import { createClient } from "@/lib/supabase/server";
import type {
  KualitasAirListParams,
  KualitasAirListResponse,
  KualitasAirRecord,
  KualitasAirTrendPoint,
  KualitasAirComparisonPoint,
} from "./types";
import { transformKualitasAirRow } from "./types";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export async function getKualitasAirList(
  params: KualitasAirListParams
): Promise<KualitasAirListResponse> {
  const supabase = await createClient();
  const {
    search,
    area_id,
    start_date,
    end_date,
    sortBy = "tanggal",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  let query = supabase
    .from("kualitas_air")
    .select("*, area_monitoring(nama)", { count: "exact" })
    .is("deleted_at", null);

  if (search) {
    query = query.or(
      `titik_sampling.ilike.%${search}%,keterangan.ilike.%${search}%`
    );
  }

  if (area_id) {
    query = query.eq("area_id", area_id);
  }

  if (start_date) {
    query = query.gte("tanggal", start_date);
  }

  if (end_date) {
    query = query.lte("tanggal", end_date);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(from, to);

  if (error) {
    console.error("Error fetching kualitas air list:", error);
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  return {
    data: ((data ?? []) as Record<string, unknown>[]).map(transformKualitasAirRow),
    total: count ?? 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

export async function getKualitasAirById(
  id: string
): Promise<KualitasAirRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kualitas_air")
    .select("*, area_monitoring(nama)")
    .eq("id", id)
    .single();

  if (!data) return null;
  return transformKualitasAirRow(data as Record<string, unknown>);
}

export async function getKualitasAirTrend(
  area_id?: string,
  start_date?: string,
  end_date?: string
): Promise<KualitasAirTrendPoint[]> {
  const supabase = await createClient();

  let query = supabase
    .from("kualitas_air")
    .select("tanggal, ph, do_mgl, salinitas_ppt, tss_mgl, suhu_c")
    .is("deleted_at", null)
    .order("tanggal", { ascending: true });

  if (area_id) query = query.eq("area_id", area_id);
  if (start_date) query = query.gte("tanggal", start_date);
  if (end_date) query = query.lte("tanggal", end_date);

  const { data } = await query;

  if (!data || data.length === 0) return [];

  const monthly: Record<
    string,
    { ph: number[]; do: number[]; salinitas: number[]; tss: number[]; suhu: number[] }
  > = {};

  for (const k of data) {
    const key = MONTHS[new Date(k.tanggal).getMonth()];
    if (!monthly[key]) {
      monthly[key] = { ph: [], do: [], salinitas: [], tss: [], suhu: [] };
    }
    if (k.ph != null) monthly[key].ph.push(k.ph);
    if (k.do_mgl != null) monthly[key].do.push(k.do_mgl);
    if (k.salinitas_ppt != null) monthly[key].salinitas.push(k.salinitas_ppt);
    if (k.tss_mgl != null) monthly[key].tss.push(k.tss_mgl);
    if (k.suhu_c != null) monthly[key].suhu.push(k.suhu_c);
  }

  const avg = (arr: number[]) =>
    arr.length > 0
      ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
      : 0;

  return Object.entries(monthly).map(([bulan, data]) => ({
    bulan,
    ph: avg(data.ph),
    do: avg(data.do),
    salinitas: avg(data.salinitas),
    tss: avg(data.tss),
    suhu: avg(data.suhu),
  }));
}

export async function getKualitasAirComparison(
  start_date?: string,
  end_date?: string
): Promise<KualitasAirComparisonPoint[]> {
  const supabase = await createClient();

  let query = supabase
    .from("kualitas_air")
    .select("ph, do_mgl, salinitas_ppt, tss_mgl, suhu_c, area_monitoring(nama)")
    .is("deleted_at", null)
    .order("tanggal", { ascending: true });

  if (start_date) query = query.gte("tanggal", start_date);
  if (end_date) query = query.lte("tanggal", end_date);

  const { data } = await query;

  if (!data || data.length === 0) return [];

  const grouped: Record<
    string,
    { ph: number[]; do: number[]; salinitas: number[]; tss: number[]; suhu: number[] }
  > = {};

  for (const k of data) {
    const areaRaw = k.area_monitoring as { nama?: string } | null;
    const nama = areaRaw?.nama ?? "Tanpa Lokasi";
    if (!grouped[nama]) {
      grouped[nama] = { ph: [], do: [], salinitas: [], tss: [], suhu: [] };
    }
    if (k.ph != null) grouped[nama].ph.push(k.ph);
    if (k.do_mgl != null) grouped[nama].do.push(k.do_mgl);
    if (k.salinitas_ppt != null) grouped[nama].salinitas.push(k.salinitas_ppt);
    if (k.tss_mgl != null) grouped[nama].tss.push(k.tss_mgl);
    if (k.suhu_c != null) grouped[nama].suhu.push(k.suhu_c);
  }

  const avg = (arr: number[]) =>
    arr.length > 0
      ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
      : 0;

  return Object.entries(grouped)
    .filter(([, v]) => v.ph.length > 0)
    .map(([lokasi, data]) => ({
      lokasi,
      ph: avg(data.ph),
      do: avg(data.do),
      salinitas: avg(data.salinitas),
      tss: avg(data.tss),
      suhu: avg(data.suhu),
      jumlah: data.ph.length,
    }));
}

export async function createKualitasAir(data: {
  tanggal: string;
  area_id: string;
  titik_sampling?: string | null;
  ph: number;
  do_mgl: number;
  salinitas_ppt: number;
  tss_mgl: number;
  suhu_c: number;
  latitude: number;
  longitude: number;
  keterangan?: string | null;
}): Promise<KualitasAirRecord | null> {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("kualitas_air")
    .insert({
      tanggal: data.tanggal,
      area_id: data.area_id,
      titik_sampling: data.titik_sampling ?? null,
      ph: data.ph,
      do_mgl: data.do_mgl,
      salinitas_ppt: data.salinitas_ppt,
      tss_mgl: data.tss_mgl,
      suhu_c: data.suhu_c,
      latitude: data.latitude,
      longitude: data.longitude,
      keterangan: data.keterangan ?? null,
    })
    .select("*, area_monitoring(nama)")
    .single();

  if (error) {
    console.error("Error creating kualitas air:", error);
    throw new Error(error.message);
  }

  return transformKualitasAirRow(record as Record<string, unknown>);
}

export async function updateKualitasAir(
  id: string,
  data: {
    tanggal: string;
    area_id: string;
    titik_sampling?: string | null;
    ph: number;
    do_mgl: number;
    salinitas_ppt: number;
    tss_mgl: number;
    suhu_c: number;
    latitude: number;
    longitude: number;
    keterangan?: string | null;
  }
): Promise<KualitasAirRecord | null> {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("kualitas_air")
    .update({
      tanggal: data.tanggal,
      area_id: data.area_id,
      titik_sampling: data.titik_sampling ?? null,
      ph: data.ph,
      do_mgl: data.do_mgl,
      salinitas_ppt: data.salinitas_ppt,
      tss_mgl: data.tss_mgl,
      suhu_c: data.suhu_c,
      latitude: data.latitude,
      longitude: data.longitude,
      keterangan: data.keterangan ?? null,
    })
    .eq("id", id)
    .select("*, area_monitoring(nama)")
    .single();

  if (error) {
    console.error("Error updating kualitas air:", error);
    throw new Error(error.message);
  }

  return transformKualitasAirRow(record as Record<string, unknown>);
}

export async function deleteKualitasAir(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("kualitas_air")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting kualitas air:", error);
    throw new Error(error.message);
  }
}

export async function getAllKualitasAirForExport(
  params: Pick<KualitasAirListParams, "search" | "area_id" | "start_date" | "end_date">
): Promise<KualitasAirRecord[]> {
  const supabase = await createClient();
  const { search, area_id, start_date, end_date } = params;

  let query = supabase
    .from("kualitas_air")
    .select("*, area_monitoring(nama)")
    .is("deleted_at", null);

  if (search) {
    query = query.or(
      `titik_sampling.ilike.%${search}%,keterangan.ilike.%${search}%`
    );
  }

  if (area_id) query = query.eq("area_id", area_id);
  if (start_date) query = query.gte("tanggal", start_date);
  if (end_date) query = query.lte("tanggal", end_date);

  const { data } = await query.order("tanggal", { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map(transformKualitasAirRow);
}
