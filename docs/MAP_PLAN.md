# Map Implementation Plan

## Library Choice: Mapbox GL JS via `react-map-gl`

### Why Mapbox GL JS over Leaflet

The project currently lists Leaflet, but **Mapbox GL JS** (wrapped by `react-map-gl`) is the stronger choice for this project:

| Criteria | Leaflet | Mapbox GL JS |
|----------|---------|--------------|
| Rendering | Raster (DOM-based) | WebGL (GPU-accelerated) |
| Custom map styles | Limited | Full control via Mapbox Studio |
| 3D / Pitch / Bearing | No | Yes |
| Smooth animations | Choppy at scale | Butter-smooth fly-to, easing |
| Cluster performance | Plugin-based, laggy 500+ | Native, handles 10k+ markers |
| Dark mode support | Hacky tile swap | Single style URL swap |
| Data viz layers | None built-in | Heatmaps, extruded polygons, etc. |
| Mobile gestures | Basic | Native-feeling pinch/rotate |

### Who Uses Mapbox

- **Uber** — built `react-map-gl` and `deck.gl` on top of Mapbox GL
- **Strava** — activity heatmaps
- **Shopify** — store locator maps
- **Instacart** — delivery zone mapping
- **The Washington Post** — data journalism
- **Figma** — office/team maps
- **Allbirds, Away, Warby Parker** — store finders
- **CNN, The New York Times** — interactive stories

### Packages to Install

```bash
npm install react-map-gl mapbox-gl
npm install -D @types/mapbox-gl
```

### Free Tier

Mapbox free tier: **50,000 map loads/month** — more than enough for a hackathon and early startup usage. No credit card required for free tier.

### Environment Variable

```env
VITE_MAPBOX_ACCESS_TOKEN=pk.xxxxxxxxxxxxx
```

Get a token at https://account.mapbox.com/access-tokens/

---

## Map Styles (Pick One)

These are the built-in Mapbox styles. Each can be swapped with a single URL change.

| Style | URL | Best For |
|-------|-----|----------|
| **Dark** | `mapbox://styles/mapbox/dark-v11` | Dashboard UIs, startup aesthetic |
| **Light** | `mapbox://styles/mapbox/light-v11` | Clean, minimal look |
| **Streets** | `mapbox://styles/mapbox/streets-v12` | General purpose |
| **Satellite Streets** | `mapbox://styles/mapbox/satellite-streets-v12` | Agriculture / shed context |
| **Navigation Night** | `mapbox://styles/mapbox/navigation-night-v1` | Dark with road emphasis |

**Recommended for CleanFeed**: `dark-v11` for the default dashboard, with a toggle to `satellite-streets-v12` so users can see actual shed locations against terrain.

