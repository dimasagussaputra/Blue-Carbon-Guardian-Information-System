-- Public SELECT policies for landing page stats & monitoring
-- Allows anonymous + authenticated users to read aggregate data

DROP POLICY IF EXISTS "Public select area_monitoring for landing" ON public.area_monitoring;
CREATE POLICY "Public select area_monitoring for landing"
  ON public.area_monitoring FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public select monitoring for landing" ON public.monitoring;
CREATE POLICY "Public select monitoring for landing"
  ON public.monitoring FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public select blue_carbon_calculations for landing" ON public.blue_carbon_calculations;
CREATE POLICY "Public select blue_carbon_calculations for landing"
  ON public.blue_carbon_calculations FOR SELECT
  TO anon, authenticated
  USING (true);
