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

-- 5️⃣ Admins: Full access to all jobs
CREATE POLICY "Admins full access"
  ON jobs
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- 6️⃣ Technicians: Access to assigned jobs and unassigned jobs
CREATE POLICY "Technicians access jobs"
  ON jobs
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'technician'
        AND (
          technician_id IS NULL 
          OR technician_id = auth.uid()
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'technician'
    )
  );

-- 7️⃣ Clients: SELECT only their own jobs
CREATE POLICY "Clients select own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'client'
    )
  );

-- 8️⃣ Clients: INSERT only their own jobs
CREATE POLICY "Clients insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'client'
    )
  );

-- 9️⃣ Clients: UPDATE their own jobs (except status)
CREATE POLICY "Clients update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'client'
    )
  )
  WITH CHECK (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'client'
    )
    -- Prevent clients from changing job status
    AND (
      OLD.status = NEW.status
    )
  );