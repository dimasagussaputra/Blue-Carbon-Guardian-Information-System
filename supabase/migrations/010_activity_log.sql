-- Migration: Add activity_log table for tracking user actions

CREATE TABLE IF NOT EXISTS public.activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL, -- 'create', 'update', 'delete', 'restore', 'force_delete', 'login', 'logout', 'export', 'upload'
  entity_type TEXT NOT NULL, -- 'tegakan', 'monitoring', 'penyulaman', 'kualitas_air', 'blue_carbon', 'galeri', 'dokumen', 'user'
  entity_id   TEXT,
  description TEXT NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast filtering
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_entity_type ON public.activity_log(entity_type);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read activity logs
CREATE POLICY "Admins can read activity logs"
  ON public.activity_log
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can insert
CREATE POLICY "Service can insert activity logs"
  ON public.activity_log
  FOR INSERT
  WITH CHECK (true);
