/*
  # Update jobs table policies

  1. Changes
    - Remove client job creation ability
    - Add new policy for admins and technicians to create jobs
  
  2. Security
    - Only admins and technicians can create new jobs
    - Maintains existing read/update policies
*/

-- Only admins & technicians may INSERT into jobs
DROP POLICY IF EXISTS "Clients insert own jobs" ON jobs;

CREATE POLICY "Admins & techs insert jobs"
  ON jobs FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'role') IN ('admin', 'technician')
  );