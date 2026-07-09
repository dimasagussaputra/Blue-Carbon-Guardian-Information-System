-- =============================================================================
-- Blue Carbon Guardian — Dashboard Tables & Seed Data
-- Jalankan di: Supabase Dashboard → SQL Editor → New query
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. AREA MONITORING
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.area_monitoring (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        TEXT NOT NULL,
  luas_ha     NUMERIC(10,2) NOT NULL DEFAULT 0,
  deskripsi   TEXT,
  latitude    NUMERIC(10,7),
  longitude   NUMERIC(10,7),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.area_monitoring IS 'Zona / area monitoring mangrove';

-- ---------------------------------------------------------------------------
-- 2. TEGAKAN
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tegakan (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id       UUID REFERENCES public.area_monitoring(id) ON DELETE SET NULL,
  kode_tegakan  TEXT NOT NULL UNIQUE,
  spesies       TEXT NOT NULL,
  tinggi_cm     NUMERIC(8,2),
  diameter_cm   NUMERIC(8,2),
  health_status TEXT NOT NULL DEFAULT 'hidup'
                  CHECK (health_status IN ('hidup', 'mati', 'stres', 'sakit')),
  latitude      NUMERIC(10,7),
  longitude     NUMERIC(10,7),
  tanggal_tanam DATE NOT NULL DEFAULT CURRENT_DATE,
  keterangan    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.tegakan IS 'Data inventaris tegakan mangrove';

CREATE INDEX IF NOT EXISTS tegakan_area_idx ON public.tegakan (area_id);
CREATE INDEX IF NOT EXISTS tegakan_spesies_idx ON public.tegakan (spesies);
CREATE INDEX IF NOT EXISTS tegakan_health_idx ON public.tegakan (health_status);

-- ---------------------------------------------------------------------------
-- 3. MONITORING
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.monitoring (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tegakan_id    UUID NOT NULL REFERENCES public.tegakan(id) ON DELETE CASCADE,
  tanggal       DATE NOT NULL DEFAULT CURRENT_DATE,
  tinggi_cm     NUMERIC(8,2),
  diameter_cm   NUMERIC(8,2),
  health_status TEXT CHECK (health_status IN ('hidup', 'mati', 'stres', 'sakit')),
  survia        BOOLEAN DEFAULT true,
  catatan       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.monitoring IS 'Data monitoring periodik tegakan';

CREATE INDEX IF NOT EXISTS monitoring_tegakan_idx ON public.monitoring (tegakan_id);
CREATE INDEX IF NOT EXISTS monitoring_tanggal_idx ON public.monitoring (tanggal);

-- ---------------------------------------------------------------------------
-- 4. PENYULAMAN
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.penyulaman (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id       UUID REFERENCES public.area_monitoring(id) ON DELETE SET NULL,
  tanggal       DATE NOT NULL DEFAULT CURRENT_DATE,
  spesies       TEXT NOT NULL,
  jumlah_bibit  INTEGER NOT NULL DEFAULT 0,
  jumlah_hidup  INTEGER,
  latitude      NUMERIC(10,7),
  longitude     NUMERIC(10,7),
  keterangan    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.penyulaman IS 'Data kegiatan penyulaman / replanting';

CREATE INDEX IF NOT EXISTS penyulaman_tanggal_idx ON public.penyulaman (tanggal);

-- ---------------------------------------------------------------------------
-- 5. KUALITAS AIR
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kualitas_air (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id       UUID REFERENCES public.area_monitoring(id) ON DELETE SET NULL,
  tanggal       DATE NOT NULL DEFAULT CURRENT_DATE,
  titik_sampling TEXT,
  ph            NUMERIC(4,2),
  do_mgl        NUMERIC(5,2),
  salinitas_ppt NUMERIC(5,2),
  tss_mgl       NUMERIC(8,2),
  suhu_c        NUMERIC(4,1),
  latitude      NUMERIC(10,7),
  longitude     NUMERIC(10,7),
  keterangan    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.kualitas_air IS 'Data sampling kualitas air';

CREATE INDEX IF NOT EXISTS kualitas_air_tanggal_idx ON public.kualitas_air (tanggal);

-- ---------------------------------------------------------------------------
-- 6. BLUE CARBON
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blue_carbon (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tegakan_id    UUID NOT NULL REFERENCES public.tegakan(id) ON DELETE CASCADE,
  tanggal       DATE NOT NULL DEFAULT CURRENT_DATE,
  biomassa_kg   NUMERIC(10,2),
  karbon_kg     NUMERIC(10,2),
  co2_ekuivalen NUMERIC(10,2),
  metode        TEXT DEFAULT 'allometric',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.blue_carbon IS 'Estimasi karbon biru / blue carbon';

CREATE INDEX IF NOT EXISTS blue_carbon_tegakan_idx ON public.blue_carbon (tegakan_id);
CREATE INDEX IF NOT EXISTS blue_carbon_tanggal_idx ON public.blue_carbon (tanggal);

-- ---------------------------------------------------------------------------
-- TRIGGERS: updated_at
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS area_monitoring_updated_at ON public.area_monitoring;
CREATE TRIGGER area_monitoring_updated_at
  BEFORE UPDATE ON public.area_monitoring
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tegakan_updated_at ON public.tegakan;
CREATE TRIGGER tegakan_updated_at
  BEFORE UPDATE ON public.tegakan
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS penyulaman_updated_at ON public.penyulaman;
CREATE TRIGGER penyulaman_updated_at
  BEFORE UPDATE ON public.penyulaman
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: semua tabel bisa dibaca admin
-- ---------------------------------------------------------------------------
ALTER TABLE public.area_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tegakan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penyulaman ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kualitas_air ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blue_carbon ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access area_monitoring" ON public.area_monitoring;
CREATE POLICY "Admin full access area_monitoring"
  ON public.area_monitoring FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access tegakan" ON public.tegakan;
CREATE POLICY "Admin full access tegakan"
  ON public.tegakan FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access monitoring" ON public.monitoring;
CREATE POLICY "Admin full access monitoring"
  ON public.monitoring FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access penyulaman" ON public.penyulaman;
CREATE POLICY "Admin full access penyulaman"
  ON public.penyulaman FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access kualitas_air" ON public.kualitas_air;
CREATE POLICY "Admin full access kualitas_air"
  ON public.kualitas_air FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access blue_carbon" ON public.blue_carbon;
CREATE POLICY "Admin full access blue_carbon"
  ON public.blue_carbon FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ===========================================================================
-- SEED DATA
-- ===========================================================================

-- Area Monitoring
INSERT INTO public.area_monitoring (id, nama, luas_ha, deskripsi, latitude, longitude) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Zona A - Timur', 2.50, 'Kawasan mangrove sisi timur Mangkang', -6.9875000, 110.3450000),
  ('a0000002-0000-0000-0000-000000000002', 'Zona B - Tengah', 3.20, 'Kawasan mangrove pusat Mangkang', -6.9912000, 110.3415000),
  ('a0000003-0000-0000-0000-000000000003', 'Zona C - Barat', 1.80, 'Kawasan mangrove sisi barat dekat muara', -6.9940000, 110.3380000)
ON CONFLICT (id) DO NOTHING;

-- Tegakan (50 baris dengan berbagai spesies dan health_status)
INSERT INTO public.tegakan (id, area_id, kode_tegakan, spesies, tinggi_cm, diameter_cm, health_status, latitude, longitude, tanggal_tanam) VALUES
  ('00000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-001', 'Rhizophora mucronata', 185.00, 4.50, 'hidup', -6.987510, 110.345010, '2025-11-15'),
  ('00000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-002', 'Rhizophora mucronata', 172.00, 4.20, 'hidup', -6.987520, 110.345020, '2025-11-15'),
  ('00000003-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-003', 'Avicennia marina', 210.00, 5.10, 'hidup', -6.987530, 110.345030, '2025-11-15'),
  ('00000004-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-004', 'Avicennia marina', 195.00, 4.80, 'hidup', -6.987540, 110.345040, '2025-11-16'),
  ('00000005-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-005', 'Sonneratia alba', 155.00, 3.90, 'mati', -6.987550, 110.345050, '2025-11-16'),
  ('00000006-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-006', 'Rhizophora apiculata', 168.00, 4.00, 'hidup', -6.987560, 110.345060, '2025-11-17'),
  ('00000007-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-007', 'Rhizophora apiculata', 145.00, 3.60, 'stres', -6.987570, 110.345070, '2025-11-17'),
  ('00000008-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-008', 'Bruguiera gymnorhiza', 130.00, 3.20, 'hidup', -6.987580, 110.345080, '2025-11-18'),
  ('00000009-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-009', 'Bruguiera gymnorhiza', 125.00, 3.00, 'mati', -6.987590, 110.345090, '2025-11-18'),
  ('00000010-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-010', 'Rhizophora mucronata', 200.00, 5.00, 'hidup', -6.987600, 110.345100, '2025-11-19'),
  ('00000011-0000-0000-0000-000000000011', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-001', 'Rhizophora mucronata', 165.00, 4.10, 'hidup', -6.991210, 110.341510, '2025-12-01'),
  ('00000012-0000-0000-0000-000000000012', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-002', 'Avicennia marina', 220.00, 5.50, 'hidup', -6.991220, 110.341520, '2025-12-01'),
  ('00000013-0000-0000-0000-000000000013', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-003', 'Avicennia marina', 205.00, 5.20, 'hidup', -6.991230, 110.341530, '2025-12-02'),
  ('00000014-0000-0000-0000-000000000014', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-004', 'Sonneratia alba', 175.00, 4.30, 'hidup', -6.991240, 110.341540, '2025-12-02'),
  ('00000015-0000-0000-0000-000000000015', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-005', 'Sonneratia alba', 160.00, 4.00, 'mati', -6.991250, 110.341550, '2025-12-03'),
  ('00000016-0000-0000-0000-000000000016', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-006', 'Rhizophora apiculata', 180.00, 4.40, 'hidup', -6.991260, 110.341560, '2025-12-03'),
  ('00000017-0000-0000-0000-000000000017', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-007', 'Rhizophora apiculata', 155.00, 3.80, 'sakit', -6.991270, 110.341570, '2025-12-04'),
  ('00000018-0000-0000-0000-000000000018', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-008', 'Bruguiera gymnorhiza', 140.00, 3.50, 'hidup', -6.991280, 110.341580, '2025-12-04'),
  ('00000019-0000-0000-0000-000000000019', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-009', 'Bruguiera gymnorhiza', 135.00, 3.30, 'hidup', -6.991290, 110.341590, '2025-12-05'),
  ('00000020-0000-0000-0000-000000000020', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-010', 'Rhizophora mucronata', 190.00, 4.70, 'hidup', -6.991300, 110.341600, '2025-12-05'),
  ('00000021-0000-0000-0000-000000000021', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-011', 'Rhizophora mucronata', 178.00, 4.30, 'stres', -6.991310, 110.341610, '2025-12-06'),
  ('00000022-0000-0000-0000-000000000022', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-012', 'Avicennia marina', 215.00, 5.30, 'hidup', -6.991320, 110.341620, '2025-12-06'),
  ('00000023-0000-0000-0000-000000000023', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-013', 'Avicennia marina', 198.00, 4.90, 'hidup', -6.991330, 110.341630, '2025-12-07'),
  ('00000024-0000-0000-0000-000000000024', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-014', 'Sonneratia alba', 170.00, 4.10, 'mati', -6.991340, 110.341640, '2025-12-07'),
  ('00000025-0000-0000-0000-000000000025', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-015', 'Rhizophora apiculata', 185.00, 4.50, 'hidup', -6.991350, 110.341650, '2025-12-08'),
  ('00000026-0000-0000-0000-000000000026', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-001', 'Rhizophora mucronata', 195.00, 4.80, 'hidup', -6.994010, 110.338010, '2025-12-15'),
  ('00000027-0000-0000-0000-000000000027', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-002', 'Rhizophora mucronata', 182.00, 4.40, 'hidup', -6.994020, 110.338020, '2025-12-15'),
  ('00000028-0000-0000-0000-000000000028', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-003', 'Avicennia marina', 225.00, 5.60, 'hidup', -6.994030, 110.338030, '2025-12-16'),
  ('00000029-0000-0000-0000-000000000029', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-004', 'Avicennia marina', 210.00, 5.00, 'stres', -6.994040, 110.338040, '2025-12-16'),
  ('00000030-0000-0000-0000-000000000030', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-005', 'Sonneratia alba', 185.00, 4.60, 'hidup', -6.994050, 110.338050, '2025-12-17'),
  ('00000031-0000-0000-0000-000000000031', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-006', 'Rhizophora apiculata', 175.00, 4.20, 'hidup', -6.994060, 110.338060, '2025-12-17'),
  ('00000032-0000-0000-0000-000000000032', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-007', 'Bruguiera gymnorhiza', 150.00, 3.70, 'mati', -6.994070, 110.338070, '2025-12-18'),
  ('00000033-0000-0000-0000-000000000033', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-008', 'Bruguiera gymnorhiza', 145.00, 3.50, 'hidup', -6.994080, 110.338080, '2025-12-18'),
  ('00000034-0000-0000-0000-000000000034', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-009', 'Rhizophora mucronata', 165.00, 4.00, 'hidup', -6.994090, 110.338090, '2025-12-19'),
  ('00000035-0000-0000-0000-000000000035', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-010', 'Avicennia marina', 205.00, 5.10, 'hidup', -6.994100, 110.338100, '2025-12-19'),
  ('00000036-0000-0000-0000-000000000036', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-011', 'Rhizophora mucronata', 175.00, 4.30, 'hidup', -6.987610, 110.345110, '2025-11-20'),
  ('00000037-0000-0000-0000-000000000037', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-012', 'Sonneratia alba', 150.00, 3.80, 'stres', -6.987620, 110.345120, '2025-11-20'),
  ('00000038-0000-0000-0000-000000000038', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-013', 'Avicennia marina', 200.00, 5.00, 'hidup', -6.987630, 110.345130, '2025-11-21'),
  ('00000039-0000-0000-0000-000000000039', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-014', 'Rhizophora apiculata', 160.00, 3.90, 'mati', -6.987640, 110.345140, '2025-11-21'),
  ('00000040-0000-0000-0000-000000000040', 'a0000001-0000-0000-0000-000000000001', 'MKG-A-015', 'Bruguiera gymnorhiza', 135.00, 3.30, 'hidup', -6.987650, 110.345150, '2025-11-22'),
  ('00000041-0000-0000-0000-000000000041', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-016', 'Rhizophora mucronata', 170.00, 4.20, 'hidup', -6.991360, 110.341660, '2025-12-08'),
  ('00000042-0000-0000-0000-000000000042', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-017', 'Avicennia marina', 225.00, 5.50, 'hidup', -6.991370, 110.341670, '2025-12-09'),
  ('00000043-0000-0000-0000-000000000043', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-018', 'Sonneratia alba', 165.00, 4.10, 'sakit', -6.991380, 110.341680, '2025-12-09'),
  ('00000044-0000-0000-0000-000000000044', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-019', 'Rhizophora apiculata', 178.00, 4.30, 'hidup', -6.991390, 110.341690, '2025-12-10'),
  ('00000045-0000-0000-0000-000000000045', 'a0000002-0000-0000-0000-000000000002', 'MKG-B-020', 'Bruguiera gymnorhiza', 140.00, 3.40, 'hidup', -6.991400, 110.341700, '2025-12-10'),
  ('00000046-0000-0000-0000-000000000046', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-011', 'Rhizophora mucronata', 188.00, 4.60, 'hidup', -6.994110, 110.338110, '2025-12-20'),
  ('00000047-0000-0000-0000-000000000047', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-012', 'Avicennia marina', 215.00, 5.30, 'stres', -6.994120, 110.338120, '2025-12-20'),
  ('00000048-0000-0000-0000-000000000048', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-013', 'Sonneratia alba', 180.00, 4.40, 'hidup', -6.994130, 110.338130, '2025-12-21'),
  ('00000049-0000-0000-0000-000000000049', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-014', 'Rhizophora apiculata', 170.00, 4.10, 'mati', -6.994140, 110.338140, '2025-12-21'),
  ('00000050-0000-0000-0000-000000000050', 'a0000003-0000-0000-0000-000000000003', 'MKG-C-015', 'Bruguiera gymnorhiza', 148.00, 3.60, 'hidup', -6.994150, 110.338150, '2025-12-22')
ON CONFLICT (kode_tegakan) DO NOTHING;

-- Monitoring (data monitoring per tegakan, beberapa siklus)
INSERT INTO public.monitoring (tegakan_id, tanggal, tinggi_cm, diameter_cm, health_status, survia, catatan) VALUES
  -- Monitoring Jan 2026
  ('00000001-0000-0000-0000-000000000001', '2026-01-15', 190.00, 4.60, 'hidup', true, 'Tumbuh baik'),
  ('00000002-0000-0000-0000-000000000002', '2026-01-15', 178.00, 4.30, 'hidup', true, 'Normal'),
  ('00000003-0000-0000-0000-000000000003', '2026-01-15', 215.00, 5.20, 'hidup', true, 'Pertumbuhan bagus'),
  ('00000004-0000-0000-0000-000000000004', '2026-01-16', 200.00, 4.90, 'hidup', true, 'Sehat'),
  ('00000005-0000-0000-0000-000000000005', '2026-01-16', 155.00, 3.90, 'mati', false, 'Mati terkena hama'),
  ('00000006-0000-0000-0000-000000000006', '2026-01-16', 172.00, 4.10, 'hidup', true, 'Normal'),
  ('00000007-0000-0000-0000-000000000007', '2026-01-17', 148.00, 3.70, 'stres', true, 'Daun menguning'),
  ('00000011-0000-0000-0000-000000000011', '2026-01-18', 170.00, 4.20, 'hidup', true, 'Normal'),
  ('00000012-0000-0000-0000-000000000012', '2026-01-18', 225.00, 5.60, 'hidup', true, 'Tumbuh subur'),
  ('00000026-0000-0000-0000-000000000026', '2026-01-20', 200.00, 4.90, 'hidup', true, 'Baik'),
  ('00000027-0000-0000-0000-000000000027', '2026-01-20', 187.00, 4.50, 'hidup', true, 'Normal'),
  ('00000028-0000-0000-0000-000000000028', '2026-01-20', 230.00, 5.70, 'hidup', true, 'Sangat baik'),
  -- Monitoring Feb 2026
  ('00000001-0000-0000-0000-000000000001', '2026-02-15', 195.00, 4.70, 'hidup', true, 'Tumbuh 5cm'),
  ('00000002-0000-0000-0000-000000000002', '2026-02-15', 182.00, 4.40, 'hidup', true, 'Normal'),
  ('00000003-0000-0000-0000-000000000003', '2026-02-15', 220.00, 5.30, 'hidup', true, 'Bagus'),
  ('00000004-0000-0000-0000-000000000004', '2026-02-16', 205.00, 5.00, 'hidup', true, 'Sehat'),
  ('00000006-0000-0000-0000-000000000006', '2026-02-16', 176.00, 4.20, 'hidup', true, 'Normal'),
  ('00000007-0000-0000-0000-000000000007', '2026-02-17', 150.00, 3.80, 'hidup', true, 'Membaik'),
  ('00000011-0000-0000-0000-000000000011', '2026-02-18', 175.00, 4.30, 'hidup', true, 'Normal'),
  ('00000012-0000-0000-0000-000000000012', '2026-02-18', 230.00, 5.70, 'hidup', true, 'Subur'),
  ('00000026-0000-0000-0000-000000000026', '2026-02-20', 205.00, 5.00, 'hidup', true, 'Baik'),
  ('00000028-0000-0000-0000-000000000028', '2026-02-20', 235.00, 5.80, 'hidup', true, 'Optimal'),
  -- Monitoring Mar 2026
  ('00000001-0000-0000-0000-000000000001', '2026-03-15', 200.00, 4.80, 'hidup', true, 'Pertumbuhan konsisten'),
  ('00000002-0000-0000-0000-000000000002', '2026-03-15', 186.00, 4.50, 'hidup', true, 'Normal'),
  ('00000003-0000-0000-0000-000000000003', '2026-03-15', 225.00, 5.40, 'hidup', true, 'Bagus'),
  ('00000004-0000-0000-0000-000000000004', '2026-03-16', 210.00, 5.10, 'hidup', true, 'Optimal'),
  ('00000006-0000-0000-0000-000000000006', '2026-03-16', 180.00, 4.30, 'hidup', true, 'Normal'),
  ('00000011-0000-0000-0000-000000000011', '2026-03-18', 180.00, 4.40, 'hidup', true, 'Baik'),
  ('00000012-0000-0000-0000-000000000012', '2026-03-18', 235.00, 5.80, 'hidup', true, 'Subur'),
  ('00000026-0000-0000-0000-000000000026', '2026-03-20', 210.00, 5.10, 'hidup', true, 'Baik'),
  ('00000028-0000-0000-0000-000000000028', '2026-03-20', 240.00, 5.90, 'hidup', true, 'Sangat baik'),
  -- Monitoring Apr 2026
  ('00000001-0000-0000-0000-000000000001', '2026-04-15', 205.00, 4.90, 'hidup', true, 'Tumbuh 5cm'),
  ('00000002-0000-0000-0000-000000000002', '2026-04-15', 190.00, 4.60, 'hidup', true, 'Normal'),
  ('00000003-0000-0000-0000-000000000003', '2026-04-15', 230.00, 5.50, 'hidup', true, 'Optimal'),
  ('00000004-0000-0000-0000-000000000004', '2026-04-16', 215.00, 5.20, 'hidup', true, 'Sehat'),
  ('00000006-0000-0000-0000-000000000006', '2026-04-16', 184.00, 4.40, 'hidup', true, 'Baik'),
  ('00000011-0000-0000-0000-000000000011', '2026-04-18', 185.00, 4.50, 'hidup', true, 'Bagus'),
  ('00000012-0000-0000-0000-000000000012', '2026-04-18', 240.00, 5.90, 'hidup', true, 'Subur'),
  ('00000026-0000-0000-0000-000000000026', '2026-04-20', 215.00, 5.20, 'hidup', true, 'Baik'),
  ('00000028-0000-0000-0000-000000000028', '2026-04-20', 245.00, 6.00, 'hidup', true, 'Maksimal'),
  -- Monitoring Mei 2026
  ('00000001-0000-0000-0000-000000000001', '2026-05-15', 210.00, 5.00, 'hidup', true, 'Pertumbuhan baik'),
  ('00000002-0000-0000-0000-000000000002', '2026-05-15', 195.00, 4.70, 'hidup', true, 'Normal'),
  ('00000003-0000-0000-0000-000000000003', '2026-05-15', 235.00, 5.60, 'hidup', true, 'Bagus'),
  ('00000004-0000-0000-0000-000000000004', '2026-05-16', 220.00, 5.30, 'hidup', true, 'Sehat'),
  ('00000006-0000-0000-0000-000000000006', '2026-05-16', 188.00, 4.50, 'hidup', true, 'Optimal'),
  ('00000011-0000-0000-0000-000000000011', '2026-05-18', 190.00, 4.60, 'hidup', true, 'Baik'),
  ('00000012-0000-0000-0000-000000000012', '2026-05-18', 245.00, 6.00, 'hidup', true, 'Sangat subur'),
  ('00000026-0000-0000-0000-000000000026', '2026-05-20', 220.00, 5.30, 'hidup', true, 'Pertumbuhan optimal'),
  ('00000028-0000-0000-0000-000000000028', '2026-05-20', 250.00, 6.10, 'hidup', true, 'Maksimal'),
  -- Monitoring Jun 2026
  ('00000001-0000-0000-0000-000000000001', '2026-06-15', 215.00, 5.10, 'hidup', true, 'Tumbuh 5cm'),
  ('00000002-0000-0000-0000-000000000002', '2026-06-15', 200.00, 4.80, 'hidup', true, 'Normal'),
  ('00000003-0000-0000-0000-000000000003', '2026-06-15', 240.00, 5.70, 'hidup', true, 'Sangat baik'),
  ('00000004-0000-0000-0000-000000000004', '2026-06-16', 225.00, 5.40, 'hidup', true, 'Optimal'),
  ('00000006-0000-0000-0000-000000000006', '2026-06-16', 192.00, 4.60, 'hidup', true, 'Baik'),
  ('00000011-0000-0000-0000-000000000011', '2026-06-18', 195.00, 4.70, 'hidup', true, 'Bagus'),
  ('00000012-0000-0000-0000-000000000012', '2026-06-18', 250.00, 6.10, 'hidup', true, 'Subur'),
  ('00000026-0000-0000-0000-000000000026', '2026-06-20', 225.00, 5.40, 'hidup', true, 'Baik'),
  ('00000028-0000-0000-0000-000000000028', '2026-06-20', 255.00, 6.20, 'hidup', true, 'Prima')
ON CONFLICT DO NOTHING;

-- Penyulaman
INSERT INTO public.penyulaman (area_id, tanggal, spesies, jumlah_bibit, jumlah_hidup, latitude, longitude, keterangan) VALUES
  ('a0000001-0000-0000-0000-000000000001', '2026-01-10', 'Rhizophora mucronata', 200, 185, -6.987500, 110.345000, 'Penyulaman rutin Januari'),
  ('a0000002-0000-0000-0000-000000000002', '2026-02-12', 'Avicennia marina', 150, 140, -6.991200, 110.341500, 'Penyulaman area tengah'),
  ('a0000003-0000-0000-0000-000000000003', '2026-02-14', 'Rhizophora apiculata', 175, 160, -6.994000, 110.338000, 'Rehabilitasi area barat'),
  ('a0000001-0000-0000-0000-000000000001', '2026-03-08', 'Bruguiera gymnorhiza', 100, 88, -6.987550, 110.345100, 'Penyulaman zona A'),
  ('a0000002-0000-0000-0000-000000000002', '2026-03-20', 'Sonneratia alba', 120, 105, -6.991250, 110.341600, 'Penyulaman zona B'),
  ('a0000003-0000-0000-0000-000000000003', '2026-04-05', 'Rhizophora mucronata', 180, 170, -6.994050, 110.338100, 'Penyulaman April'),
  ('a0000001-0000-0000-0000-000000000001', '2026-04-18', 'Avicennia marina', 130, 118, -6.987600, 110.345150, 'Penyulaman rutin'),
  ('a0000002-0000-0000-0000-000000000002', '2026-05-10', 'Rhizophora mucronata', 160, 148, -6.991300, 110.341650, 'Penyulaman Mei'),
  ('a0000003-0000-0000-0000-000000000003', '2026-05-22', 'Avicennia marina', 140, 125, -6.994080, 110.338120, 'Rehabilitasi'),
  ('a0000001-0000-0000-0000-000000000001', '2026-06-12', 'Rhizophora apiculata', 190, 178, -6.987650, 110.345180, 'Penyulaman Juni'),
  ('a0000002-0000-0000-0000-000000000002', '2026-06-25', 'Bruguiera gymnorhiza', 110, 95, -6.991350, 110.341700, 'Penyulaman akhir Juni'),
  ('a0000003-0000-0000-0000-000000000003', '2026-07-05', 'Rhizophora mucronata', 165, 152, -6.994100, 110.338150, 'Penyulaman Juli')
ON CONFLICT DO NOTHING;

-- Kualitas Air
INSERT INTO public.kualitas_air (area_id, tanggal, titik_sampling, ph, do_mgl, salinitas_ppt, tss_mgl, suhu_c, latitude, longitude) VALUES
  ('a0000001-0000-0000-0000-000000000001', '2026-01-10', 'TS-A1', 7.2, 5.8, 28.0, 45.0, 29.5, -6.987500, 110.345000),
  ('a0000002-0000-0000-0000-000000000002', '2026-01-10', 'TS-B1', 7.0, 5.5, 30.0, 52.0, 30.0, -6.991200, 110.341500),
  ('a0000003-0000-0000-0000-000000000003', '2026-01-10', 'TS-C1', 7.3, 6.0, 26.0, 38.0, 29.0, -6.994000, 110.338000),
  ('a0000001-0000-0000-0000-000000000001', '2026-02-14', 'TS-A1', 7.1, 5.6, 29.0, 48.0, 30.0, -6.987500, 110.345000),
  ('a0000002-0000-0000-0000-000000000002', '2026-02-14', 'TS-B1', 6.9, 5.3, 31.0, 55.0, 30.5, -6.991200, 110.341500),
  ('a0000003-0000-0000-0000-000000000003', '2026-02-14', 'TS-C1', 7.2, 5.9, 27.0, 40.0, 29.5, -6.994000, 110.338000),
  ('a0000001-0000-0000-0000-000000000001', '2026-03-15', 'TS-A1', 7.0, 5.4, 30.0, 50.0, 30.5, -6.987500, 110.345000),
  ('a0000002-0000-0000-0000-000000000002', '2026-03-15', 'TS-B1', 6.8, 5.1, 32.0, 58.0, 31.0, -6.991200, 110.341500),
  ('a0000003-0000-0000-0000-000000000003', '2026-03-15', 'TS-C1', 7.1, 5.7, 28.0, 42.0, 30.0, -6.994000, 110.338000),
  ('a0000001-0000-0000-0000-000000000001', '2026-04-12', 'TS-A1', 7.3, 5.9, 27.0, 44.0, 31.0, -6.987500, 110.345000),
  ('a0000002-0000-0000-0000-000000000002', '2026-04-12', 'TS-B1', 7.0, 5.5, 29.0, 50.0, 31.5, -6.991200, 110.341500),
  ('a0000003-0000-0000-0000-000000000003', '2026-04-12', 'TS-C1', 7.4, 6.1, 25.0, 36.0, 30.5, -6.994000, 110.338000),
  ('a0000001-0000-0000-0000-000000000001', '2026-05-18', 'TS-A1', 7.2, 5.7, 28.0, 46.0, 31.5, -6.987500, 110.345000),
  ('a0000002-0000-0000-0000-000000000002', '2026-05-18', 'TS-B1', 6.9, 5.4, 30.0, 53.0, 32.0, -6.991200, 110.341500),
  ('a0000003-0000-0000-0000-000000000003', '2026-05-18', 'TS-C1', 7.3, 6.0, 26.0, 39.0, 31.0, -6.994000, 110.338000),
  ('a0000001-0000-0000-0000-000000000001', '2026-06-20', 'TS-A1', 7.1, 5.6, 29.0, 47.0, 32.0, -6.987500, 110.345000),
  ('a0000002-0000-0000-0000-000000000002', '2026-06-20', 'TS-B1', 6.8, 5.2, 31.0, 56.0, 32.5, -6.991200, 110.341500),
  ('a0000003-0000-0000-0000-000000000003', '2026-06-20', 'TS-C1', 7.2, 5.8, 27.0, 41.0, 31.5, -6.994000, 110.338000),
  ('a0000001-0000-0000-0000-000000000001', '2026-07-08', 'TS-A1', 7.0, 5.5, 30.0, 49.0, 31.0, -6.987500, 110.345000),
  ('a0000002-0000-0000-0000-000000000002', '2026-07-08', 'TS-B1', 6.7, 5.0, 32.0, 57.0, 31.5, -6.991200, 110.341500),
  ('a0000003-0000-0000-0000-000000000003', '2026-07-08', 'TS-C1', 7.1, 5.7, 28.0, 43.0, 30.5, -6.994000, 110.338000)
ON CONFLICT DO NOTHING;

-- Blue Carbon
INSERT INTO public.blue_carbon (tegakan_id, tanggal, biomassa_kg, karbon_kg, co2_ekuivalen) VALUES
  ('00000001-0000-0000-0000-000000000001', '2026-06-15', 12.50, 5.88, 21.56),
  ('00000002-0000-0000-0000-000000000002', '2026-06-15', 11.20, 5.26, 19.30),
  ('00000003-0000-0000-0000-000000000003', '2026-06-15', 15.80, 7.43, 27.26),
  ('00000004-0000-0000-0000-000000000004', '2026-06-16', 14.50, 6.82, 25.01),
  ('00000006-0000-0000-0000-000000000006', '2026-06-16', 10.80, 5.08, 18.63),
  ('00000008-0000-0000-0000-000000000008', '2026-06-17', 8.50, 4.00, 14.67),
  ('00000011-0000-0000-0000-000000000011', '2026-06-18', 11.00, 5.17, 18.96),
  ('00000012-0000-0000-0000-000000000012', '2026-06-18', 16.50, 7.76, 28.46),
  ('00000014-0000-0000-0000-000000000014', '2026-06-18', 12.00, 5.64, 20.68),
  ('00000016-0000-0000-0000-000000000016', '2026-06-19', 11.50, 5.41, 19.84),
  ('00000018-0000-0000-0000-000000000018', '2026-06-19', 9.20, 4.32, 15.85),
  ('00000019-0000-0000-0000-000000000019', '2026-06-19', 8.80, 4.14, 15.18),
  ('00000020-0000-0000-0000-000000000020', '2026-06-20', 13.20, 6.20, 22.74),
  ('00000022-0000-0000-0000-000000000022', '2026-06-20', 15.50, 7.29, 26.74),
  ('00000023-0000-0000-0000-000000000023', '2026-06-20', 14.00, 6.58, 24.14),
  ('00000025-0000-0000-0000-000000000025', '2026-06-21', 12.80, 6.02, 22.08),
  ('00000026-0000-0000-0000-000000000026', '2026-06-20', 13.50, 6.35, 23.30),
  ('00000027-0000-0000-0000-000000000027', '2026-06-20', 12.00, 5.64, 20.68),
  ('00000028-0000-0000-0000-000000000028', '2026-06-21', 17.00, 7.99, 29.31),
  ('00000030-0000-0000-0000-000000000030', '2026-06-21', 12.50, 5.88, 21.56),
  ('00000031-0000-0000-0000-000000000031', '2026-06-21', 11.00, 5.17, 18.96),
  ('00000033-0000-0000-0000-000000000033', '2026-06-22', 9.50, 4.47, 16.40),
  ('00000034-0000-0000-0000-000000000034', '2026-06-22', 10.50, 4.94, 18.12),
  ('00000035-0000-0000-0000-000000000035', '2026-06-22', 14.80, 6.96, 25.53),
  ('00000036-0000-0000-0000-000000000036', '2026-06-23', 13.00, 6.11, 22.41),
  ('00000038-0000-0000-0000-000000000038', '2026-06-23', 15.00, 7.05, 25.86),
  ('00000040-0000-0000-0000-000000000040', '2026-06-23', 9.00, 4.23, 15.52),
  ('00000041-0000-0000-0000-000000000041', '2026-06-24', 10.80, 5.08, 18.63),
  ('00000042-0000-0000-0000-000000000042', '2026-06-24', 16.00, 7.52, 27.59),
  ('00000044-0000-0000-0000-000000000044', '2026-06-24', 11.20, 5.26, 19.30),
  ('00000045-0000-0000-0000-000000000045', '2026-06-25', 8.50, 4.00, 14.67),
  ('00000046-0000-0000-0000-000000000046', '2026-06-25', 12.50, 5.88, 21.56),
  ('00000048-0000-0000-0000-000000000048', '2026-06-25', 11.80, 5.55, 20.36),
  ('00000050-0000-0000-0000-000000000050', '2026-06-26', 9.20, 4.32, 15.85)
ON CONFLICT DO NOTHING;

-- ===========================================================================
-- VERIFIKASI DATA
-- ===========================================================================
-- Jumlahkan untuk cek:
-- SELECT COUNT(*) AS total_tegakan FROM public.tegakan;
-- SELECT health_status, COUNT(*) FROM public.tegakan GROUP BY health_status;
-- SELECT COUNT(*) AS total_monitoring FROM public.monitoring;
-- SELECT COUNT(*) AS total_penyulaman FROM public.penyulaman;
-- SELECT COUNT(*) AS total_kualitas_air FROM public.kualitas_air;
-- SELECT COUNT(*) AS total_blue_carbon FROM public.blue_carbon;
-- SELECT SUM(karbon_kg) AS total_karbon FROM public.blue_carbon;
