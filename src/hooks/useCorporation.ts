/**
 * Hook to fetch the current user's corporation.
 * Uses a long staleTime since corporation data rarely changes.
 */
import { useQuery } from "@tanstack/react-query";
import { fetchCorporation } from "@/services/api";

export function useCorporation() {
  return useQuery({
    queryKey: ["corporation"],
    queryFn: fetchCorporation,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
