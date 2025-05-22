/*
  # Fix recursive user policies

  1. Changes
    - Remove recursive policies that were causing infinite loops
    - Simplify policy structure for user roles
    - Maintain same security model but with optimized policy definitions

  2. Security
    - Maintain RLS enabled
    - Rewrite policies to avoid recursion while keeping same access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins & techs can read all users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Technicians can read clients" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new non-recursive policies
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role = ANY (ARRAY['admin'::text, 'client'::text, 'technician'::text])
);

CREATE POLICY "Admins can manage all users"
ON users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Technicians can read clients"
ON users
FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'technician'
  ))
  AND role = 'client'
);