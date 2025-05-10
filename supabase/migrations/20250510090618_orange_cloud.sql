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

-- Create the users table first
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','client','technician')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create the role change function
CREATE OR REPLACE FUNCTION public.check_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.role <> OLD.role AND (auth.jwt() ->> 'role') <> 'admin') THEN
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger after the function exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'check_role_change_trigger'
  ) THEN
    CREATE TRIGGER check_role_change_trigger
      BEFORE UPDATE ON users
      FOR EACH ROW 
      EXECUTE FUNCTION public.check_role_change();
  END IF;
END $$;

-- Create RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data" 
      ON users 
      FOR SELECT 
      TO authenticated 
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data" 
      ON users 
      FOR UPDATE 
      TO authenticated 
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins can read all users'
  ) THEN
    CREATE POLICY "Admins can read all users" 
      ON users 
      FOR SELECT 
      TO authenticated 
      USING ((auth.jwt() ->> 'role') = 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Admins can update all users'
  ) THEN
    CREATE POLICY "Admins can update all users" 
      ON users 
      FOR UPDATE 
      TO authenticated 
      USING ((auth.jwt() ->> 'role') = 'admin');
  END IF;
END $$;