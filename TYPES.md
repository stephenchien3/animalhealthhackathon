# TypeScript Types — FeedShed Tracker

All types live in `src/types/index.ts`. This document is the reference for every interface in the app.

---

## Base / Utility Types

```typescript
/** UUID v4 string identifier */
type UUID = string;

/** ISO 8601 date string, e.g. "2026-02-20T15:30:00Z" */
type ISODateString = string;

/** Geographic coordinate pair */
interface GeoCoordinate {
  latitude: number;   // -90 to 90
  longitude: number;  // -180 to 180
}

/** Standard paginated request params */
interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Standard paginated response wrapper */
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** API error response */
interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string>;
}
```

---

## Corporation

```typescript
/** Tier of the corporation */
type CorporationTier = 'multinational' | 'regional' | 'local';

/** A corporation that owns/manages sheds */
interface Corporation {
  id: UUID;
  name: string;                    // "Cargill", "ADM", etc.
  contactEmail: string;
  country: string;
  tier: CorporationTier;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

---

## Shed

```typescript
/** Type of soybean stored in the shed */
type SoybeanType = 'meal' | 'whole' | 'hull' | 'other';

/** Operational status of the shed */
type ShedStatus = 'operational' | 'maintenance' | 'offline';

/** A physical animal feed storage shed */
interface Shed {
  id: UUID;
  corporationId: UUID;
  name: string;                    // "São Paulo Warehouse A"
  code: string;                    // "BR-042" — unique short code
  latitude: number;
  longitude: number;
  address: string;
  imageUrl: string | null;         // Photo of the physical shed
  soybeanType: SoybeanType;
  soybeanCount: number;            // Tonnes of soybean currently stored
  moisturePct: number;             // Current moisture percentage (0-100)
  temperature: number;             // Current temperature in °C
  capacityTonnes: number;          // Maximum storage capacity in tonnes
  status: ShedStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

### Shed Form Types (Create / Edit)

```typescript
/** Input for creating a new shed */
interface CreateShedInput {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl?: string;
  soybeanType: SoybeanType;
  soybeanCount: number;
  moisturePct: number;
  temperature: number;
  capacityTonnes: number;
  status: ShedStatus;
}

/** Input for updating an existing shed (all fields optional) */
type UpdateShedInput = Partial<CreateShedInput>;
```

### Shed Filter Types (Database Tab)

```typescript
/** Filters for the shed list on the Database page */
interface ShedFilters {
  search?: string;                 // Free-text search across name, code, address
  soybeanType?: SoybeanType[];     // Filter by soybean type
  status?: ShedStatus[];           // Filter by status
  moistureRange?: {
    min: number;
    max: number;
  };
  capacityRange?: {
    min: number;
    max: number;
  };
}

/** Combined query params for fetching sheds */
interface ShedQueryParams extends PaginationParams {
  filters?: ShedFilters;
}
```

---

## Shed Detail (Map Click)

```typescript
/** Extended shed info shown when clicking a pin on the map */
interface ShedDetail extends Shed {
  corporation: {
    id: UUID;
    name: string;
  };
  recentReadings: SensorReading[];  // Last few sensor readings
  utilizationPct: number;           // soybeanCount / capacityTonnes * 100
}
```

---

## Sensor Readings

```typescript
/** Type of sensor installed in a shed */
type SensorType = 'temperature' | 'moisture' | 'range';

/** A single sensor reading from a shed */
interface SensorReading {
  id: UUID;
  shedId: UUID;
  sensorType: SensorType;
  value: number;                   // The sensor reading value
  unit: string;                    // "°C", "%", "cm"
  recordedAt: ISODateString;       // When the sensor took the reading
}

/** Input for posting a new sensor reading */
interface CreateSensorReadingInput {
  shedId: UUID;
  sensorType: SensorType;
  value: number;
  unit: string;
}
```

---

## Map Types

```typescript
/** A marker/pin on the map representing a shed */
interface MapMarker {
  shedId: UUID;
  latitude: number;
  longitude: number;
  name: string;
  code: string;
  status: ShedStatus;
}

/** The map's current viewport state */
interface MapViewState {
  center: GeoCoordinate;
  zoom: number;
}
```

---

## Summary Types

```typescript
/** Severity level for alerts and suggestions */
type Severity = 'info' | 'warning' | 'critical';

/** A single improvement suggestion on the summary page */
interface ImprovementSuggestion {
  shedId: UUID;
  shedCode: string;
  message: string;                 // "Moisture is high (15.1%)"
  severity: Severity;
}

/** Stats broken down by soybean type */
interface SoybeanTypeStat {
  soybeanType: SoybeanType;
  totalTonnes: number;
  shedCount: number;
}

/** The full summary/dashboard response */
interface DashboardSummary {
  totalSheds: number;
  totalSoybeanTonnes: number;
  avgMoisturePct: number;
  avgTemperature: number;
  shedsAtCapacity: number;         // Sheds where utilization > 90%
  alertCount: {
    critical: number;
    warning: number;
    info: number;
  };
  statsByType: SoybeanTypeStat[];
  improvements: ImprovementSuggestion[];
}
```

---

## Auth / User Types

```typescript
/** Role of the logged-in user */
type UserRole = 'admin' | 'operator' | 'viewer';

/** The currently authenticated user */
interface User {
  id: UUID;
  email: string;
  name: string;
  role: UserRole;
  corporationId: UUID;
  corporationName: string;         // For the "Hello, [Corp]!" greeting
}

/** Login request */
interface LoginInput {
  email: string;
  password: string;
}

/** Login response */
interface AuthResponse {
  user: User;
  token: string;
  expiresAt: ISODateString;
}
```

---

## Settings Types

```typescript
/** User-configurable settings */
interface UserSettings {
  temperatureUnit: 'celsius' | 'fahrenheit';
  defaultMapZoom: number;
  defaultPageSize: number;         // 10, 25, 50
  notifications: {
    highMoisture: boolean;
    lowCapacity: boolean;
    shedOffline: boolean;
  };
}
```

---

## API Service Types

```typescript
/** Generic API response wrapper */
interface ApiResponse<T> {
  data: T;
  success: boolean;
}

/** Shed list endpoint response */
type ShedListResponse = PaginatedResponse<Shed>;

/** Summary endpoint response */
type SummaryResponse = ApiResponse<DashboardSummary>;

/** Map markers endpoint response */
type MapMarkersResponse = ApiResponse<MapMarker[]>;

/** Single shed detail response */
type ShedDetailResponse = ApiResponse<ShedDetail>;
```

---

## Table Column Definition (Database Tab)

```typescript
/** Column config for the ShedTable (TanStack Table) */
interface ShedTableColumn {
  id: string;
  header: string;
  accessorKey: keyof Shed;
  sortable: boolean;
  filterable: boolean;
}

/**
 * Columns used in the database table:
 *
 * | Column ID    | Header     | Accessor       | Sortable | Filterable |
 * |-------------|------------|----------------|----------|------------|
 * | name        | Name       | name           | yes      | no (search)|
 * | code        | Code       | code           | yes      | no         |
 * | location    | Location   | address        | yes      | no         |
 * | soybeanType | Soybean    | soybeanType    | yes      | yes        |
 * | moisture    | Moisture   | moisturePct    | yes      | yes (range)|
 * | count       | Count      | soybeanCount   | yes      | no         |
 * | status      | Status     | status         | yes      | yes        |
 * | actions     | —          | —              | no       | no         |
 */
```

---

## Complete `src/types/index.ts`

For convenience, here's the full file ready to copy:

```typescript
// src/types/index.ts

// ─── Base Types ────────────────────────────────────────────

export type UUID = string;
export type ISODateString = string;

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
}

// ─── Corporation ───────────────────────────────────────────

export type CorporationTier = 'multinational' | 'regional' | 'local';

export interface Corporation {
  id: UUID;
  name: string;
  contactEmail: string;
  country: string;
  tier: CorporationTier;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ─── Shed ──────────────────────────────────────────────────

export type SoybeanType = 'meal' | 'whole' | 'hull' | 'other';
export type ShedStatus = 'operational' | 'maintenance' | 'offline';

export interface Shed {
  id: UUID;
  corporationId: UUID;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl: string | null;
  soybeanType: SoybeanType;
  soybeanCount: number;
  moisturePct: number;
  temperature: number;
  capacityTonnes: number;
  status: ShedStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateShedInput {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl?: string;
  soybeanType: SoybeanType;
  soybeanCount: number;
  moisturePct: number;
  temperature: number;
  capacityTonnes: number;
  status: ShedStatus;
}

export type UpdateShedInput = Partial<CreateShedInput>;

export interface ShedFilters {
  search?: string;
  soybeanType?: SoybeanType[];
  status?: ShedStatus[];
  moistureRange?: { min: number; max: number };
  capacityRange?: { min: number; max: number };
}

export interface ShedQueryParams extends PaginationParams {
  filters?: ShedFilters;
}

// ─── Shed Detail (Map) ────────────────────────────────────

export interface ShedDetail extends Shed {
  corporation: { id: UUID; name: string };
  recentReadings: SensorReading[];
  utilizationPct: number;
}

// ─── Sensors ───────────────────────────────────────────────

export type SensorType = 'temperature' | 'moisture' | 'range';

export interface SensorReading {
  id: UUID;
  shedId: UUID;
  sensorType: SensorType;
  value: number;
  unit: string;
  recordedAt: ISODateString;
}

export interface CreateSensorReadingInput {
  shedId: UUID;
  sensorType: SensorType;
  value: number;
  unit: string;
}

// ─── Map ───────────────────────────────────────────────────

export interface MapMarker {
  shedId: UUID;
  latitude: number;
  longitude: number;
  name: string;
  code: string;
  status: ShedStatus;
}

export interface MapViewState {
  center: GeoCoordinate;
  zoom: number;
}

// ─── Summary ───────────────────────────────────────────────

export type Severity = 'info' | 'warning' | 'critical';

export interface ImprovementSuggestion {
  shedId: UUID;
  shedCode: string;
  message: string;
  severity: Severity;
}

export interface SoybeanTypeStat {
  soybeanType: SoybeanType;
  totalTonnes: number;
  shedCount: number;
}

export interface DashboardSummary {
  totalSheds: number;
  totalSoybeanTonnes: number;
  avgMoisturePct: number;
  avgTemperature: number;
  shedsAtCapacity: number;
  alertCount: { critical: number; warning: number; info: number };
  statsByType: SoybeanTypeStat[];
  improvements: ImprovementSuggestion[];
}

// ─── Auth ──────────────────────────────────────────────────

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface User {
  id: UUID;
  email: string;
  name: string;
  role: UserRole;
  corporationId: UUID;
  corporationName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: ISODateString;
}

// ─── Settings ──────────────────────────────────────────────

export interface UserSettings {
  temperatureUnit: 'celsius' | 'fahrenheit';
  defaultMapZoom: number;
  defaultPageSize: number;
  notifications: {
    highMoisture: boolean;
    lowCapacity: boolean;
    shedOffline: boolean;
  };
}

// ─── API Responses ─────────────────────────────────────────

export type ShedListResponse = PaginatedResponse<Shed>;
export type SummaryResponse = ApiResponse<DashboardSummary>;
export type MapMarkersResponse = ApiResponse<MapMarker[]>;
export type ShedDetailResponse = ApiResponse<ShedDetail>;
```
