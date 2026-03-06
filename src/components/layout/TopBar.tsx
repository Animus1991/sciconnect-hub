import { Search, Bell, Plus, Sun, Moon, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";

interface TopBarProps {
  onMenuToggle?: () => void;
}

const TopBar = ({ onMenuToggle }: TopBarProps) => {
  const { theme, toggleTheme } = useTheme();

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
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search papers, researchers, topics..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border-none text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded font-mono hidden lg:inline">
            ⌘K
          </kbd>
        </div>
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
        <button className="relative w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <Bell className="w-4 h-4 text-foreground" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center">
            3
          </span>
        </button>
        <Avatar className="w-9 h-9 border-2 border-accent/30">
          <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-sm font-semibold">
            DR
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default TopBar;
