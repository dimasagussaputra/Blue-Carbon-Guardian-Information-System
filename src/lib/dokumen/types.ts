export const KATEGORI_DOKUMEN = [
  "proposal",
  "laporan",
  "sop",
  "dokumentasi",
] as const;

export type KategoriDokumen = (typeof KATEGORI_DOKUMEN)[number];

export const LABEL_KATEGORI: Record<KategoriDokumen, string> = {
  proposal: "Proposal",
  laporan: "Laporan",
  sop: "SOP",
  dokumentasi: "Dokumentasi",
};

export interface DokumenRecord {
  id: string;
  kategori: KategoriDokumen;
  judul: string;
  deskripsi: string;
  file_path: string;
  file_type: string;
  file_size: number;
  public_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DokumenListResponse {
  data: DokumenRecord[];
  total: number;
}
