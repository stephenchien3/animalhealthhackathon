/**
 * Hook to fetch soy sale records for the current corporation.
 */
import { useQuery } from "@tanstack/react-query";
import { fetchSoyRecords } from "@/services/api";

export function useSoyRecords() {
  return useQuery({
    queryKey: ["soy-records"],
    queryFn: fetchSoyRecords,
  });
}
