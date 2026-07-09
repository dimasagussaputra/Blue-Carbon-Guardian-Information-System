import { z } from "zod";

export const KONDISI_OPTIONS = ["hidup", "mati", "stres", "sakit"] as const;

export const monitoringSchema = z.object({
  tegakan_id: z.string().min(1, "Tegakan harus dipilih"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  tinggi_cm: z
    .number("Tinggi harus diisi")
    .min(0, "Tinggi minimal 0"),
  diameter_cm: z
    .number("Diameter harus berupa angka")
    .min(0, "Diameter minimal 0")
    .optional()
    .nullable(),
  health_status: z.enum(KONDISI_OPTIONS, "Kondisi harus dipilih"),
  catatan: z.string().optional(),
});

export type MonitoringFormData = z.infer<typeof monitoringSchema>;

export interface MonitoringRecord {
  id: string;
  tegakan_id: string;
  kode_tegakan: string;
  tanggal: string;
  tinggi_cm: number;
  diameter_cm: number | null;
  health_status: string;
  survia: boolean;
  catatan: string | null;
  foto_url: string | null;
  created_at: string;
}

export interface MonitoringListParams {
  tegakan_id?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface MonitoringListResponse {
  data: MonitoringRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function transformMonitoringRow(
  raw: Record<string, unknown>
): MonitoringRecord {
  const tegakanRaw = raw.tegakan as { kode_tegakan?: string } | null;
  return {
    id: raw.id as string,
    tegakan_id: raw.tegakan_id as string,
    kode_tegakan: tegakanRaw?.kode_tegakan ?? "",
    tanggal: raw.tanggal as string,
    tinggi_cm: Number(raw.tinggi_cm),
    diameter_cm: (raw.diameter_cm as number) ?? null,
    health_status: raw.health_status as string,
    survia: (raw.survia as boolean) ?? true,
    catatan: (raw.catatan as string) ?? null,
    foto_url: (raw.foto_url as string) ?? null,
    created_at: raw.created_at as string,
  };
}
