-- Create dokumen table
CREATE TABLE IF NOT EXISTS dokumen (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  kategori text NOT NULL CHECK (kategori IN ('proposal','laporan','sop','dokumentasi')),
  judul text NOT NULL DEFAULT '',
  deskripsi text DEFAULT '',
  file_path text NOT NULL,
  file_type text NOT NULL DEFAULT '',
  file_size bigint NOT NULL DEFAULT 0,
  public_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dokumen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view dokumen"
ON dokumen FOR SELECT TO public
USING (true);

CREATE POLICY "Admin full access dokumen"
ON dokumen FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('dokumen', 'dokumen', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload dokumen" ON storage.objects;
CREATE POLICY "Authenticated users can upload dokumen"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dokumen');

DROP POLICY IF EXISTS "Authenticated users can delete dokumen" ON storage.objects;
CREATE POLICY "Authenticated users can delete dokumen"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'dokumen');

DROP POLICY IF EXISTS "Anyone can view dokumen" ON storage.objects;
CREATE POLICY "Anyone can view dokumen"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'dokumen');
