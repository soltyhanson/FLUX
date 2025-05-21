/*
  # Fix RLS policies for user queries

  1. Changes
    - Drop existing policies that might conflict
    - Add new policies for querying users by role
    - Ensure admin and technician can query client users
    - Ensure admin can query technician users

  2. Security
    - Maintain RLS enabled
    - Add specific policies for role-based queries
*/

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create new policies for role-based queries
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Technicians can read client users"
  ON users FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role'::text) = 'technician'::text
    AND role = 'client'::text
  );

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);