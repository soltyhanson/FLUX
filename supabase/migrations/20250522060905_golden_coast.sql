/*
  # Fix recursive policies in users table
  
  1. Changes
    - Remove self-referential queries from policies
    - Use JWT claims for role checks instead of querying users table
    - Simplify policy structure while maintaining security
  
  2. Security
    - Maintains same access control rules
    - Prevents infinite recursion
    - Uses JWT claims for role verification
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Technicians can read clients" ON users;

-- Create new non-recursive policies using JWT claims
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
  (auth.jwt() ->> 'role')::text = 'admin'
);

CREATE POLICY "Technicians can read clients"
ON users
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'technician'
  AND role = 'client'
);