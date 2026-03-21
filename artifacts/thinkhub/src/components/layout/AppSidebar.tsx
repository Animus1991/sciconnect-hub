import { useState } from "react";
import thinkHubLogo from "@/assets/thinkhub-logo.png";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, User, Search, BookOpen, Users, GitBranch, BarChart3,
  MessageSquare, Bell, Settings, ChevronLeft, ChevronRight,
  Atom, BookmarkCheck, CalendarDays, GraduationCap,
  Activity, FileText, Globe, Briefcase, Target, Radio,
  ChevronDown, Microscope, FlaskConical, DollarSign, BookMarked,
  MessagesSquare, HelpCircle, UserPlus, Shield, ArrowLeftRight, Building2, Layers
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
      { icon: MessagesSquare, label: "Messages", path: "/messages", badge: 7 },
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
      { icon: DollarSign, label: "Funding", path: "/funding" },
      { icon: Microscope, label: "Lab Notebook", path: "/lab-notebook" },
      { icon: BookMarked, label: "Citations", path: "/citations" },
      { icon: CalendarDays, label: "Calendar", path: "/calendar" },
      { icon: Layers, label: "Canvas", path: "/canvas" },
    ],
    collapsible: true,
    defaultOpen: true,
  },
  {
    title: "Blockchain",
    items: [
      { icon: Atom, label: "Dashboard", path: "/blockchain" },
      { icon: BarChart3, label: "Analytics", path: "/blockchain-analytics" },
      { icon: Activity, label: "Contributions", path: "/contributions" },
      { icon: Shield, label: "Peer Review", path: "/peer-review" },
      { icon: Target, label: "Reputation", path: "/reputation" },
      { icon: GitBranch, label: "Provenance", path: "/provenance" },
    ],
    collapsible: true,
    defaultOpen: false,
  },
  {
    title: "Community",
    items: [
      { icon: Globe, label: "Community", path: "/community" },
      { icon: Users, label: "Groups", path: "/groups" },
      { icon: MessageSquare, label: "Discussions", path: "/discussions" },
      { icon: CalendarDays, label: "Events", path: "/events" },
      { icon: CalendarDays, label: "Conferences", path: "/conferences" },
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
      { icon: ArrowLeftRight, label: "Compare", path: "/compare" },
      { icon: Building2, label: "Institution", path: "/admin" },
      { icon: UserPlus, label: "Invite", path: "/invite" },
      { icon: Settings, label: "Settings", path: "/settings" },
      { icon: HelpCircle, label: "Help", path: "/help" },
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

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navSections.forEach((s) => {
      if (s.collapsible) {
        const hasActive = s.items.some((i) => location.pathname === i.path || location.pathname.startsWith(i.path + "/"));
        initial[s.title] = hasActive || (s.defaultOpen ?? false);
      }
    });
    return initial;
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleClick = () => {
    onNavigate?.();
  };

  const isMobile = !!onNavigate;

  return (
    <aside className="h-full bg-sidebar flex flex-col border-r border-border/50 transition-all duration-150 ease-in-out w-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed && !isMobile ? "justify-center" : "gap-3 px-4"} h-14 border-b border-border/50 flex-shrink-0`}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-primary/10">
          <Atom className="w-4 h-4 text-primary" />
        </div>
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden flex-1 whitespace-nowrap"
            >
              <h1 className="font-semibold text-foreground text-sm tracking-tight leading-tight">Think!Hub</h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">
        {navSections.map((section, idx) => {
          const isCollapsible = section.collapsible && (!collapsed || isMobile);
          const isOpen = !section.collapsible || openSections[section.title] !== false;
          const hasActiveChild = section.items.some((i) =>
            location.pathname === i.path || location.pathname.startsWith(i.path + "/")
          );

          return (
            <div key={section.title} className="mb-4 last:mb-0">
              {/* Section header */}
              {(!collapsed || isMobile) && (
                <button
                  onClick={() => isCollapsible && toggleSection(section.title)}
                  className={`flex items-center justify-between w-full text-[10px] font-semibold tracking-[0.08em] uppercase px-3 mb-1 mt-4 first:mt-2 transition-colors ${
                    isCollapsible
                      ? "cursor-pointer hover:text-foreground text-muted-foreground/60"
                      : "cursor-default text-muted-foreground/60"
                  } ${hasActiveChild && !isOpen ? "text-primary" : ""}`}
                >
                  <span>{section.title}</span>
                  {isCollapsible && (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isOpen ? "" : "-rotate-90"}`} />
                  )}
                </button>
              )}

              {/* Divider if collapsed */}
              {collapsed && !isMobile && idx > 0 && (
                <div className="h-px bg-border/40 my-2 mx-2" />
              )}

              {/* Items */}
              <AnimatePresence initial={false}>
                {(isOpen || collapsed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-0.5">
                      {section.items.map((item) => {
                        const isActive =
                          item.path === "/"
                            ? location.pathname === "/"
                            : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleClick}
                            title={collapsed && !isMobile ? item.label : undefined}
                            className={`flex items-center h-8 px-3 rounded-lg transition-all duration-150 relative ${
                              collapsed && !isMobile ? "justify-center px-0 mx-1" : "gap-3"
                            } ${
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            }`}
                          >
                            <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />

                            <AnimatePresence>
                              {(!collapsed || isMobile) && (
                                <motion.span
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: "auto" }}
                                  exit={{ opacity: 0, width: 0 }}
                                  className="text-[13px] whitespace-nowrap overflow-hidden"
                                >
                                  {item.label}
                                </motion.span>
                              )}
                            </AnimatePresence>

                            {item.badge && (!collapsed || isMobile) && (
                              <span className="ml-auto text-[10px] font-bold bg-primary/15 text-primary rounded-full px-1.5 py-0.5 flex items-center justify-center">
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
      <div className={`p-2 border-t border-border/50 flex-shrink-0 ${collapsed && !isMobile ? "flex justify-center" : ""}`}>
        <Link
          to="/profile"
          onClick={handleClick}
          className={`flex items-center h-10 rounded-lg hover:bg-secondary/60 transition-colors ${
            collapsed && !isMobile ? "justify-center w-10" : "gap-2 px-2"
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-[10px] font-medium text-foreground flex-shrink-0">
            {user.initials}
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex-1"
              >
                <p className="text-[13px] font-medium text-foreground truncate">{user.name}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Collapse Button */}
      {!isMobile && (
        <div className={`p-2 border-t border-border/50 flex-shrink-0 ${collapsed ? "flex justify-center" : "flex justify-end"}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
