import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { AuthProvider } from "./contexts/AuthContext";
import HomeRedirect from "./components/HomeRedirect";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import HodPortal from "./pages/HodPortal";
import TutorPortal from "./pages/TutorPortal";
import StudentPortal from "./pages/StudentPortal";

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
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PrincipalDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hod/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['hod', 'admin']}>
                    <HodPortal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tutor/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['tutor', 'hod', 'admin']}>
                    <TutorPortal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'tutor', 'hod', 'admin']}>
                    <StudentPortal />
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