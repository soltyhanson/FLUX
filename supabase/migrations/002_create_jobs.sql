-- supabase/migrations/002_create_jobs.sql

-- 1️⃣ Drop existing jobs table (and all old policies/triggers)
DROP TABLE IF EXISTS jobs CASCADE;

-- 2️⃣ Recreate jobs table
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

-- 3️⃣ Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 4️⃣ DROP any old policies to avoid conflicts
DROP POLICY IF EXISTS "Admins & techs select jobs" ON jobs;
DROP POLICY IF EXISTS "Admins & techs insert jobs" ON jobs;
DROP POLICY IF EXISTS "Admins & techs update jobs" ON jobs;
DROP POLICY IF EXISTS "Admins & techs delete jobs" ON jobs;
DROP POLICY IF EXISTS "Clients select own jobs" ON jobs;
DROP POLICY IF EXISTS "Clients insert own jobs" ON jobs;

-- Admins: Full access
CREATE POLICY "Admins have full access"
  ON jobs
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'))
  WITH CHECK (EXISTS (
  );

-- 6️⃣ Admins & Technicians: INSERT jobs
CREATE POLICY "Admins & techs insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin','technician')
    )
  );

-- Technicians: SELECT all jobs
CREATE POLICY "Technicians can select all jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'technician'));


-- Clients: SELECT only their own jobs
CREATE POLICY "Clients select own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'client'));



-- Clients: INSERT only their own jobs
CREATE POLICY "Clients insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid() AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'client'));


-- 9️⃣ Admins & Technicians: UPDATE any job
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

-- 🔟 Admins & Technicians: DELETE any job
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

-- Clients: UPDATE only their own jobs (excluding status)
CREATE POLICY "Clients update own jobs (no status change)"
  ON jobs FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'client'))
  WITH CHECK (client_id = auth.uid() AND OLD.status = NEW.status AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'client'));
