/**
 * Mapbox GL interactive map with clustered shed markers.
 * Uses WebGL rendering for smooth performance at any zoom level.
 * Markers are colored by shed status (green/amber/red).
 */
import { useState, useCallback } from "react";
import Map, { Source, Layer, Popup, NavigationControl } from "react-map-gl/mapbox";
import type { MapMouseEvent } from "react-map-gl/mapbox";
import type { MapMarker } from "@/types";
import { STATUS_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapViewProps {
  markers: MapMarker[];
  onMarkerClick: (marker: MapMarker) => void;
}

export default function MapView({ markers, onMarkerClick }: MapViewProps) {
  const [popup, setPopup] = useState<MapMarker | null>(null);

  // Convert markers to GeoJSON for Mapbox source
  const geojson = {
    type: "FeatureCollection" as const,
    features: markers.map((m) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [m.longitude, m.latitude] as [number, number],
      },
      properties: {
        shedId: m.shedId,
        name: m.name,
        code: m.code,
        status: m.status,
        color: STATUS_COLORS[m.status] ?? "#6b7280",
      },
    })),
  };

  // Find the clicked marker from the map feature and propagate to parent
  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature?.properties) return;
      const marker = markers.find((m) => m.shedId === feature.properties!.shedId);
      if (marker) {
        setPopup(marker);
        onMarkerClick(marker);
      }
    },
    [markers, onMarkerClick],
  );

  return (
    <Map
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
      initialViewState={{ longitude: 20, latitude: 0, zoom: 2 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      interactiveLayerIds={["shed-points"]}
      onClick={handleClick}
    >
      <NavigationControl position="top-right" />
      <Source id="sheds" type="geojson" data={geojson} cluster clusterMaxZoom={14} clusterRadius={50}>
        {/* Cluster circles — sized by point count */}
        <Layer
          id="clusters"
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": "#6366f1",
            "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 50, 40],
            "circle-opacity": 0.7,
          }}
        />
        {/* Cluster count labels */}
        <Layer
          id="cluster-count"
          type="symbol"
          filter={["has", "point_count"]}
          layout={{ "text-field": "{point_count_abbreviated}", "text-size": 12 }}
          paint={{ "text-color": "#ffffff" }}
        />
        {/* Individual shed markers — colored by status */}
        <Layer
          id="shed-points"
          type="circle"
          filter={["!", ["has", "point_count"]]}
          paint={{
            "circle-color": ["get", "color"],
            "circle-radius": 8,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          }}
        />
      </Source>
      {popup && (
        <Popup
          longitude={popup.longitude}
          latitude={popup.latitude}
          onClose={() => setPopup(null)}
          closeButton={false}
          anchor="bottom"
          className="[&_.mapboxgl-popup-content]:bg-background [&_.mapboxgl-popup-content]:border [&_.mapboxgl-popup-content]:border-border [&_.mapboxgl-popup-content]:rounded-lg [&_.mapboxgl-popup-content]:shadow-lg [&_.mapboxgl-popup-tip]:border-t-background"
        >
          <div className="space-y-1 text-sm text-foreground">
            <p className="font-semibold">{popup.name}</p>
            <p className="text-muted-foreground">{popup.code}</p>
            <Badge variant="secondary" className="text-xs">{popup.status}</Badge>
          </div>
        </Popup>
      )}
    </Map>
  );
}
