import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { getCurrentUser } from "@/lib/auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CustomerPortal from "./pages/CustomerPortal";
import ServiceChecklist from "./pages/ServiceChecklist";
import EmployeeChecklist from "./pages/EmployeeChecklist";
import SearchCustomer from "./pages/SearchCustomer";
import InventoryControl from "./pages/InventoryControl";
import Invoicing from "./pages/Invoicing";
import Accounting from "./pages/Accounting";
import Reports from "./pages/Reports";
import TrainingManual from "./pages/TrainingManual";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import MobileSetup from "./pages/MobileSetup";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const user = getCurrentUser();
  
  if (!user && allowedRoles.length > 0) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const user = getCurrentUser();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/customer-portal" element={<CustomerPortal />} />
            
            <Route
              path="/*"
              element={
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <div className="flex-1">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/checklist" element={
                          <ProtectedRoute allowedRoles={['employee', 'admin']}>
                            <EmployeeChecklist />
                          </ProtectedRoute>
                        } />
                        <Route path="/service-checklist" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <ServiceChecklist />
                          </ProtectedRoute>
                        } />
                        <Route path="/customers" element={
                          <ProtectedRoute allowedRoles={['employee', 'admin']}>
                            <SearchCustomer />
                          </ProtectedRoute>
                        } />
                        <Route path="/inventory" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <InventoryControl />
                          </ProtectedRoute>
                        } />
                        <Route path="/invoicing" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Invoicing />
                          </ProtectedRoute>
                        } />
                        <Route path="/accounting" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Accounting />
                          </ProtectedRoute>
                        } />
                        <Route path="/reports" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Reports />
                          </ProtectedRoute>
                        } />
                        <Route path="/training" element={
                          <ProtectedRoute allowedRoles={['employee', 'admin']}>
                            <TrainingManual />
                          </ProtectedRoute>
                        } />
                        <Route path="/employee-dashboard" element={
                          <ProtectedRoute allowedRoles={['employee', 'admin']}>
                            <EmployeeDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/mobile-setup" element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <MobileSetup />
                          </ProtectedRoute>
                        } />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </div>
                </SidebarProvider>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
