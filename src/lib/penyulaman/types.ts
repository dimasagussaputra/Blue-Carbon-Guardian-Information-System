import { z } from "zod";

export const STATUS_OPTIONS = ["baik", "rusak", "mati"] as const;
export const GELOMBANG_OPTIONS = [1, 2] as const;

export const penyulamanSchema = z.object({
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  gelombang: z
    .number("Gelombang harus diisi")
    .int("Gelombang harus bilangan bulat")
    .min(1, "Gelombang minimal 1")
    .max(2, "Gelombang maksimal 2"),
  spesies: z.string().min(1, "Spesies harus dipilih"),
  jumlah_bibit: z
    .number("Jumlah bibit harus diisi")
    .int("Jumlah bibit harus bilangan bulat")
    .min(1, "Jumlah bibit minimal 1"),
  jumlah_hidup: z
    .number("Jumlah hidup harus diisi")
    .int("Jumlah hidup harus bilangan bulat")
    .min(0, "Jumlah hidup minimal 0")
    .optional()
    .nullable(),
  latitude: z
    .number("Latitude harus diisi")
    .min(-90, "Latitude minimal -90")
    .max(90, "Latitude maksimal 90"),
  longitude: z
    .number("Longitude harus diisi")
    .min(-180, "Longitude minimal -180")
    .max(180, "Longitude maksimal 180"),
  status: z.enum(STATUS_OPTIONS, "Status harus dipilih"),
  keterangan: z.string().optional(),
});

export interface PenyulamanFormData {
  tanggal: string;
  gelombang: number;
  spesies: string;
  jumlah_bibit: number;
  jumlah_hidup?: number | null;
  latitude: number;
  longitude: number;
  status: "baik" | "rusak" | "mati";
  keterangan?: string;
}

export interface PenyulamanRecord {
  id: string;
  tanggal: string;
  gelombang: number;
  spesies: string;
  jumlah_bibit: number;
  jumlah_hidup: number | null;
  survival_rate: number | null;
  latitude: number;
  longitude: number;
  foto_url: string | null;
  status: string;
  keterangan: string | null;
  area_id: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface PenyulamanListParams {
  search?: string;
  gelombang?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PenyulamanListResponse {
  data: PenyulamanRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PenyulamanStats {
  total_kegiatan: number;
  total_bibit: number;
  total_hidup: number;
  survival_rate: number | null;
  total_gelombang_1: number;
  total_bibit_gelombang_1: number;
  total_gelombang_2: number;
  total_bibit_gelombang_2: number;
}

export function calcSurvivalRate(
  jumlah_bibit: number,
  jumlah_hidup: number | null
): number | null {
  if (!jumlah_bibit || jumlah_hidup === null || jumlah_hidup === undefined)
    return null;
  return Math.round((jumlah_hidup / jumlah_bibit) * 100);
}

export function transformPenyulamanRow(
  raw: Record<string, unknown>
): PenyulamanRecord {
  const jmlBibit = Number(raw.jumlah_bibit);
  const jmlHidup =
    raw.jumlah_hidup !== null && raw.jumlah_hidup !== undefined
      ? Number(raw.jumlah_hidup)
      : null;

  return {
    id: raw.id as string,
    tanggal: raw.tanggal as string,
    gelombang: Number(raw.gelombang ?? 1),
    spesies: raw.spesies as string,
    jumlah_bibit: jmlBibit,
    jumlah_hidup: jmlHidup,
    survival_rate: calcSurvivalRate(jmlBibit, jmlHidup),
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    foto_url: (raw.foto_url as string) ?? null,
    status: (raw.status as string) ?? "baik",
    keterangan: (raw.keterangan as string) ?? null,
    area_id: (raw.area_id as string) ?? null,
    created_at: raw.created_at as string,
    deleted_at: (raw.deleted_at as string) ?? null,
  };
}
