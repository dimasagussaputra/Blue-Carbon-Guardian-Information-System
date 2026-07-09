-- Create galeri table
CREATE TABLE IF NOT EXISTS galeri (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  kategori text NOT NULL CHECK (kategori IN ('before','after','monitoring','penyulaman','edukasi','clean_up')),
  judul text NOT NULL DEFAULT '',
  deskripsi text DEFAULT '',
  file_path text NOT NULL,
  public_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE galeri ENABLE ROW LEVEL SECURITY;

-- Public can view all gallery photos
CREATE POLICY "Public can view galeri"
ON galeri FOR SELECT TO public
USING (true);

-- Admin full access
CREATE POLICY "Admin full access galeri"
ON galeri FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Create storage bucket for gallery photos
INSERT INTO storage.buckets (id, name, public) VALUES ('galeri', 'galeri', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop first to avoid duplicate policy errors)
DROP POLICY IF EXISTS "Authenticated users can upload galeri photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload galeri photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'galeri');

DROP POLICY IF EXISTS "Authenticated users can delete galeri photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete galeri photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'galeri');

DROP POLICY IF EXISTS "Anyone can view galeri photos" ON storage.objects;
CREATE POLICY "Anyone can view galeri photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'galeri');

-- Seed data for existing landing page images
INSERT INTO galeri (kategori, judul, deskripsi, file_path, public_url) VALUES
('monitoring', 'Ekosistem Hutan Mangrove', 'Vegetasi Rhizophora pesisir Mangkang Kulon yang tumbuh lebat dan kuat.', '/ekosistem hutan mangrove.png', '/ekosistem hutan mangrove.png'),
('edukasi', 'Penanaman Bersama Warga', 'Sosialisasi aktif bahaya abrasi dan penanaman bersama anak-anak sekolah.', '/wisata_edukasi.png', '/wisata_edukasi.png'),
('after', 'Boardwalk Ekowisata Pesisir', 'Prasarana jembatan kayu untuk menyusuri rimbunnya konservasi mangrove.', '/wisata_ekowisata.png', '/wisata_ekowisata.png'),
('penyulaman', 'Zona Nursery Pembibitan', 'Proses pembibitan mangrove unggulan siap tanam untuk melengkapi greenbelt.', '/zona nursery pembibitan.png', '/zona nursery pembibitan.png')
ON CONFLICT DO NOTHING;
