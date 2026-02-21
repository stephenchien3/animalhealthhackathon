/**
 * Hook to fetch a single shed by ID.
 * Only fires the query when a valid ID is provided.
 */
import { useQuery } from "@tanstack/react-query";
import { fetchShedById } from "@/services/api";

export function useShed(id: string | undefined) {
  return useQuery({
    queryKey: ["sheds", id],
    queryFn: () => fetchShedById(id!),
    enabled: !!id,
  });
}
