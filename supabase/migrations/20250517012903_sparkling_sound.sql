/*
  # Create jobs table

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references users)
      - `technician_id` (uuid, references users)
      - `title` (text)
      - `description` (text)
      - `status` (text, enum)
      - `site_location` (text)
      - `scheduled_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `jobs` table
    - Add policies for:
      - Admins: full control
      - Clients: read/create own jobs
      - Technicians: read assigned jobs
      - Assigned users: update status/details

  3. Changes
    - Added foreign key constraints to users table
    - Added status validation check
*/

-- Drop existing jobs artifacts
DROP TABLE IF EXISTS jobs CASCADE;

-- Create jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (
    status IN ('Allocated', 'In Progress', 'Ready to Invoice', 'Invoice Sent', 'Paid')
  ),
  site_location TEXT,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Admins policy: full control
CREATE POLICY "Admins manage all jobs"
  ON jobs FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Clients can read/create their own
CREATE POLICY "Clients select own jobs"
  ON jobs FOR SELECT TO authenticated
  USING (client_id = auth.uid());
CREATE POLICY "Clients insert own jobs"
  ON jobs FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Technicians can read assigned jobs
CREATE POLICY "Techs select assigned jobs"
  ON jobs FOR SELECT TO authenticated
  USING (technician_id = auth.uid());

-- Assigned users can update status/details
CREATE POLICY "Assigned update jobs"
  ON jobs FOR UPDATE TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = technician_id);