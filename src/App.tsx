import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import StudentPortal from "./pages/StudentPortal";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Keep router for components that need it like Link

const queryClient = new QueryClient();

// Dummy component to wrap StudentPortal in a route context if needed
const AppWrapper = () => (
  <BrowserRouter>
    <StudentPortal />
  </BrowserRouter>
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          {/* Directly rendering StudentPortal to isolate the issue */}
          <AppWrapper />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;