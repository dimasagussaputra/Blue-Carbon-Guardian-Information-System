-- Soft delete support: add deleted_at column to all data tables
ALTER TABLE tegakan ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE monitoring ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE penyulaman ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE kualitas_air ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE blue_carbon_calculations ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE galeri ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE dokumen ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE area_monitoring ADD COLUMN deleted_at TIMESTAMPTZ;
