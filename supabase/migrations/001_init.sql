-- Wipe out any existing users table + all related objects
DROP TABLE IF EXISTS users CASCADE;

-- Create fresh users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','client','technician')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Block non-admin role changes
CREATE OR REPLACE FUNCTION public.check_role_change()
  RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE'
      AND NEW.role <> OLD.role
      AND (auth.jwt() ->> 'role') <> 'admin')
  THEN
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_role_change_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.check_role_change();

-- RLS Policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');
