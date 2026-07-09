-- =============================================================================
-- Blue Carbon Guardian — Blue Carbon Calculations
-- Mengganti tabel blue_carbon (per-tegakan) dengan blue_carbon_calculations (per-area)
-- =============================================================================

DROP TABLE IF EXISTS public.blue_carbon CASCADE;

CREATE TABLE IF NOT EXISTS public.blue_carbon_calculations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  area_ha       NUMERIC(10,2) NOT NULL,
  lokasi        TEXT,
  mangrove_type TEXT NOT NULL DEFAULT 'mixed',
  density_per_ha NUMERIC(8,2),
  avg_dbh_cm    NUMERIC(5,2),
  carbon_price  NUMERIC(10,2) NOT NULL DEFAULT 10,
  metode        TEXT NOT NULL DEFAULT 'ipcc_tier1',
  biomassa_kg   NUMERIC(14,2),
  karbon_kg     NUMERIC(14,2),
  co2_ekuivalen NUMERIC(14,2),
  nilai_ekonomi NUMERIC(18,2),
  nilai_ekonomi_idr NUMERIC(22,2),
  detail_json   JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.blue_carbon_calculations IS 'Riwayat kalkulasi estimasi blue carbon berbasis luas area';
COMMENT ON COLUMN public.blue_carbon_calculations.metode IS 'Metode: ipcc_tier1 (default), allometric (dengan DBH)';
COMMENT ON COLUMN public.blue_carbon_calculations.detail_json IS 'JSON berisi breakdown per langkah dan referensi';

CREATE INDEX IF NOT EXISTS blue_carbon_calc_user_idx ON public.blue_carbon_calculations (user_id);
CREATE INDEX IF NOT EXISTS blue_carbon_calc_created_idx ON public.blue_carbon_calculations (created_at DESC);

-- ---------------------------------------------------------------------------
-- RLS: hanya admin yang bisa akses blue_carbon_calculations
-- ---------------------------------------------------------------------------
ALTER TABLE public.blue_carbon_calculations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access blue_carbon_calculations" ON public.blue_carbon_calculations;
CREATE POLICY "Admin full access blue_carbon_calculations"
  ON public.blue_carbon_calculations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
