import { useState, useRef, useEffect } from "react";
import {
  Search, Bell, Plus, Sun, Moon, Monitor, Menu, User, Settings,
  LogOut, ChevronDown, BookOpen, FlaskConical, MessageSquare,
  Check, Zap, FileText
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "react-router-dom";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useNotifications } from "@/hooks/use-notifications";

interface TopBarProps {
  onMenuToggle?: () => void;
}

const TopBar = ({ onMenuToggle }: TopBarProps) => {
  const { theme, setTheme, isDark } = useTheme();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { registerShortcut } = useKeyboardShortcuts();
  const { unreadCount } = useNotifications();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerShortcut({ key: "h", alt: true, description: "Go to Feed",          action: () => navigate("/"),             category: "Navigation" });
    registerShortcut({ key: "p", alt: true, description: "Go to Profile",        action: () => navigate("/profile"),      category: "Navigation" });
    registerShortcut({ key: "s", alt: true, description: "Go to Settings",       action: () => navigate("/settings"),     category: "Navigation" });
    registerShortcut({ key: "n", alt: true, description: "Go to Notifications",  action: () => navigate("/notifications"),category: "Navigation" });
    registerShortcut({ key: "d", alt: true, description: "Go to Discover",       action: () => navigate("/discover"),     category: "Navigation" });
    registerShortcut({ key: "t", ctrl: true,description: "Toggle theme",         action: () => setTheme(isDark ? "light" : "dark"), category: "General" });
  }, [registerShortcut, navigate, setTheme, isDark]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarMenuOpen(false);
      if (createRef.current && !createRef.current.contains(e.target as Node)) setCreateMenuOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const ThemeIcon = theme === "system" ? Monitor : theme === "hitech" ? Zap : isDark ? Moon : Sun;

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/92 backdrop-blur-xl flex items-center justify-between px-4 md:px-6">

      {/* ── Left: mobile menu + search ── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-4.5 h-4.5 text-foreground" />
          </button>
        )}

        {/* Search bar */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="relative hidden sm:flex items-center gap-2 h-10 pl-10 pr-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary/80 hover:border-border/80 text-sm font-display text-muted-foreground transition-all duration-150 cursor-pointer text-left w-full max-w-[440px]"
          style={{ minWidth: 280 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <span className="truncate">Search papers, researchers…</span>
          <kbd className="ml-auto text-[10px] text-muted-foreground/50 bg-background/80 border border-border px-1.5 py-0.5 rounded-md font-mono hidden lg:inline flex-shrink-0">
            Ctrl+K
          </kbd>
        </button>

        {/* Mobile search icon */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="sm:hidden w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          aria-label="Search"
        >
          <Search className="w-4.5 h-4.5 text-foreground" />
        </button>
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-2 md:gap-2.5 flex-shrink-0 ml-4">

        {/* Theme Switcher */}
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setThemeMenuOpen(p => !p)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150"
            aria-label="Change theme"
          >
            <ThemeIcon className="w-4.5 h-4.5" />
          </button>
          {themeMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-popover border border-border rounded-xl shadow-scholarly py-1.5 z-50 animate-fade-in-up">
              {([
                { value: "light"  as const, icon: Sun,     label: "Light" },
                { value: "hitech" as const, icon: Zap,     label: "Hi-Tech" },
                { value: "dark"   as const, icon: Moon,    label: "Dark" },
                { value: "system" as const, icon: Monitor, label: "System" },
              ]).map(item => (
                <button
                  key={item.value}
                  onClick={() => { setTheme(item.value); setThemeMenuOpen(false); }}
                  className={`flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-display text-foreground hover:bg-secondary transition-colors w-full text-left ${
                    theme === item.value ? "text-accent" : ""
                  }`}
                >
                  <item.icon className={`w-3.5 h-3.5 ${theme === item.value ? "text-accent" : "text-muted-foreground"}`} />
                  {item.label}
                  {theme === item.value && <Check className="w-3 h-3 text-accent ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create Menu */}
        <div ref={createRef} className="relative">
          <button
            onClick={() => setCreateMenuOpen(p => !p)}
            className="h-9 px-4 rounded-xl bg-accent text-accent-foreground text-[13px] font-display font-semibold flex items-center gap-1.5 transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            style={{ boxShadow: "0 1px 4px hsl(var(--accent) / 0.35)" }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="w-3.5 h-3.5 hidden sm:inline opacity-80" />
          </button>
          {createMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-xl shadow-scholarly py-1.5 z-50 animate-fade-in-up">
              <p className="px-3.5 py-1 text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground/70 font-display">New</p>
              {[
                { icon: BookOpen,    label: "Publication", path: "/publications",  desc: "Paper or preprint" },
                { icon: FlaskConical,label: "Project",     path: "/projects",      desc: "Research project" },
                { icon: MessageSquare,label:"Discussion",  path: "/discussions",   desc: "Start a thread" },
                { icon: FileText,    label: "Wiki Page",   path: "/wiki",          desc: "Knowledge article" },
              ].map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2 text-[13px] font-display text-foreground hover:bg-secondary transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-[17px] h-[17px] rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar Dropdown */}
        <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarMenuOpen(p => !p)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          >
            <Avatar className="w-9 h-9 border-2 border-accent/25 cursor-pointer hover:border-accent/50 transition-colors duration-150">
              <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-[12px] font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
          </button>
          {avatarMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-xl shadow-scholarly py-1.5 z-50 animate-fade-in-up">
              <div className="px-3.5 py-2.5 border-b border-border mb-1">
                <p className="text-[13px] font-display font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-[11px] text-muted-foreground font-display truncate mt-0.5">{user.institution}</p>
              </div>
              {[
                { icon: User,     label: "View Profile", path: "/profile" },
                { icon: Settings, label: "Settings",     path: "/settings" },
              ].map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setAvatarMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-display text-foreground hover:bg-secondary transition-colors"
                >
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <button className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-display text-destructive hover:bg-destructive/8 transition-colors w-full text-left">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
