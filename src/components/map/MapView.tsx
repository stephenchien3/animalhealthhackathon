/**
 * Mapbox GL interactive map with shed markers, plant markers,
 * flight/truck arcs, and vehicle icons.
 */
import { useState, useCallback, useRef } from "react";
import Map, { Source, Layer, Popup, NavigationControl, Marker } from "react-map-gl/mapbox";
import type { MapMouseEvent, MapRef } from "react-map-gl/mapbox";
import type { MapMarker } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Warehouse, Factory, Truck, Plane } from "lucide-react";
import { PLANTS } from "@/data/plants";
import { DEMO_SHIPMENTS, getShipmentDestination, generateArc } from "@/data/shipments";
import type { Shipment } from "@/data/shipments";
import "mapbox-gl/dist/mapbox-gl.css";

// ── SVG icons as data URLs for Mapbox ───────────────────────────
const PLANE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%233b82f6" stroke="%23ffffff" stroke-width="0.5"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;
const TRUCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="%2322c55e"/><g transform="translate(4.5,5) scale(0.625)" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="15.5" r="2.5" fill="white"/><circle cx="18.5" cy="15.5" r="2.5" fill="white"/></g></svg>`;

const PLANE_IMG_URL = `data:image/svg+xml;charset=utf-8,${PLANE_SVG}`;
const TRUCK_IMG_URL = `data:image/svg+xml;charset=utf-8,${TRUCK_SVG}`;

const POPUP_CLASS = "[&_.mapboxgl-popup-content]:bg-white [&_.mapboxgl-popup-content]:border [&_.mapboxgl-popup-content]:border-gray-200 [&_.mapboxgl-popup-content]:rounded-lg [&_.mapboxgl-popup-content]:shadow-lg [&_.mapboxgl-popup-content]:p-0 [&_.mapboxgl-popup-content]:overflow-hidden [&_.mapboxgl-popup-tip]:border-t-white";

interface MapViewProps {
  markers: MapMarker[];
  onMarkerClick: (marker: MapMarker) => void;
}

/** Build arc + vehicle GeoJSON for a set of shipments. */
function buildShipmentGeo(shipments: Shipment[], progress: number) {
  const arcs: GeoJSON.Feature[] = [];
  const vehicles: GeoJSON.Feature[] = [];
  const origins: GeoJSON.Feature[] = [];

  for (const s of shipments) {
    const dest = getShipmentDestination(s);
    if (!dest) continue;

    const coords = generateArc(s.originLng, s.originLat, dest.lng, dest.lat);
    arcs.push({
      type: "Feature",
      geometry: { type: "LineString", coordinates: coords },
      properties: { id: s.id, mode: s.mode },
    });

    const idx = Math.floor(coords.length * progress);
    const pt = coords[idx]!;
    const prev = coords[Math.max(0, idx - 1)]!;
    const next = coords[Math.min(coords.length - 1, idx + 1)]!;
    const bearing = Math.atan2(next[0] - prev[0], next[1] - prev[1]) * (180 / Math.PI);
    vehicles.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: pt },
      properties: { id: s.id, mode: s.mode, bearing },
    });

    origins.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.originLng, s.originLat] },
      properties: { id: s.id, name: s.originName },
    });
  }

  return { arcs, vehicles, origins };
}

export default function MapView({ markers, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popup, setPopup] = useState<MapMarker | null>(null);
  const [plantPopup, setPlantPopup] = useState<(typeof PLANTS)[0] | null>(null);
  const [shipmentPopup, setShipmentPopup] = useState<Shipment | null>(null);

  // ── Shed GeoJSON ────────────────────────────────────────────
  const geojson = {
    type: "FeatureCollection" as const,
    features: markers.map((m) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [m.longitude, m.latitude] as [number, number] },
      properties: { shedId: m.shedId, name: m.name, code: m.code, status: m.status },
    })),
  };

  // ── Shipment GeoJSON ────────────────────────────────────────
  const active = DEMO_SHIPMENTS.filter((s) => s.status === "in_transit");
  const { arcs, vehicles, origins } = buildShipmentGeo(active, 0.6);

  const domesticArcs: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: arcs.filter((f) => f.properties?.mode === "truck") };
  const intlArcs: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: arcs.filter((f) => f.properties?.mode === "plane") };
  const vehiclesGeojson: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: vehicles };
  const originsGeojson: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: origins };

  // ── Load icons into Mapbox ──────────────────────────────────
  const handleMapLoad = useCallback((e: { target: mapboxgl.Map }) => {
    const map = e.target;
    map.setPaintProperty("land", "background-color", "#e5e7eb");

    const loadImg = (name: string, url: string, size: number) => {
      const img = new Image(size, size);
      img.onload = () => { if (!map.hasImage(name)) map.addImage(name, img); };
      img.src = url;
    };
    loadImg("plane-icon", PLANE_IMG_URL, 24);
    loadImg("truck-icon", TRUCK_IMG_URL, 26);
  }, []);

  // ── Click handler — sheds, arcs, vehicles, origins ──────────
  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature?.properties) {
        setPopup(null);
        setShipmentPopup(null);
        return;
      }

      // Shed click
      if (feature.properties.shedId) {
        const marker = markers.find((m) => m.shedId === feature.properties!.shedId);
        if (marker) { setPopup(marker); setShipmentPopup(null); onMarkerClick(marker); }
        return;
      }

      // Shipment click (arc, vehicle, or origin dot)
      if (feature.properties.id) {
        const shipment = DEMO_SHIPMENTS.find((s) => s.id === feature.properties!.id);
        if (shipment) { setShipmentPopup(shipment); setPopup(null); }
      }
    },
    [markers, onMarkerClick],
  );

  // Resolve popup coords for shipment (use vehicle position — midpoint of arc)
  const shipmentPopupCoords = shipmentPopup ? (() => {
    const dest = getShipmentDestination(shipmentPopup);
    if (!dest) return null;
    const coords = generateArc(shipmentPopup.originLng, shipmentPopup.originLat, dest.lng, dest.lat);
    const mid = coords[Math.floor(coords.length * 0.6)]!;
    return { lng: mid[0], lat: mid[1] };
  })() : null;

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
      initialViewState={{ longitude: -40, latitude: 20, zoom: 2 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      styleDiffing={false}
      onLoad={handleMapLoad}
      interactiveLayerIds={["shed-points", "domestic-arc-lines", "intl-arc-lines", "vehicle-icons", "origin-dots"]}
      onClick={handleClick}
    >
      <NavigationControl position="top-right" />

      {/* ── Shed markers (clustered) ─────────────────────────── */}
      <Source id="sheds" type="geojson" data={geojson} cluster clusterMaxZoom={14} clusterRadius={50}>
        <Layer id="clusters" type="circle" filter={["has", "point_count"]}
          paint={{ "circle-color": "#22c55e", "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 50, 28], "circle-opacity": 0.7 }} />
        <Layer id="cluster-count" type="symbol" filter={["has", "point_count"]}
          layout={{ "text-field": "{point_count_abbreviated}", "text-size": 11 }}
          paint={{ "text-color": "#ffffff" }} />
        <Layer id="shed-points" type="circle" filter={["!", ["has", "point_count"]]}
          paint={{ "circle-color": "#22c55e", "circle-radius": 6, "circle-stroke-width": 2, "circle-stroke-color": "#ffffff" }} />
      </Source>

      {/* ── Green origin dots for shipments ───────────────────── */}
      <Source id="origins" type="geojson" data={originsGeojson}>
        <Layer id="origin-dots" type="circle"
          paint={{ "circle-color": "#22c55e", "circle-radius": 5, "circle-stroke-width": 1.5, "circle-stroke-color": "#ffffff" }} />
      </Source>

      {/* ── Domestic arcs (green dashed) ─────────────────────── */}
      <Source id="domestic-arcs" type="geojson" data={domesticArcs}>
        <Layer id="domestic-arc-lines" type="line"
          paint={{ "line-color": "#22c55e", "line-width": 2, "line-dasharray": [4, 3], "line-opacity": 0.5 }} />
      </Source>

      {/* ── International arcs (blue dashed) ─────────────────── */}
      <Source id="intl-arcs" type="geojson" data={intlArcs}>
        <Layer id="intl-arc-lines" type="line"
          paint={{ "line-color": "#3b82f6", "line-width": 2, "line-dasharray": [4, 3], "line-opacity": 0.5 }} />
      </Source>

      {/* ── Vehicle icons ────────────────────────────────────── */}
      <Source id="vehicles" type="geojson" data={vehiclesGeojson}>
        <Layer id="vehicle-icons" type="symbol"
          layout={{
            "icon-image": ["match", ["get", "mode"], "truck", "truck-icon", "plane-icon"],
            "icon-size": 0.9,
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
          }} />
      </Source>

      {/* ── Plant markers (blue) ─────────────────────────────── */}
      {PLANTS.map((plant) => (
        <Marker key={plant.code} longitude={plant.longitude} latitude={plant.latitude} anchor="center"
          onClick={(e) => { e.originalEvent.stopPropagation(); setPlantPopup(plant); setShipmentPopup(null); setPopup(null); }}>
          <div className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-sm">
            <Factory className="h-3 w-3 text-white" />
          </div>
        </Marker>
      ))}

      {/* ── Shed popup ───────────────────────────────────────── */}
      {popup && (
        <Popup longitude={popup.longitude} latitude={popup.latitude} onClose={() => setPopup(null)}
          closeButton={false} closeOnClick={false} anchor="bottom" className={POPUP_CLASS}>
          <div className="w-52" style={{ background: "#ffffff" }}>
            {popup.imageUrl ? (
              <img src={popup.imageUrl} alt={popup.name} className="h-28 w-full object-cover" />
            ) : (
              <div className="flex h-28 w-full items-center justify-center" style={{ background: "#f4f4f5" }}>
                <Warehouse className="size-8 text-zinc-400" />
              </div>
            )}
            <div className="space-y-1 p-3 text-sm text-black">
              <p className="font-semibold">{popup.name}</p>
              <p className="text-zinc-500">{popup.code}</p>
              <Badge variant="secondary" className="text-xs">{popup.status}</Badge>
            </div>
          </div>
        </Popup>
      )}

      {/* ── Plant popup ──────────────────────────────────────── */}
      {plantPopup && (
        <Popup longitude={plantPopup.longitude} latitude={plantPopup.latitude} onClose={() => setPlantPopup(null)}
          closeButton={false} closeOnClick={false} anchor="bottom" className={POPUP_CLASS}>
          <div className="p-3 text-sm text-black">
            <p className="font-semibold">{plantPopup.name}</p>
            <p className="text-zinc-500">{plantPopup.code} &middot; {plantPopup.state}</p>
          </div>
        </Popup>
      )}

      {/* ── Shipment popup ───────────────────────────────────── */}
      {shipmentPopup && shipmentPopupCoords && (
        <Popup longitude={shipmentPopupCoords.lng} latitude={shipmentPopupCoords.lat} onClose={() => setShipmentPopup(null)}
          closeButton={false} closeOnClick={false} anchor="bottom" className={POPUP_CLASS}>
          <div className="w-56 p-3 text-sm text-black">
            <div className="flex items-center gap-2 mb-2">
              {shipmentPopup.mode === "truck" ? (
                <Truck className="h-4 w-4 text-green-500" />
              ) : (
                <Plane className="h-4 w-4 text-blue-500" />
              )}
              <span className="font-semibold">{shipmentPopup.id}</span>
              <Badge className={`ml-auto text-xs ${shipmentPopup.mode === "truck" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                {shipmentPopup.mode === "truck" ? "Domestic" : "International"}
              </Badge>
            </div>
            <div className="space-y-1 text-zinc-600">
              <p><span className="text-zinc-400">From:</span> {shipmentPopup.originName}</p>
              <p><span className="text-zinc-400">To:</span> {PLANTS.find((p) => p.code === shipmentPopup.plantCode)?.name}</p>
              <p><span className="text-zinc-400">Cargo:</span> {shipmentPopup.quantityTonnes}t {shipmentPopup.soybeanType}</p>
              <p><span className="text-zinc-400">Vehicle:</span> {shipmentPopup.vehicleId}</p>
            </div>
          </div>
        </Popup>
      )}
    </Map>
  );
}
