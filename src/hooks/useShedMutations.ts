/**
 * Hook for shed create/update/delete mutations.
 * Automatically invalidates related caches on success.
 * Shows toast notifications for success and error states.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    onSuccess: () => {
      invalidateAll();
      toast.success("Shed created successfully");
    },
    onError: (err: Error) => {
      toast.error("Failed to create shed", { description: err.message });
    },
  });

  const updateShed = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateShedInput }) =>
      apiUpdate(id, input),
    onSuccess: (_data, { id }) => {
      invalidateAll();
      qc.invalidateQueries({ queryKey: ["sheds", id] });
      toast.success("Shed updated successfully");
    },
    onError: (err: Error) => {
      toast.error("Failed to update shed", { description: err.message });
    },
  });

  const deleteShed = useMutation({
    mutationFn: (id: string) => apiDelete(id),
    onSuccess: () => {
      invalidateAll();
      toast.success("Shed deleted");
    },
    onError: (err: Error) => {
      toast.error("Failed to delete shed", { description: err.message });
    },
  });

  return { createShed, updateShed, deleteShed };
}
