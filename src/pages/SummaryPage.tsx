/**
 * Summary page — the operational command center.
 * Shows KPIs, charts (soybean by type, status distribution),
 * top sheds by utilization, and improvement suggestions.
 * Uses two tabs: Overview and Analytics.
 */
import { Droplets, Thermometer, Warehouse, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import { useSummary } from "@/hooks/useSummary";
import { useSheds } from "@/hooks/useSheds";
import KPIGrid from "@/components/summary/KPIGrid";
import ImprovementsList from "@/components/summary/ImprovementsList";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { STATUS_COLORS_HSL, STATUS_CHART_CONFIG } from "@/lib/constants";
import type { Shed } from "@/types";

const soybeanChartConfig = {
  tonnes: { label: "Tonnes", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

/** Skeleton shown while summary data is loading. */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" /><Skeleton className="size-4" />
            </CardHeader>
            <CardContent><Skeleton className="h-7 w-16" /><Skeleton className="mt-1 h-3 w-28" /></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4"><CardContent><Skeleton className="h-[350px]" /></CardContent></Card>
        <Card className="col-span-3"><CardContent><Skeleton className="h-[350px]" /></CardContent></Card>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  const { data: summary, isLoading: summaryLoading } = useSummary();
  const { data: sheds, isLoading: shedsLoading } = useSheds();

  if (summaryLoading || shedsLoading || !summary) return <LoadingSkeleton />;

  const allSheds = (sheds ?? []) as Shed[];

  // Aggregate status counts for pie chart
  const statusCounts = allSheds.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status, count, fill: STATUS_COLORS_HSL[status] ?? "hsl(var(--chart-5))",
  }));

  // Soybean type bar chart data
  const soybeanData = summary.statsByType.map((s) => ({ type: s.soybeanType, tonnes: s.totalTonnes }));

  // Top 5 sheds by capacity utilization
  const topSheds = [...allSheds]
    .filter((s) => s.capacityTonnes > 0)
    .map((s) => ({ ...s, utilization: (s.soybeanCount / s.capacityTonnes) * 100 }))
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 5);

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <KPIGrid summary={summary} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Soybean by Type — Bar Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Soybean by Type</CardTitle>
              <CardDescription>Total tonnes stored by soybean variety</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={soybeanChartConfig} className="h-[350px] w-full">
                <BarChart data={soybeanData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="type" tickLine={false} tickMargin={10} axisLine={false}
                    tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="tonnes" fill="var(--color-tonnes)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Status Distribution — Pie Chart */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Shed Status</CardTitle>
              <CardDescription>Distribution of shed operational status</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={STATUS_CHART_CONFIG} className="mx-auto aspect-square h-[300px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
                    {statusData.map((e) => <Cell key={e.status} fill={e.fill} />)}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="mt-4 flex items-center justify-center gap-4">
                {statusData.map((e) => (
                  <div key={e.status} className="flex items-center gap-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: e.fill }} />
                    <span className="text-sm capitalize text-muted-foreground">{e.status} ({e.count})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Top Sheds by Utilization */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Top Sheds by Utilization</CardTitle>
              <CardDescription>Sheds closest to full capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSheds.map((shed) => (
                  <div key={shed.id} className="flex items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                        <Warehouse className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-none truncate">{shed.name}</p>
                        <p className="text-sm text-muted-foreground">{shed.code}</p>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <Progress value={Math.min(shed.utilization, 100)} className="w-24 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{shed.utilization.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
                {topSheds.length === 0 && <p className="text-sm text-muted-foreground">No sheds with capacity data.</p>}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Improvements */}
          <div className="col-span-3">
            <ImprovementsList suggestions={summary.improvements} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="size-4" />Key Metrics</CardTitle>
              <CardDescription>Detailed breakdown of all shed data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { icon: Package, label: "Total soybean stored", value: `${summary.totalSoybeanTonnes.toLocaleString()}t` },
                  { icon: Droplets, label: "Average moisture", value: `${summary.avgMoisturePct.toFixed(1)}%` },
                  { icon: Thermometer, label: "Average temperature", value: `${summary.avgTemperature.toFixed(1)}C` },
                  { icon: AlertTriangle, label: "Sheds near capacity", value: `${summary.shedsAtCapacity} / ${summary.totalSheds}` },
                ].map(({ icon: Icon, label, value }, i, arr) => (
                  <div key={label}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-muted-foreground" /><span className="text-sm">{label}</span>
                      </div>
                      <span className="text-sm font-bold">{value}</span>
                    </div>
                    {i < arr.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Soybean Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Soybean Type Breakdown</CardTitle>
              <CardDescription>Distribution across soybean varieties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.statsByType.map((stat) => (
                  <div key={stat.soybeanType}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{stat.soybeanType}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{stat.shedCount} shed{stat.shedCount !== 1 ? "s" : ""}</Badge>
                        <span className="font-bold">{stat.totalTonnes.toLocaleString()}t</span>
                      </div>
                    </div>
                    <Progress value={summary.totalSoybeanTonnes > 0 ? (stat.totalTonnes / summary.totalSoybeanTonnes) * 100 : 0} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
