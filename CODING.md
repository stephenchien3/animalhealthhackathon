# Coding Guide — FeedShed Tracker

## Folder Structure

```
feedshed-tracker/
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.tsx                          # App entry point, renders <App />
│   ├── App.tsx                           # Root: providers + router
│   │
│   ├── pages/
│   │   ├── HomePage.tsx                  # Welcome dashboard, greeting, quick stats
│   │   ├── SummaryPage.tsx               # Tracked sheds, stats, improvement tips
│   │   ├── DatabasePage.tsx              # Shed CRUD table with filters
│   │   └── MapPage.tsx                   # World map with shed pins + detail panel
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx             # Shell: sidebar + header + main content
│   │   │   ├── Sidebar.tsx               # Nav links: Summary, Database, Map
│   │   │   └── Header.tsx                # "Hello, [Corp]!" + settings icon
│   │   │
│   │   ├── shed/
│   │   │   ├── ShedTable.tsx             # TanStack Table for database view
│   │   │   ├── ShedRow.tsx               # Single table row
│   │   │   ├── ShedForm.tsx              # Create/edit shed modal form
│   │   │   ├── ShedCard.tsx              # Card view used on summary page
│   │   │   └── ShedDetail.tsx            # Full detail panel (map click or expand)
│   │   │
│   │   ├── map/
│   │   │   ├── MapView.tsx               # Leaflet map wrapper (world view)
│   │   │   ├── ShedMarker.tsx            # Individual pin on map
│   │   │   └── ShedPopup.tsx             # Popup/panel when pin clicked
│   │   │
│   │   ├── summary/
│   │   │   ├── KPICard.tsx               # Single stat card (tracked sheds, etc.)
│   │   │   ├── KPIGrid.tsx               # Row of KPI cards
│   │   │   ├── StatsList.tsx             # Summary statistics list
│   │   │   └── ImprovementsList.tsx      # "How to improve" suggestions
│   │   │
│   │   └── ui/                           # shadcn/ui components (auto-generated)
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── table.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── badge.tsx
│   │       ├── select.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── useSheds.ts                   # TanStack Query: fetch shed list
│   │   ├── useShed.ts                    # TanStack Query: fetch single shed
│   │   ├── useShedMutations.ts           # Create / update / delete mutations
│   │   ├── useSummary.ts                 # TanStack Query: fetch summary data
│   │   ├── useMapMarkers.ts              # TanStack Query: fetch map marker data
│   │   └── useAuth.ts                    # Auth state (current user, corp)
│   │
│   ├── services/
│   │   ├── api.ts                        # Base fetch/axios client with auth headers
│   │   ├── shedService.ts                # API calls: /api/sheds/*
│   │   ├── summaryService.ts             # API calls: /api/summary
│   │   ├── mapService.ts                 # API calls: /api/map/*
│   │   └── authService.ts               # API calls: /api/auth/*
│   │
│   ├── types/
│   │   └── index.ts                      # All TypeScript types (see TYPES.md)
│   │
│   ├── lib/
│   │   └── utils.ts                      # shadcn/ui cn() utility, formatters
│   │
│   └── styles/
│       └── globals.css                   # Tailwind base + custom styles
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── components.json                       # shadcn/ui config
└── .env.example                          # VITE_API_URL, VITE_MAPBOX_TOKEN (if using Mapbox)
```

---

## Component Breakdown by Page

### HomePage (`/`)
```
AppLayout
├── Header          → "Hello, Cargill!" + settings gear
├── Sidebar         → Summary / Database / Map links
└── HomePage
    ├── Welcome message
    ├── KPIGrid     → 3 quick stat cards (total sheds, feed levels, alerts)
    └── Recent activity or "Get started" prompt
```

### SummaryPage (`/summary`)
```
AppLayout
├── Header
├── Sidebar (active: Summary)
└── SummaryPage
    ├── KPIGrid           → Tracked sheds count, feed level %, alert count
    ├── StatsList         → Total soybean, avg moisture, sheds at capacity
    └── ImprovementsList  → Actionable suggestions with severity icons
```

### DatabasePage (`/database`)
```
AppLayout
├── Header
├── Sidebar (active: Database)
└── DatabasePage
    ├── Search bar + filter dropdowns (status, soybean type)
    ├── [+ Add Shed] button → opens ShedForm (dialog)
    ├── ShedTable
    │   └── ShedRow (repeated)
    │       └── Edit button → opens ShedForm (dialog, edit mode)
    └── Pagination controls
```

