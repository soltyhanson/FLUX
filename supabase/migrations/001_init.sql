-- supabase/migrations/001_init.sql

-- 1️⃣ Create users table if not exists
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','client','technician')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2️⃣ Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3️⃣ Helper function to check a user's role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.user_has_role(r TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.users u
     WHERE u.id = auth.uid()
       AND u.role = r
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 4️⃣ Drop any old policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Technicians can read clients" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- 5️⃣ Users: read own row
CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 6️⃣ Admins: read all users
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (public.user_has_role('admin'));

-- 7️⃣ Technicians: read only client users
CREATE POLICY "Technicians can read clients"
  ON public.users FOR SELECT
  TO authenticated
  USING (public.user_has_role('technician') AND role = 'client');

-- 8️⃣ Users: insert own data
CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 9️⃣ Users: update own data (role immutable)
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = OLD.role);

-- 🔟 Admins: update all users
CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  TO authenticated
  USING (public.user_has_role('admin'));
