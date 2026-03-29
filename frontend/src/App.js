import "./App.css";
import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import WorkspaceLayout from "./components/WorkspaceLayout";
import AppDashboard from "./pages/AppDashboard";
import ClientsPage from "./pages/ClientsPage";
import NewReportPage from "./pages/NewReportPage";
import ColumnMappingPage from "./pages/ColumnMappingPage";
import ReportPreviewPage from "./pages/ReportPreviewPage";
import TemplatesPage from "./pages/TemplatesPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="h-screen bg-gray-100 flex items-center justify-center">
      <p className="font-mono text-xs text-gray-400">Loading ReportBridge...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? <Navigate to="/app" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/app" element={<ProtectedRoute><WorkspaceLayout /></ProtectedRoute>}>
            <Route index element={<AppDashboard />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="reports/new" element={<NewReportPage />} />
            <Route path="reports/:id/map" element={<ColumnMappingPage />} />
            <Route path="reports/:id/preview" element={<ReportPreviewPage />} />
            <Route path="templates" element={<TemplatesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