### MapPage (`/map`)
```
AppLayout
├── Header
├── Sidebar (active: Map)
└── MapPage
    ├── MapView (full width/height)
    │   └── ShedMarker (repeated per shed)
    │       └── onClick → ShedPopup / ShedDetail panel
    └── ShedDetail (slide-in panel or overlay)
        ├── Shed image
        ├── Location (lat/lng + address)
        ├── Soybean type
        ├── Quantity (tonnes)
        ├── Moisture %
        ├── Temperature
        └── Status badge
```

---

## Routing

Using **React Router v7** with a layout route:

```tsx
// App.tsx
<Routes>
  <Route element={<AppLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/summary" element={<SummaryPage />} />
    <Route path="/database" element={<DatabasePage />} />
    <Route path="/map" element={<MapPage />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Route>
</Routes>
```

The `AppLayout` component renders:
- `<Header />` at the top (greeting + settings link)
- `<Sidebar />` on the left (nav links with active state)
- `<Outlet />` for the page content

---

## State Management

### Server State — TanStack Query v5

All data from the API is managed by TanStack Query. No Redux, no global store for server data.

```
Query Keys:
  ['sheds']              → shed list (with filter/page params)
  ['sheds', shedId]      → single shed detail
  ['summary']            → dashboard summary
  ['map', 'markers']     → map pin coordinates

Mutation flow:
  Create shed → POST /api/sheds → invalidate ['sheds'] + ['summary']
  Update shed → PUT /api/sheds/:id → invalidate ['sheds'] + ['sheds', id] + ['summary']
  Delete shed → DELETE /api/sheds/:id → invalidate ['sheds'] + ['summary']
```

### Client State — React useState / useSearchParams

Simple local state for UI concerns:
- `activeFilters` — filter selections on database page (can use URL search params)
- `selectedShedId` — which shed is selected on the map
- `isFormOpen` / `formMode` — whether the create/edit dialog is showing
- `currentPage` / `pageSize` — pagination state

No Zustand needed at MVP — `useState` and URL params cover everything.

---

## Libraries

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "leaflet": "^1.9.0",
    "react-leaflet": "^5.0.0",
    "recharts": "^2.12.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.23.0",
    "tailwindcss": "^4.0.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "date-fns": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/leaflet": "^1.9.0"
  }
}
```

### Why these choices:

| Library           | Reason                                                    |
|-------------------|-----------------------------------------------------------|
| **Leaflet**       | Free, no API key, simple pin/popup support, lightweight   |
| **TanStack Table**| Headless — full control over styling, sort/filter/page    |
| **TanStack Query**| Handles caching, loading, error, refetch automatically    |
| **React Hook Form + Zod** | Performant forms with runtime validation          |
| **shadcn/ui**     | Copy-paste components, fully customizable, Tailwind-based |
| **Recharts**      | Simple charts for KPI cards on summary page               |
| **Lucide React**  | Clean icon set, tree-shakeable                            |
| **date-fns**      | Lightweight date formatting                               |

---

## Getting Started (Scaffold)

```bash
# 1. Create the React app
npm create vite@latest feedshed-tracker -- --template react-ts
cd feedshed-tracker

# 2. Install dependencies
npm install react-router @tanstack/react-query @tanstack/react-table \
  leaflet react-leaflet recharts react-hook-form @hookform/resolvers zod \
  lucide-react clsx tailwind-merge date-fns

npm install -D @types/leaflet

# 3. Set up Tailwind CSS v4
npm install tailwindcss @tailwindcss/vite
# Add Tailwind plugin to vite.config.ts

# 4. Set up shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input table card dialog badge select

# 5. Create folder structure
mkdir -p src/{pages,components/{layout,shed,map,summary,ui},hooks,services,types,lib,styles}

# 6. Set up environment
cp .env.example .env
# Edit VITE_API_URL=http://localhost:3001/api
```

---

## Key Implementation Notes

1. **Sidebar navigation** uses React Router `<NavLink>` with active class styling
2. **ShedTable** is headless via TanStack Table — define columns, pass data, style with Tailwind
3. **MapView** initializes Leaflet centered on [0, 20] (shows Africa/South America) at zoom 2
4. **Shed detail on map** — clicking a `ShedMarker` either opens a Leaflet popup or sets `selectedShedId` state to show a side panel
5. **Summary aggregation** — the backend does the math (COUNT, AVG, SUM) and returns a single response; the frontend just renders it
6. **Form validation** — Zod schema validates shed inputs (name required, latitude -90 to 90, moisture 0-100, etc.)
7. **Optimistic updates** — TanStack Query mutations for create/edit can optimistically update the cache before the server responds
