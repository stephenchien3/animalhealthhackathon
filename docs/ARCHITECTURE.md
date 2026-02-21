# Architecture — CleanFeed

## Overview

CleanFeed is a web app for animal feed corporations to track soybean storage across a network of physical sheds. Each shed stores soybean data (type, quantity, moisture, temperature) and is plotted on an interactive map.

---

## Tech Stack

| Layer        | Technology                | Why                                           |
|--------------|--------------------------|-----------------------------------------------|
| Frontend     | React 19 + TypeScript    | Industry standard, strong typing              |
| Build        | Vite 6                   | Fast dev server, quick builds                 |
| Routing      | React Router v7          | Sidebar nav between views                     |
| Map          | Mapbox GL JS + react-map-gl | WebGL rendering, clustering, dark mode     |
| Data Table   | TanStack Table v8        | Headless sorting/filtering/pagination         |
| Styling      | Tailwind CSS v4 + shadcn/ui | Rapid UI dev, accessible components        |
| Charts       | Recharts                 | Simple bar/pie charts for summary view        |
| Server State | TanStack Query v5        | Caching, refetching, mutations                |
| Forms        | React Hook Form + Zod    | Performant forms with runtime validation      |
| Backend/DB   | Supabase                 | Hosted Postgres + Auth + RLS                  |
| Icons        | Lucide React             | Tree-shakeable icon set                       |

---

## Folder Structure

```
cleanfeed/
├── docs/                          # Project documentation
│   ├── ARCHITECTURE.md            # This file — system design
│   ├── CODING.md                  # Folder structure + component breakdown
│   ├── DESIGN.md                  # Design system (colors, spacing, etc.)
│   ├── AUTHENTICATION.md          # Auth flow + RLS docs
│   ├── DATABASE_TABLES_PLAN.md    # Full table schema reference
│   ├── MAP_PLAN.md                # Map implementation details
│   ├── SUMMARY_PLAN.md            # Summary page implementation details
│   └── TYPES.md                   # TypeScript type reference
│
├── src/
│   ├── main.tsx                   # Entry point — providers + render
│   ├── App.tsx                    # Routes with lazy-loaded pages
│   ├── index.css                  # Tailwind + CSS custom properties
│   ├── vite-env.d.ts              # Vite type declarations
│   │
│   ├── pages/                     # Route-level page components
│   │   ├── LoginPage.tsx          # Email/password login
│   │   ├── HomePage.tsx           # Welcome + KPI cards + nav shortcuts
│   │   ├── SummaryPage.tsx        # Charts, KPIs, improvement suggestions
│   │   ├── DatabasePage.tsx       # CRUD table with search/sort/pagination
│   │   └── MapPage.tsx            # Mapbox GL map + detail panel
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx # Session guard → redirects to /login
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Shell: sidebar + header + outlet
│   │   │   ├── Header.tsx         # Page title + corporation name
│   │   │   └── Sidebar.tsx        # Nav links + sign out
│   │   ├── map/
│   │   │   ├── MapView.tsx        # Mapbox GL with clustered markers
│   │   │   └── ShedDetailPanel.tsx # Slide-out shed info panel
│   │   ├── shed/
│   │   │   ├── ShedTable.tsx      # TanStack Table for database view
│   │   │   └── ShedForm.tsx       # Create/edit form with Zod validation
│   │   ├── summary/
│   │   │   ├── KPICard.tsx        # Single stat card
│   │   │   ├── KPIGrid.tsx        # 4-card grid of KPIs
│   │   │   └── ImprovementsList.tsx # Alert suggestion cards
│   │   └── ui/                    # shadcn/ui primitives (auto-generated)
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts             # Session management + sign in/out
│   │   ├── useSheds.ts            # Fetch all sheds
│   │   ├── useShed.ts             # Fetch single shed by ID
│   │   ├── useShedMutations.ts    # Create/update/delete mutations
│   │   ├── useSummary.ts          # Computed summary stats from shed list
│   │   ├── useMapMarkers.ts       # Fetch map marker data
│   │   ├── useCorporation.ts      # Fetch user's corporation
│   │   └── use-mobile.tsx         # Mobile viewport detection (shadcn)
│   │
│   ├── services/
│   │   └── api.ts                 # Supabase queries + mutations
│   │
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client singleton
│   │   ├── utils.ts               # cn() utility for Tailwind merging
│   │   └── constants.ts           # Shared status colors + badge variants
│   │
│   └── types/
│       └── index.ts               # All TypeScript interfaces
│
├── supabase/
│   ├── config.toml                # Local Supabase config
│   └── migrations/
│       ├── 001_create_corporations.sql
│       ├── 002_create_sheds.sql
│       ├── 003_profiles_and_rls.sql
│       └── 010_seed_data.sql
│
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── components.json                # shadcn/ui config
└── .env.example
```

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                 FRONTEND (Vite + React)               │
│                                                       │
│  Pages: Login → Home → Summary → Database → Map       │
│  State: TanStack Query (server) + useState (client)   │
│  UI: shadcn/ui + Tailwind CSS + Recharts + Mapbox GL  │
│                                                       │
│              Supabase JS Client                        │
└──────────────────┬───────────────────────────────────┘
                   │ HTTPS
┌──────────────────┴───────────────────────────────────┐
│                   SUPABASE                            │
│                                                       │
│  Auth: Email/password → JWT with corporation_id       │
│  Database: PostgreSQL with RLS                        │
│  Tables: corporations, sheds, profiles                │
│                                                       │
│  RLS: All queries auto-scoped to user's corporation   │
└──────────────────────────────────────────────────────┘
```

---

## Data Flow

1. **Auth**: User signs in → Supabase issues JWT with `corporation_id` → stored in session
2. **Queries**: All Supabase queries include JWT → RLS filters to user's corporation
3. **Summary**: Sheds fetched once → client-side aggregation via `useSummary` hook (useMemo)
4. **Map**: Lightweight marker query → GeoJSON → Mapbox clusters + status-colored pins
5. **Mutations**: Create/update/delete → invalidate `sheds` + `map` caches

---

## Database Schema (3 tables)

### `corporations`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| name | VARCHAR(255) | Company name |
| contact_email | VARCHAR(255) | Primary contact |
| country | VARCHAR(100) | HQ country |
| tier | ENUM | multinational / regional / local |

### `sheds`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| corporation_id | UUID (FK) | → corporations.id |
| name | VARCHAR(255) | Human-readable |
| code | VARCHAR(20) | Unique code, e.g. "BR-042" |
| latitude / longitude | DOUBLE PRECISION | GPS coordinates |
| soybean_type | ENUM | meal / whole / hull / other |
| soybean_count | DECIMAL(12,3) | Tonnes stored |
| moisture_pct | DECIMAL(5,2) | Current moisture % |
| temperature | DECIMAL(5,2) | Current temp C |
| capacity_tonnes | DECIMAL(12,3) | Max capacity |
| status | ENUM | operational / maintenance / offline |

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | → auth.users.id |
| corporation_id | UUID (FK) | → corporations.id |
| full_name | VARCHAR(255) | Display name |
| role | VARCHAR(20) | admin / manager / viewer |

---

## Performance Optimizations

- **Lazy loading**: All pages use `React.lazy()` for code-split chunks
- **TanStack Query**: 5-minute stale time prevents redundant fetches
- **Mapbox WebGL**: GPU-accelerated map rendering with native clustering
- **Memoized summary**: `useSummary` derives KPIs client-side via `useMemo`
