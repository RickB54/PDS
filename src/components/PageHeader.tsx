import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getCurrentUser, logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { LogOut, Info } from "lucide-react";
import logo from "@/assets/logo-3inch.png";

interface PageHeaderProps {
  title?: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-20 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-foreground" />
            <button onClick={() => setShowAbout(true)} className="flex items-center gap-3">
              <img src={logo} alt="Prime Detail Solutions" className="h-12 w-auto" />
            </button>
            {title && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground font-medium">{title}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setShowAbout(true)} className="gap-2">
              <Info className="h-4 w-4" />
              About
            </Button>
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Hi, {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Prime Detail Solutions" className="w-48" />
            </div>
            <DialogTitle className="text-center text-2xl">About Prime Detail Solutions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Welcome to Prime Detail Solutions — your trusted partner in premium auto care.
            </p>
            <p className="text-muted-foreground">
              We specialize in high-quality interior and exterior detailing, paint correction, 
              ceramic coatings, and mobile-ready services. With transparent pricing and expert 
              craftsmanship, we deliver showroom results at our optimized detailing facility.
            </p>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Website: <a href="https://prime-detail-solutions.netlify.app/" className="text-primary hover:underline">
                  prime-detail-solutions.netlify.app
                </a>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                © Prime Detail Solutions. All rights reserved.
              </p>
            </div>
          </div>
          <Button onClick={() => setShowAbout(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
