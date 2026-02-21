/**
 * Farmer page displaying soy sale records.
 * Uses mock data for the standalone (unauthenticated) view.
 */
import { useState } from "react";
import { Plus } from "lucide-react";
import SoyRecordTable from "@/components/farmer/SoyRecordTable";
import SoyRecordForm from "@/components/farmer/SoyRecordForm";
import type { SoyRecord, CreateSoyRecordInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MOCK_RECORDS: SoyRecord[] = [
  { id: "1", corporationId: "a1b2c3d4-0000-0000-0000-000000000001", shedId: "s1", buyerCompany: "AgriCorp International",      soyType: "meal",  quantityTonnes: 120,  priceUsd: 288,  shedLocation: "Lusaka, Zambia",            status: "delivered", soldAt: "2025-11-15T00:00:00Z", createdAt: "2025-11-15T00:00:00Z" },
  { id: "2", corporationId: "a1b2c3d4-0000-0000-0000-000000000001", shedId: "s2", buyerCompany: "AgriCorp International",     soyType: "whole", quantityTonnes: 350,  priceUsd: 840,  shedLocation: "Copperbelt, Zambia",        status: "delivered", soldAt: "2025-12-01T00:00:00Z", createdAt: "2025-12-01T00:00:00Z" },
  { id: "3", corporationId: "a1b2c3d4-0000-0000-0000-000000000001", shedId: "s3", buyerCompany: "AgriCorp International",    soyType: "whole", quantityTonnes: 500,  priceUsd: 1200, shedLocation: "Kabwe, Zambia",             status: "shipped",   soldAt: "2026-01-10T00:00:00Z", createdAt: "2026-01-10T00:00:00Z" },
  { id: "4", corporationId: "a1b2c3d4-0000-0000-0000-000000000001", shedId: "s4", buyerCompany: "AgriCorp International",              soyType: "meal",  quantityTonnes: 200,  priceUsd: 480,  shedLocation: "Chipata, Zambia",           status: "delivered", soldAt: "2026-01-18T00:00:00Z", createdAt: "2026-01-18T00:00:00Z" },
  { id: "5", corporationId: "a1b2c3d4-0000-0000-0000-000000000001", shedId: "s5", buyerCompany: "AgriCorp International", soyType: "hull",  quantityTonnes: 150,  priceUsd: 300,  shedLocation: "Maharashtra, India",        status: "shipped",   soldAt: "2026-02-01T00:00:00Z", createdAt: "2026-02-01T00:00:00Z" },
  { id: "6", corporationId: "a1b2c3d4-0000-0000-0000-000000000001", shedId: "s6", buyerCompany: "AgriCorp International",          soyType: "meal",  quantityTonnes: 800,  priceUsd: 1380, shedLocation: "Gujarat, India",            status: "shipped",   soldAt: "2026-02-10T00:00:00Z", createdAt: "2026-02-10T00:00:00Z" },
  { id: "7", corporationId: "a1b2c3d4-0000-0000-0000-000000000001", shedId: "s7", buyerCompany: "AgriCorp International",     soyType: "meal",  quantityTonnes: 100,  priceUsd: 240,  shedLocation: "Southern Province, Zambia", status: "delivered", soldAt: "2025-10-22T00:00:00Z", createdAt: "2025-10-22T00:00:00Z" },
  { id: "8", corporationId: "a1b2c3d4-0000-0000-0000-000000000001", shedId: "s8", buyerCompany: "AgriCorp International",         soyType: "meal",  quantityTonnes: 250,  priceUsd: 600,  shedLocation: "Lusaka, Zambia",            status: "delivered", soldAt: "2025-09-05T00:00:00Z", createdAt: "2025-09-05T00:00:00Z" },
];

export default function FarmerPage() {
  const [records, setRecords] = useState<SoyRecord[]>(MOCK_RECORDS);
  const [formOpen, setFormOpen] = useState(false);

  function handleSubmit(data: CreateSoyRecordInput) {
    const newRecord: SoyRecord = {
      id: crypto.randomUUID(),
      corporationId: "a1b2c3d4-0000-0000-0000-000000000001",
      shedId: data.shedId,
      buyerCompany: data.buyerCompany,
      soyType: data.soyType,
      quantityTonnes: data.quantityTonnes,
      priceUsd: data.priceUsd,
      shedLocation: data.shedLocation,
      status: data.status,
      soldAt: data.soldAt,
      createdAt: new Date().toISOString(),
    };
    setRecords((prev) => [newRecord, ...prev]);
    setFormOpen(false);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Soybean Sales Records</h2>
          <p className="text-muted-foreground">Track records of soybeans sold.</p>
        </div>
      </div>

      <SoyRecordTable data={records} />

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
