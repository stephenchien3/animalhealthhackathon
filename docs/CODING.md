# Coding Guide — CleanFeed

## Component Architecture

Every file has a JSDoc description at the top explaining what it does. The codebase uses:

- **shadcn/ui** for all primitive UI components (`src/components/ui/`)
- **Custom components** that compose shadcn primitives into domain features
- **Hooks** that wrap TanStack Query for data fetching
- **A single API service** that handles all Supabase communication

### How shadcn/ui works

shadcn/ui is **not** an npm package. It copies component source code into `src/components/ui/`:

```bash
npx shadcn@latest add card    # → creates src/components/ui/card.tsx
npx shadcn@latest add button  # → creates src/components/ui/button.tsx
```

You then import from your own code: `import { Card } from "@/components/ui/card"`. These are just regular React components you fully own and can customize.

---

## Component Breakdown by Page

### LoginPage (`/login`)
```
LoginPage
├── Card (shadcn)
├── Input + Label (shadcn)
└── Button (shadcn)
└── useAuth hook → supabase.auth.signInWithPassword()
```

### HomePage (`/`)
```
AppLayout → Header + Sidebar + Outlet
└── HomePage
    ├── 3 KPI Cards (inline, using shadcn Card)
    └── 3 Quick Action Cards with Links
    └── useSummary + useCorporation hooks
```

### SummaryPage (`/summary`)
```
SummaryPage (Tabs: Overview | Analytics)
├── KPIGrid → 4x KPICard
├── BarChart (Recharts) — soybean by type
├── PieChart (Recharts) — status distribution
├── Top Sheds by Utilization (progress bars)
├── ImprovementsList → Alert cards by severity
└── Analytics tab: Key Metrics + Soybean Breakdown
└── useSummary + useSheds hooks
```

### DatabasePage (`/database`)
```
DatabasePage
├── ShedTable (TanStack Table)
│   └── Edit / Delete buttons per row
├── Dialog (shadcn) → ShedForm
│   └── React Hook Form + Zod validation
└── useSheds + useShedMutations hooks
```

### MapPage (`/map`)
```
MapPage
├── MapView (Mapbox GL)
│   ├── Source (GeoJSON) → clustered markers
│   ├── Layers: clusters, cluster-count, shed-points
│   └── Popup on click
├── ShedDetailPanel (slide-out panel)
│   └── useShed hook for detailed data
└── useMapMarkers hook
```

---

## State Management

### Server State — TanStack Query
```
Query Keys:
  ['sheds']           → shed list
  ['sheds', id]       → single shed detail
  ['map', 'markers']  → map marker coordinates
  ['corporation']     → current user's corporation

Mutations:
  create → invalidate ['sheds'] + ['map', 'markers']
  update → invalidate ['sheds'] + ['sheds', id] + ['map', 'markers']
  delete → invalidate ['sheds'] + ['map', 'markers']
```

### Client State — React useState
- `globalFilter` — search text on database page
- `sorting` — table column sort state
- `selectedShedId` — which marker is selected on map
- `formOpen` / `editingShed` — dialog state on database page

---

## Routing

```tsx
// App.tsx — lazy-loaded pages for code splitting
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
    <Route path="/" element={<HomePage />} />
    <Route path="/summary" element={<SummaryPage />} />
    <Route path="/database" element={<DatabasePage />} />
    <Route path="/map" element={<MapPage />} />
  </Route>
</Routes>
```

---

## Shared Constants

`src/lib/constants.ts` centralizes values used across multiple components:

- `STATUS_VARIANT` — maps shed status to shadcn Badge variant
- `STATUS_COLORS` — hex colors for map markers and chart segments

---

## Supabase Migrations

Only 4 migrations (down from 10):

1. `001_create_corporations.sql` — Corporation table + update trigger
2. `002_create_sheds.sql` — Sheds table with enums + indexes
3. `003_profiles_and_rls.sql` — Profiles + RLS policies for all tables
4. `010_seed_data.sql` — Demo corporation + 10 sheds

Removed: sensor_readings, alerts, audit_log, views (unused by frontend).

---

## Getting Started

```bash
npm install
cp .env.example .env   # Fill in Supabase + Mapbox credentials
npm run dev             # http://localhost:5173
```

### Environment Variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token-here
```
