# Summary Page Implementation Plan

## Purpose

The Summary page is the operational command center. It answers one question: **"How healthy is our feed network right now?"** — through KPIs, charts, alerts, and trends.

---

## Page Layout (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: "Network Summary"              [Last updated: 2 min ago] [↻ Refresh] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Total    │  │ Avg      │  │ Active   │  │ Tonnes   │       │
│  │ Sheds    │  │ Moisture │  │ Alerts   │  │ Stored   │       │
│  │   127    │  │  12.4%   │  │    8     │  │ 54,230   │       │
│  │ +3 this  │  │ ↑ 0.2%   │  │ 3 crit   │  │ 78% cap  │       │
│  │   week   │  │ vs last  │  │          │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐  ┌────────────────────────┐   │
│  │  Moisture Trend (7d/30d)    │  │  Sheds by Status       │   │
│  │  ~~~~~~~~  line chart  ~~~~ │  │  ██ Operational  112   │   │
│  │  ~~~~~~~~~~~~~~~~~~~~~~~~~~~│  │  ██ Maintenance   10   │   │
│  │                             │  │  ██ Offline        5   │   │
│  └─────────────────────────────┘  └────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐  ┌────────────────────────┐   │
│  │  Storage by Soybean Type    │  │  Top 5 Highest         │   │
│  │  Meal    ████████  62%      │  │  Moisture Sheds        │   │
│  │  Whole   ████      28%      │  │  1. BR-042  18.2%  ⚠️  │   │
│  │  Hull    ██         7%      │  │  2. AR-019  17.8%  ⚠️  │   │
│  │  Other   █          3%      │  │  3. US-107  16.1%      │   │
│  └─────────────────────────────┘  └────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  IMPROVEMENT SUGGESTIONS                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔴 CRITICAL: BR-042 moisture at 18.2% — exceeds 15%   │   │
│  │    threshold. Risk of spoilage. Schedule inspection.     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 🟡 WARNING: 5 sheds offline for >24h. Check sensors.   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 🟢 INFO: Overall capacity at 78%. Consider expanding    │   │
│  │    storage in South America region.                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Tree

```
<SummaryPage />
├── <PageHeader title="Network Summary" />
│   └── <RefreshButton />           // Manual refetch + last-updated timestamp
│
├── <KPICardGrid />                 // 4-column responsive grid
│   ├── <KPICard title="Total Sheds" value={127} delta="+3 this week" icon={Warehouse} />
│   ├── <KPICard title="Avg Moisture" value="12.4%" delta="↑ 0.2%" trend="up" icon={Droplets} />
│   ├── <KPICard title="Active Alerts" value={8} subtitle="3 critical" icon={AlertTriangle} />
│   └── <KPICard title="Tonnes Stored" value="54,230" subtitle="78% capacity" icon={Package} />
│
├── <div className="grid grid-cols-2 gap-6">   // Charts row 1
│   ├── <MoistureTrendChart />       // Line chart — avg moisture over 7d or 30d
│   └── <StatusBreakdownChart />     // Donut or horizontal bar — operational/maintenance/offline
│
├── <div className="grid grid-cols-2 gap-6">   // Charts row 2
│   ├── <SoybeanTypeChart />         // Horizontal bar — tonnes by soybean type
│   └── <HighMoistureTable />        // Mini table — top 5 sheds with highest moisture
│
└── <ImprovementSuggestions />       // Alert cards sorted by severity
    ├── <SuggestionCard severity="critical" ... />
    ├── <SuggestionCard severity="warning" ... />
    └── <SuggestionCard severity="info" ... />
```

---

## Charting Library: Recharts

Already in the tech stack. Recharts is React-native, composable, and works well with Tailwind.

### Charts to Build

#### 1. Moisture Trend (Line Chart)

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={moistureTrend}>
    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
    <XAxis dataKey="date" stroke="#9ca3af" />
    <YAxis domain={[0, 20]} stroke="#9ca3af" />
    <Tooltip />
    <Line type="monotone" dataKey="avgMoisture" stroke="#3b82f6" strokeWidth={2} dot={false} />
    <ReferenceLine y={15} stroke="#ef4444" strokeDasharray="5 5" label="Threshold" />
  </LineChart>
