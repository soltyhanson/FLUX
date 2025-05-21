/*
  # Fix RLS policies for users table

  1. Changes
    - Drop existing policies
    - Create new, simplified policies for admin access
    - Ensure proper role-based access control

  2. Security
    - Maintain row-level security
    - Ensure admins can read all users
    - Users can still read their own data
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Create new policies
CREATE POLICY "Enable read access for admins"
  ON users FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
    OR auth.uid() = id
  );

CREATE POLICY "Enable insert for users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for admins and own data"
  ON users FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
    OR auth.uid() = id
  );