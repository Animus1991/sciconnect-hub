import { Search, Bell, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TopBar = () => {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search papers, researchers, topics..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border-none text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold flex items-center gap-2 shadow-gold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Post
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
