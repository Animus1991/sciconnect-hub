import { ReactNode, useState } from "react";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import GridBackground from "./GridBackground";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  return (
    <div className="min-h-screen bg-background relative">
      <GridBackground />
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-accent-foreground focus:font-display focus:font-semibold focus:text-sm focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Desktop sidebar — rendered in a fixed wrapper to guarantee it's out of flow */}
      {!isMobile && (
        <div className="fixed left-0 top-0 h-screen z-50" style={{ width: sidebarWidth }}>
          <AppSidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[260px] bg-sidebar border-sidebar-border">
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      <div
        className="transition-all duration-300"
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
      >
        <TopBar onMenuToggle={isMobile ? () => setMobileOpen(true) : undefined} />
        <main id="main-content" role="main" className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
