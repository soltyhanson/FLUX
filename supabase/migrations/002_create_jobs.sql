-- supabase/migrations/002_create_jobs.sql

-- 1️⃣ Drop any old jobs table
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
                      'Allocated','In Progress',
                      'Ready to Invoice','Invoice Sent','Paid'
                    )),
  site_location  TEXT,
  scheduled_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ    DEFAULT now()
);

-- 3️⃣ Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 4️⃣ Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Admins & techs select jobs" ON jobs;
DROP POLICY IF EXISTS "Admins & techs insert jobs" ON jobs;
DROP POLICY IF EXISTS "Admins & techs update jobs" ON jobs;
DROP POLICY IF EXISTS "Admins & techs delete jobs" ON jobs;
DROP POLICY IF EXISTS "Clients select own jobs" ON jobs;

-- 5️⃣ Admins & Technicians: SELECT any job
CREATE POLICY "Admins & techs select jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin','technician')
    )
  );

-- 6️⃣ Admins & Technicians: INSERT new jobs
CREATE POLICY "Admins & techs insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin','technician')
    )
    -- you can also enforce NEW.client_id = auth.uid() here if desired
  );

-- 7️⃣ Admins & Technicians: UPDATE any job
CREATE POLICY "Admins & techs update jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin','technician')
    )
  );

-- 8️⃣ Admins & Technicians: DELETE any job
CREATE POLICY "Admins & techs delete jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin','technician')
    )
  );

-- 9️⃣ Clients: SELECT only their own jobs
CREATE POLICY "Clients select own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING ( client_id = auth.uid() );
