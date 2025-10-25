import { SidebarTrigger } from "@/components/ui/sidebar";
import logo from "@/assets/pds-final-logo.png";

interface PageHeaderProps {
  title?: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 items-center gap-4 px-4">
        <SidebarTrigger className="text-foreground" />
        <div className="flex items-center gap-3">
          <img src={logo} alt="Prime Detail Solutions" className="h-10 w-auto" />
        </div>
        {title && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground font-medium">{title}</span>
          </>
        )}
      </div>
    </header>
  );
}
