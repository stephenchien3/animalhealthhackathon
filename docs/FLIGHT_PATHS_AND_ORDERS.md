# Flight Paths & Order Tracking

## How It Works

1. 3 manufacturing plants in the US (Illinois, Iowa, Ohio)
2. When a shipment is in transit, a **dashed blue arc** is drawn from the plant to the destination shed
3. A **plane icon** sits along the arc showing approximate position
4. Click a blue plant marker to see its details

## Shipment Statuses

| Status | Map Display |
|--------|-------------|
| `in_transit` | Blue dashed arc + plane icon |
| `delivered` | Hidden (arc removed) |
| `cancelled` | Hidden |

## Files

| File | What It Does |
|------|-------------|
| `src/data/plants.ts` | Plant locations and info |
| `src/data/shipments.ts` | Demo shipments + arc generation |
| `src/components/map/MapView.tsx` | Renders everything on the map |
