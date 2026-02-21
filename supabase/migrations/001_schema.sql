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
  ('a1b2c3d4-0000-0000-0000-000000000001', 'AgriCorp International', 'ops@agricorp.com', 'Zambia', 'multinational');

INSERT INTO sheds (corporation_id, name, code, latitude, longitude, image_url, soybean_type, soybean_count, moisture_pct, temperature, capacity_tonnes, status) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Lusaka Central Store',    'ZM-001', -15.3875,  28.3228, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', 'meal',  4200.000, 12.3, 28.5, 5000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Copperbelt Depot',        'ZM-002', -12.9714,  28.6317, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop', 'whole', 3100.500, 15.3, 30.1, 4000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Southern Province Shed',  'ZM-003', -15.8000,  28.2800, 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop', 'meal',  2800.000, 17.8, 22.3, 3500.000, 'maintenance'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Kabwe Storage Facility',  'ZM-004', -14.4380,  28.4519, 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=300&fit=crop', 'whole', 5100.000, 16.1, 18.7, 6000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Livingstone Warehouse',   'ZM-005', -17.8419,  25.8544, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&h=300&fit=crop', 'other',  900.000, 10.2, 19.5, 1500.000, 'offline'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Chipata Feed Center',     'ZM-006', -13.6390,  32.6460, 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', 'meal',  3800.000, 11.5, 27.8, 4500.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Maharashtra Depot',       'IN-204',  19.7515,  75.7139, 'https://images.unsplash.com/photo-1586771107445-b3e7eb4e1e48?w=400&h=300&fit=crop', 'hull',  1500.750, 14.9, 33.2, 2000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Punjab Storage Unit',     'IN-078',  30.7333,  76.7794, 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=400&h=300&fit=crop', 'hull',  1200.000, 13.1, 31.8, 2500.000, 'maintenance'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Gujarat Feed Store',      'IN-115',  23.0225,  72.5714, 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop', 'meal',  5500.000, 11.0, 15.3, 7000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Madhya Pradesh Silo',     'IN-301',  23.2599,  77.4126, 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=400&h=300&fit=crop', 'whole', 4600.000, 13.7, 25.1, 5500.000, 'operational');
