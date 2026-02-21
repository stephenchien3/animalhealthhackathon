/**
 * 4-column grid of KPI cards for the Summary page.
 * Shows total sheds, avg moisture, active alerts, and tonnes stored.
 */
import { Warehouse, Droplets, AlertTriangle, Package } from "lucide-react";
import type { DashboardSummary } from "@/types";
import KPICard from "./KPICard";

export default function KPIGrid({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard title="Total Sheds" value={summary.totalSheds} icon={Warehouse} />
      <KPICard title="Avg Moisture" value={`${summary.avgMoisturePct.toFixed(1)}%`} icon={Droplets} />
      <KPICard
        title="Active Alerts"
        value={summary.alertCount.critical + summary.alertCount.warning}
        subtitle={`${summary.alertCount.critical} critical`}
        icon={AlertTriangle}
      />
      <KPICard
        title="Tonnes Stored"
        value={summary.totalSoybeanTonnes.toLocaleString()}
        subtitle={`${summary.shedsAtCapacity} sheds near capacity`}
        icon={Package}
      />
    </div>
  );
}
