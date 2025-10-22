import { SidebarTrigger } from "@/components/ui/sidebar";
import logo from "@/assets/prime-logo.png";

interface PageHeaderProps {
  title?: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <SidebarTrigger className="text-foreground" />
        <div className="flex items-center gap-2">
          <img src={logo} alt="Prime Detail Solutions" className="w-6 h-6" />
          <span className="font-semibold text-foreground">
            Prime Detail Solutions
          </span>
        </div>
        {title && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{title}</span>
          </>
        )}
      </div>
    </header>
  );
}
