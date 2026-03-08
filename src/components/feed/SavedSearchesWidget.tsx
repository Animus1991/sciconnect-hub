import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, BellOff, X, Plus, ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface SavedSearch {
  id: string;
  query: string;
  newResults: number;
  alertsEnabled: boolean;
  lastChecked: string;
  category?: string;
}

const DEFAULT_SEARCHES: SavedSearch[] = [
  { id: "ss-1", query: "transformer attention mechanisms", newResults: 12, alertsEnabled: true, lastChecked: "2h ago", category: "ML" },
  { id: "ss-2", query: "CRISPR gene therapy clinical trials", newResults: 5, alertsEnabled: true, lastChecked: "4h ago", category: "Bio" },
  { id: "ss-3", query: "quantum error correction topological", newResults: 3, alertsEnabled: false, lastChecked: "1d ago", category: "Physics" },
  { id: "ss-4", query: "climate model ensemble methods", newResults: 0, alertsEnabled: false, lastChecked: "2d ago", category: "Climate" },
];

const categoryColors: Record<string, string> = {
  ML: "bg-scholarly/10 text-scholarly",
  Bio: "bg-success-muted text-success",
  Physics: "bg-info-muted text-info",
  Climate: "bg-warning-muted text-warning",
};

export function SavedSearchesWidget() {
  const [searches, setSearches] = useLocalStorage<SavedSearch[]>("sciconnect-saved-searches", DEFAULT_SEARCHES);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuery, setNewQuery] = useState("");

  const totalNew = searches.reduce((sum, s) => sum + s.newResults, 0);

  const toggleAlert = (id: string) => {
    setSearches(prev =>
      prev.map(s => s.id === id ? { ...s, alertsEnabled: !s.alertsEnabled } : s)
    );
    toast("Alert preference updated");
  };

  const removeSearch = (id: string) => {
    setSearches(prev => prev.filter(s => s.id !== id));
    toast("Search removed");
  };

  const addSearch = () => {
    if (!newQuery.trim()) return;
    const search: SavedSearch = {
      id: `ss-${Date.now()}`,
      query: newQuery.trim(),
      newResults: 0,
      alertsEnabled: true,
      lastChecked: "just now",
    };
    setSearches(prev => [search, ...prev]);
    setNewQuery("");
    setIsAdding(false);
    toast.success("Search saved with alerts enabled");
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-xl border border-border p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-accent" />
          <h3 className="text-[13px] font-semibold text-foreground">Saved Searches</h3>
          {totalNew > 0 && (
            <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 bg-accent text-accent-foreground">
              {totalNew} new
            </Badge>
          )}
        </div>
        <button
          onClick={() => setIsAdding(p => !p)}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
          title="Add search"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Add new search */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-2"
          >
            <div className="flex items-center gap-1.5 p-1.5 bg-secondary/50 rounded-lg border border-border">
              <Search className="w-3 h-3 text-muted-foreground shrink-0 ml-1" />
              <input
                value={newQuery}
                onChange={e => setNewQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSearch()}
                placeholder="Type a search query..."
                className="flex-1 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground outline-none"
                autoFocus
              />
              <button
                onClick={addSearch}
                disabled={!newQuery.trim()}
                className="text-[10px] font-medium px-2 py-1 rounded bg-accent text-accent-foreground disabled:opacity-40 transition-opacity"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search List */}
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {searches.map((s) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12, scale: 0.95 }}
              className="group flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to={`/search?q=${encodeURIComponent(s.query)}`}
                  className="text-[11px] font-medium text-foreground hover:text-accent transition-colors line-clamp-1 flex items-center gap-1.5"
                >
                  {s.category && (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${categoryColors[s.category] || "bg-secondary text-muted-foreground"}`}>
                      {s.category}
                    </span>
                  )}
                  {s.query}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> {s.lastChecked}
                  </span>
                  {s.newResults > 0 && (
                    <span className="text-[9px] font-semibold text-success">
                      +{s.newResults} results
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleAlert(s.id)}
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${s.alertsEnabled ? "text-success" : "text-muted-foreground hover:text-foreground"}`}
                  title={s.alertsEnabled ? "Disable alerts" : "Enable alerts"}
                >
                  {s.alertsEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => removeSearch(s.id)}
                  className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Link to="/search" className="block mt-3 pt-2.5 border-t border-border text-[10px] text-accent font-medium text-center hover:underline flex items-center justify-center gap-1">
        Open Advanced Search <ArrowRight className="w-2.5 h-2.5" />
      </Link>
    </motion.section>
  );
}
