# Database Tables Implementation Plan

## Overview

All data is stored in **Supabase PostgreSQL**. This document defines every table, column, constraint, index, RLS policy, and migration needed.

---

## Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌────────────────────┐
│   corporations   │       │        sheds          │       │  sensor_readings   │
├──────────────────┤       ├──────────────────────┤       ├────────────────────┤
│ id          (PK) │──┐    │ id              (PK) │──┐    │ id            (PK) │
│ name             │  │    │ corporation_id  (FK) │  │    │ shed_id       (FK) │
│ contact_email    │  └───>│ name                 │  └───>│ sensor_type        │
│ country          │       │ code            (UQ) │       │ value              │
│ tier             │       │ latitude             │       │ unit               │
│ created_at       │       │ longitude            │       │ recorded_at        │
│ updated_at       │       │ address              │       │ created_at         │
└──────────────────┘       │ image_url            │       └────────────────────┘
                           │ soybean_type         │
                           │ soybean_count        │       ┌────────────────────┐
                           │ moisture_pct         │       │      alerts        │
                           │ temperature          │       ├────────────────────┤
                           │ capacity_tonnes      │       │ id            (PK) │
                           │ status               │       │ shed_id       (FK) │
                           │ created_at           │       │ alert_type         │
                           │ updated_at           │       │ severity           │
┌──────────────────┐       └──────────────────────┘       │ message            │
│     profiles     │                                      │ acknowledged       │
├──────────────────┤                                      │ acknowledged_by    │
│ id          (PK) │       ┌──────────────────────┐       │ created_at         │
│ user_id     (FK) │       │    audit_log         │       │ resolved_at        │
│ corporation_id   │       ├──────────────────────┤       └────────────────────┘
│ full_name        │       │ id              (PK) │
│ role             │       │ user_id         (FK) │
│ avatar_url       │       │ action               │
│ settings (JSON)  │       │ table_name           │
│ created_at       │       │ record_id            │
│ updated_at       │       │ old_data (JSONB)     │
└──────────────────┘       │ new_data (JSONB)     │
                           │ created_at           │
                           └──────────────────────┘
