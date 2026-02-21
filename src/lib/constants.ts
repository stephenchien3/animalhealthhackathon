/**
 * Shared constants used across multiple components.
 * Centralizes status-to-variant mappings and status colors.
 */

/** Maps shed status to shadcn Badge variant for consistent styling. */
export const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  operational: "default",
  maintenance: "secondary",
  offline: "destructive",
};

/** Hex colors for map markers, keyed by shed status. */
export const STATUS_COLORS: Record<string, string> = {
  operational: "#22c55e",
  maintenance: "#f59e0b",
  offline: "#ef4444",
};

/** HSL colors for chart segments, keyed by shed status. */
export const STATUS_COLORS_HSL: Record<string, string> = {
  operational: "hsl(142 76% 36%)",
  maintenance: "hsl(38 92% 50%)",
  offline: "hsl(0 84% 60%)",
};

/** Recharts ChartConfig for status charts. */
export const STATUS_CHART_CONFIG = {
  operational: { label: "Operational", color: "hsl(142 76% 36%)" },
  maintenance: { label: "Maintenance", color: "hsl(38 92% 50%)" },
  offline: { label: "Offline", color: "hsl(0 84% 60%)" },
} as const;
