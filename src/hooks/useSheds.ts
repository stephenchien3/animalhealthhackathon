/**
 * Hook to fetch the full list of sheds for the current corporation.
 */
import { useQuery } from "@tanstack/react-query";
import { fetchSheds } from "@/services/api";

export function useSheds() {
  return useQuery({
    queryKey: ["sheds"],
    queryFn: fetchSheds,
  });
}
