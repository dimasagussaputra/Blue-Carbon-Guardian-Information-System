-- =============================================================================
-- Blue Carbon Guardian — Penyulaman Enhancement
-- Menambahkan kolom gelombang, foto_url, dan status ke tabel penyulaman
-- =============================================================================

ALTER TABLE public.penyulaman
  ADD COLUMN IF NOT EXISTS gelombang INTEGER NOT NULL DEFAULT 1
    CHECK (gelombang IN (1, 2));

ALTER TABLE public.penyulaman
  ADD COLUMN IF NOT EXISTS foto_url TEXT;

ALTER TABLE public.penyulaman
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'baik'
    CHECK (status IN ('baik', 'rusak', 'mati'));

COMMENT ON COLUMN public.penyulaman.gelombang IS 'Gelombang penanaman (1 atau 2)';
COMMENT ON COLUMN public.penyulaman.foto_url IS 'URL foto dokumentasi penyulaman';
COMMENT ON COLUMN public.penyulaman.status IS 'Status kondisi bibit: baik, rusak, mati';
