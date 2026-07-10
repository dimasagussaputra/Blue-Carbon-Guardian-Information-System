import { createClient } from "@/lib/supabase/server";
import type {
  BlueCarbonRecord,
  BlueCarbonListParams,
  BlueCarbonListResponse,
} from "./types";
import { transformBlueCarbonRow } from "./types";

export async function saveBlueCarbonCalculation(result: {
  area_ha: number;
  mangrove_type: string;
  lokasi?: string | null;
  density_per_ha: number | null;
  avg_dbh_cm: number | null;
  carbon_price: number;
  metode: string;
  biomassa_kg: number;
  karbon_kg: number;
  co2_ekuivalen_kg: number;
  nilai_ekonomi: number;
  nilai_ekonomi_idr: number;
  breakdown: { step: number; label: string; formula: string; nilai: string; satuam: string; sumber: string }[];
  referensi: string[];
  mangrove_label: string;
}): Promise<BlueCarbonRecord | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("blue_carbon_calculations")
    .insert({
      user_id: user?.user?.id ?? null,
      lokasi: result.lokasi ?? null,
      area_ha: result.area_ha,
      mangrove_type: result.mangrove_type,
      density_per_ha: result.density_per_ha,
      avg_dbh_cm: result.avg_dbh_cm,
      carbon_price: result.carbon_price,
      metode: result.metode,
      biomassa_kg: result.biomassa_kg,
      karbon_kg: result.karbon_kg,
      co2_ekuivalen: result.co2_ekuivalen_kg,
      nilai_ekonomi: result.nilai_ekonomi,
      nilai_ekonomi_idr: result.nilai_ekonomi_idr,
      detail_json: {
        breakdown: result.breakdown,
        referensi: result.referensi,
        mangrove_label: result.mangrove_label,
      },
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving blue carbon calculation:", error);
    throw new Error(error.message);
  }

  return transformBlueCarbonRow(data as Record<string, unknown>);
}

export async function getBlueCarbonHistory(
  params: BlueCarbonListParams
): Promise<BlueCarbonListResponse> {
  const supabase = await createClient();
  const { page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc" } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("blue_carbon_calculations")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(from, to);

  if (error) {
    console.error("Error fetching blue carbon history:", error);
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  return {
    data: ((data ?? []) as Record<string, unknown>[]).map(transformBlueCarbonRow),
    total: count ?? 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

export async function getBlueCarbonById(
  id: string
): Promise<BlueCarbonRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blue_carbon_calculations")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) return null;
  return transformBlueCarbonRow(data as Record<string, unknown>);
}

export async function deleteBlueCarbonCalculation(
  id: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("blue_carbon_calculations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting blue carbon calculation:", error);
    throw new Error(error.message);
  }
}
