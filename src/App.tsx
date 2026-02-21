/**
 * Root application component.
 * Defines route structure with lazy-loaded pages for faster initial load.
 * All authenticated routes are wrapped in ProtectedRoute.
 */
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Lazy-load pages so only the active page's JS is downloaded
const LoginPage = lazy(() => import("./pages/LoginPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const SummaryPage = lazy(() => import("./pages/SummaryPage"));
const DatabasePage = lazy(() => import("./pages/DatabasePage"));
const MapPage = lazy(() => import("./pages/MapPage"));

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
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/database" element={<DatabasePage />} />
          <Route path="/map" element={<MapPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
