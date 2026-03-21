import { useState, useRef, useEffect } from "react";
import {
  Search, Bell, Plus, Sun, Moon, Monitor, Menu,
  User, Settings, LogOut, BookOpen, FlaskConical,
  MessageSquare, Check, Zap,
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
    registerShortcut({ key: "h", alt: true, description: "Go to Home", action: () => navigate("/"), category: "Navigation" });
    registerShortcut({ key: "p", alt: true, description: "Go to Profile", action: () => navigate("/profile"), category: "Navigation" });
    registerShortcut({ key: "s", alt: true, description: "Go to Settings", action: () => navigate("/settings"), category: "Navigation" });
    registerShortcut({ key: "n", alt: true, description: "Go to Notifications", action: () => navigate("/notifications"), category: "Navigation" });
    registerShortcut({ key: "d", alt: true, description: "Go to Discover", action: () => navigate("/discover"), category: "Navigation" });
    registerShortcut({ key: "t", ctrl: true, description: "Toggle theme", action: () => setTheme(isDark ? "light" : "dark"), category: "General" });
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

  const themeIcon = theme === "system" ? Monitor : theme === "hitech" ? Zap : isDark ? Moon : Sun;
  const ThemeIcon = themeIcon;

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border/40 bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 md:px-5 transition-colors duration-300">
      {/* Left: mobile menu + search */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden w-8 h-8 rounded-md bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Menu className="w-4 h-4 text-foreground" />
          </button>
        )}

        {/* Search trigger */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="relative hidden sm:flex items-center gap-2 h-8 pl-8 pr-3 max-w-sm w-full rounded-md bg-secondary/50 border border-border/50 text-[12.5px] text-muted-foreground hover:bg-secondary/80 hover:border-border/80 transition-all duration-150 cursor-pointer text-left"
        >
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="flex-1 truncate">Search papers, researchers...</span>
          <kbd className="hidden lg:inline text-[10px] text-muted-foreground/50 bg-background/60 px-1.5 py-0.5 rounded font-mono border border-border/30">
            ⌘K
          </kbd>
        </button>

        {/* Mobile search icon */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="sm:hidden w-8 h-8 rounded-md bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <Search className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setThemeMenuOpen((p) => !p)}
            className="w-8 h-8 rounded-md bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Change theme"
          >
            <ThemeIcon className="w-[15px] h-[15px]" />
          </button>
          {themeMenuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[152px] bg-popover border border-border rounded-xl shadow-lg py-1.5 z-50">
              {(
                [
                  { value: "light" as const, icon: Sun, label: "Light" },
                  { value: "hitech" as const, icon: Zap, label: "Hi-Tech" },
                  { value: "dark" as const, icon: Moon, label: "Dark" },
                  { value: "system" as const, icon: Monitor, label: "System" },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  onClick={() => { setTheme(item.value); setThemeMenuOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-foreground hover:bg-secondary rounded-lg mx-1 transition-colors w-[calc(100%-8px)] text-left"
                >
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.label}
                  {theme === item.value && <Check className="w-3 h-3 text-primary ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create */}
        <div ref={createRef} className="relative">
          <button
            onClick={() => setCreateMenuOpen((p) => !p)}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
          </button>
          {createMenuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[168px] bg-popover border border-border rounded-xl shadow-lg py-1.5 z-50">
              {[
                { icon: BookOpen, label: "New Publication", path: "/publications" },
                { icon: FlaskConical, label: "New Project", path: "/projects" },
                { icon: MessageSquare, label: "Start Discussion", path: "/discussions" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-foreground hover:bg-secondary rounded-lg mx-1 transition-colors"
                >
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative w-8 h-8 rounded-md bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-[15px] h-[15px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <div ref={avatarRef} className="relative ml-0.5">
          <button
            onClick={() => setAvatarMenuOpen((p) => !p)}
            className="focus:outline-none"
          >
            <Avatar className="w-8 h-8 border border-border/50 cursor-pointer hover:border-border transition-colors">
              <AvatarFallback className="bg-primary/15 text-primary text-[11px] font-semibold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
          </button>
          {avatarMenuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[180px] bg-popover border border-border rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-3 py-2.5 mb-0.5 border-b border-border/50">
                <p className="text-[13px] font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.institution}</p>
              </div>
              <div className="pt-1">
                {[
                  { icon: User, label: "Profile", path: "/profile" },
                  { icon: Settings, label: "Settings", path: "/settings" },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-foreground hover:bg-secondary rounded-lg mx-1 transition-colors"
                  >
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="my-1 mx-2 border-t border-border/50" />
              <button className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-destructive hover:bg-destructive/8 rounded-lg mx-1 transition-colors w-[calc(100%-8px)] text-left">
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
