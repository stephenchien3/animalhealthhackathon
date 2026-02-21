/**
 * Alert cards showing actionable improvement suggestions, sorted by severity.
 * Uses shadcn Alert component with destructive variant for critical items.
 */
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { ImprovementSuggestion, Severity } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const severityConfig: Record<Severity, { icon: typeof AlertTriangle; variant: "default" | "destructive" }> = {
  critical: { icon: AlertTriangle, variant: "destructive" },
  warning: { icon: AlertCircle, variant: "default" },
  info: { icon: Info, variant: "default" },
};

export default function ImprovementsList({ suggestions }: { suggestions: ImprovementSuggestion[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to Improve</CardTitle>
        <CardDescription>
          {suggestions.length === 0
            ? "All readings are within normal ranges."
            : `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"} found`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((s, i) => {
            const { icon: Icon, variant } = severityConfig[s.severity];
            return (
              <Alert key={i} variant={variant}>
                <Icon className="size-4" />
                <AlertTitle>{s.shedCode}</AlertTitle>
                <AlertDescription>{s.message}</AlertDescription>
              </Alert>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
