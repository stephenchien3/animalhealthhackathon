-- ============================================================
-- Marketplace: listings, orders, corporation credits
-- ============================================================

-- ── Credits column on corporations ──────────────────────────

ALTER TABLE corporations
  ADD COLUMN credits_usd DECIMAL(12, 2) NOT NULL DEFAULT 10000.00;

-- Give the demo corporation starting credits
UPDATE corporations SET credits_usd = 10000.00
  WHERE id = 'a1b2c3d4-0000-0000-0000-000000000001';

-- ── Enums ───────────────────────────────────────────────────

CREATE TYPE listing_type   AS ENUM ('pallet', 'shed');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'cancelled');
CREATE TYPE order_status   AS ENUM ('pending', 'confirmed', 'delivered');

-- ── Listings ────────────────────────────────────────────────

CREATE TABLE listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shed_id         UUID NOT NULL REFERENCES sheds(id) ON DELETE CASCADE,
  listing_type    listing_type NOT NULL,
  title           VARCHAR(255) NOT NULL,
  soybean_type    soybean_type NOT NULL,
  quantity_tonnes DECIMAL(12, 3) NOT NULL,
  price_usd       DECIMAL(12, 2) NOT NULL,
  status          listing_status NOT NULL DEFAULT 'active',
  image_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX listings_status_idx ON listings(status);
CREATE INDEX listings_shed_id_idx ON listings(shed_id);

-- ── Orders ──────────────────────────────────────────────────

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity_tonnes DECIMAL(12, 3) NOT NULL,
  total_price_usd DECIMAL(12, 2) NOT NULL,
  status          order_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_buyer_id_idx ON orders(buyer_id);
CREATE INDEX orders_listing_id_idx ON orders(listing_id);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can browse active listings
CREATE POLICY "Browse listings" ON listings FOR SELECT
  USING (true);

-- Orders: users can view their own
CREATE POLICY "View own orders" ON orders FOR SELECT
  USING (buyer_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Orders: users can insert their own
CREATE POLICY "Create orders" ON orders FOR INSERT
  WITH CHECK (buyer_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Service role can do everything (for RPC)
CREATE POLICY "Service role listings" ON listings FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role orders" ON orders FOR ALL
  USING (auth.role() = 'service_role');

-- ── place_order RPC ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION place_order(
  p_listing_id UUID,
  p_buyer_profile_id UUID,
  p_quantity DECIMAL
) RETURNS UUID AS $$
DECLARE
  v_listing   listings%ROWTYPE;
  v_corp_id   UUID;
  v_credits   DECIMAL;
  v_price     DECIMAL;
  v_order_id  UUID;
BEGIN
  -- Lock the listing row
  SELECT * INTO v_listing FROM listings WHERE id = p_listing_id FOR UPDATE;

  IF v_listing IS NULL OR v_listing.status != 'active' THEN
    RAISE EXCEPTION 'Listing is not available';
  END IF;

  IF p_quantity > v_listing.quantity_tonnes THEN
    RAISE EXCEPTION 'Requested quantity exceeds available';
  END IF;

  -- Calculate price proportionally
  v_price := (p_quantity / v_listing.quantity_tonnes) * v_listing.price_usd;

  -- Get buyer's corporation and check credits
  SELECT corporation_id INTO v_corp_id FROM profiles WHERE id = p_buyer_profile_id;
  SELECT credits_usd INTO v_credits FROM corporations WHERE id = v_corp_id FOR UPDATE;

  IF v_credits < v_price THEN
    RAISE EXCEPTION 'Insufficient credits (have %, need %)', v_credits, v_price;
  END IF;

  -- Deduct credits
  UPDATE corporations SET credits_usd = credits_usd - v_price WHERE id = v_corp_id;

  -- Create order
  INSERT INTO orders (listing_id, buyer_id, quantity_tonnes, total_price_usd, status)
  VALUES (p_listing_id, p_buyer_profile_id, p_quantity, v_price, 'pending')
  RETURNING id INTO v_order_id;

  -- Update listing
  UPDATE listings
  SET quantity_tonnes = quantity_tonnes - p_quantity,
      status = CASE WHEN quantity_tonnes - p_quantity <= 0 THEN 'sold'::listing_status ELSE 'active'::listing_status END
  WHERE id = p_listing_id;

  -- Update shed soybean count
  UPDATE sheds
  SET soybean_count = soybean_count - p_quantity
  WHERE id = v_listing.shed_id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Seed Listings ───────────────────────────────────────────

INSERT INTO listings (shed_id, listing_type, title, soybean_type, quantity_tonnes, price_usd, status, image_url) VALUES
  -- Zambia sheds
  ((SELECT id FROM sheds WHERE code = 'ZM-001'), 'pallet', '500t Soybean Meal — Lusaka Central',      'meal',  500.000,  1200.00, 'active', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop'),
  ((SELECT id FROM sheds WHERE code = 'ZM-002'), 'pallet', '800t Whole Soybean — Copperbelt',          'whole', 800.000,  1920.00, 'active', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop'),
  ((SELECT id FROM sheds WHERE code = 'ZM-003'), 'pallet', '200t Soybean Meal — Southern Province',    'meal',  200.000,   480.00, 'active', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop'),
  ((SELECT id FROM sheds WHERE code = 'ZM-004'), 'pallet', '1000t Whole Soybean — Kabwe',              'whole', 1000.000, 2400.00, 'active', 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=300&fit=crop'),
  ((SELECT id FROM sheds WHERE code = 'ZM-005'), 'shed',   'Livingstone Warehouse — Full Site',         'other', 900.000,  8500.00, 'active', 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&h=300&fit=crop'),
  ((SELECT id FROM sheds WHERE code = 'ZM-006'), 'pallet', '600t Soybean Meal — Chipata',              'meal',  600.000,  1440.00, 'active', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop'),
  -- India sheds
  ((SELECT id FROM sheds WHERE code = 'IN-204'), 'pallet', '300t Soybean Hull — Maharashtra',          'hull',  300.000,   600.00, 'active', 'https://images.unsplash.com/photo-1586771107445-b3e7eb4e1e48?w=400&h=300&fit=crop'),
  ((SELECT id FROM sheds WHERE code = 'IN-115'), 'shed',   'Gujarat Feed Store — Full Site',            'meal',  5500.000, 9500.00, 'active', 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop');
