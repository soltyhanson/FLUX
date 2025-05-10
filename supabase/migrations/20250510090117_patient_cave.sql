/*
  # Initial schema for FLUX application
  
  1. Schema Structure
    - `users` table with role-based access control 
    - Role-specific triggers and policies
  
  2. Security
    - Row level security enabled for users table
    - Policies for user data access based on role
    - Trigger to prevent unauthorized role changes
*/

-- DROP any old users artifacts
DROP TRIGGER IF EXISTS check_role_change_trigger ON users;
DROP TABLE IF EXISTS users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- CREATE fresh users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','client','technician')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Trigger to block non-admins changing roles
CREATE OR REPLACE FUNCTION public.check_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.role <> OLD.role AND (auth.jwt() ->> 'role') <> 'admin') THEN
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER check_role_change_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.check_role_change();

-- RLS Policies
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can read all users" ON users FOR SELECT TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY "Admins can update all users" ON users FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');