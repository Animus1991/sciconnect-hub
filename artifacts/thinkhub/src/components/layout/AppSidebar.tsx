import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Search, MessagesSquare, Bell,
  BookOpen, FlaskConical, Microscope, BookmarkCheck, BookMarked,
  Globe, MessageSquare, GraduationCap,
  BarChart3, DollarSign, Atom,
  Settings, ChevronDown, ChevronRight, ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const navSections: NavSection[] = [
  {
    title: "Main",
    collapsible: false,
    items: [
      { icon: Home, label: "Home", path: "/" },
      { icon: Search, label: "Discover", path: "/discover" },
      { icon: MessagesSquare, label: "Messages", path: "/messages", badge: 7 },
      { icon: Bell, label: "Notifications", path: "/notifications", badge: 3 },
    ],
  },
  {
    title: "Research",
    collapsible: true,
    defaultOpen: true,
    items: [
      { icon: BookOpen, label: "Publications", path: "/publications" },
      { icon: FlaskConical, label: "Projects", path: "/projects" },
      { icon: Microscope, label: "Lab Notebook", path: "/lab-notebook" },
      { icon: BookmarkCheck, label: "Reading List", path: "/reading-list" },
      { icon: BookMarked, label: "Citations", path: "/citations" },
    ],
  },
  {
    title: "Collaboration",
    collapsible: true,
    defaultOpen: false,
    items: [
      { icon: Globe, label: "Community", path: "/community" },
      { icon: MessageSquare, label: "Discussions", path: "/discussions" },
      { icon: GraduationCap, label: "Mentorship", path: "/mentorship" },
    ],
  },
  {
    title: "Tools",
    collapsible: true,
    defaultOpen: false,
    items: [
      { icon: BarChart3, label: "Insights", path: "/analytics" },
      { icon: DollarSign, label: "Funding", path: "/funding" },
      { icon: Atom, label: "Blockchain", path: "/blockchain" },
    ],
  },
];

interface AppSidebarProps {
  onNavigate?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const AppSidebar = ({ onNavigate, collapsed: controlledCollapsed, onCollapsedChange }: AppSidebarProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = onCollapsedChange ?? setInternalCollapsed;
  const location = useLocation();
  const { user } = useAuth();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navSections.forEach((s) => {
      if (s.collapsible) {
        const hasActive = s.items.some(
          (i) => location.pathname === i.path || location.pathname.startsWith(i.path + "/")
        );
        initial[s.title] = hasActive || (s.defaultOpen ?? false);
      }
    });
    return initial;
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleClick = () => onNavigate?.();
  const isMobile = !!onNavigate;

  return (
    <aside className="h-full bg-sidebar flex flex-col border-r border-border/40 transition-all duration-150 ease-in-out w-full">
      {/* Wordmark / Logo */}
      <div
        className={`flex items-center h-14 border-b border-border/40 flex-shrink-0 ${
          collapsed && !isMobile ? "justify-center" : "gap-2.5 px-4"
        }`}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary text-primary-foreground">
          <Atom className="w-3.5 h-3.5" />
        </div>
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden flex-1 whitespace-nowrap"
            >
              <span className="font-semibold text-foreground text-[13px] tracking-tight">Think!Hub</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
        <div className="space-y-4">
          {navSections.map((section, sectionIdx) => {
            const isCollapsible = section.collapsible && (!collapsed || isMobile);
            const isOpen = !section.collapsible || (openSections[section.title] !== false);

            return (
              <div key={section.title}>
                {/* Section header */}
                {(!collapsed || isMobile) && (
                  <button
                    onClick={() => isCollapsible && toggleSection(section.title)}
                    className={`flex items-center justify-between w-full px-2 mb-1 ${
                      isCollapsible ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span className="text-[10px] font-semibold tracking-[0.09em] uppercase text-muted-foreground/45 select-none">
                      {section.title}
                    </span>
                    {isCollapsible && (
                      <ChevronDown
                        className={`w-3 h-3 text-muted-foreground/40 transition-transform duration-150 ${
                          isOpen ? "" : "-rotate-90"
                        }`}
                      />
                    )}
                  </button>
                )}

                {/* Divider when collapsed */}
                {collapsed && !isMobile && sectionIdx > 0 && (
                  <div className="h-px bg-border/30 my-1 mx-2" />
                )}

                {/* Nav items */}
                <AnimatePresence initial={false}>
                  {(isOpen || collapsed) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-0.5">
                        {section.items.map((item) => {
                          const isActive =
                            item.path === "/"
                              ? location.pathname === "/"
                              : location.pathname === item.path ||
                                location.pathname.startsWith(item.path + "/");

                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={handleClick}
                              title={collapsed && !isMobile ? item.label : undefined}
                              className={`flex items-center h-8 rounded-md transition-all duration-100 relative group ${
                                collapsed && !isMobile
                                  ? "justify-center px-0 mx-1"
                                  : "gap-2.5 px-2.5"
                              } ${
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                              }`}
                            >
                              <item.icon
                                className={`w-[15px] h-[15px] flex-shrink-0 transition-colors ${
                                  isActive
                                    ? "text-primary"
                                    : "text-muted-foreground/65 group-hover:text-foreground"
                                }`}
                              />

                              <AnimatePresence>
                                {(!collapsed || isMobile) && (
                                  <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className={`text-[13px] whitespace-nowrap overflow-hidden flex-1 ${
                                      isActive ? "font-medium text-primary" : "font-normal"
                                    }`}
                                  >
                                    {item.label}
                                  </motion.span>
                                )}
                              </AnimatePresence>

                              {item.badge && (!collapsed || isMobile) && (
                                <span className="ml-auto text-[10px] font-semibold bg-primary/15 text-primary rounded-full px-1.5 h-4 min-w-[18px] text-center leading-none flex items-center justify-center">
                                  {item.badge}
                                </span>
                              )}

                              {item.badge && collapsed && !isMobile && (
                                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Bottom: User + Settings */}
      <div className={`border-t border-border/40 flex-shrink-0 p-2 space-y-0.5`}>
        <Link
          to="/profile"
          onClick={handleClick}
          className={`flex items-center rounded-md hover:bg-secondary/50 transition-colors duration-100 ${
            collapsed && !isMobile ? "justify-center h-8 w-8 mx-auto" : "gap-2.5 px-2 py-2"
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-primary/15 border border-border/60 flex items-center justify-center text-[10px] font-semibold text-primary flex-shrink-0">
            {user.initials}
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="text-[12px] font-medium text-foreground truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight">{user.title}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <Link
          to="/settings"
          onClick={handleClick}
          className={`flex items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors duration-100 ${
            collapsed && !isMobile ? "justify-center h-8 w-8 mx-auto" : "gap-2.5 px-2.5 py-1.5"
          }`}
        >
          <Settings className="w-[14px] h-[14px] flex-shrink-0" />
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[12px] overflow-hidden whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Collapse toggle */}
      {!isMobile && (
        <div className={`border-t border-border/40 flex-shrink-0 flex p-1.5 ${collapsed ? "justify-center" : "justify-end"}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/40 hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
