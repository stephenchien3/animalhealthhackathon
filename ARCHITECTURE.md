# Architecture — FeedShed Tracker

## Overview

FeedShed Tracker is a web application for multinational animal feed corporations and emerging market operators to track soybean/animal feed across a network of physical storage sheds. Each shed is equipped with sensors (temperature, moisture, range) and can be managed, monitored on a map, and summarized with statistics.

---

## UI Flow (Wireframe)

```
┌─────────────────────────────────────────────────────────────────┐
│  Hello, [Corporation Name]!                        ⚙ Settings   │
│                                                                 │
│  ┌──────────┐  ┌─────────────────────────────────────────────┐  │
│  │          │  │                                             │  │
│  │ Summary  │──│   Home Page for a farmer / corporation      │  │
│  │          │  │                                             │  │
│  │ Database │  │   Welcome dashboard with quick stats        │  │
│  │          │  │   and recent activity                       │  │
│  │ Map      │  │                                             │  │
│  │          │  │                                             │  │
│  └──────────┘  └─────────────────────────────────────────────┘  │
│   sidebar nav                    main content area              │
└─────────────────────────────────────────────────────────────────┘
```

### Summary View
```
┌─────────────────────────────────────────────┐
│  Summary                                    │
│                                             │
│  ┌────────────┐ ┌────────────┐ ┌─────────┐ │
│  │ 12 Tracked │ │ 94% Feed   │ │ 3 Alerts│ │
│  │ Sheds      │ │ Levels OK  │ │         │ │
│  └────────────┘ └────────────┘ └─────────┘ │
│                                             │
│  Summary Statistics                         │
│  ─────────────────────                      │
│  • Total soybean stored: 4,200 tonnes       │
│  • Average moisture: 12.3%                  │
│  • Sheds at capacity: 2 of 12               │
│                                             │
│  How to Improve                             │
│  ─────────────────────                      │
│  ⚠ Shed BR-042 moisture is high (15.1%)    │
│  ⚠ Shed NG-007 below 20% capacity          │
│  ✓ All temperature readings nominal         │
│                                             │
└─────────────────────────────────────────────┘
```

### Database View
```
┌──────────────────────────────────────────────────────────────┐
│  Database                              [+ Add Shed]          │
│                                                              │
│  Search: [_______________]    Filter: [Status ▾] [Type ▾]    │
│                                                              │
│  ┌──────┬───────────┬──────────┬──────────┬────────┬──────┐  │
│  │ Name │ Location  │ Soybean  │ Moisture │ Count  │ Edit │  │
│  ├──────┼───────────┼──────────┼──────────┼────────┼──────┤  │
│  │BR-042│ São Paulo │ Meal     │ 15.1%    │ 850t   │  ✏   │  │
│  │NG-007│ Lagos     │ Whole    │ 11.2%    │ 120t   │  ✏   │  │
│  │IN-019│ Mumbai    │ Hull     │ 12.8%    │ 2100t  │  ✏   │  │
│  │VN-003│ Ho Chi M. │ Meal     │ 10.5%    │ 640t   │  ✏   │  │
│  └──────┴───────────┴──────────┴──────────┴────────┴──────┘  │
│                                                              │
│  Showing 1-4 of 12 sheds                    [< 1 2 3 >]     │
└──────────────────────────────────────────────────────────────┘
```

