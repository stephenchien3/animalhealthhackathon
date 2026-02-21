-- ============================================================
-- CleanFeed Database Schema
-- Complete schema: corporations, sheds, profiles, RLS, seed data.
-- ============================================================

-- ── Enums ─────────────────────────────────────────────────────

CREATE TYPE corporation_tier AS ENUM ('multinational', 'regional', 'local');
CREATE TYPE soybean_type     AS ENUM ('meal', 'whole', 'hull', 'other');
CREATE TYPE shed_status      AS ENUM ('operational', 'maintenance', 'offline');

-- ── Shared trigger function ───────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Corporations ──────────────────────────────────────────────

CREATE TABLE corporations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  country       VARCHAR(100) NOT NULL,
  tier          corporation_tier NOT NULL DEFAULT 'local',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER corporations_updated_at
  BEFORE UPDATE ON corporations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Sheds ─────────────────────────────────────────────────────

CREATE TABLE sheds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporation_id  UUID NOT NULL REFERENCES corporations(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  code            VARCHAR(20) NOT NULL UNIQUE,
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  address         TEXT NOT NULL DEFAULT '',
  image_url       TEXT,
  soybean_type    soybean_type NOT NULL DEFAULT 'whole',
  soybean_count   DECIMAL(12, 3) NOT NULL DEFAULT 0,
  moisture_pct    DECIMAL(5, 2) NOT NULL DEFAULT 0,
  temperature     DECIMAL(5, 2) NOT NULL DEFAULT 0,
  capacity_tonnes DECIMAL(12, 3) NOT NULL DEFAULT 0,
  status          shed_status NOT NULL DEFAULT 'operational',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sheds_corporation_id_idx ON sheds(corporation_id);
CREATE INDEX sheds_status_idx ON sheds(status);

CREATE TRIGGER sheds_updated_at
  BEFORE UPDATE ON sheds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Profiles ──────────────────────────────────────────────────

CREATE TABLE profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  corporation_id  UUID NOT NULL REFERENCES corporations(id) ON DELETE CASCADE,
  full_name       VARCHAR(255) NOT NULL,
  role            VARCHAR(20) NOT NULL DEFAULT 'viewer'
                  CHECK (role IN ('admin', 'manager', 'viewer')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_profiles_corporation ON profiles(corporation_id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE corporations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheds ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own corporation" ON corporations FOR SELECT
  USING (id = (auth.jwt() ->> 'corporation_id')::uuid);

CREATE POLICY "View own sheds" ON sheds FOR SELECT
  USING (corporation_id = (auth.jwt() ->> 'corporation_id')::uuid);

CREATE POLICY "Create own sheds" ON sheds FOR INSERT
  WITH CHECK (corporation_id = (auth.jwt() ->> 'corporation_id')::uuid);

CREATE POLICY "Update own sheds" ON sheds FOR UPDATE
  USING (corporation_id = (auth.jwt() ->> 'corporation_id')::uuid);

CREATE POLICY "Delete own sheds" ON sheds FOR DELETE
  USING (corporation_id = (auth.jwt() ->> 'corporation_id')::uuid);

CREATE POLICY "View own profile" ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Update own profile" ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- ── Seed Data ─────────────────────────────────────────────────

INSERT INTO corporations (id, name, contact_email, country, tier) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'AgriCorp International', 'ops@agricorp.com', 'Brazil', 'multinational');

INSERT INTO sheds (corporation_id, name, code, latitude, longitude, soybean_type, soybean_count, moisture_pct, temperature, capacity_tonnes, status) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Mato Grosso Facility A', 'BR-042', -12.6819, -56.9211, 'meal',  4200.000, 12.3, 28.5, 5000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Mato Grosso Facility B', 'BR-088', -13.0500, -55.4800, 'whole', 3100.500, 15.3, 30.1, 4000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Buenos Aires Storage',   'AR-019', -34.6037, -58.3816, 'meal',  2800.000, 17.8, 22.3, 3500.000, 'maintenance'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Iowa Distribution Hub',  'US-107',  41.8780, -93.0977, 'whole', 5100.000, 16.1, 18.7, 6000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Maharashtra Depot',      'IN-204',  19.7515,  75.7139, 'hull',  1500.750, 14.9, 33.2, 2000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Goias Facility',         'BR-115', -15.8270, -49.8362, 'meal',  3800.000, 11.5, 27.8, 4500.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Rosario Port Storage',   'AR-033', -32.9468, -60.6393, 'other',  900.000, 10.2, 19.5, 1500.000, 'offline'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Parana Warehouse',       'BR-201', -25.4284, -49.2733, 'whole', 4600.000, 13.7, 25.1, 5500.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Illinois Feed Center',   'US-044',  40.6331, -89.3985, 'meal',  5500.000, 11.0, 15.3, 7000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Punjab Storage Unit',    'IN-078',  30.7333,  76.7794, 'hull',  1200.000, 13.1, 31.8, 2500.000, 'maintenance');
