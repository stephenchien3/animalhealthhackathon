/**
 * Hook to fetch map marker data for all sheds.
 * Returns lightweight lat/lng + status data for the map view.
 */
import { useQuery } from "@tanstack/react-query";
import { fetchMapMarkers } from "@/services/api";

export function useMapMarkers() {
  return useQuery({
    queryKey: ["map", "markers"],
    queryFn: fetchMapMarkers,
  });
}
