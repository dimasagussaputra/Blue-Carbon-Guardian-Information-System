-- Public SELECT policies for Peta Mangrove (landing page)
-- Allows anonymous and authenticated (non-admin) users to read coordinate
-- data for the public map. Admin retains full access via existing policies.

DROP POLICY IF EXISTS "Public select tegakan for peta" ON public.tegakan;
CREATE POLICY "Public select tegakan for peta"
  ON public.tegakan FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public select penyulaman for peta" ON public.penyulaman;
CREATE POLICY "Public select penyulaman for peta"
  ON public.penyulaman FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public select kualitas_air for peta" ON public.kualitas_air;
CREATE POLICY "Public select kualitas_air for peta"
  ON public.kualitas_air FOR SELECT
  TO anon, authenticated
  USING (true);
