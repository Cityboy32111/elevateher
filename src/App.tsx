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
import TherapistOnboardingPage from "@/pages/TherapistOnboardingPage";
import CompanySignupPage from "@/pages/CompanySignupPage";
import AcceptInvitePage from "@/pages/AcceptInvitePage";
import AdminInvitePage from "@/pages/AdminInvitePage";
import BillingPage from "@/pages/BillingPage";
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
            <Route path="/company-signup" element={<CompanySignupPage />} />
            <Route path="/accept-invite" element={<AcceptInvitePage />} />

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
              path="/admin/invite"
              element={
                <ProtectedRoute allowedRoles={["hr_admin"]}>
                  <AdminInvitePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/billing"
              element={
                <ProtectedRoute allowedRoles={["hr_admin"]}>
                  <BillingPage />
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

            {/* Coach / Therapist */}
            <Route
              path="/expert"
              element={
                <ProtectedRoute allowedRoles={["talia_coach", "therapist"]}>
                  <ExpertDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/therapist-onboarding"
              element={
                <ProtectedRoute allowedRoles={["talia_coach", "therapist"]}>
                  <TherapistOnboardingPage />
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
