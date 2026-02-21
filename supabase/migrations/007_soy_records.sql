-- ============================================================
-- Soy Records: farmer sale tracking
-- ============================================================

-- ── Enum ──────────────────────────────────────────────────────

CREATE TYPE soy_record_status AS ENUM ('shipped', 'delivered');

-- ── Table ─────────────────────────────────────────────────────

CREATE TABLE soy_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporation_id  UUID NOT NULL REFERENCES corporations(id) ON DELETE CASCADE,
  shed_id         UUID NOT NULL REFERENCES sheds(id) ON DELETE CASCADE,
  buyer_company   VARCHAR(255) NOT NULL,
  soy_type        soybean_type NOT NULL,
  quantity_tonnes DECIMAL(12, 3) NOT NULL,
  price_usd       DECIMAL(12, 2) NOT NULL,
  shed_location   TEXT NOT NULL DEFAULT '',
  status          soy_record_status NOT NULL DEFAULT 'shipped',
  sold_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX soy_records_corporation_id_idx ON soy_records(corporation_id);
CREATE INDEX soy_records_shed_id_idx ON soy_records(shed_id);

-- ── RLS ───────────────────────────────────────────────────────

ALTER TABLE soy_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own soy records" ON soy_records FOR SELECT
  USING (corporation_id IN (
    SELECT corporation_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Create own soy records" ON soy_records FOR INSERT
  WITH CHECK (corporation_id IN (
    SELECT corporation_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Update own soy records" ON soy_records FOR UPDATE
  USING (corporation_id IN (
    SELECT corporation_id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Delete own soy records" ON soy_records FOR DELETE
  USING (corporation_id IN (
    SELECT corporation_id FROM profiles WHERE user_id = auth.uid()
  ));

-- ── Seed Data ─────────────────────────────────────────────────

INSERT INTO soy_records (corporation_id, shed_id, buyer_company, soy_type, quantity_tonnes, price_usd, shed_location, status, sold_at) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM sheds WHERE code = 'ZM-001'), 'Tyson Foods',          'meal',  120.000,  288.00, 'Lusaka, Zambia',          'delivered', '2025-11-15'),
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM sheds WHERE code = 'ZM-002'), 'Cargill Inc.',         'whole', 350.000,  840.00, 'Copperbelt, Zambia',      'delivered', '2025-12-01'),
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM sheds WHERE code = 'ZM-004'), 'Bunge Limited',        'whole', 500.000, 1200.00, 'Kabwe, Zambia',           'shipped',   '2026-01-10'),
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM sheds WHERE code = 'ZM-006'), 'ADM',                  'meal',  200.000,  480.00, 'Chipata, Zambia',         'delivered', '2026-01-18'),
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM sheds WHERE code = 'IN-204'), 'Charoen Pokphand',     'hull',  150.000,  300.00, 'Maharashtra, India',      'shipped',   '2026-02-01'),
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM sheds WHERE code = 'IN-115'), 'Nutreco',              'meal',  800.000, 1380.00, 'Gujarat, India',          'shipped',   '2026-02-10'),
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM sheds WHERE code = 'ZM-003'), 'Perdue Farms',         'meal',  100.000,  240.00, 'Southern Province, Zambia','delivered', '2025-10-22'),
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM sheds WHERE code = 'ZM-001'), 'JBS S.A.',             'meal',  250.000,  600.00, 'Lusaka, Zambia',          'delivered', '2025-09-05');
