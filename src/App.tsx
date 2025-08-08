import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import HomeRedirect from "./components/HomeRedirect";
import Login from "./pages/Login";
import StudentPortal from "./pages/StudentPortal";
import TutorPortal from "./pages/TutorPortal";
import HodPortal from "./pages/HodPortal";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={["student", "tutor", "hod", "admin"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tutor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["tutor"]}>
                    <TutorPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hod/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["hod"]}>
                    <HodPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;