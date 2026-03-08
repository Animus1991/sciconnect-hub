import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, User, Search, BookOpen, Users, GitBranch, BarChart3,
  MessageSquare, Bell, Settings, ChevronLeft, ChevronRight,
  Atom, BookmarkCheck, Calendar, GraduationCap,
  LogOut, Activity, FileText, Globe, Briefcase, Target, Radio,
  ChevronDown, Microscope, FlaskConical
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
    items: [
      { icon: Home, label: "Feed", path: "/" },
      { icon: Search, label: "Discover", path: "/discover" },
      { icon: Bell, label: "Notifications", path: "/notifications", badge: 3 },
    ],
    collapsible: false,
  },
  {
    title: "Research",
    items: [
      { icon: BookOpen, label: "Publications", path: "/publications" },
      { icon: GitBranch, label: "Repositories", path: "/repositories" },
      { icon: FlaskConical, label: "Projects", path: "/projects" },
      { icon: BarChart3, label: "Insights", path: "/analytics" },
      { icon: BookmarkCheck, label: "Reading List", path: "/reading-list" },
      { icon: Target, label: "Milestones", path: "/milestones" },
      { icon: FileText, label: "Wiki", path: "/wiki" },
    ],
    collapsible: true,
    defaultOpen: true,
  },
  {
    title: "Community",
    items: [
      { icon: Globe, label: "Community", path: "/community" },
      { icon: Users, label: "Groups", path: "/groups" },
      { icon: MessageSquare, label: "Discussions", path: "/discussions" },
      { icon: Microscope, label: "Peer Review", path: "/peer-review" },
      { icon: Calendar, label: "Events", path: "/events" },
      { icon: Radio, label: "Collaboration", path: "/collaboration" },
    ],
    collapsible: true,
    defaultOpen: false,
  },
  {
    title: "Career",
    items: [
      { icon: GraduationCap, label: "Mentorship", path: "/mentorship" },
      { icon: Briefcase, label: "Opportunities", path: "/opportunities" },
      { icon: GraduationCap, label: "Courses", path: "/courses" },
    ],
    collapsible: true,
    defaultOpen: false,
  },
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", path: "/profile" },
      { icon: Activity, label: "Activity", path: "/activity" },
      { icon: Settings, label: "Settings", path: "/settings" },
    ],
    collapsible: false,
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

  // Track which collapsible sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navSections.forEach(s => {
      if (s.collapsible) {
        // Auto-open section if current route is in it
        const hasActive = s.items.some(i => location.pathname === i.path);
        initial[s.title] = hasActive || (s.defaultOpen ?? false);
      }
    });
    return initial;
  });

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleClick = () => {
    onNavigate?.();
  };

  const isMobile = !!onNavigate;

  return (
    <motion.aside
      animate={isMobile ? undefined : { width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`${isMobile ? "w-full h-full" : "fixed left-0 top-0 h-screen z-50"} bg-sidebar flex flex-col border-r border-sidebar-border`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center flex-shrink-0">
          <Atom className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden"
            >
              <h1 className="font-display font-bold text-sidebar-foreground text-lg leading-tight">SciConnect</h1>
              <p className="text-[10px] text-scholarly-muted tracking-wider uppercase">Research Network</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-4 space-y-3 px-3 scrollbar-thin">
        {navSections.map((section) => {
          const isCollapsible = section.collapsible && (!collapsed || isMobile);
          const isOpen = !section.collapsible || openSections[section.title] !== false;
          const hasActiveChild = section.items.some(i => location.pathname === i.path);

          return (
            <div key={section.title}>
              {/* Section header */}
              {(!collapsed || isMobile) && (
                <button
                  onClick={() => isCollapsible && toggleSection(section.title)}
                  className={`flex items-center justify-between w-full text-[10px] uppercase tracking-widest mb-1.5 px-3 py-1 font-display font-medium rounded transition-colors ${
                    isCollapsible ? "cursor-pointer hover:bg-sidebar-accent/30 text-scholarly-muted" : "cursor-default text-scholarly-muted"
                  } ${hasActiveChild && !isOpen ? "text-sidebar-primary" : ""}`}
                >
                  <span>{section.title}</span>
                  {isCollapsible && (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`} />
                  )}
                </button>
              )}

              {/* Items */}
              <AnimatePresence initial={false}>
                {(isOpen || collapsed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleClick}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                              isActive
                                ? "bg-sidebar-accent text-sidebar-primary"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                            }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="sidebar-active"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary"
                              />
                            )}
                            <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
                            <AnimatePresence>
                              {(!collapsed || isMobile) && (
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="text-sm font-display font-medium truncate"
                                >
                                  {item.label}
                                </motion.span>
                              )}
                            </AnimatePresence>
                            {item.badge && (!collapsed || isMobile) && (
                              <span className="ml-auto text-[10px] font-bold bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center">
                                {item.badge}
                              </span>
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
      </nav>

      {/* User Profile Mini */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <Link
          to="/profile"
          onClick={handleClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-display font-semibold flex-shrink-0">
            {user.initials}
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-display font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-scholarly-muted truncate">{user.institution}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Collapse Button */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}
    </motion.aside>
  );
};

export default AppSidebar;
