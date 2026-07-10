export const KATEGORI_GALERI = [
  "before",
  "after",
  "monitoring",
  "penyulaman",
  "edukasi",
  "clean_up",
] as const;

export type KategoriGaleri = (typeof KATEGORI_GALERI)[number];

export const LABEL_KATEGORI: Record<KategoriGaleri, string> = {
  before: "Before",
  after: "After",
  monitoring: "Monitoring",
  penyulaman: "Penyulaman",
  edukasi: "Edukasi",
  clean_up: "Clean Up",
};

export interface GaleriRecord {
  id: string;
  kategori: KategoriGaleri;
  judul: string;
  deskripsi: string;
  tanggal: string | null;
  file_path: string;
  public_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GaleriListResponse {
  data: GaleriRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
