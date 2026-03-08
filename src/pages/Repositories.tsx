import AppLayout from "@/components/layout/AppLayout";
import { repositories } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Shield, RefreshCw, Check, ExternalLink, AlertCircle, Clock, Database, FileText, Plus, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

const repoMeta: Record<string, { papers: number; lastSync: string; status: "synced" | "pending" | "error" }> = {
  ORCID:           { papers: 24, lastSync: "2 hours ago", status: "synced" },
  arXiv:           { papers: 8,  lastSync: "1 day ago",   status: "synced" },
  GitHub:          { papers: 0,  lastSync: "3 hours ago", status: "synced" },
  "Google Scholar":{ papers: 24, lastSync: "5 days ago",  status: "pending" },
};

const recentActivity = [
  { repo: "ORCID",    action: "Synced 3 new publications",                  time: "2h ago",  icon: "🆔" },
  { repo: "arXiv",   action: 'New preprint indexed: "Quantum Error Correction Beyond..."', time: "1d ago",  icon: "📄" },
  { repo: "GitHub",  action: "NeuroSim v3.0 repository linked",              time: "3h ago",  icon: "🐙" },
  { repo: "ORCID",   action: "Citation count updated: +12 new citations",   time: "2d ago",  icon: "🆔" },
  { repo: "arXiv",   action: "2 papers updated with DOI links",              time: "3d ago",  icon: "📄" },
];

const Repositories = () => {
  const [repoStates, setRepoStates] = useState<Record<string, boolean>>(
    Object.fromEntries(repositories.map(r => [r.name, r.connected]))
  );
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterConnected, setFilterConnected] = useState<"all" | "connected" | "available">("all");

  const debouncedSearch = useDebounce(searchQuery, 250);

  const toggleConnect = (name: string) => {
    const wasConnected = repoStates[name];
    setRepoStates(prev => ({ ...prev, [name]: !prev[name] }));
    if (!wasConnected) {
      toast.success(`Connected to ${name}`);
    } else {
      toast.info(`Disconnected from ${name}`);
    }
  };

  const handleSync = (name: string) => {
    setSyncing(prev => new Set([...prev, name]));
    toast(`Syncing ${name}...`);
    setTimeout(() => {
      setSyncing(prev => { const n = new Set(prev); n.delete(name); return n; });
      toast.success(`${name} synced successfully`);
    }, 2000);
  };

  const filteredRepos = useMemo(() => {
    let repos = repositories.map(r => ({ ...r, connected: repoStates[r.name] ?? r.connected }));
    if (filterConnected === "connected") repos = repos.filter(r => r.connected);
    if (filterConnected === "available") repos = repos.filter(r => !r.connected);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      repos = repos.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    return repos;
  }, [repoStates, filterConnected, debouncedSearch]);

  const connectedCount = Object.values(repoStates).filter(Boolean).length;
  const totalPapers = Object.values(repoMeta).reduce((s, m) => s + m.papers, 0);

  return (
    <AppLayout>
      <div className="max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Repository Connections</h1>
              <p className="text-muted-foreground font-display text-sm">
                Connect your accounts to import publications, sync data, and maintain your scholarly identity.
              </p>
            </div>
            <button className="h-10 px-5 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-sm flex items-center gap-2 shadow-gold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Repository
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Connected", value: String(connectedCount), icon: Shield, color: "text-success", bgClass: "bg-success-muted" },
            { label: "Papers Synced", value: String(totalPapers), icon: FileText, color: "text-warning", bgClass: "bg-warning-muted" },
            { label: "Databases", value: String(repositories.length), icon: Database, color: "text-info", bgClass: "bg-info-muted" },
            { label: "Last Sync", value: "2h ago", icon: Clock, color: "text-muted-foreground", bgClass: "bg-secondary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="card-interactive p-4 text-center"
            >
              <div className={`w-8 h-8 rounded-lg ${stat.bgClass} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-xl font-display font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div>
            {/* Search + Filter Bar */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search repositories..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
                {(["all", "connected", "available"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterConnected(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-display font-medium capitalize transition-all ${
                      filterConnected === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Repository Cards */}
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRepos.map((repo, i) => {
                  const meta = repoMeta[repo.name];
                  const isSyncing = syncing.has(repo.name);
                  return (
                    <motion.div
                      key={repo.name}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                      className={`card-interactive p-5 flex flex-col ${
                        repo.connected ? "border-accent/20" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{repo.icon}</div>
                          <div>
                            <h3 className="font-display font-semibold text-foreground">{repo.name}</h3>
                            {meta && (
                              <div className="flex items-center gap-2 mt-0.5">
                                {meta.status === "synced" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-brand" />}
                                {meta.status === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />}
                                {meta.status === "error" && <AlertCircle className="w-3 h-3 text-destructive" />}
                                <span className="text-[10px] text-muted-foreground font-display">
                                  {meta.status === "synced" ? `Synced ${meta.lastSync}` :
                                   meta.status === "pending" ? "Sync pending" : "Sync error"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {repo.connected ? (
                          <Badge className="text-[10px] bg-emerald-muted text-emerald-brand border-emerald-brand/20">
                            <Check className="w-2.5 h-2.5 mr-1" /> Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Not connected
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground font-display leading-relaxed mb-3 flex-1">
                        {repo.description}
                      </p>

                      {meta && repo.connected && (
                        <div className="flex items-center gap-4 py-2.5 px-3 rounded-lg bg-secondary/50 mb-3 text-xs font-display">
                          <span className="text-muted-foreground"><span className="text-foreground font-medium">{meta.papers}</span> papers</span>
                          <span className="text-muted-foreground">Last: <span className="text-foreground">{meta.lastSync}</span></span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleConnect(repo.name)}
                          className={`flex-1 h-9 rounded-lg font-display font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
                            repo.connected
                              ? "bg-secondary text-foreground hover:bg-secondary/80"
                              : "gradient-gold text-accent-foreground shadow-gold hover:opacity-90"
                          }`}
                        >
                          {repo.connected ? (
                            <><ExternalLink className="w-3.5 h-3.5" /> Manage</>
                          ) : (
                            <><Link2 className="w-3.5 h-3.5" /> Connect</>
                          )}
                        </button>
                        {repo.connected && (
                          <button
                            onClick={() => handleSync(repo.name)}
                            className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                            title="Sync now"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isSyncing ? "animate-spin" : ""}`} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>

            {filteredRepos.length === 0 && (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Filter className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground font-display">No repositories match your search</p>
              </div>
            )}
          </div>

          {/* Sidebar: Recent Activity */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="card-interactive p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-display font-semibold text-sm text-foreground">Sync Activity</h3>
              </div>
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-display text-foreground leading-snug">{item.action}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="card-interactive p-5"
            >
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">Import Options</h3>
              <div className="space-y-2">
                {[
                  { label: "Import from BibTeX", icon: "📋" },
                  { label: "Import from RIS", icon: "📑" },
                  { label: "Import from DOI list", icon: "🔗" },
                  { label: "Bulk CSV upload", icon: "📤" },
                ].map(item => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-xs font-display text-foreground">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Repositories;
