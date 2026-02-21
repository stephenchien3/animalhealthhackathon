/**
 * Hook for shed create/update/delete mutations.
 * Automatically invalidates related caches on success.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createShed as apiCreate,
  updateShed as apiUpdate,
  deleteShed as apiDelete,
} from "@/services/api";
import type { CreateShedInput, UpdateShedInput } from "@/types";

export function useShedMutations() {
  const qc = useQueryClient();

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["sheds"] });
    qc.invalidateQueries({ queryKey: ["map", "markers"] });
  };

  const createShed = useMutation({
    mutationFn: (input: CreateShedInput) => apiCreate(input),
    onSuccess: invalidateAll,
  });

  const updateShed = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateShedInput }) =>
      apiUpdate(id, input),
    onSuccess: (_data, { id }) => {
      invalidateAll();
      qc.invalidateQueries({ queryKey: ["sheds", id] });
    },
  });

  const deleteShed = useMutation({
    mutationFn: (id: string) => apiDelete(id),
    onSuccess: invalidateAll,
  });

  return { createShed, updateShed, deleteShed };
}
