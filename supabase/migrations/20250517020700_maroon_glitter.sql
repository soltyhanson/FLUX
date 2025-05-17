/*
  # Jobs Table Schema

  1. Table Structure
    - `jobs` table with the following columns:
      - `id` (uuid, primary key)
      - `client_id` (uuid, references users.id)
      - `technician_id` (uuid, references users.id, nullable)
      - `title` (text)
      - `description` (text, nullable)
      - `status` (text, with check constraint)
      - `site_location` (text, nullable)
      - `scheduled_at` (timestamptz, nullable)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS
    - Policies for:
      - Admins: full access
      - Technicians: insert and view assigned jobs
      - Clients: view and update own jobs

  3. Constraints
    - Status must be one of: 'Allocated', 'In Progress', 'Ready to Invoice', 'Invoice Sent', 'Paid'
    - Foreign key constraints to users table
*/

-- Drop existing table and dependencies
DROP TABLE IF EXISTS jobs;

-- Create jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technician_id uuid REFERENCES users(id),
  title text NOT NULL,
  description text,
  status text NOT NULL,
  site_location text,
  scheduled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT jobs_status_check CHECK (
    status IN ('Allocated', 'In Progress', 'Ready to Invoice', 'Invoice Sent', 'Paid')
  )
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policies

-- Admins have full access
CREATE POLICY "Admins manage all jobs"
  ON jobs FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Only admins & technicians may INSERT jobs
CREATE POLICY "Admins & techs insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role') IN ('admin', 'technician'));

-- Clients can view their own jobs
CREATE POLICY "Clients select own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Technicians can view jobs assigned to them
CREATE POLICY "Techs select assigned jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (technician_id = auth.uid());

-- Allow updates by client or assigned technician
CREATE POLICY "Assigned update jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING ((auth.uid() = client_id) OR (auth.uid() = technician_id))
  WITH CHECK ((auth.uid() = client_id) OR (auth.uid() = technician_id));