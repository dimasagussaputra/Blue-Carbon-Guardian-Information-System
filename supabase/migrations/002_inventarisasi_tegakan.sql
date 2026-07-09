-- Create spesies master table
CREATE TABLE IF NOT EXISTS spesies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nama text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Seed initial species
INSERT INTO spesies (nama) VALUES
  ('Rhizophora mucronata'),
  ('Avicennia marina'),
  ('Sonneratia alba'),
  ('Rhizophora apiculata'),
  ('Bruguiera gymnorhiza')
ON CONFLICT (nama) DO NOTHING;

-- Add new columns to tegakan table
ALTER TABLE tegakan
ADD COLUMN IF NOT EXISTS tanggal date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS foto_url text,
ADD COLUMN IF NOT EXISTS keterangan text;

-- Create storage bucket for tegakan photos
INSERT INTO storage.buckets (id, name, public) VALUES ('tegakan', 'tegakan', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to tegakan bucket
CREATE POLICY "Authenticated users can upload tegakan photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'tegakan');

CREATE POLICY "Anyone can view tegakan photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'tegakan');
