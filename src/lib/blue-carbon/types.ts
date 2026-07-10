import { z } from "zod";

export const blueCarbonInputSchema = z.object({
  area_ha: z
    .number("Luas area harus diisi")
    .positive("Luas area harus lebih dari 0")
    .max(999999.99, "Luas area terlalu besar"),
  mangrove_type: z.string().min(1, "Jenis mangrove harus dipilih"),
  density_per_ha: z.number().positive().nullish(),
  avg_dbh_cm: z.number().min(0).max(200).nullish(),
  carbon_price: z
    .number("Harga karbon harus diisi")
    .min(0, "Harga karbon minimal 0"),
  lokasi: z.string().nullish(),
});

export type BlueCarbonInput = z.infer<typeof blueCarbonInputSchema>;

export interface BlueCarbonResult {
  area_ha: number;
  mangrove_type: string;
  mangrove_label: string;
  density_per_ha: number | null;
  avg_dbh_cm: number | null;
  carbon_price: number;
  biomassa_kg: number;
  biomassa_tons: number;
  karbon_kg: number;
  karbon_tons: number;
  co2_ekuivalen_kg: number;
  co2_ekuivalen_tons: number;
  nilai_ekonomi: number;
  nilai_ekonomi_idr: number;
  metode: string;
  breakdown: CalculationBreakdown[];
  referensi: string[];
}

export interface CalculationBreakdown {
  step: number;
  label: string;
  formula: string;
  nilai: string;
  satuam: string;
  sumber: string;
}

export interface BlueCarbonRecord {
  id: string;
  user_id: string | null;
  area_ha: number;
  lokasi: string | null;
  mangrove_type: string;
  density_per_ha: number | null;
  avg_dbh_cm: number | null;
  carbon_price: number;
  metode: string;
  biomassa_kg: number;
  karbon_kg: number;
  co2_ekuivalen: number;
  nilai_ekonomi: number;
  nilai_ekonomi_idr: number;
  detail_json: Record<string, unknown> | null;
  created_at: string;
  deleted_at: string | null;
}

export interface BlueCarbonListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BlueCarbonListResponse {
  data: BlueCarbonRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function transformBlueCarbonRow(raw: Record<string, unknown>): BlueCarbonRecord {
  return {
    id: raw.id as string,
    user_id: (raw.user_id as string) ?? null,
    area_ha: Number(raw.area_ha),
    lokasi: (raw.lokasi as string) ?? null,
    mangrove_type: raw.mangrove_type as string,
    density_per_ha: raw.density_per_ha ? Number(raw.density_per_ha) : null,
    avg_dbh_cm: raw.avg_dbh_cm ? Number(raw.avg_dbh_cm) : null,
    carbon_price: Number(raw.carbon_price),
    metode: raw.metode as string,
    biomassa_kg: Number(raw.biomassa_kg),
    karbon_kg: Number(raw.karbon_kg),
    co2_ekuivalen: Number(raw.co2_ekuivalen),
    nilai_ekonomi: Number(raw.nilai_ekonomi),
    nilai_ekonomi_idr: Number(raw.nilai_ekonomi_idr ?? 0),
    detail_json: raw.detail_json as Record<string, unknown> | null,
    created_at: raw.created_at as string,
    deleted_at: (raw.deleted_at as string) ?? null,
  };
}
