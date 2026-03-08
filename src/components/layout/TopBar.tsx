import { useState, useRef, useEffect } from "react";
import { Search, Bell, Plus, Sun, Moon, Monitor, Menu, User, Settings, LogOut, ChevronDown, BookOpen, FlaskConical, MessageSquare, Check } from "lucide-react";
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
  const { theme, preference, toggleTheme, setPreference } = useTheme();
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
    registerShortcut({ key: "t", ctrl: true, description: "Toggle theme", action: toggleTheme, category: "General" });
  }, [registerShortcut, navigate, toggleTheme]);

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
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6">
      {/* Mobile menu + Search */}
      <div className="flex items-center gap-3 flex-1">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        )}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="relative w-full max-w-md hidden sm:flex items-center gap-2 h-10 pl-10 pr-4 rounded-lg bg-secondary text-sm font-display text-muted-foreground hover:bg-secondary/80 transition-colors cursor-pointer text-left"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <span>Search papers, researchers, topics...</span>
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded font-mono hidden lg:inline">
            Ctrl+K
          </kbd>
        </button>
        {/* Mobile search icon */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="sm:hidden w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <Search className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-foreground" /> : <Moon className="w-4 h-4 text-foreground" />}
        </button>

        {/* Create Menu */}
        <div ref={createRef} className="relative">
          <button
            onClick={() => setCreateMenuOpen(p => !p)}
            className="h-9 px-3 md:px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold flex items-center gap-1.5 shadow-gold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="w-3 h-3 hidden sm:inline" />
          </button>
          {createMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-scholarly py-2 z-50">
              {[
                { icon: BookOpen, label: "New Publication", path: "/publications" },
                { icon: FlaskConical, label: "New Project", path: "/projects" },
                { icon: MessageSquare, label: "Start Discussion", path: "/discussions" },
              ].map(item => (
                <Link key={item.path} to={item.path} onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-display text-foreground hover:bg-secondary transition-colors">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link to="/notifications" className="relative w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <Bell className="w-4 h-4 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar with Dropdown */}
        <div ref={avatarRef} className="relative">
          <button onClick={() => setAvatarMenuOpen(p => !p)} className="focus:outline-none">
            <Avatar className="w-9 h-9 border-2 border-accent/30 cursor-pointer hover:border-accent transition-colors">
              <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-sm font-semibold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
          </button>
          {avatarMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-scholarly py-2 z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-display font-medium text-foreground truncate">{user.name}</p>
                <p className="text-[11px] text-muted-foreground font-display truncate">{user.institution}</p>
              </div>
              {[
                { icon: User, label: "Profile", path: "/profile" },
                { icon: Settings, label: "Settings", path: "/settings" },
              ].map(item => (
                <Link key={item.path} to={item.path} onClick={() => setAvatarMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-display text-foreground hover:bg-secondary transition-colors">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <button className="flex items-center gap-3 px-4 py-2.5 text-sm font-display text-destructive hover:bg-destructive/10 transition-colors w-full text-left">
                  <LogOut className="w-4 h-4" />
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
