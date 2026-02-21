/**
 * Map page showing shed locations on an interactive Mapbox GL map.
 * Clicking a marker opens a slide-out detail panel on the right.
 */
import { useState } from "react";
import { useMapMarkers } from "@/hooks/useMapMarkers";
import MapView from "@/components/map/MapView";
import ShedDetailPanel from "@/components/map/ShedDetailPanel";
import type { MapMarker } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function MapPage() {
  const { data: markers, isLoading } = useMapMarkers();
  const [selectedShedId, setSelectedShedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-[calc(100vh-10rem)] rounded-md" />
      </div>
    );
  }

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)]">
      <div className="flex-1">
        <MapView markers={markers ?? []} onMarkerClick={(m: MapMarker) => setSelectedShedId(m.shedId)} />
      </div>
      {selectedShedId && (
        <ShedDetailPanel shedId={selectedShedId} onClose={() => setSelectedShedId(null)} />
      )}
    </div>
  );
}
