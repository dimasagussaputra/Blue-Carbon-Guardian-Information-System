import { createClient } from "@/lib/supabase/server";
import type {
  MonitoringListParams,
  MonitoringListResponse,
  MonitoringRecord,
} from "./types";
import { transformMonitoringRow } from "./types";

export async function getMonitoringList(
  params: MonitoringListParams
): Promise<MonitoringListResponse> {
  const supabase = await createClient();
  const {
    tegakan_id,
    search,
    sortBy = "tanggal",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  let query = supabase
    .from("monitoring")
    .select("*, tegakan(kode_tegakan)", { count: "exact" })
    .is("deleted_at", null);

  if (tegakan_id) {
    query = query.eq("tegakan_id", tegakan_id);
  }

  if (search) {
    query = query.or(`catatan.ilike.%${search}%,tegakan.kode_tegakan.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(from, to);

  if (error) {
    console.error("Error fetching monitoring list:", error);
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  return {
    data: ((data ?? []) as Record<string, unknown>[]).map(transformMonitoringRow),
    total: count ?? 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

export async function getMonitoringById(
  id: string
): Promise<MonitoringRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("monitoring")
    .select("*, tegakan(kode_tegakan)")
    .eq("id", id)
    .single();

  if (!data) return null;
  return transformMonitoringRow(data as Record<string, unknown>);
}

export async function getAllMonitoringForExport(
  tegakan_id?: string
): Promise<MonitoringRecord[]> {
  const supabase = await createClient();
  let query = supabase
    .from("monitoring")
    .select("*, tegakan(kode_tegakan)")
    .is("deleted_at", null);

  if (tegakan_id) {
    query = query.eq("tegakan_id", tegakan_id);
  }

  const { data } = await query.order("tanggal", { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map(transformMonitoringRow);
}

export async function createMonitoring(data: {
  tegakan_id: string;
  tanggal: string;
  tinggi_cm: number;
  diameter_cm?: number | null;
  health_status: string;
  survia?: boolean;
  catatan?: string | null;
  foto_url?: string | null;
}): Promise<MonitoringRecord | null> {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("monitoring")
    .insert({
      tegakan_id: data.tegakan_id,
      tanggal: data.tanggal,
      tinggi_cm: data.tinggi_cm,
      diameter_cm: data.diameter_cm ?? null,
      health_status: data.health_status,
      survia: data.survia ?? true,
      catatan: data.catatan ?? null,
      foto_url: data.foto_url ?? null,
    })
    .select("*, tegakan(kode_tegakan)")
    .single();

  if (error) {
    console.error("Error creating monitoring:", error);
    throw new Error(error.message);
  }

  return transformMonitoringRow(record as Record<string, unknown>);
}

export async function updateMonitoring(
  id: string,
  data: {
    tanggal: string;
    tinggi_cm: number;
    diameter_cm?: number | null;
    health_status: string;
    survia?: boolean;
    catatan?: string | null;
    foto_url?: string | null;
  }
): Promise<MonitoringRecord | null> {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("monitoring")
    .update({
      tanggal: data.tanggal,
      tinggi_cm: data.tinggi_cm,
      diameter_cm: data.diameter_cm ?? null,
      health_status: data.health_status,
      survia: data.survia ?? true,
      catatan: data.catatan ?? null,
      foto_url: data.foto_url ?? null,
    })
    .eq("id", id)
    .select("*, tegakan(kode_tegakan)")
    .single();

  if (error) {
    console.error("Error updating monitoring:", error);
    throw new Error(error.message);
  }

  return transformMonitoringRow(record as Record<string, unknown>);
}

export async function deleteMonitoring(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("monitoring")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting monitoring:", error);
    throw new Error(error.message);
  }
}

export async function getGrowthData(
  tegakan_id: string
): Promise<{ tanggal: string; tinggi_cm: number; diameter_cm: number | null }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("monitoring")
    .select("tanggal, tinggi_cm, diameter_cm")
    .eq("tegakan_id", tegakan_id)
    .is("deleted_at", null)
    .order("tanggal", { ascending: true });

  return (data ?? []) as { tanggal: string; tinggi_cm: number; diameter_cm: number | null }[];
}

export async function getTimeline(
  tegakan_id: string
): Promise<MonitoringRecord[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("monitoring")
    .select("*, tegakan(kode_tegakan)")
    .eq("tegakan_id", tegakan_id)
    .is("deleted_at", null)
    .order("tanggal", { ascending: false });

  return ((data ?? []) as Record<string, unknown>[]).map(transformMonitoringRow);
}
