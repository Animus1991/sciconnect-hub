import { ReactNode, useState } from "react";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import MessagesBubble from "./MessagesBubble";
import GridBackground from "./GridBackground";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AppLayoutProps {
  children: ReactNode;
  fullBleed?: boolean;
}

const AppLayout = ({ children, fullBleed = false }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 64 : 220;

  return (
    <div className="min-h-screen bg-background relative transition-colors duration-300">
      <GridBackground />
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:font-semibold focus:text-sm focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Desktop sidebar — rendered in a fixed wrapper to guarantee it's out of flow */}
      {!isMobile && (
        <div className="fixed left-0 top-0 h-screen z-50 transition-all duration-150 ease-in-out" style={{ width: sidebarWidth }}>
          <AppSidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[220px] bg-sidebar border-border/50">
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      <div
        className={cn("transition-all duration-150 ease-in-out flex flex-col", fullBleed ? "h-screen" : "min-h-screen")}
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
      >
        <TopBar onMenuToggle={isMobile ? () => setMobileOpen(true) : undefined} />
        <main
          id="main-content"
          role="main"
          className={cn(
            "transition-all duration-300 flex-1",
            fullBleed
              ? "flex flex-col overflow-hidden p-0"
              : "px-4 sm:px-6 lg:px-8 pt-0 pb-8 max-w-screen-xl mx-auto w-full"
          )}
        >
          {children}
        </main>
      </div>
      <MessagesBubble />
    </div>
  );
};

export default AppLayout;
