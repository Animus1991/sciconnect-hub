import { Search, Bell, Plus, Sun, Moon, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "react-router-dom";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useNotifications } from "@/hooks/use-notifications";
import { useEffect } from "react";

interface TopBarProps {
  onMenuToggle?: () => void;
}

const TopBar = ({ onMenuToggle }: TopBarProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { registerShortcut } = useKeyboardShortcuts();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    registerShortcut({ key: "h", alt: true, description: "Go to Feed", action: () => navigate("/"), category: "Navigation" });
    registerShortcut({ key: "p", alt: true, description: "Go to Profile", action: () => navigate("/profile"), category: "Navigation" });
    registerShortcut({ key: "s", alt: true, description: "Go to Settings", action: () => navigate("/settings"), category: "Navigation" });
    registerShortcut({ key: "n", alt: true, description: "Go to Notifications", action: () => navigate("/notifications"), category: "Navigation" });
    registerShortcut({ key: "d", alt: true, description: "Go to Discover", action: () => navigate("/discover"), category: "Navigation" });
    registerShortcut({ key: "t", ctrl: true, description: "Toggle theme", action: toggleTheme, category: "General" });
  }, [registerShortcut, navigate, toggleTheme]);

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
        <button className="h-9 px-3 md:px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold flex items-center gap-2 shadow-gold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Post</span>
        </button>
        <Link to="/notifications" className="relative w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <Bell className="w-4 h-4 text-foreground" />
          {(unreadCount > 0 || 3 > 0) && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center">
              {unreadCount || 3}
            </span>
          )}
        </Link>
        <Link to="/profile">
          <Avatar className="w-9 h-9 border-2 border-accent/30 cursor-pointer hover:border-accent transition-colors">
            <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-sm font-semibold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};

export default TopBar;
