/**
 * Hook for soy record create/update/delete mutations.
 * Invalidates cache and shows toast notifications.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSoyRecord as apiCreate,
  updateSoyRecord as apiUpdate,
  deleteSoyRecord as apiDelete,
} from "@/services/api";
import type { CreateSoyRecordInput, UpdateSoyRecordInput } from "@/types";

export function useSoyRecordMutations() {
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: ["soy-records"] });

  const createSoyRecord = useMutation({
    mutationFn: (input: CreateSoyRecordInput) => apiCreate(input),
    onSuccess: () => { invalidate(); toast.success("Record created"); },
    onError: (err: Error) => toast.error("Failed to create record", { description: err.message }),
  });

  const updateSoyRecord = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSoyRecordInput }) => apiUpdate(id, input),
    onSuccess: () => { invalidate(); toast.success("Record updated"); },
    onError: (err: Error) => toast.error("Failed to update record", { description: err.message }),
  });

  const deleteSoyRecord = useMutation({
    mutationFn: (id: string) => apiDelete(id),
    onSuccess: () => { invalidate(); toast.success("Record deleted"); },
    onError: (err: Error) => toast.error("Failed to delete record", { description: err.message }),
  });

  return { createSoyRecord, updateSoyRecord, deleteSoyRecord };
}
