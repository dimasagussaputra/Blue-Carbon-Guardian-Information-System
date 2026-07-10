import { z } from "zod";

export const kualitasAirSchema = z.object({
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  area_id: z.string().min(1, "Lokasi harus dipilih"),
  titik_sampling: z.string().optional(),
  ph: z
    .number("pH harus diisi")
    .min(0, "pH minimal 0")
    .max(14, "pH maksimal 14"),
  do_mgl: z
    .number("DO harus diisi")
    .min(0, "DO minimal 0"),
  salinitas_ppt: z
    .number("Salinitas harus diisi")
    .min(0, "Salinitas minimal 0"),
  tss_mgl: z
    .number("TSS harus diisi")
    .min(0, "TSS minimal 0"),
  suhu_c: z
    .number("Suhu harus diisi")
    .min(-10, "Suhu minimal -10")
    .max(60, "Suhu maksimal 60"),
  latitude: z
    .number("Latitude harus diisi")
    .min(-90, "Latitude minimal -90")
    .max(90, "Latitude maksimal 90"),
  longitude: z
    .number("Longitude harus diisi")
    .min(-180, "Longitude minimal -180")
    .max(180, "Longitude maksimal 180"),
  keterangan: z.string().optional(),
});

export type KualitasAirFormData = z.infer<typeof kualitasAirSchema>;

export interface KualitasAirRecord {
  id: string;
  tanggal: string;
  area_id: string | null;
  lokasi: string;
  titik_sampling: string | null;
  ph: number;
  do_mgl: number;
  salinitas_ppt: number;
  tss_mgl: number;
  suhu_c: number;
  latitude: number;
  longitude: number;
  keterangan: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface KualitasAirListParams {
  search?: string;
  area_id?: string;
  start_date?: string;
  end_date?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface KualitasAirListResponse {
  data: KualitasAirRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KualitasAirTrendPoint {
  bulan: string;
  ph: number;
  do: number;
  salinitas: number;
  tss: number;
  suhu: number;
}

export interface KualitasAirComparisonPoint {
  lokasi: string;
  ph: number;
  do: number;
  salinitas: number;
  tss: number;
  suhu: number;
  jumlah: number;
}

export function transformKualitasAirRow(
  raw: Record<string, unknown>
): KualitasAirRecord {
  const areaRaw = raw.area_monitoring as { nama?: string } | null;
  return {
    id: raw.id as string,
    tanggal: raw.tanggal as string,
    area_id: (raw.area_id as string) ?? null,
    lokasi: areaRaw?.nama ?? "",
    titik_sampling: (raw.titik_sampling as string) ?? null,
    ph: Number(raw.ph),
    do_mgl: Number(raw.do_mgl),
    salinitas_ppt: Number(raw.salinitas_ppt),
    tss_mgl: Number(raw.tss_mgl),
    suhu_c: Number(raw.suhu_c),
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    keterangan: (raw.keterangan as string) ?? null,
    created_at: raw.created_at as string,
    deleted_at: (raw.deleted_at as string) ?? null,
  };
}
