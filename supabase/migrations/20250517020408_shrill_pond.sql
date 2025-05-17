/*
  # Create jobs table with policies

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references users.id)
      - `technician_id` (uuid, references users.id)
      - `title` (text)
      - `description` (text)
      - `status` (text, enum)
      - `site_location` (text)
      - `scheduled_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `jobs` table
    - Add policies for:
      - Admins: full access
      - Technicians: read all, create, update assigned
      - Clients: read own, update own
*/

-- Drop existing table and dependencies
DROP TABLE IF EXISTS jobs CASCADE;

-- Create jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technician_id uuid REFERENCES users(id),
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('Allocated', 'In Progress', 'Ready to Invoice', 'Invoice Sent', 'Paid')),
  site_location text,
  scheduled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policies for admins
CREATE POLICY "Admins manage all jobs"
  ON jobs FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Policies for technicians
CREATE POLICY "Admins & techs insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role') IN ('admin', 'technician'));

CREATE POLICY "Techs select assigned jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (technician_id = auth.uid());

CREATE POLICY "Assigned update jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING ((auth.uid() = client_id) OR (auth.uid() = technician_id))
  WITH CHECK ((auth.uid() = client_id) OR (auth.uid() = technician_id));

-- Policies for clients
CREATE POLICY "Clients select own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());