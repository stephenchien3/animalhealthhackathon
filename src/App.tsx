/**
 * Root application component.
 * Defines route structure with lazy-loaded pages for faster initial load.
 * All authenticated routes are wrapped in ProtectedRoute.
 */
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";

// Lazy-load pages so only the active page's JS is downloaded
const HeroPage = lazy(() => import("./pages/hero/HeroPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const SummaryPage = lazy(() => import("./pages/SummaryPage"));
const DatabasePage = lazy(() => import("./pages/DatabasePage"));
const MapPage = lazy(() => import("./pages/MapPage"));

// Lazy-load hero sub-pages (standalone routes)
const FeaturesPage = lazy(() => import("./pages/hero/Features"));
const IntegrationsPage = lazy(() => import("./pages/hero/Integrations"));
const StatsPage = lazy(() => import("./pages/hero/Stats"));

/** Minimal fallback shown while a lazy page chunk loads. */
function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public hero / marketing pages */}
        <Route path="/" element={<HeroPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/stats" element={<StatsPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected app routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/database" element={<DatabasePage />} />
          <Route path="/map" element={<MapPage />} />
        </Route>
      </Routes>
      <Toaster richColors position="bottom-right" />
    </Suspense>
  );
}
