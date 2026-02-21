# Marketplace — CleanFeed

## Overview

The Marketplace lets users browse and buy soybean pallets or entire sheds using their corporation's credit balance. Listings are pre-seeded with demo data. When a purchase goes through, the buyer's credits are deducted, the shed data updates in the database, and the map reflects the changes.

---

## Database Schema

### Changes to Existing Tables

**`corporations`** — Add a `credits_usd` column:

| Column | Type | Notes |
|--------|------|-------|
| credits_usd | DECIMAL(12,2) | Starting balance, e.g. $10,000. Deducted on purchase. |

```sql
ALTER TABLE corporations ADD COLUMN credits_usd DECIMAL(12,2) NOT NULL DEFAULT 10000.00;
```

### New Tables

**`listings`** — A pallet or shed for sale. Populated via seed data.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| shed_id | UUID (FK) | → sheds.id |
| listing_type | ENUM | `pallet` / `shed` |
| title | VARCHAR(255) | |
| soybean_type | soybean_type | Reuses existing enum |
| quantity_tonnes | DECIMAL(12,3) | |
| price_usd | DECIMAL(12,2) | |
| status | ENUM | `active` / `sold` / `cancelled` |
| image_url | TEXT | Listing photo |
| created_at | TIMESTAMPTZ | |

**`orders`** — Tracks purchases made by users.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| listing_id | UUID (FK) | → listings.id |
| buyer_id | UUID (FK) | → profiles.id |
| quantity_tonnes | DECIMAL(12,3) | |
| total_price_usd | DECIMAL(12,2) | |
| status | ENUM | `pending` / `confirmed` / `delivered` |
| created_at | TIMESTAMPTZ | |

### How It Connects

```
corporations (credits_usd)
      │
      ├──→ profiles ──→ orders
      │                    ↑
      └──→ sheds ──→ listings
```

---

## Seed Data

The migration seeds the demo corporation with $10,000 credits and ~8 fake listings tied to existing sheds:

```sql
-- Give demo corp starting credits
UPDATE corporations SET credits_usd = 10000.00
  WHERE id = 'a1b2c3d4-0000-0000-0000-000000000001';

-- Seed listings from existing sheds
INSERT INTO listings (shed_id, listing_type, title, soybean_type, quantity_tonnes, price_usd, status) VALUES
  ('...ZM-001...', 'pallet', '500t Soybean Meal — Lusaka',         'meal',  500.000,  1200.00, 'active'),
  ('...ZM-002...', 'pallet', '800t Whole Soybean — Copperbelt',    'whole', 800.000,  1920.00, 'active'),
  ('...ZM-003...', 'pallet', '200t Soybean Meal — Southern',       'meal',  200.000,   480.00, 'active'),
  ('...ZM-004...', 'pallet', '1000t Whole Soybean — Kabwe',        'whole', 1000.000, 2400.00, 'active'),
  ('...ZM-005...', 'shed',   'Livingstone Warehouse — Full Site',   'other', 1500.000, 8500.00, 'active'),
  ('...ZM-006...', 'pallet', '600t Soybean Meal — Chipata',        'meal',  600.000,  1440.00, 'active'),
  ('...IN-204...', 'pallet', '300t Soybean Hull — Maharashtra',    'hull',  300.000,   600.00, 'active'),
  ('...IN-115...', 'shed',   'Gujarat Feed Store — Full Site',      'meal',  7000.000, 9500.00, 'active');
```

---

## What Happens on Purchase

When the user buys a listing, the `place_order` RPC runs atomically:

1. **Check credits** — Corporation must have enough `credits_usd` for the purchase.
2. **Deduct credits** — Subtract `total_price_usd` from the buyer's corporation.
3. **Create order** — Insert into `orders`.
4. **Update listing** — Decrement `quantity_tonnes`; mark `sold` if depleted.
5. **Update shed** — Decrement `soybean_count` on the source shed so the **database page** reflects the new stock.
6. **Invalidate caches** — TanStack Query invalidates `listings`, `sheds`, `corporation`, and `orders` so the **map** and **summary** pages update immediately.

If credits are insufficient, the RPC raises an exception and nothing changes.

### Effects Across the App

| Page | What Changes |
|------|-------------|
| **Database** | Shed's `soybean_count` decreases |
| **Map** | Shed popup shows updated tonnage |
| **Summary** | KPIs (total tonnes, avg moisture) recalculate |
| **Dashboard** | Credit balance displayed in header updates |
| **Marketplace** | Listing quantity decreases or disappears if sold out |

---

## API

New functions in `src/services/api.ts`:

```typescript
fetchListings(filters?)        // browse active listings
fetchListingById(id)           // single listing + shed join
createOrder(listingId, qty)    // calls place_order RPC
fetchMyOrders()                // orders for current user
fetchCorporationCredits()      // current credit balance
```

Hooks: `useListings`, `useListing`, `useCreateOrder`, `useMyOrders`, `useCorporationCredits`.

---

## Frontend

### Routes

| Route | Page |
|-------|------|
| `/marketplace` | Browse listings (card grid + filters) |
| `/marketplace/:id` | Listing detail + map + buy button |
| `/marketplace/orders` | Order history table |

### Key Components

All in `src/components/marketplace/`:

- **ListingCard** — Card showing title, type, quantity, price
- **ListingFilters** — Filter by type (pallet/shed) and soybean type
- **PurchaseDialog** — Shows price, current credits, confirms purchase
- **OrderTable** — Order history with status badges
- **CreditsBadge** — Displays corporation credit balance (shown in header/sidebar)

---

## Migration

Single file: `supabase/migrations/006_marketplace.sql`:
- Adds `credits_usd` column to `corporations`
- Creates `listings` and `orders` tables with enums and indexes
- Creates RLS policies
- Creates `place_order` RPC (atomic: check credits → deduct → create order → update listing → update shed)
- Seeds fake listings and demo corp credits
