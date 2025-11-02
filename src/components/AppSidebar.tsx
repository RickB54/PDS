import { 
  Home, 
  ClipboardCheck, 
  Search, 
  FileText, 
  Calculator, 
  BookOpen, 
  Users, 
  Settings,
  Package,
  FileBarChart,
  DollarSign,
  LayoutDashboard
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth";
import logo from "@/assets/logo-3inch.png";

export function AppSidebar() {
  const { open, setOpenMobile } = useSidebar();
  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';
  const isCustomer = user?.role === 'customer';

  const handleNavClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-border">
      <div className="p-4 border-b border-border">
        {open && (
          <div className="flex items-center gap-3 animate-fade-in">
            <img src={logo} alt="Prime Detail Solutions" className="w-10 h-10" />
            <div>
              <h2 className="font-bold text-foreground">Prime Detail</h2>
              <p className="text-xs text-muted-foreground">Solutions</p>
            </div>
          </div>
        )}
        {!open && (
          <img src={logo} alt="Prime Detail Solutions" className="w-8 h-8 mx-auto" />
        )}
      </div>

      <SidebarContent>
        <SidebarMenu>
          {isCustomer && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild onClick={handleNavClick}>
                <Link to="/customer-dashboard">
                  <Home className="h-4 w-4" />
                  <span>My Account</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {(isAdmin || isEmployee) && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/checklist">
                    <ClipboardCheck className="h-4 w-4" />
                    <span>Service Checklist</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/search-customer">
                    <Users className="h-4 w-4" />
                    <span>Find Customer</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/service-checklist">
                    <DollarSign className="h-4 w-4" />
                    <span>Package Pricing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/training-manual">
                    <BookOpen className="h-4 w-4" />
                    <span>Training Manual</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/employee-dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Employee Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}

          {isAdmin && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/invoicing">
                    <FileText className="h-4 w-4" />
                    <span>Invoicing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/accounting">
                    <Calculator className="h-4 w-4" />
                    <span>Accounting</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/inventory-control">
                    <Package className="h-4 w-4" />
                    <span>Inventory Control</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/company-employees">
                    <Users className="h-4 w-4" />
                    <span>Company Employees</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/file-manager">
                    <FileText className="h-4 w-4" />
                    <span>File Manager</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/reports">
                    <FileBarChart className="h-4 w-4" />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleNavClick}>
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