You can also create a **fully custom style** in [Mapbox Studio](https://studio.mapbox.com/) — branded colors, hidden labels, custom fonts, etc.

---

## Map Page Architecture

### Component Tree

```
<MapPage />
├── <MapControls />            // Style toggle, zoom buttons, fullscreen
├── <Map />                    // react-map-gl wrapper
│   ├── <NavigationControl />  // Zoom +/- and compass (built-in)
│   ├── <GeolocateControl />   // "Find me" button (built-in)
│   ├── <Source />             // GeoJSON data source for shed markers
│   │   └── <Layer />          // Clustered circle layer
│   ├── <Marker />             // Individual shed pins (unclustered)
│   └── <Popup />              // Shed detail card on click
├── <ShedDetailPanel />        // Slide-out panel (right side) with full shed info
└── <MapLegend />              // Status color key
```

### Data Flow

```
1. Page mounts
2. TanStack Query fetches GET /api/map/markers
3. Response → GeoJSON FeatureCollection
4. Feed into <Source type="geojson" data={geojson}>
5. Mapbox clusters automatically via cluster: true
6. Click cluster → zoom in (flyTo)
7. Click individual marker → open Popup or ShedDetailPanel
```

---

## Feature Breakdown

### Phase 1 — Core Map (MVP)

- [ ] Render Mapbox GL map with dark style
- [ ] Plot shed markers from Supabase query
- [ ] Color markers by status: green (operational), amber (maintenance), red (offline)
- [ ] Click marker → show popup with shed name, code, status, soybean count
- [ ] Cluster markers when zoomed out (built-in Mapbox clustering)
- [ ] Click cluster → fly to and expand
- [ ] Zoom controls + compass
- [ ] Center map on shed locations using `fitBounds`

### Phase 2 — Enhanced UX

- [ ] Slide-out detail panel (right side) on marker click
  - Shed image
  - GPS coordinates
  - Soybean type + quantity
  - Moisture % with color indicator
  - Temperature with color indicator
  - Status badge
  - "Edit" and "View History" buttons
- [ ] Map style toggle (dark / satellite / light)
- [ ] Fullscreen mode
- [ ] URL sync — clicking a marker updates `?shed=BR-042` so links are shareable
- [ ] Loading skeleton while markers fetch

### Phase 3 — Data Visualization

- [ ] Heatmap layer for moisture levels across regions
- [ ] Extrude markers as 3D bars proportional to soybean count
- [ ] Draw shed capacity as a ring/donut around each marker
- [ ] Filter markers by status, soybean type, or corporation
- [ ] Animated fly-to when selecting a shed from the Database page

---

## Marker Design

### Status Colors

```typescript
const STATUS_COLORS = {
  operational:  '#22c55e', // green-500
  maintenance:  '#f59e0b', // amber-500
  offline:      '#ef4444', // red-500
} as const;
```

### Custom Marker (HTML Overlay)

Instead of default pins, use a custom circular marker:

```
┌─────────┐
│  ● 42t  │   ← circle colored by status, tonnage label
│  BR-042 │   ← shed code below
└─────────┘
```

Or use Mapbox's `circle` layer type for thousands of markers (GPU-rendered, no DOM nodes).

### Cluster Markers

```
  ┌───┐
  │ 7 │   ← number of sheds in cluster
  └───┘
```

Clusters use a stepped circle size: small (< 10 sheds), medium (10–50), large (50+).

---

## Key Code Pattern

```tsx
import Map, { Source, Layer, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export function MapPage() {
  const { data: markers } = useQuery({ queryKey: ['map', 'markers'], queryFn: fetchMapMarkers });
  const [selected, setSelected] = useState<MapMarker | null>(null);

  const geojson = useMemo(() => toGeoJSON(markers), [markers]);

  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{ longitude: 20, latitude: 0, zoom: 2 }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onClick={(e) => { /* handle marker click */ }}
    >
      <NavigationControl position="top-right" />
      <Source id="sheds" type="geojson" data={geojson} cluster clusterMaxZoom={14} clusterRadius={50}>
        <Layer id="clusters" type="circle" filter={['has', 'point_count']} paint={{...}} />
        <Layer id="cluster-count" type="symbol" filter={['has', 'point_count']} layout={{...}} />
        <Layer id="shed-points" type="circle" filter={['!', ['has', 'point_count']]} paint={{...}} />
      </Source>
      {selected && (
        <Popup longitude={selected.longitude} latitude={selected.latitude} onClose={() => setSelected(null)}>
          <ShedPopupCard marker={selected} />
        </Popup>
      )}
    </Map>
  );
}
```

---

## Alternative: MapLibre GL JS (100% Free)

If the team wants to avoid any API key or usage limits:

- **MapLibre GL JS** is the open-source fork of Mapbox GL JS
- Same API, same performance, same WebGL rendering
- Use free tile providers: Stadia Maps, MapTiler, or self-hosted
- Package: `react-map-gl` supports MapLibre as a drop-in via `mapLib` prop
- Trade-off: slightly less polished default styles, no Mapbox Studio

```bash
npm install react-map-gl maplibre-gl
```

```tsx
import maplibregl from 'maplibre-gl';
<Map mapLib={maplibregl} mapStyle="https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json" />
```

---

## Decision Summary

| Option | Cost | Quality | Effort |
|--------|------|---------|--------|
| **Mapbox GL JS** (recommended) | Free up to 50k loads | Best-in-class | Low (great React wrapper) |
| MapLibre GL JS | Fully free | Very good | Medium (style sourcing) |
| Leaflet (current) | Free | Adequate | Low but limited ceiling |
| Google Maps | $200 free credit | Good | Medium (heavier SDK) |

**Recommendation**: Use **Mapbox GL JS** via `react-map-gl` for the hackathon. Swap to MapLibre later if cost becomes a concern at scale.
