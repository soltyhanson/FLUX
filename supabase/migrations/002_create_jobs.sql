-- supabase/migrations/002_create_jobs.sql

-- 1️⃣ Drop any old table & policies
DROP TABLE IF EXISTS jobs CASCADE;

-- 2️⃣ Recreate jobs table
CREATE TABLE jobs (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technician_id  UUID           REFERENCES users(id),
  title          TEXT           NOT NULL,
  description    TEXT,
  status         TEXT           NOT NULL CHECK (status IN (
                    'Allocated',
                    'In Progress',
                    'Ready to Invoice',
                    'Invoice Sent',
                    'Paid'
                  )),
  site_location  TEXT,
  scheduled_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ    DEFAULT now()
);

-- 3️⃣ Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 4️⃣ Drop any old policies
DROP POLICY IF EXISTS "Admins full access"           ON jobs;
DROP POLICY IF EXISTS "Technicians select jobs"      ON jobs;
DROP POLICY IF EXISTS "Technicians insert jobs"      ON jobs;
DROP POLICY IF EXISTS "Technicians update jobs"      ON jobs;
DROP POLICY IF EXISTS "Clients select own jobs"      ON jobs;
DROP POLICY IF EXISTS "Clients insert own jobs"      ON jobs;
DROP POLICY IF EXISTS "Admins & techs update jobs"   ON jobs;
DROP POLICY IF EXISTS "Admins & techs delete jobs"   ON jobs;
DROP POLICY IF EXISTS "Clients update own jobs (no status change)" ON jobs;

-- 5️⃣ Admins: full CRUD
CREATE POLICY "Admins full access"
  ON jobs FOR ALL
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

-- 6️⃣ Technicians: select/insert/update
CREATE POLICY "Technicians select jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING ( auth.uid() IN (
    SELECT id FROM users WHERE role = 'technician'
  ));

CREATE POLICY "Technicians insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK ( auth.uid() IN (
    SELECT id FROM users WHERE role = 'technician'
  ));

CREATE POLICY "Technicians update jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING ( auth.uid() IN (
    SELECT id FROM users WHERE role = 'technician'
  ));

-- 7️⃣ Clients: only their own
CREATE POLICY "Clients select own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING ( client_id = auth.uid() );

CREATE POLICY "Clients insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK ( client_id = auth.uid() );

CREATE POLICY "Clients update own jobs (no status change)"
  ON jobs FOR UPDATE
  TO authenticated
  USING ( client_id = auth.uid() )
  WITH CHECK (
    client_id = auth.uid()
    AND OLD.status = NEW.status
  );
