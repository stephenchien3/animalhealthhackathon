/**
 * Hook that computes dashboard summary statistics from the shed list.
 * Derives KPIs, type breakdowns, and improvement suggestions client-side.
 */
import { useMemo } from "react";
import { useSheds } from "./useSheds";
import type { DashboardSummary, Shed, ImprovementSuggestion } from "@/types";

/** Aggregate shed data into dashboard KPIs and suggestions. */
function computeSummary(sheds: Shed[]): DashboardSummary {
  const totalSheds = sheds.length;
  const totalSoybeanTonnes = sheds.reduce((sum, s) => sum + s.soybeanCount, 0);
  const avgMoisturePct = totalSheds > 0
    ? sheds.reduce((sum, s) => sum + s.moisturePct, 0) / totalSheds
    : 0;
  const avgTemperature = totalSheds > 0
    ? sheds.reduce((sum, s) => sum + s.temperature, 0) / totalSheds
    : 0;
  const shedsAtCapacity = sheds.filter(
    (s) => s.capacityTonnes > 0 && s.soybeanCount / s.capacityTonnes > 0.9,
  ).length;

  // Group sheds by soybean type
  const typeMap = new Map<string, { tonnes: number; count: number }>();
  for (const shed of sheds) {
    const entry = typeMap.get(shed.soybeanType) ?? { tonnes: 0, count: 0 };
    entry.tonnes += shed.soybeanCount;
    entry.count += 1;
    typeMap.set(shed.soybeanType, entry);
  }
  const statsByType = Array.from(typeMap.entries()).map(([type, stats]) => ({
    soybeanType: type as Shed["soybeanType"],
    totalTonnes: stats.tonnes,
    shedCount: stats.count,
  }));

  // Generate improvement suggestions based on thresholds
  const improvements: ImprovementSuggestion[] = [];

  for (const shed of sheds.filter((s) => s.moisturePct > 15)) {
    improvements.push({
      shedId: shed.id,
      shedCode: shed.code,
      message: `Moisture at ${shed.moisturePct}% — exceeds 15% safe threshold. Risk of spoilage.`,
      severity: "critical",
    });
  }

  const offlineSheds = sheds.filter((s) => s.status === "offline");
  if (offlineSheds.length > 0) {
    improvements.push({
      shedId: offlineSheds[0]!.id,
      shedCode: `${offlineSheds.length} sheds`,
      message: `${offlineSheds.length} shed(s) offline. Check sensor connectivity.`,
      severity: "warning",
    });
  }

  const highTemp = sheds.filter((s) => s.temperature > 35);
  if (highTemp.length > 0) {
    improvements.push({
      shedId: highTemp[0]!.id,
      shedCode: `${highTemp.length} sheds`,
      message: `${highTemp.length} shed(s) above 35C. Check ventilation systems.`,
      severity: "warning",
    });
  }

  return {
    totalSheds,
    totalSoybeanTonnes,
    avgMoisturePct,
    avgTemperature,
    shedsAtCapacity,
    alertCount: {
      critical: improvements.filter((i) => i.severity === "critical").length,
      warning: improvements.filter((i) => i.severity === "warning").length,
      info: improvements.filter((i) => i.severity === "info").length,
    },
    statsByType,
    improvements,
  };
}

export function useSummary() {
  const { data: sheds, ...rest } = useSheds();
  const summary = useMemo(() => (sheds ? computeSummary(sheds) : undefined), [sheds]);
  return { ...rest, data: summary };
}
