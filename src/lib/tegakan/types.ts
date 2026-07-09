import { z } from "zod";

export const STATUS_OPTIONS = ["hidup", "mati"] as const;

export const tegakanSchema = z.object({
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  area_id: z.string().min(1, "Zona monitoring harus dipilih"),
  latitude: z
    .number("Latitude harus diisi")
    .min(-90, "Latitude minimal -90")
    .max(90, "Latitude maksimal 90"),
  longitude: z
    .number("Longitude harus diisi")
    .min(-180, "Longitude minimal -180")
    .max(180, "Longitude maksimal 180"),
  spesies: z.string().min(1, "Spesies harus dipilih"),
  health_status: z.enum(STATUS_OPTIONS, "Status harus dipilih"),
  keterangan: z.string().optional(),
});

export type TegakanFormData = z.infer<typeof tegakanSchema>;

export interface TegakanRecord {
  id: string;
  kode_tegakan: string;
  tanggal: string;
  area_id: string | null;
  zona: string;
  latitude: number;
  longitude: number;
  spesies: string;
  health_status: string;
  foto_url: string | null;
  keterangan: string | null;
  created_at: string;
}

export interface TegakanListParams {
  search?: string;
  status?: string;
  spesies?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface TegakanListResponse {
  data: TegakanRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function extractKodeZona(nama: string): string {
  const cleaned = nama.replace(/^Blok\s*/i, "").replace(/^Zona\s*/i, "").trim();
  return cleaned || nama.charAt(0).toUpperCase();
}

export function transformTegakanRow(raw: Record<string, unknown>): TegakanRecord {
  const areaRaw = raw.area_monitoring as { nama?: string } | null;
  return {
    id: raw.id as string,
    kode_tegakan: raw.kode_tegakan as string,
    tanggal: raw.tanggal as string,
    area_id: (raw.area_id as string) ?? null,
    zona: areaRaw?.nama ?? "",
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    spesies: raw.spesies as string,
    health_status: raw.health_status as string,
    foto_url: (raw.foto_url as string) ?? null,
    keterangan: (raw.keterangan as string) ?? null,
    created_at: raw.created_at as string,
  };
}
