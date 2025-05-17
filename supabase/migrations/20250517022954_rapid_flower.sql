/*
  # Update job policies to allow client job creation

  1. Changes
    - Add new policy allowing clients to create jobs for themselves
    - Update existing policies for better clarity and security

  2. Security
    - Clients can only create jobs with their own client_id
    - Maintains existing admin and technician permissions
    - Ensures proper row-level security for all operations
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins & techs manage jobs" ON jobs;
DROP POLICY IF EXISTS "Clients select own jobs" ON jobs;
DROP POLICY IF EXISTS "Admins & techs insert jobs" ON jobs;

-- Create new, more specific policies
CREATE POLICY "Admins manage all jobs"
  ON jobs FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Technicians manage assigned jobs"
  ON jobs FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'technician' AND
    (technician_id = auth.uid() OR technician_id IS NULL)
  );

CREATE POLICY "Clients create own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'client' AND
    client_id = auth.uid()
  );

CREATE POLICY "Clients view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'client' AND
    client_id = auth.uid()
  );

CREATE POLICY "Clients update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'client' AND
    client_id = auth.uid()
  );