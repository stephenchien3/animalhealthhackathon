/**
 * Route guard that redirects unauthenticated users to /login.
 * Shows a loading skeleton while the session is being restored.
 */
import { Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return children;
}
