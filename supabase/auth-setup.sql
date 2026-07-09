-- =============================================================================
-- Blue Carbon Guardian — Supabase Auth & Role Setup
-- Jalankan seluruh script ini di: Supabase Dashboard → SQL Editor → New query
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENUM & TABEL PROFILES
-- -----------------------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM ('admin', 'guest');

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        public.user_role NOT NULL DEFAULT 'guest',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Profil pengguna — role admin/guest untuk Blue Carbon Guardian';
COMMENT ON COLUMN public.profiles.role IS 'admin = akses penuh dashboard, guest = publik saja';

-- Index untuk lookup cepat
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- -----------------------------------------------------------------------------
-- 2. TRIGGER: AUTO-UPDATE updated_at
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. SYNC ROLE → auth.users.app_metadata (agar JWT middleware Next.js bisa baca)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_role_to_app_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', NEW.role::text)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_role_to_app_metadata();

-- -----------------------------------------------------------------------------
-- 4. TRIGGER: AUTO-BUAT PROFILE SAAT USER BARU REGISTER
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'guest'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5. HELPER: CEK APAKAH USER ADALAH ADMIN
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid();
$$;

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admin: akses penuh ke semua profil
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
CREATE POLICY "Admin full access profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- User: hanya bisa baca profil sendiri
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- User: hanya bisa update nama sendiri (bukan role)
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 7. FUNCTION: PROMOSI USER MENJADI ADMIN (panggil via SQL Editor)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id
  FROM auth.users
  WHERE email = user_email;

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'User dengan email % tidak ditemukan. Buat dulu di Authentication → Users.', user_email;
  END IF;

  INSERT INTO public.profiles (id, email, role)
  SELECT id, email, 'admin'::public.user_role
  FROM auth.users
  WHERE id = target_id
  ON CONFLICT (id) DO UPDATE
    SET role = 'admin'::public.user_role,
        email = EXCLUDED.email;

  -- Trigger sync_role_to_app_metadata akan otomatis update app_metadata
END;
$$;

-- Hanya service role / postgres yang boleh panggil promote (via SQL Editor)
REVOKE ALL ON FUNCTION public.promote_to_admin(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(TEXT) TO postgres, service_role;

-- -----------------------------------------------------------------------------
-- 8. BACKFILL: profil untuk user yang sudah ada sebelum script dijalankan
-- -----------------------------------------------------------------------------

INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  CASE
    WHEN u.raw_app_meta_data ->> 'role' = 'admin' THEN 'admin'::public.user_role
    ELSE 'guest'::public.user_role
  END
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- Sync ulang app_metadata dari profiles yang sudah ada
UPDATE auth.users u
SET raw_app_meta_data =
  COALESCE(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', p.role::text)
FROM public.profiles p
WHERE u.id = p.id;

-- =============================================================================
-- SELESAI! Langkah berikutnya:
-- =============================================================================
--
-- A) BUAT USER ADMIN (pilih salah satu):
--
--    Opsi 1 — Via Dashboard:
--    Authentication → Users → Add user → isi email & password
--    Lalu jalankan query di bawah (ganti email):
--
--    SELECT public.promote_to_admin('admin@bcguardian.id');
--
--    Opsi 2 — Langsung via SQL (ganti email & password):
--    (Password minimal 6 karakter)
--
--    -- Uncomment dan edit jika perlu:
--    -- INSERT INTO auth.users (
--    --   instance_id, id, aud, role, email, encrypted_password,
--    --   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
--    --   created_at, updated_at, confirmation_token
--    -- ) VALUES (...);
--    -- Lebih mudah buat user via Dashboard, lalu promote_to_admin().
--
-- B) VERIFIKASI:
--
--    SELECT id, email, role FROM public.profiles;
--
--    SELECT id, email, raw_app_meta_data ->> 'role' AS jwt_role
--    FROM auth.users;
--
-- C) SETEL .env.local di proyek Next.js:
--
--    NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
--
-- D) LOGIN di: http://localhost:3000/admin/login
--
-- =============================================================================

-- ▼▼▼ JALANKAN INI SETELAH BUAT USER DI DASHBOARD ▼▼▼
-- Ganti email dengan email admin Anda:

-- SELECT public.promote_to_admin('admin@bcguardian.id');
