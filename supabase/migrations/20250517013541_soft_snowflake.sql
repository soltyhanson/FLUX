/*
  # Fix jobs policies

  1. Changes
    - Remove the "Clients insert own jobs" policy
    - Add new INSERT policy for admins and technicians only

  2. Security
    - Only admins and technicians can create new jobs
    - Maintains existing read/update policies for all roles
*/

-- Only admins & technicians may INSERT into jobs
DROP POLICY IF EXISTS "Clients insert own jobs" ON jobs;

CREATE POLICY "Admins & techs insert jobs"
  ON jobs FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role') IN ('admin', 'technician'));