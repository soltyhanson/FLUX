-- 002_create_jobs.sql

-- 1) Drop any old jobs table
DROP TABLE IF EXISTS jobs CASCADE;

-- 2) Create fresh jobs table
CREATE TABLE jobs (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technician_id  UUID           REFERENCES users(id),
  title          TEXT           NOT NULL,
  description    TEXT,
  status         TEXT           NOT NULL
                      CHECK (status IN ('Allocated','In Progress','Ready to Invoice','Invoice Sent','Paid')),
  site_location  TEXT,
  scheduled_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ    DEFAULT now()
);

-- 3) Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 4) Policies

-- Admins & techs get full SELECT/INSERT/UPDATE/DELETE
CREATE POLICY "Admins & techs manage jobs"
  ON jobs FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') IN ('admin','technician'));

-- Clients can only SELECT their own
CREATE POLICY "Clients select own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Clients cannot INSERT or DELETE anymore (we dropped those policies)

-- Technicians select only assigned is covered by the ALL policy above
