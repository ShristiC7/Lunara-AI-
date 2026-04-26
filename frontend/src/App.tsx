import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "./components/layout/AppShell";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuthStore } from "./store/authStore";

const Dashboard  = React.lazy(() => import("./pages/Dashboard"));
const Insights   = React.lazy(() => import("./pages/Insights"));
const Analytics  = React.lazy(() => import("./pages/Analytics"));
const Settings   = React.lazy(() => import("./pages/Settings"));
const Login      = React.lazy(() => import("./pages/Login"));
const Register   = React.lazy(() => import("./pages/Register"));
const Community  = React.lazy(() => import("./pages/Community"));
const Chat       = React.lazy(() => import("./pages/Chat"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime:    10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: 0 },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? (
    <AppShell>{children}</AppShell>
  ) : (
    <Navigate to="/login" replace />
  );
}

const Fallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-bg">
    <div className="w-10 h-10 border-[3px] border-lunara-core border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <React.Suspense fallback={<Fallback />}>
            <Routes>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
              <Route path="/chat"      element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}