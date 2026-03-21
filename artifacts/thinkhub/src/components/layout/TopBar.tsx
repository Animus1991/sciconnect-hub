import { useState, useRef, useEffect } from "react";
import { Search, Bell, Plus, Sun, Moon, Monitor, Menu, User, Settings, LogOut, ChevronDown, BookOpen, FlaskConical, MessageSquare, Check, Zap } from "lucide-react";
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
    registerShortcut({ key: "h", alt: true, description: "Go to Feed", action: () => navigate("/"), category: "Navigation" });
    registerShortcut({ key: "p", alt: true, description: "Go to Profile", action: () => navigate("/profile"), category: "Navigation" });
    registerShortcut({ key: "s", alt: true, description: "Go to Settings", action: () => navigate("/settings"), category: "Navigation" });
    registerShortcut({ key: "n", alt: true, description: "Go to Notifications", action: () => navigate("/notifications"), category: "Navigation" });
    registerShortcut({ key: "d", alt: true, description: "Go to Discover", action: () => navigate("/discover"), category: "Navigation" });
    registerShortcut({ key: "t", ctrl: true, description: "Toggle theme", action: () => setTheme(isDark ? "light" : "dark"), category: "General" });
  }, [registerShortcut, navigate, setTheme, isDark]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarMenuOpen(false);
      if (createRef.current && !createRef.current.contains(e.target as Node)) setCreateMenuOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background flex items-center justify-between px-4 md:px-6 transition-colors duration-300 shadow-[0_1px_4px_0_rgb(0_0_0/0.08)] dark:shadow-none">
      {/* Mobile menu + Search */}
      <div className="flex items-center gap-3 flex-1">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/70 transition-colors"
          >
            <Menu className="w-4 h-4 text-foreground" />
          </button>
        )}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="relative w-full max-w-md hidden sm:flex items-center gap-2 h-9 pl-9 pr-3 rounded-xl bg-secondary border border-border text-[13px] text-muted-foreground hover:bg-secondary/80 hover:border-border transition-all duration-150 cursor-pointer text-left"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <span>Search papers, researchers, topics...</span>
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded font-mono hidden lg:inline">
            Ctrl+K
          </kbd>
        </button>
        {/* Mobile search icon */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="sm:hidden w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/70 transition-colors"
        >
          <Search className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Switcher Dropdown */}
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setThemeMenuOpen(p => !p)}
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/70 transition-colors"
            aria-label="Change theme"
          >
            {theme === "system" ? <Monitor className="w-4 h-4 text-foreground" /> : theme === "hitech" ? <Zap className="w-4 h-4 text-foreground" /> : isDark ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-foreground" />}
          </button>
          {themeMenuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[160px] bg-card border border-border rounded-xl shadow-lg py-1.5 z-50">
              {([
                { value: "light" as const, icon: Sun, label: "Light" },
                { value: "hitech" as const, icon: Zap, label: "Hi-Tech" },
                { value: "dark" as const, icon: Moon, label: "Dark" },
                { value: "system" as const, icon: Monitor, label: "System" },
              ]).map(item => (
                <button
                  key={item.value}
                  onClick={() => { setTheme(item.value); setThemeMenuOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-secondary rounded-lg mx-1 transition-colors duration-100 w-[calc(100%-8px)] text-left"
                >
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.label}
                  {theme === item.value && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create Menu */}
        <div ref={createRef} className="relative">
          <button
            onClick={() => setCreateMenuOpen(p => !p)}
            className="h-8 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="w-3 h-3 hidden sm:inline opacity-70" />
          </button>
          {createMenuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[160px] bg-card border border-border rounded-xl shadow-lg py-1.5 z-50">
              {[
                { icon: BookOpen, label: "New Publication", path: "/publications" },
                { icon: FlaskConical, label: "New Project", path: "/projects" },
                { icon: MessageSquare, label: "Start Discussion", path: "/discussions" },
              ].map(item => (
                <Link key={item.path} to={item.path} onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-secondary rounded-lg mx-1 transition-colors duration-100">
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link to="/notifications" className="relative w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/70 transition-colors">
          <Bell className="w-4 h-4 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar with Dropdown */}
        <div ref={avatarRef} className="relative ml-1">
          <button onClick={() => setAvatarMenuOpen(p => !p)} className="focus:outline-none flex items-center">
            <Avatar className="w-8 h-8 border border-border/50 cursor-pointer hover:border-border transition-colors">
              <AvatarFallback className="bg-secondary text-foreground text-[11px] font-medium">
                {user.initials}
              </AvatarFallback>
            </Avatar>
          </button>
          {avatarMenuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[160px] bg-card border border-border rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-3 py-2 mb-1">
                <p className="text-[13px] font-medium text-foreground truncate">{user.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.institution}</p>
              </div>
              <div className="my-1 border-t border-border/60" />
              {[
                { icon: User, label: "Profile", path: "/profile" },
                { icon: Settings, label: "Settings", path: "/settings" },
              ].map(item => (
                <Link key={item.path} to={item.path} onClick={() => setAvatarMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-secondary rounded-lg mx-1 transition-colors duration-100">
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
              <div className="my-1 border-t border-border/60" />
              <button className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-destructive hover:bg-destructive/10 rounded-lg mx-1 transition-colors duration-100 w-[calc(100%-8px)] text-left">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
