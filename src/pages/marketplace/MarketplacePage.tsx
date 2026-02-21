import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Package, Warehouse, Clock, CheckCircle, Truck } from "lucide-react";
import { toast } from "sonner";
import { fetchListings, fetchCredits, placeOrder } from "@/services/api";
import type { Listing } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DEMO_ORDERS = [
  { id: "ord-001", title: "500t Soybean Meal — Lusaka Central", qty: 120, price: 288.00, status: "delivered" as const, date: "2026-02-18" },
  { id: "ord-002", title: "800t Whole Soybean — Copperbelt", qty: 350, price: 840.00, status: "confirmed" as const, date: "2026-02-19" },
  { id: "ord-003", title: "300t Soybean Hull — Maharashtra", qty: 75, price: 150.00, status: "delivered" as const, date: "2026-02-17" },
  { id: "ord-004", title: "1000t Whole Soybean — Kabwe", qty: 500, price: 1200.00, status: "pending" as const, date: "2026-02-21" },
  { id: "ord-005", title: "600t Soybean Meal — Chipata", qty: 200, price: 480.00, status: "confirmed" as const, date: "2026-02-20" },
  { id: "ord-006", title: "Gujarat Feed Store — Full Site", qty: 1500, price: 2590.91, status: "pending" as const, date: "2026-02-21" },
];

const ORDER_STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, variant: "outline" as const },
  confirmed: { label: "Confirmed", icon: CheckCircle, variant: "secondary" as const },
  delivered: { label: "Delivered", icon: Truck, variant: "default" as const },
};

export default function MarketplacePage() {
  const qc = useQueryClient();
  const { data: listings, isLoading } = useQuery({ queryKey: ["listings"], queryFn: fetchListings });
  const { data: credits } = useQuery({ queryKey: ["credits"], queryFn: fetchCredits });

  const [selected, setSelected] = useState<Listing | null>(null);
  const [qty, setQty] = useState("");

  const buy = useMutation({
    mutationFn: () => placeOrder(selected!.id, Number(qty)),
    onSuccess: () => {
      toast.success("Purchase complete!");
      setSelected(null);
      setQty("");
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["credits"] });
      qc.invalidateQueries({ queryKey: ["sheds"] });
      qc.invalidateQueries({ queryKey: ["map", "markers"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const cost = selected ? (Number(qty) / selected.quantityTonnes) * selected.priceUsd : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
          <p className="text-muted-foreground">Browse and purchase soybean pallets or sheds.</p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-2">
          Credits: ${(credits ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Badge>
      </div>

      {/* Listing grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(listings ?? []).map((l) => (
          <Card key={l.id} className="flex flex-col">
            {l.imageUrl && (
              <img src={l.imageUrl} alt={l.title} className="h-40 w-full rounded-t-lg object-cover" />
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-base leading-snug">{l.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {l.listingType === "pallet" ? <Package className="mr-1 size-3" /> : <Warehouse className="mr-1 size-3" />}
                  {l.listingType}
                </Badge>
                <Badge variant="outline">{l.soybeanType}</Badge>
              </div>
              <div className="mt-auto flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold">${l.priceUsd.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{l.quantityTonnes.toLocaleString()}t available</p>
                </div>
                <Button size="sm" onClick={() => { setSelected(l); setQty(String(l.quantityTonnes)); }}>
                  <ShoppingCart className="mr-1 size-3" />Buy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Recent Orders</h3>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead className="text-right">Qty (t)</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_ORDERS.map((o) => {
                const cfg = ORDER_STATUS_CONFIG[o.status];
                const Icon = cfg.icon;
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell>{o.title}</TableCell>
                    <TableCell className="text-right">{o.qty.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">${o.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant} className="gap-1">
                        <Icon className="size-3" />
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Purchase dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setQty(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase: {selected?.title}</DialogTitle>
            <DialogDescription>
              ${selected?.priceUsd.toLocaleString()} for {selected?.quantityTonnes.toLocaleString()}t total
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium">Quantity (tonnes)</label>
              <Input
                type="number"
                min={1}
                max={selected?.quantityTonnes}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Cost</span>
              <span className="font-bold">${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Your credits</span>
              <span>${(credits ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {cost > (credits ?? 0) && (
              <p className="text-sm text-destructive">Insufficient credits.</p>
            )}
            <Button
              className="w-full"
              disabled={!qty || Number(qty) <= 0 || Number(qty) > (selected?.quantityTonnes ?? 0) || cost > (credits ?? 0) || buy.isPending}
              onClick={() => buy.mutate()}
            >
              {buy.isPending ? "Processing..." : "Confirm Purchase"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
