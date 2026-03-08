import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, User, Search, BookOpen, Users, GitBranch, BarChart3,
  MessageSquare, Bell, Settings, ChevronLeft, ChevronRight,
  Microscope, FlaskConical, Atom, BookmarkCheck, Calendar, GraduationCap,
  LogOut, Activity, FileText, Globe, Briefcase, Target, AlertCircle, Radio
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const navSections = [
  {
    title: "Main",
    items: [
      { icon: Home, label: "Feed", path: "/" },
      { icon: Search, label: "Discover", path: "/discover" },
      { icon: Bell, label: "Notifications", path: "/notifications", badge: 3 },
    ],
  },
  {
    title: "Research",
    items: [
      { icon: BookOpen, label: "Publications", path: "/publications" },
      { icon: GitBranch, label: "Repositories", path: "/repositories" },
      { icon: FlaskConical, label: "Projects", path: "/projects" },
      { icon: BookmarkCheck, label: "Reading List", path: "/reading-list" },
      { icon: BarChart3, label: "Impact", path: "/impact" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
      { icon: FileText, label: "Wiki", path: "/wiki" },
      { icon: Target, label: "Milestones", path: "/milestones" },
      { icon: BookOpen, label: "References", path: "/references" },
      { icon: AlertCircle, label: "Issues", path: "/issues" },
    ],
  },
  {
    title: "Community",
    items: [
      { icon: Globe, label: "Community", path: "/community" },
      { icon: Users, label: "Groups", path: "/groups" },
      { icon: MessageSquare, label: "Discussions", path: "/discussions" },
      { icon: Microscope, label: "Peer Review", path: "/peer-review" },
      { icon: Calendar, label: "Events", path: "/events" },
      { icon: GraduationCap, label: "Mentorship", path: "/mentorship" },
      { icon: Briefcase, label: "Opportunities", path: "/opportunities" },
      { icon: GraduationCap, label: "Courses", path: "/courses" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", path: "/profile" },
      { icon: Activity, label: "Activity", path: "/activity" },
      { icon: Settings, label: "Settings", path: "/settings" },
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
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-4 space-y-5 px-3 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] uppercase tracking-widest text-scholarly-muted mb-2 px-3 font-display font-medium"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
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
          </div>
        ))}
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
