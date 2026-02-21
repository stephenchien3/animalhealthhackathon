/**
 * Farmer page displaying soy sale records.
 * Shows a searchable/sortable table with an add record dialog.
 */
import { useState } from "react";
import { Plus } from "lucide-react";
import { useSoyRecords } from "@/hooks/useSoyRecords";
import { useSoyRecordMutations } from "@/hooks/useSoyRecordMutations";
import SoyRecordTable from "@/components/farmer/SoyRecordTable";
import SoyRecordForm from "@/components/farmer/SoyRecordForm";
import type { SoyRecord, CreateSoyRecordInput } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function FarmerPage() {
  const { data: records, isLoading } = useSoyRecords();
  const { createSoyRecord } = useSoyRecordMutations();
  const [formOpen, setFormOpen] = useState(false);

  function handleSubmit(data: CreateSoyRecordInput) {
    createSoyRecord.mutate(data, {
      onSuccess: () => setFormOpen(false),
    });
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
          <h2 className="text-3xl font-bold tracking-tight">Soy Sales Records</h2>
          <p className="text-muted-foreground">Track records of soy sold — buyer, amount, price, and location.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 size-4" />Add Record
        </Button>
      </div>

      <SoyRecordTable data={(records ?? []) as SoyRecord[]} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Record</DialogTitle>
            <DialogDescription>Fill in the details of the soy sale.</DialogDescription>
          </DialogHeader>
          <SoyRecordForm
            key="new"
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
