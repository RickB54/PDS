import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import ServiceChecklist from "./pages/ServiceChecklist";
import SearchCustomer from "./pages/SearchCustomer";
import InventoryControl from "./pages/InventoryControl";
import Invoicing from "./pages/Invoicing";
import Accounting from "./pages/Accounting";
import TrainingManual from "./pages/TrainingManual";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import MobileSetup from "./pages/MobileSetup";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/checklist" element={<ServiceChecklist />} />
                <Route path="/customers" element={<SearchCustomer />} />
                <Route path="/inventory" element={<InventoryControl />} />
                <Route path="/invoicing" element={<Invoicing />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/training" element={<TrainingManual />} />
                <Route path="/employees" element={<EmployeeDashboard />} />
                <Route path="/mobile-setup" element={<MobileSetup />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
