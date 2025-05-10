/*
  # Add user insert policy
  
  1. Changes
    - Add policy to allow users to insert their own data row
    - This enables new user registration by allowing authenticated users to create their own record
  
  2. Security
    - Policy ensures users can only insert rows where id matches their auth.uid()
    - Maintains data integrity by preventing users from creating records for other users
*/

-- Allow new users to insert their own row
DROP POLICY IF EXISTS "Users can insert own data" ON users;

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);