</ResponsiveContainer>
```

- X-axis: dates (last 7 or 30 days, toggle)
- Y-axis: average moisture %
- Red dashed reference line at 15% (danger threshold)
- Toggle between 7-day and 30-day view

#### 2. Status Breakdown (Donut Chart)

```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
      {statusData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.status]} />)}
    </Pie>
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

- Segments: operational (green), maintenance (amber), offline (red)
- Inner label: total shed count
- Hover: count + percentage

#### 3. Soybean Type Distribution (Horizontal Bar)

```tsx
<ResponsiveContainer width="100%" height={200}>
  <BarChart data={soybeanData} layout="vertical">
    <XAxis type="number" />
    <YAxis type="category" dataKey="type" width={60} />
    <Tooltip formatter={(val) => `${val} tonnes`} />
    <Bar dataKey="tonnes" fill="#6366f1" radius={[0, 4, 4, 0]} />
  </BarChart>
</ResponsiveContainer>
```

- Horizontal bars: meal, whole, hull, other
- Values in tonnes
- Sorted descending

#### 4. High Moisture Table (Mini Table)

Not a chart — a simple ranked list using shadcn/ui `<Table>`:

| Rank | Shed | Moisture | Status |
|------|------|----------|--------|
| 1 | BR-042 | 18.2% | critical |
| 2 | AR-019 | 17.8% | critical |
| 3 | US-107 | 16.1% | warning |
| 4 | BR-088 | 15.3% | warning |
| 5 | IN-204 | 14.9% | ok |

Click a row → navigate to that shed on the Map page.

---

## KPI Card Design

Each card is a shadcn `<Card>` with:

```
┌──────────────────────┐
│ [icon]  Total Sheds  │  ← muted title + icon
│                      │
│       127            │  ← large bold number
│                      │
│  +3 this week  ↑     │  ← delta with trend arrow (green/red)
└──────────────────────┘
```

### KPI Data Source

```typescript
interface KPIData {
  totalSheds: number;
  avgMoisture: number;
  moistureDelta: number;       // change vs previous period
  activeAlerts: number;
  criticalAlerts: number;
  totalTonnesStored: number;
  capacityPercentage: number;
}
```

All computed server-side via a single `GET /api/summary` call (or Supabase RPC function).

---

## Improvement Suggestions Logic

Suggestions are generated server-side (or client-side from shed data) based on rules:

### Rule Engine

```typescript
function generateSuggestions(sheds: Shed[]): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  // CRITICAL: Any shed with moisture > 15%
  const highMoisture = sheds.filter(s => s.moisturePct > 15);
  highMoisture.forEach(shed => {
    suggestions.push({
      severity: 'critical',
      title: `${shed.code} moisture at ${shed.moisturePct}%`,
      description: `Exceeds 15% safe threshold. Risk of spoilage. Schedule immediate inspection.`,
      shedId: shed.id,
    });
  });

  // WARNING: Sheds offline for extended period
  const offlineSheds = sheds.filter(s => s.status === 'offline');
  if (offlineSheds.length > 0) {
    suggestions.push({
      severity: 'warning',
      title: `${offlineSheds.length} sheds offline`,
      description: `Check sensor connectivity and power supply.`,
    });
  }

  // WARNING: Sheds near full capacity (>90%)
  const nearFull = sheds.filter(s => (s.soybeanCount / s.capacityTonnes) > 0.9);
  if (nearFull.length > 0) {
    suggestions.push({
      severity: 'warning',
      title: `${nearFull.length} sheds above 90% capacity`,
      description: `Consider redistributing stock or expanding storage.`,
    });
  }

  // INFO: Overall capacity insights
  const totalStored = sheds.reduce((sum, s) => sum + s.soybeanCount, 0);
  const totalCapacity = sheds.reduce((sum, s) => sum + s.capacityTonnes, 0);
  const utilizationPct = (totalStored / totalCapacity) * 100;
  if (utilizationPct > 75) {
    suggestions.push({
      severity: 'info',
      title: `Network at ${utilizationPct.toFixed(0)}% capacity`,
      description: `Consider expanding storage in high-demand regions.`,
    });
  }

  // INFO: Temperature anomalies
  const highTemp = sheds.filter(s => s.temperature > 35);
  if (highTemp.length > 0) {
    suggestions.push({
      severity: 'warning',
      title: `${highTemp.length} sheds above 35°C`,
      description: `High temperature risks feed degradation. Check ventilation systems.`,
    });
  }

  return suggestions.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
}
```

