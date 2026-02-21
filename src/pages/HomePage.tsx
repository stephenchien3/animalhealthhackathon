/**
 * Home dashboard page.
 * Shows a welcome greeting, 3 quick KPI cards, and navigation shortcuts
 * to Summary, Database, and Map views.
 * When no sheds exist yet, shows a prominent CTA to add the first shed.
 */
import { Link } from "react-router";
import { Warehouse, Droplets, AlertTriangle, BarChart3, Database, Map, Plus } from "lucide-react";
import { useSummary } from "@/hooks/useSummary";
import { useCorporation } from "@/hooks/useCorporation";
import { useSheds } from "@/hooks/useSheds";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const { data: summary, isLoading } = useSummary();
  const { data: corp } = useCorporation();
  const { data: sheds } = useSheds();

  const hasSheds = sheds && sheds.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome{corp?.name ? `, ${corp.name}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Your CleanFeed dashboard overview. Monitor sheds, view analytics, and manage your database.
          </p>
        </div>
        <Button asChild>
          <Link to="/database?add=true">
            <Plus className="mr-2 size-4" />Add Shed
          </Link>
        </Button>
      </div>

      {/* Empty state — no sheds yet */}
      {!isLoading && !hasSheds && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Warehouse className="mb-4 size-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No sheds yet</h3>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              Get started by adding your first shed. You can search for an address and it will automatically fill in the location coordinates.
            </p>
            <Button asChild size="lg">
              <Link to="/database?add=true">
                <Plus className="mr-2 size-4" />Add Your First Shed
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick KPI cards */}
      {isLoading || !summary ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-4" />
              </CardHeader>
              <CardContent><Skeleton className="h-7 w-16" /></CardContent>
            </Card>
          ))}
        </div>
      ) : hasSheds ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tracked Sheds</CardTitle>
              <Warehouse className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{summary.totalSheds}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Moisture</CardTitle>
              <Droplets className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{summary.avgMoisturePct.toFixed(1)}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.alertCount.critical + summary.alertCount.warning}</div>
              <p className="text-xs text-muted-foreground">{summary.alertCount.critical} critical</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Quick action cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: BarChart3, title: "Summary", desc: "View aggregated statistics and charts", to: "/summary", label: "View Summary" },
          { icon: Database, title: "Database", desc: "Search, filter, add, and edit sheds", to: "/database", label: "Manage Sheds" },
          { icon: Map, title: "Map", desc: "View shed locations on an interactive map", to: "/map", label: "Open Map" },
        ].map((item) => (
          <Card key={item.to}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><item.icon className="size-4" />{item.title}</CardTitle>
              <CardDescription>{item.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to={item.to}>{item.label}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