```

---

## Table Definitions

### 1. `corporations`

Represents the company/organization that owns sheds.

```sql
CREATE TABLE corporations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  country       VARCHAR(100) NOT NULL,
  tier          VARCHAR(20) NOT NULL CHECK (tier IN ('multinational', 'regional', 'local')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_corporations_tier ON corporations(tier);
CREATE INDEX idx_corporations_country ON corporations(country);
```

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `name` | VARCHAR(255) | No | — | e.g. "Cargill", "ADM" |
| `contact_email` | VARCHAR(255) | No | — | Primary contact |
| `country` | VARCHAR(100) | No | — | HQ country |
| `tier` | VARCHAR(20) | No | — | `multinational` / `regional` / `local` |
| `created_at` | TIMESTAMPTZ | No | `now()` | Auto |
| `updated_at` | TIMESTAMPTZ | No | `now()` | Auto via trigger |

---

### 2. `sheds`

The core table. Each row is a physical storage shed.

```sql
CREATE TABLE sheds (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporation_id   UUID NOT NULL REFERENCES corporations(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  code             VARCHAR(20) NOT NULL UNIQUE,
  latitude         DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude        DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  address          TEXT,
  image_url        TEXT,
  soybean_type     VARCHAR(20) NOT NULL CHECK (soybean_type IN ('meal', 'whole', 'hull', 'other')),
  soybean_count    DECIMAL(12,3) NOT NULL DEFAULT 0 CHECK (soybean_count >= 0),
  moisture_pct     DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (moisture_pct BETWEEN 0 AND 100),
  temperature      DECIMAL(5,2),
  capacity_tonnes  DECIMAL(12,3) NOT NULL CHECK (capacity_tonnes > 0),
  status           VARCHAR(20) NOT NULL DEFAULT 'operational'
                   CHECK (status IN ('operational', 'maintenance', 'offline')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sheds_corporation ON sheds(corporation_id);
CREATE INDEX idx_sheds_status ON sheds(status);
CREATE INDEX idx_sheds_soybean_type ON sheds(soybean_type);
CREATE INDEX idx_sheds_location ON sheds(latitude, longitude);
CREATE INDEX idx_sheds_moisture ON sheds(moisture_pct DESC);
```

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | PK |
| `corporation_id` | UUID | No | — | FK → corporations.id, CASCADE |
| `name` | VARCHAR(255) | No | — | Human-readable name |
| `code` | VARCHAR(20) | No | — | UNIQUE, e.g. "BR-042" |
| `latitude` | DOUBLE PRECISION | No | — | -90 to 90 |
| `longitude` | DOUBLE PRECISION | No | — | -180 to 180 |
| `address` | TEXT | Yes | — | Street address |
| `image_url` | TEXT | Yes | — | Photo URL |
| `soybean_type` | VARCHAR(20) | No | — | meal/whole/hull/other |
| `soybean_count` | DECIMAL(12,3) | No | 0 | Tonnes stored, >= 0 |
| `moisture_pct` | DECIMAL(5,2) | No | 0 | 0–100 |
| `temperature` | DECIMAL(5,2) | Yes | — | °C |
| `capacity_tonnes` | DECIMAL(12,3) | No | — | Max capacity, > 0 |
| `status` | VARCHAR(20) | No | `operational` | operational/maintenance/offline |
| `created_at` | TIMESTAMPTZ | No | `now()` | — |
| `updated_at` | TIMESTAMPTZ | No | `now()` | Via trigger |

---

### 3. `sensor_readings`

Time-series log of sensor data. High-write, append-only.

```sql
CREATE TABLE sensor_readings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shed_id     UUID NOT NULL REFERENCES sheds(id) ON DELETE CASCADE,
  sensor_type VARCHAR(20) NOT NULL CHECK (sensor_type IN ('temperature', 'moisture', 'fill_level')),
  value       DOUBLE PRECISION NOT NULL,
  unit        VARCHAR(20) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Critical for time-series queries
CREATE INDEX idx_readings_shed_time ON sensor_readings(shed_id, recorded_at DESC);
CREATE INDEX idx_readings_type ON sensor_readings(sensor_type);
CREATE INDEX idx_readings_recorded ON sensor_readings(recorded_at DESC);
```

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | UUID | No | PK |
| `shed_id` | UUID | No | FK → sheds.id |
| `sensor_type` | VARCHAR(20) | No | temperature / moisture / fill_level |
| `value` | DOUBLE PRECISION | No | The reading value |
| `unit` | VARCHAR(20) | No | `°C`, `%`, `cm`, `tonnes` |
| `recorded_at` | TIMESTAMPTZ | No | When sensor took the reading |
| `created_at` | TIMESTAMPTZ | No | When row was inserted |

**Growth estimate**: ~3 readings/shed/hour × 127 sheds = ~9,000 rows/day. At 30 days = ~270k rows. Supabase free tier handles this easily.

---

### 4. `profiles`

Extends Supabase Auth `auth.users` with app-specific data.

```sql
CREATE TABLE profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  corporation_id  UUID NOT NULL REFERENCES corporations(id) ON DELETE CASCADE,
  full_name       VARCHAR(255) NOT NULL,
  role            VARCHAR(20) NOT NULL DEFAULT 'viewer'
                  CHECK (role IN ('admin', 'manager', 'viewer')),
  avatar_url      TEXT,
  settings        JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_profiles_corporation ON profiles(corporation_id);
```

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | UUID | No | PK |
| `user_id` | UUID | No | UNIQUE, FK → auth.users.id |
| `corporation_id` | UUID | No | FK → corporations.id |
| `full_name` | VARCHAR(255) | No | Display name |
| `role` | VARCHAR(20) | No | admin / manager / viewer |
| `avatar_url` | TEXT | Yes | Profile photo |
| `settings` | JSONB | No | User preferences (temp unit, default zoom, etc.) |
| `created_at` | TIMESTAMPTZ | No | — |
| `updated_at` | TIMESTAMPTZ | No | — |

**Settings JSONB shape:**

```json
{
  "temperatureUnit": "celsius",
  "defaultMapZoom": 3,
  "pageSize": 25,
  "notifications": {
    "highMoisture": true,
    "lowCapacity": true,
    "shedOffline": true
  }
}
```

---

### 5. `alerts`

Tracks triggered alerts for sheds.

```sql
CREATE TABLE alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shed_id         UUID NOT NULL REFERENCES sheds(id) ON DELETE CASCADE,
  alert_type      VARCHAR(30) NOT NULL
                  CHECK (alert_type IN ('high_moisture', 'high_temperature', 'low_capacity', 'offline', 'sensor_fault')),
  severity        VARCHAR(10) NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  message         TEXT NOT NULL,
  acknowledged    BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_alerts_shed ON alerts(shed_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_unresolved ON alerts(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
```

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | UUID | No | PK |
| `shed_id` | UUID | No | FK → sheds.id |
| `alert_type` | VARCHAR(30) | No | high_moisture / high_temperature / low_capacity / offline / sensor_fault |
| `severity` | VARCHAR(10) | No | critical / warning / info |
| `message` | TEXT | No | Human-readable alert message |
| `acknowledged` | BOOLEAN | No | Default false |
| `acknowledged_by` | UUID | Yes | FK → profiles.id |
| `created_at` | TIMESTAMPTZ | No | When alert was triggered |
| `resolved_at` | TIMESTAMPTZ | Yes | NULL = still active |

---

### 6. `audit_log`

Tracks who changed what. Useful for compliance and debugging.

```sql
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  action      VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name  VARCHAR(100) NOT NULL,
  record_id   UUID NOT NULL,
  old_data    JSONB,
  new_data    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
```

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | UUID | No | PK |
| `user_id` | UUID | Yes | Who made the change (NULL = system) |
| `action` | VARCHAR(20) | No | INSERT / UPDATE / DELETE |
| `table_name` | VARCHAR(100) | No | Which table was affected |
| `record_id` | UUID | No | PK of the affected row |
| `old_data` | JSONB | Yes | Previous state (NULL for INSERT) |
| `new_data` | JSONB | Yes | New state (NULL for DELETE) |
| `created_at` | TIMESTAMPTZ | No | When the change happened |

---

## Row Level Security (RLS)

All tables should have RLS enabled so users can only access their corporation's data.

```sql
-- Enable RLS on all tables
ALTER TABLE corporations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheds ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's corporation_id
CREATE OR REPLACE FUNCTION get_user_corporation_id()
RETURNS UUID AS $$
  SELECT corporation_id FROM profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Corporations: users can only see their own corporation
CREATE POLICY "Users can view own corporation"
  ON corporations FOR SELECT
  USING (id = get_user_corporation_id());

-- Sheds: users can only see sheds belonging to their corporation
CREATE POLICY "Users can view own sheds"
  ON sheds FOR SELECT
  USING (corporation_id = get_user_corporation_id());

CREATE POLICY "Admins and managers can insert sheds"
  ON sheds FOR INSERT
  WITH CHECK (
    corporation_id = get_user_corporation_id()
    AND (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Admins and managers can update sheds"
  ON sheds FOR UPDATE
  USING (corporation_id = get_user_corporation_id())
  WITH CHECK (
    (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Admins can delete sheds"
  ON sheds FOR DELETE
  USING (
    corporation_id = get_user_corporation_id()
    AND (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
  );

-- Sensor readings: inherit access from parent shed
CREATE POLICY "Users can view readings for own sheds"
  ON sensor_readings FOR SELECT
  USING (
    shed_id IN (SELECT id FROM sheds WHERE corporation_id = get_user_corporation_id())
  );

-- Alerts: inherit access from parent shed
CREATE POLICY "Users can view alerts for own sheds"
  ON alerts FOR SELECT
  USING (
    shed_id IN (SELECT id FROM sheds WHERE corporation_id = get_user_corporation_id())
  );

-- Profiles: users can see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());
```

---

## Auto-Updated Timestamps

```sql
-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON corporations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON sheds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Auto-Create Profile on Signup

When a new user signs up via Supabase Auth, automatically create a profile row:

```sql
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
```

---

## Seed Data

For the hackathon demo, seed with realistic data:

```sql
-- 1 corporation
INSERT INTO corporations (id, name, contact_email, country, tier) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'AgriCorp International', 'ops@agricorp.com', 'Brazil', 'multinational');

-- 10 sheds across multiple countries
INSERT INTO sheds (corporation_id, name, code, latitude, longitude, soybean_type, soybean_count, moisture_pct, temperature, capacity_tonnes, status) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Mato Grosso Facility A', 'BR-042', -12.6819, -56.9211, 'meal', 4200.000, 12.3, 28.5, 5000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Mato Grosso Facility B', 'BR-088', -13.0500, -55.4800, 'whole', 3100.500, 15.3, 30.1, 4000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Buenos Aires Storage',   'AR-019', -34.6037, -58.3816, 'meal', 2800.000, 17.8, 22.3, 3500.000, 'maintenance'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Iowa Distribution Hub',  'US-107', 41.8780,  -93.0977, 'whole', 5100.000, 16.1, 18.7, 6000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Maharashtra Depot',      'IN-204', 19.7515,  75.7139,  'hull', 1500.750, 14.9, 33.2, 2000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Goiás Facility',         'BR-115', -15.8270, -49.8362, 'meal', 3800.000, 11.5, 27.8, 4500.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Rosario Port Storage',   'AR-033', -32.9468, -60.6393, 'other', 900.000, 10.2, 19.5, 1500.000, 'offline'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Paraná Warehouse',       'BR-201', -25.4284, -49.2733, 'whole', 4600.000, 13.7, 25.1, 5500.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Illinois Feed Center',   'US-044', 40.6331,  -89.3985, 'meal', 5500.000, 11.0, 15.3, 7000.000, 'operational'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Punjab Storage Unit',    'IN-078', 30.7333,  76.7794,  'hull', 1200.000, 13.1, 31.8, 2500.000, 'maintenance');
```

---

## Supabase Dashboard Views (Optional)

Create database views for common queries used by the frontend:

```sql
-- View: shed_summary (used by summary page)
CREATE VIEW shed_summary AS
SELECT
  s.corporation_id,
  COUNT(*)                                     AS total_sheds,
  COUNT(*) FILTER (WHERE status = 'operational')   AS operational_count,
  COUNT(*) FILTER (WHERE status = 'maintenance')   AS maintenance_count,
  COUNT(*) FILTER (WHERE status = 'offline')        AS offline_count,
  ROUND(AVG(moisture_pct)::NUMERIC, 2)         AS avg_moisture,
  ROUND(AVG(temperature)::NUMERIC, 2)          AS avg_temperature,
  SUM(soybean_count)                           AS total_tonnes_stored,
  SUM(capacity_tonnes)                         AS total_capacity,
  ROUND((SUM(soybean_count) / NULLIF(SUM(capacity_tonnes), 0) * 100)::NUMERIC, 1) AS utilization_pct
FROM sheds s
GROUP BY s.corporation_id;

-- View: map_markers (used by map page)
CREATE VIEW map_markers AS
SELECT
  id,
  corporation_id,
  name,
  code,
  latitude,
  longitude,
  soybean_type,
  soybean_count,
  moisture_pct,
  temperature,
  capacity_tonnes,
  status
FROM sheds;
```

---

## Migration Order

Run these in Supabase SQL Editor in this order:

1. `corporations` table
2. `sheds` table (depends on corporations)
3. `sensor_readings` table (depends on sheds)
4. `profiles` table (depends on auth.users + corporations)
5. `alerts` table (depends on sheds + profiles)
6. `audit_log` table (depends on auth.users)
7. Triggers (`updated_at`, `handle_new_user`)
8. RLS policies
9. Views (`shed_summary`, `map_markers`)
10. Seed data

---

## Table Summary

| Table | Purpose | Est. Rows (Demo) | Growth Rate |
|-------|---------|-------------------|-------------|
| `corporations` | Parent org | 1–5 | Static |
| `sheds` | Core entity — storage sheds | 10–200 | Slow |
| `sensor_readings` | Time-series sensor data | 10k–1M | ~9k/day |
| `profiles` | User accounts + preferences | 5–50 | Slow |
| `alerts` | Triggered warnings/alerts | 50–500 | Moderate |
| `audit_log` | Change tracking | 100–10k | Moderate |
