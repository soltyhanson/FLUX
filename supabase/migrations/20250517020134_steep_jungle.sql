/*
  # Update job policies for client restrictions
  
  1. Changes
    - Remove client's ability to insert jobs
    - Ensure only admins and technicians can insert jobs
  
  2. Security
    - Drop existing policies to avoid conflicts
    - Create new policy for admins and technicians
*/

-- Drop both policies to ensure clean state
DROP POLICY IF EXISTS "Clients insert own jobs" ON jobs;
DROP POLICY IF EXISTS "Admins & techs insert jobs" ON jobs;

-- Create fresh policy for admins and technicians
CREATE POLICY "Admins & techs insert jobs"
  ON jobs FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role') IN ('admin', 'technician'));