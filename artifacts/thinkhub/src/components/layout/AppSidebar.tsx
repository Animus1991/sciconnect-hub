import { useState } from "react";
import thinkHubLogo from "@/assets/thinkhub-logo.png";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, User, Search, BookOpen, Users, GitBranch, BarChart3,
  MessageSquare, Bell, Settings, ChevronLeft, ChevronRight,
  Calendar, GraduationCap, Activity, FileText, Globe, Briefcase,
  Target, ChevronDown, Microscope, FlaskConical, DollarSign,
  BookmarkCheck, MessagesSquare, BookMarked, Radio, Atom,
  Layers, Shield
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
  icon: typeof Home;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const navSections: NavSection[] = [
  {
    title: "Main",
    icon: Home,
    items: [
      { icon: Home,          label: "Feed",          path: "/" },
      { icon: Search,        label: "Discover",      path: "/discover" },
      { icon: MessagesSquare,label: "Messages",      path: "/messages", badge: 7 },
      { icon: Bell,          label: "Notifications", path: "/notifications", badge: 3 },
    ],
    collapsible: false,
  },
  {
    title: "Research",
    icon: BookOpen,
    items: [
      { icon: BookOpen,     label: "Publications", path: "/publications" },
      { icon: GitBranch,    label: "Repositories", path: "/repositories" },
      { icon: FlaskConical, label: "Projects",     path: "/projects" },
      { icon: BarChart3,    label: "Insights",     path: "/analytics" },
      { icon: BookmarkCheck,label: "Reading List", path: "/reading-list" },
      { icon: Target,       label: "Milestones",   path: "/milestones" },
      { icon: FileText,     label: "Wiki",         path: "/wiki" },
      { icon: DollarSign,   label: "Funding",      path: "/funding" },
      { icon: Microscope,   label: "Lab Notebook", path: "/lab-notebook" },
      { icon: BookMarked,   label: "Citations",    path: "/citations" },
    ],
    collapsible: true,
    defaultOpen: true,
  },
  {
    title: "Blockchain",
    icon: Shield,
    items: [
      { icon: Layers,       label: "Dashboard",     path: "/blockchain" },
      { icon: BarChart3,    label: "Analytics",     path: "/blockchain-analytics" },
      { icon: Activity,     label: "Contributions", path: "/contributions" },
      { icon: Microscope,   label: "Peer Review",   path: "/peer-review" },
      { icon: Target,       label: "Reputation",    path: "/reputation" },
      { icon: GitBranch,    label: "Provenance",    path: "/provenance" },
    ],
    collapsible: true,
    defaultOpen: false,
  },
  {
    title: "Community",
    icon: Globe,
    items: [
      { icon: Globe,         label: "Community",    path: "/community" },
      { icon: Users,         label: "Groups",       path: "/groups" },
      { icon: MessageSquare, label: "Discussions",  path: "/discussions" },
      { icon: Calendar,      label: "Events",       path: "/events" },
      { icon: Atom,          label: "Conferences",  path: "/conferences" },
      { icon: Radio,         label: "Collaboration",path: "/collaboration" },
    ],
    collapsible: true,
    defaultOpen: false,
  },
  {
    title: "Career",
    icon: GraduationCap,
    items: [
      { icon: GraduationCap, label: "Mentorship",   path: "/mentorship" },
      { icon: Briefcase,     label: "Opportunities",path: "/opportunities" },
      { icon: BookOpen,      label: "Courses",      path: "/courses" },
    ],
    collapsible: true,
    defaultOpen: false,
  },
  {
    title: "Account",
    icon: User,
    items: [
      { icon: User,     label: "Profile",  path: "/profile" },
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

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navSections.forEach((s) => {
      if (s.collapsible) {
        const hasActive = s.items.some((i) => location.pathname === i.path);
        initial[s.title] = hasActive || (s.defaultOpen ?? false);
      }
    });
    return initial;
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleClick = () => { onNavigate?.(); };
  const isMobile = !!onNavigate;

  return (
    <motion.aside
      animate={isMobile ? undefined : { width: collapsed ? 68 : 256 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={`${isMobile ? "w-full h-full" : "h-full"} bg-sidebar flex flex-col border-r border-sidebar-border sidebar-gradient-accent`}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-0 px-3.5 h-16 border-b border-sidebar-border flex-shrink-0">
        <div className="w-[48px] h-[48px] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-sidebar-accent/30">
          <img
            alt="Think!Hub"
            className="w-[96px] h-[96px] object-cover contrast-125 brightness-110"
            src={thinkHubLogo}
          />
        </div>
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden ml-3"
            >
              <h1 className="font-serif font-bold text-sidebar-foreground text-[17px] leading-tight tracking-tight">
                Think!Hub
              </h1>
              <p className="text-[10px] text-scholarly-muted tracking-[0.1em] uppercase font-display font-medium">
                Research Network
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto py-3 scrollbar-thin"
      >
        {navSections.map((section, sIdx) => {
          const isCollapsible = section.collapsible && (!collapsed || isMobile);
          const isOpen = !section.collapsible || openSections[section.title] !== false;
          const hasActiveChild = section.items.some((i) => location.pathname === i.path);

          return (
            <div key={section.title} className={sIdx > 0 ? "mt-1" : ""}>
              {/* Section header */}
              {(!collapsed || isMobile) && (
                <button
                  onClick={() => isCollapsible && toggleSection(section.title)}
                  className={`
                    flex items-center w-full gap-2 px-3.5 py-2 mb-0.5
                    text-[11px] uppercase tracking-[0.08em] font-display font-bold
                    rounded-lg transition-colors duration-150
                    ${isCollapsible ? "cursor-pointer" : "cursor-default"}
                    ${hasActiveChild && !isOpen
                      ? "text-sidebar-primary"
                      : "text-scholarly-muted hover:text-sidebar-foreground/70"}
                  `}
                >
                  <section.icon className="w-3 h-3 flex-shrink-0" />
                  <span className="flex-1 text-left">{section.title}</span>
                  {isCollapsible && (
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "" : "-rotate-90"
                      }`}
                    />
                  )}
                </button>
              )}

              {/* Collapsed state: just a thin divider between groups */}
              {collapsed && !isMobile && sIdx > 0 && (
                <div className="mx-3 h-px bg-sidebar-border/50 my-1" />
              )}

              {/* Items */}
              <AnimatePresence initial={false}>
                {(isOpen || collapsed) && (
                  <motion.div
                    key={section.title + "-items"}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-px px-2 pb-1">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleClick}
                            title={collapsed && !isMobile ? item.label : undefined}
                            className={`
                              relative flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg
                              transition-all duration-150 group
                              ${isActive
                                ? "bg-sidebar-accent text-sidebar-primary"
                                : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                              }
                              ${collapsed && !isMobile ? "justify-center px-2" : ""}
                            `}
                          >
                            {/* Active indicator bar */}
                            {isActive && (
                              <motion.div
                                layoutId="sidebar-active"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full bg-sidebar-primary"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}

                            <item.icon
                              className={`
                                flex-shrink-0 transition-colors duration-150
                                ${collapsed && !isMobile ? "w-[18px] h-[18px]" : "w-[16px] h-[16px]"}
                                ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"}
                              `}
                            />

                            <AnimatePresence>
                              {(!collapsed || isMobile) && (
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="text-[13.5px] font-display font-medium truncate flex-1"
                                >
                                  {item.label}
                                </motion.span>
                              )}
                            </AnimatePresence>

                            {item.badge && (!collapsed || isMobile) && (
                              <span className="ml-auto text-[10px] font-bold bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                {item.badge}
                              </span>
                            )}

                            {/* Collapsed badge dot */}
                            {item.badge && collapsed && !isMobile && (
                              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-accent rounded-full" />
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

      {/* ── User mini ── */}
      <div className="px-2 py-2.5 border-t border-sidebar-border flex-shrink-0">
        <Link
          to="/profile"
          onClick={handleClick}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors duration-150 group ${
            collapsed && !isMobile ? "justify-center px-2" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-[12px] font-display font-bold flex-shrink-0 group-hover:ring-2 group-hover:ring-sidebar-primary/30 transition-all duration-150">
            {user.initials}
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <p className="text-[13px] font-display font-semibold text-sidebar-foreground truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-scholarly-muted truncate">{user.institution}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* ── Collapse toggle ── */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-sidebar-border text-sidebar-foreground/40 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/30 transition-all duration-150 flex-shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </motion.aside>
  );
};

export default AppSidebar;
