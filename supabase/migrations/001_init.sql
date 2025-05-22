-- supabase/migrations/001_init.sql

-- 1️⃣ Create users table (if it doesn’t already exist)
CREATE TABLE IF NOT EXISTS public.users (
  id         UUID           PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT           NOT NULL,
  role       TEXT           NOT NULL CHECK (role IN ('admin','client','technician')),
  created_at TIMESTAMPTZ    DEFAULT now()
);

-- 2️⃣ Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3️⃣ DROP any old policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data"               ON public.users;
DROP POLICY IF EXISTS "Users can insert own data"             ON public.users;
DROP POLICY IF EXISTS "Users can update own data"             ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users"           ON public.users;
DROP POLICY IF EXISTS "Technicians can read clients"          ON public.users;

-- 4️⃣ CREATE new, non-recursive policies using JWT claims

-- Users can read their own row
CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own row
CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own row (cannot change role)
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = ANY (ARRAY['admin'::text, 'client'::text, 'technician'::text])
  );

-- Admins have full CRUD on users
CREATE POLICY "Admins can manage all users"
  ON public.users FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Technicians can read only client users
CREATE POLICY "Technicians can read clients"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'technician'
    AND role = 'client'
  );