### Map View
```
┌──────────────────────────────────────────────────────────────┐
│  Map                                                         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │          🌍 Large Scale Map of the Earth             │    │
│  │                                                      │    │
│  │       📍 BR-042          📍 IN-019                   │    │
│  │                  📍 NG-007                            │    │
│  │                                   📍 VN-003          │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                         │                                    │
│                    click a pin                                │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  📍 Shed BR-042 — São Paulo, Brazil                  │    │
│  │                                                      │    │
│  │  ┌──────────────┐  Location: -23.55, -46.63          │    │
│  │  │              │  Soybean Type: Meal                 │    │
│  │  │  [Shed Image]│  Quantity: 850 tonnes               │    │
│  │  │              │  Moisture: 15.1%                    │    │
│  │  └──────────────┘  Temperature: 24°C                  │    │
│  │                     Status: ⚠ High Moisture           │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│                                                                 │
│   React + TypeScript + Vite                                     │
│   ┌───────────┬────────────┬──────────┬───────────┐             │
│   │ HomePage  │ SummaryPage│ Database │  MapPage  │             │
│   │           │            │  Page    │           │             │
│   └─────┬─────┴─────┬──────┴────┬─────┴─────┬─────┘             │
│         │           │           │           │                   │
│         └───────────┴─────┬─────┴───────────┘                   │
│                           │                                     │
│                    API calls (fetch)                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────┼─────────────────────────────────────┐
│                      BACKEND API                                │
│                           │                                     │
│   Node.js + Express (or Fastify)                                │
│                           │                                     │
│   ┌───────────────────────┼───────────────────────────┐         │
│   │  /api/sheds           │  CRUD for sheds           │         │
│   │  /api/sheds/:id       │  Single shed + details    │         │
│   │  /api/summary         │  Aggregated stats         │         │
│   │  /api/map/markers     │  Lat/lng for all sheds    │         │
│   │  /api/corporations    │  Corp info                │         │
│   │  /api/auth            │  Login/session            │         │
│   └───────────────────────┼───────────────────────────┘         │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                       DATABASE                                  │
│                           │                                     │
│   PostgreSQL                                                    │
│   ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│   │ corporations   │  │ sheds          │  │ sensor_readings  │  │
│   │                │  │                │  │                  │  │
│   │ id             │  │ id             │  │ id               │  │
│   │ name           │  │ corporation_id │◄─│ shed_id          │  │
│   │ contact_email  │  │ name           │  │ sensor_type      │  │
│   │ country        │  │ code           │  │ value            │  │
│   │ tier           │  │ latitude       │  │ unit             │  │
│   └───────┬────────┘  │ longitude      │  │ recorded_at      │  │
│           │           │ image_url      │  └──────────────────┘  │
│           │ 1:many    │ soybean_type   │                        │
│           └──────────►│ soybean_count  │                        │
│                       │ moisture_pct   │                        │
│                       │ temperature    │                        │
│                       │ capacity       │                        │
│                       │ status         │                        │
│                       └────────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ sensor data ingestion
┌───────────────────────────┼─────────────────────────────────────┐
│                    IoT SENSORS                                  │
│                           │                                     │
│   Physical sheds with:                                          │
│   • Temperature sensors                                         │
│   • Moisture sensors                                            │
│   • Range sensors (fill level)                                  │
│                           │                                     │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                          │
│   │BR-042│ │NG-007│ │IN-019│ │VN-003│  ... more sheds           │
│   └──────┘ └──────┘ └──────┘ └──────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
1. SENSOR → API
   Shed sensors push readings (temp, moisture, fill level)
   → Backend ingests via POST /api/sensors/readings
   → Stored in sensor_readings table

2. API → SUMMARY VIEW
   GET /api/summary
   → Backend aggregates: total sheds, avg moisture, alerts, improvement tips
   → Frontend renders KPI cards + suggestion list

3. API → DATABASE VIEW
   GET /api/sheds?page=1&sort=name
   → Backend queries sheds table with filters/pagination
   → Frontend renders editable table with CRUD actions

4. API → MAP VIEW
   GET /api/map/markers
   → Backend returns {shedId, lat, lng, name, status} for all sheds
   → Frontend plots pins on Leaflet/Mapbox map

   GET /api/sheds/:id (on pin click)
   → Backend returns full shed detail (image, moisture, soybean, count)
   → Frontend shows shed detail card overlaying the map
```

---

## Database Schema

### `corporations`
| Column        | Type         | Notes                          |
|---------------|-------------|--------------------------------|
| id            | UUID (PK)   | Auto-generated                 |
| name          | VARCHAR(255)| "Cargill", "ADM", etc.         |
| contact_email | VARCHAR(255)| Primary contact                |
| country       | VARCHAR(100)| HQ country                     |
| tier          | ENUM        | 'multinational' / 'regional' / 'local' |
| created_at    | TIMESTAMPTZ | Auto                           |
| updated_at    | TIMESTAMPTZ | Auto                           |

