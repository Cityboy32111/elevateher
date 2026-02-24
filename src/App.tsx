import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import TimelinePage from "@/pages/TimelinePage";
import CoachingPage from "@/pages/CoachingPage";
import ScriptsPage from "@/pages/ScriptsPage";
import EmotionalHealthPage from "@/pages/EmotionalHealthPage";
import EducationPage from "@/pages/EducationPage";
import CommunityPage from "@/pages/CommunityPage";
import CareerToolkitPage from "@/pages/CareerToolkitPage";
import ResourcesPage from "@/pages/ResourcesPage";
import ContentFeedPage from "@/pages/ContentFeedPage";
import NotificationsPage from "@/pages/NotificationsPage";
import AdminDashboard from "@/pages/AdminDashboard";
import ContentManagerPage from "@/pages/ContentManagerPage";
import ExpertDashboard from "@/pages/ExpertDashboard";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Employee (any authenticated user) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/coaching" element={<CoachingPage />} />
            <Route path="/scripts" element={<ScriptsPage />} />
            <Route path="/emotional-health" element={<EmotionalHealthPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/career-toolkit" element={<CareerToolkitPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/content-feed" element={<ContentFeedPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* HR Admin Only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["hr_admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/content-manager"
              element={
                <ProtectedRoute allowedRoles={["hr_admin"]}>
                  <ContentManagerPage />
                </ProtectedRoute>
              }
            />

            {/* Coach Only */}
            <Route
              path="/expert"
              element={
                <ProtectedRoute allowedRoles={["talia_coach"]}>
                  <ExpertDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
