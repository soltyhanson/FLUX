-- supabase/migrations/002_create_jobs.sql

-- 1️⃣ Drop any old jobs table (clean slate)
DROP TABLE IF EXISTS jobs CASCADE;

-- 2️⃣ Create fresh jobs table
CREATE TABLE jobs (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technician_id  UUID           REFERENCES users(id),
  title          TEXT           NOT NULL,
  description    TEXT,
  status         TEXT           NOT NULL
                    CHECK (status IN (
                      'Allocated','In Progress','Ready to Invoice',
                      'Invoice Sent','Paid'
                    )),
  site_location  TEXT,
  scheduled_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ    DEFAULT now()
);

-- 3️⃣ Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 4️⃣ Policies

-- 👀 Admins & technicians can SELECT any job
CREATE POLICY "Admins & techs select jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') IN ('admin','technician'));

-- ✏️ Admins & technicians can INSERT jobs
CREATE POLICY "Admins & techs insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role') IN ('admin','technician'));

-- 🔄 Admins & technicians can UPDATE any job
CREATE POLICY "Admins & techs update jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role') IN ('admin','technician'));

-- 🗑️ Admins & technicians can DELETE any job
CREATE POLICY "Admins & techs delete jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'role') IN ('admin','technician'));

-- 👤 Clients can only SELECT their own jobs
CREATE POLICY "Clients select own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());
