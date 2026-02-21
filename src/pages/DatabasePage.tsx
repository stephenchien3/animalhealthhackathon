/**
 * Database page for CRUD management of sheds.
 * Shows a searchable/sortable table with add/edit/delete actions.
 * Create and edit use a modal dialog with validated form.
 */
import { useState } from "react";
import { Plus } from "lucide-react";
import { useSheds } from "@/hooks/useSheds";
import { useShedMutations } from "@/hooks/useShedMutations";
import ShedTable from "@/components/shed/ShedTable";
import ShedForm from "@/components/shed/ShedForm";
import type { Shed, CreateShedInput } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DatabasePage() {
  const { data: sheds, isLoading } = useSheds();
  const { createShed, updateShed, deleteShed } = useShedMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editingShed, setEditingShed] = useState<Shed | undefined>();

  function handleEdit(shed: Shed) {
    setEditingShed(shed);
    setFormOpen(true);
  }

  function handleDelete(shedId: string) {
    if (confirm("Delete this shed?")) deleteShed.mutate(shedId);
  }

  function handleSubmit(data: CreateShedInput) {
    if (editingShed) updateShed.mutate({ id: editingShed.id, input: data });
    else createShed.mutate(data);
    setFormOpen(false);
    setEditingShed(undefined);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" /><Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Database</h2>
          <p className="text-muted-foreground">Manage your sheds — search, filter, add, and edit entries.</p>
        </div>
        <Button onClick={() => { setEditingShed(undefined); setFormOpen(true); }}>
          <Plus className="mr-2 size-4" />Add Shed
        </Button>
      </div>

      <ShedTable data={(sheds ?? []) as Shed[]} onEdit={handleEdit} onDelete={handleDelete} />

      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingShed(undefined); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingShed ? "Edit Shed" : "Add Shed"}</DialogTitle>
            <DialogDescription>
              {editingShed ? "Update the details of this shed." : "Fill in the details to add a new shed."}
            </DialogDescription>
          </DialogHeader>
          <ShedForm
            key={editingShed?.id ?? "new"}
            shed={editingShed}
            onSubmit={handleSubmit}
            onCancel={() => { setFormOpen(false); setEditingShed(undefined); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
