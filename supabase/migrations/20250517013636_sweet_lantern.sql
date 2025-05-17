/*
  # Fix jobs table policies

  1. Changes
    - Remove the "Clients insert own jobs" policy
    - Ensure "Admins & techs insert jobs" policy is properly set up
    
  2. Security
    - Only admins and technicians can create new jobs
    - Maintains existing RLS policies for other operations
*/

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Clients insert own jobs" ON jobs;
DROP POLICY IF EXISTS "Admins & techs insert jobs" ON jobs;

-- Create the new insert policy for admins and technicians
CREATE POLICY "Admins & techs insert jobs"
  ON jobs FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role') IN ('admin', 'technician'));