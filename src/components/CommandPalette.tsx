import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Home, User, BookOpen, GitBranch, Users, MessageSquare,
  Bell, Settings, BarChart3, FlaskConical, Microscope, Calendar,
  GraduationCap, BookmarkCheck, Moon, Sun, ArrowRight, Command,
  FileText, TrendingUp, Zap, Activity, Globe, Briefcase
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: "navigation" | "actions" | "settings" | "search";
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { theme, setTheme, isDark } = useTheme();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const items: CommandItem[] = useMemo(() => [
    // Navigation
    { id: "nav-feed", label: "Feed", description: "Go to your research feed", icon: Home, action: () => { navigate("/"); close(); }, category: "navigation", keywords: ["home", "dashboard"] },
    { id: "nav-discover", label: "Discover", description: "Explore research papers and datasets", icon: Search, action: () => { navigate("/discover"); close(); }, category: "navigation", keywords: ["explore", "search", "find"] },
    { id: "nav-publications", label: "Publications", description: "Manage your papers and preprints", icon: BookOpen, action: () => { navigate("/publications"); close(); }, category: "navigation", keywords: ["papers", "manuscripts"] },
    { id: "nav-repositories", label: "Repositories", description: "Connected scientific platforms", icon: GitBranch, action: () => { navigate("/repositories"); close(); }, category: "navigation", keywords: ["connections", "integrations"] },
    { id: "nav-projects", label: "Projects", description: "Research projects and collaborations", icon: FlaskConical, action: () => { navigate("/projects"); close(); }, category: "navigation", keywords: ["research", "collaboration"] },
    { id: "nav-reading", label: "Reading List", description: "Saved papers and collections", icon: BookmarkCheck, action: () => { navigate("/reading-list"); close(); }, category: "navigation", keywords: ["saved", "bookmarks", "library"] },
    { id: "nav-impact", label: "Impact Dashboard", description: "Citation metrics and analytics", icon: BarChart3, action: () => { navigate("/impact"); close(); }, category: "navigation", keywords: ["metrics", "citations", "h-index", "analytics"] },
    { id: "nav-groups", label: "Groups", description: "Research communities", icon: Users, action: () => { navigate("/groups"); close(); }, category: "navigation", keywords: ["communities", "teams"] },
    { id: "nav-discussions", label: "Discussions", description: "Scientific discourse and Q&A", icon: MessageSquare, action: () => { navigate("/discussions"); close(); }, category: "navigation", keywords: ["forums", "questions"] },
    { id: "nav-peer-review", label: "Peer Review", description: "Review assignments and contributions", icon: Microscope, action: () => { navigate("/peer-review"); close(); }, category: "navigation", keywords: ["review", "manuscript"] },
    { id: "nav-events", label: "Events", description: "Conferences, workshops, seminars", icon: Calendar, action: () => { navigate("/events"); close(); }, category: "navigation", keywords: ["conferences", "workshops"] },
    { id: "nav-mentorship", label: "Mentorship", description: "Find mentors and programs", icon: GraduationCap, action: () => { navigate("/mentorship"); close(); }, category: "navigation", keywords: ["mentor", "career"] },
    { id: "nav-notifications", label: "Notifications", description: "View all notifications", icon: Bell, action: () => { navigate("/notifications"); close(); }, category: "navigation", keywords: ["alerts", "updates"] },
    { id: "nav-profile", label: "Profile", description: "View your researcher profile", icon: User, action: () => { navigate("/profile"); close(); }, category: "navigation", keywords: ["account", "me"] },
    { id: "nav-activity", label: "Activity", description: "Your research activity timeline", icon: Activity, action: () => { navigate("/activity"); close(); }, category: "navigation", keywords: ["timeline", "history", "feed"] },
    { id: "nav-wiki", label: "Wiki", description: "Collaborative research knowledge base", icon: FileText, action: () => { navigate("/wiki"); close(); }, category: "navigation", keywords: ["knowledge", "articles", "documentation"] },
    { id: "nav-community", label: "Community", description: "Discover researchers and institutions", icon: Globe, action: () => { navigate("/community"); close(); }, category: "navigation", keywords: ["researchers", "institutions", "social"] },
    { id: "nav-opportunities", label: "Opportunities", description: "Grants, fellowships, and positions", icon: Briefcase, action: () => { navigate("/opportunities"); close(); }, category: "navigation", keywords: ["grants", "jobs", "funding", "fellowship"] },
    { id: "nav-courses", label: "Courses", description: "Learning hub and workshops", icon: GraduationCap, action: () => { navigate("/courses"); close(); }, category: "navigation", keywords: ["learning", "education", "workshops", "training"] },
    { id: "nav-settings", label: "Settings", description: "Preferences and configuration", icon: Settings, action: () => { navigate("/settings"); close(); }, category: "navigation", keywords: ["preferences", "config"] },
    // Actions
    { id: "act-new-pub", label: "New Publication", description: "Create a new paper or preprint", icon: FileText, action: () => { navigate("/publications"); close(); }, category: "actions", keywords: ["create", "write", "publish"] },
    { id: "act-new-post", label: "Start Discussion", description: "Start a new discussion thread", icon: MessageSquare, action: () => { navigate("/discussions"); close(); }, category: "actions", keywords: ["post", "question"] },
    { id: "act-impact", label: "View Impact Dashboard", description: "Open citation metrics and rankings", icon: BarChart3, action: () => { navigate("/impact"); close(); }, category: "actions", keywords: ["citations", "h-index", "metrics", "analytics", "ranking"] },
    // Settings
    { id: "set-theme", label: `Switch to ${isDark ? "Light" : "Dark"} Mode`, description: "Toggle the color theme", icon: isDark ? Sun : Moon, action: () => { setTheme(isDark ? "light" : "dark"); close(); }, category: "settings", keywords: ["theme", "dark", "light", "appearance"] },
  ], [navigate, close, isDark, setTheme]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.keywords?.some(k => k.includes(q))
    );
  }, [items, query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filtered]);

  const flatFiltered = useMemo(() => filtered, [filtered]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape" && open) {
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  // Arrow navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatFiltered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        flatFiltered[selectedIndex]?.action();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, selectedIndex, flatFiltered]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const categoryLabels: Record<string, { label: string; icon: React.ElementType }> = {
    navigation: { label: "Pages", icon: ArrowRight },
    actions: { label: "Quick Actions", icon: Zap },
    settings: { label: "Settings", icon: Settings },
    search: { label: "Search Results", icon: TrendingUp },
  };

  let flatIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={close}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-lg"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 h-14 bg-transparent text-foreground text-sm font-display placeholder:text-muted-foreground focus:outline-none"
                />
                <kbd className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[320px] overflow-y-auto py-2">
                {flatFiltered.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground font-display">No results found</p>
                    <p className="text-xs text-muted-foreground/60 font-display mt-1">Try a different search term</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, categoryItems]) => {
                    const catInfo = categoryLabels[category] || { label: category, icon: ArrowRight };
                    return (
                      <div key={category}>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-display font-medium px-4 py-2">
                          {catInfo.label}
                        </p>
                        {categoryItems.map((item) => {
                          const currentFlatIndex = flatIndex++;
                          const isSelected = currentFlatIndex === selectedIndex;
                          return (
                            <button
                              key={item.id}
                              onClick={item.action}
                              onMouseEnter={() => setSelectedIndex(currentFlatIndex)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                isSelected
                                  ? "bg-accent/10 text-foreground"
                                  : "text-foreground/80 hover:bg-secondary/50"
                              }`}
                            >
                              <item.icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-accent" : "text-muted-foreground"}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-display font-medium truncate">{item.label}</p>
                                {item.description && (
                                  <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                                )}
                              </div>
                              {isSelected && (
                                <ArrowRight className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground font-display">
                <span className="flex items-center gap-1">
                  <kbd className="bg-secondary px-1.5 py-0.5 rounded font-mono">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-secondary px-1.5 py-0.5 rounded font-mono">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-secondary px-1.5 py-0.5 rounded font-mono">ESC</kbd> Close
                </span>
                <span className="ml-auto flex items-center gap-1">
                  <Command className="w-3 h-3" />
                  <span>SciConnect</span>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
