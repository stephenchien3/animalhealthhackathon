/**
 * Slide-out panel showing full shed details when a map marker is clicked.
 * Displays location, soybean type, capacity, moisture, and temperature.
 */
import { MapPin, Droplets, Thermometer, Package, Wheat } from "lucide-react";
import { useShed } from "@/hooks/useShed";
import { STATUS_VARIANT } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface ShedDetailPanelProps {
  shedId: string;
  onClose: () => void;
}

export default function ShedDetailPanel({ shedId, onClose }: ShedDetailPanelProps) {
  const { data: shed, isLoading } = useShed(shedId);

  if (isLoading) {
    return (
      <div className="w-80 border-l border-border bg-background p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!shed) return null;

  const utilization = shed.capacityTonnes > 0
    ? ((shed.soybeanCount / shed.capacityTonnes) * 100).toFixed(1)
    : "0";

  return (
    <div className="w-80 border-l border-border bg-background overflow-y-auto">
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{shed.name}</h3>
            <p className="text-sm text-muted-foreground">{shed.code}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <Badge variant={STATUS_VARIANT[shed.status] ?? "secondary"}>{shed.status}</Badge>

        {shed.imageUrl && (
          <img src={shed.imageUrl} alt={shed.name} className="h-40 w-full rounded-md object-cover" />
        )}

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <span>{shed.latitude.toFixed(4)}, {shed.longitude.toFixed(4)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wheat className="size-4 text-muted-foreground" />
            <span className="capitalize">{shed.soybeanType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="size-4 text-muted-foreground" />
            <span>{shed.soybeanCount.toLocaleString()}t / {shed.capacityTonnes.toLocaleString()}t ({utilization}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="size-4 text-muted-foreground" />
            <span>{shed.moisturePct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="size-4 text-muted-foreground" />
            <span>{shed.temperature}C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
