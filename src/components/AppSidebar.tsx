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
  FileBarChart
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth";
import logo from "@/assets/logo-3inch.png";

const adminItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Service Checklist", url: "/checklist", icon: ClipboardCheck },
  { title: "Customer Info", url: "/customers", icon: Search },
  { title: "Inventory Control", url: "/inventory", icon: Package },
  { title: "Invoicing", url: "/invoicing", icon: FileText },
  { title: "Accounting", url: "/accounting", icon: Calculator },
  { title: "Reports", url: "/reports", icon: FileBarChart },
  { title: "Training Manual", url: "/training", icon: BookOpen },
  { title: "Employee Dashboard", url: "/employee-dashboard", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

const employeeItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Service Checklist", url: "/checklist", icon: ClipboardCheck },
  { title: "Customer Info", url: "/customers", icon: Search },
  { title: "Training Manual", url: "/training", icon: BookOpen },
  { title: "Employee Dashboard", url: "/employee-dashboard", icon: Users },
];

export function AppSidebar() {
  const { open, setOpenMobile } = useSidebar();
  const user = getCurrentUser();
  
  const menuItems = user?.role === 'admin' ? adminItems : user?.role === 'employee' ? employeeItems : [];

  const handleNavClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
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

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary/20 text-primary font-medium border-l-2 border-primary"
                          : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