---

## Data Fetching Strategy

### Single Query Approach

```typescript
// TanStack Query
const { data: summary, isLoading } = useQuery({
  queryKey: ['summary'],
  queryFn: fetchDashboardSummary,
  refetchInterval: 60_000, // auto-refresh every 60s
});
```

### Supabase RPC (Recommended)

Create a PostgreSQL function that computes all summary data in one round trip:

```sql
CREATE OR REPLACE FUNCTION get_dashboard_summary(corp_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'totalSheds', (SELECT COUNT(*) FROM sheds WHERE corporation_id = corp_id),
    'avgMoisture', (SELECT AVG(moisture_pct) FROM sheds WHERE corporation_id = corp_id),
    'totalTonnes', (SELECT SUM(soybean_count) FROM sheds WHERE corporation_id = corp_id),
    'statusBreakdown', (
      SELECT json_agg(json_build_object('status', status, 'count', cnt))
      FROM (SELECT status, COUNT(*) as cnt FROM sheds WHERE corporation_id = corp_id GROUP BY status) s
    ),
    'soybeanBreakdown', (
      SELECT json_agg(json_build_object('type', soybean_type, 'tonnes', total))
      FROM (SELECT soybean_type, SUM(soybean_count) as total FROM sheds WHERE corporation_id = corp_id GROUP BY soybean_type) t
    ),
    'highMoistureSheds', (
      SELECT json_agg(json_build_object('id', id, 'code', code, 'moisturePct', moisture_pct))
      FROM (SELECT id, code, moisture_pct FROM sheds WHERE corporation_id = corp_id ORDER BY moisture_pct DESC LIMIT 5) h
    )
  );
$$ LANGUAGE SQL STABLE;
```

Call from client:

```typescript
const { data } = await supabase.rpc('get_dashboard_summary', { corp_id: user.corporationId });
```

---

## Responsive Behavior

| Breakpoint | KPI Cards | Charts | Suggestions |
|------------|-----------|--------|-------------|
| `lg` (1024px+) | 4 columns | 2 columns | Full width |
| `md` (768px) | 2 columns | 1 column stacked | Full width |
| `sm` (640px) | 1 column | 1 column | Full width |

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* KPI Cards */}
</div>
```

---

## Implementation Phases

### Phase 1 — Static KPIs (MVP)

- [ ] Create `SummaryPage` layout with header + refresh button
- [ ] Build `KPICard` component (icon, title, value, delta)
- [ ] Fetch summary data from Supabase (direct query or RPC)
- [ ] Render 4 KPI cards with real data
- [ ] Loading skeletons for each card

### Phase 2 — Charts

- [ ] `MoistureTrendChart` — line chart with 7d/30d toggle
- [ ] `StatusBreakdownChart` — donut chart
- [ ] `SoybeanTypeChart` — horizontal bar chart
- [ ] `HighMoistureTable` — mini ranked table
- [ ] Responsive 2-column grid for charts

### Phase 3 — Alerts & Intelligence

- [ ] `ImprovementSuggestions` component
- [ ] Client-side rule engine to generate suggestions
- [ ] Severity badges (critical red, warning amber, info blue)
- [ ] Click suggestion → navigate to relevant shed/map
- [ ] Auto-refresh summary every 60 seconds

### Phase 4 — Polish

- [ ] Animate KPI number transitions (count-up effect)
- [ ] Chart hover tooltips with formatted values
- [ ] Empty states when no data
- [ ] Print-friendly view for reports
- [ ] Export summary as PDF (stretch goal)