### `sheds`
| Column          | Type          | Notes                           |
|-----------------|---------------|---------------------------------|
| id              | UUID (PK)     | Auto-generated                  |
| corporation_id  | UUID (FK)     | → corporations.id               |
| name            | VARCHAR(255)  | Human-readable name             |
| code            | VARCHAR(20)   | Unique code, e.g. "BR-042"     |
| latitude        | FLOAT         | GPS latitude                    |
| longitude       | FLOAT         | GPS longitude                   |
| address         | TEXT          | Street address                  |
| image_url       | TEXT          | Photo of the physical shed      |
| soybean_type    | ENUM          | 'meal' / 'whole' / 'hull' / 'other' |
| soybean_count   | DECIMAL(12,3) | Tonnes of soybean in shed       |
| moisture_pct    | DECIMAL(5,2)  | Current moisture %              |
| temperature     | DECIMAL(5,2)  | Current temp in °C              |
| capacity_tonnes | DECIMAL(12,3) | Max capacity                    |
| status          | ENUM          | 'operational' / 'maintenance' / 'offline' |
| created_at      | TIMESTAMPTZ   | Auto                            |
| updated_at      | TIMESTAMPTZ   | Auto                            |

### `sensor_readings` (time-series log)
| Column      | Type         | Notes                        |
|-------------|-------------|------------------------------|
| id          | UUID (PK)   | Auto-generated               |
| shed_id     | UUID (FK)   | → sheds.id                   |
| sensor_type | ENUM        | 'temperature' / 'moisture' / 'range' |
| value       | FLOAT       | The reading value            |
| unit        | VARCHAR(20) | '°C', '%', 'cm'             |
| recorded_at | TIMESTAMPTZ | When the sensor took the reading |

---

## API Routes

### Sheds (Database Tab)
```
GET    /api/sheds                → List all sheds (paginated, filterable)
       ?page=1&pageSize=10
       &search=brazil
       &soybeanType=meal
       &status=operational
       &sortBy=name&sortOrder=asc

GET    /api/sheds/:id            → Get single shed with full details

POST   /api/sheds                → Create a new shed
       Body: { name, code, latitude, longitude, imageUrl, soybeanType, ... }

PUT    /api/sheds/:id            → Update an existing shed
       Body: { moisture_pct?, soybean_count?, status?, ... }

DELETE /api/sheds/:id            → Delete a shed
```

### Summary Tab
```
GET    /api/summary              → Aggregated dashboard data
       Response: {
         totalSheds, totalSoybeanTonnes, avgMoisture,
         shedsAtCapacity, alertCount,
         statsByType: [...],
         improvements: [{ shedCode, message, severity }]
       }
```

### Map Tab
```
GET    /api/map/markers          → All shed locations for map pins
       Response: [{ shedId, latitude, longitude, name, code, status }]

       (Shed detail on click uses GET /api/sheds/:id)
```

### Sensor Data
```
POST   /api/sensors/readings     → Ingest a sensor reading
       Body: { shedId, sensorType, value, unit }

GET    /api/sensors/readings     → Query historical readings
       ?shedId=xxx&sensorType=temperature&from=...&to=...
```

### Auth / Corporation
```
POST   /api/auth/login           → Login
GET    /api/auth/me              → Current user + corporation info
GET    /api/corporations/:id     → Corporation details
```

---

## Tech Stack

| Layer       | Technology              | Why                                          |
|-------------|------------------------|----------------------------------------------|
| Frontend    | React 19 + TypeScript  | Industry standard, strong typing              |
| Build       | Vite                   | Fast dev server, quick builds                 |
| Routing     | React Router v7        | Sidebar nav between views                     |
| Map         | Leaflet + react-leaflet| Free, no API key needed, good enough for pins |
| Data Table  | TanStack Table v8      | Headless, sorting/filtering/pagination built-in|
| Styling     | Tailwind CSS + shadcn/ui| Rapid UI development, accessible components  |
| Charts      | Recharts               | Simple bar/pie charts for summary view        |
| Server State| TanStack Query v5      | Caching, refetching, mutations                |
| Backend     | Node.js + Express      | Simple, well-known                            |
| ORM         | Drizzle ORM            | Type-safe SQL, lightweight                    |
| Database    | PostgreSQL             | Reliable, handles spatial + time-series fine  |
| Auth        | JWT (simple)           | Stateless, good enough for MVP                |
