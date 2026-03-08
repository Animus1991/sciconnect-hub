import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { repositories } from "@/data/mockData";
import {
  Shield, RefreshCw, Check, ExternalLink, AlertCircle, Clock, Database,
  FileText, Plus, Search, Filter, Link2, Wifi, WifiOff, TestTube, Globe,
  ArrowUpRight, BarChart3, Loader2, CheckCircle, XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import ConnectionModal from "@/components/repositories/ConnectionModal";

interface RepoMeta {
  papers: number;
  lastSync: string;
  status: "synced" | "pending" | "error" | "none";
  apiVersion?: string;
  authType: string;
}

const repoMeta: Record<string, RepoMeta> = {
  ORCID:             { papers: 24, lastSync: "2 hours ago",   status: "synced",  apiVersion: "v3.0", authType: "OAuth 2.0" },
  arXiv:             { papers: 8,  lastSync: "1 day ago",     status: "synced",  apiVersion: "v1",   authType: "API Key" },
  PubMed:            { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v2",   authType: "API Key" },
  GitHub:            { papers: 0,  lastSync: "3 hours ago",   status: "synced",  apiVersion: "v4",   authType: "OAuth 2.0" },
  Zenodo:            { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v1",   authType: "OAuth 2.0" },
  "Google Scholar":  { papers: 24, lastSync: "5 days ago",    status: "pending", apiVersion: "N/A",  authType: "Scraping" },
  "Semantic Scholar":{ papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v1",   authType: "API Key" },
  "IEEE Xplore":     { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v2",   authType: "API Key" },
  Scopus:            { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v2",   authType: "API Key" },
  "Web of Science":  { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v2",   authType: "API Key" },
  Figshare:          { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v2",   authType: "OAuth 2.0" },
  Mendeley:          { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v1",   authType: "OAuth 2.0" },
};

const recentActivity = [
  { repo: "ORCID",    action: "Synced 3 new publications",              time: "2h ago",  icon: "🆔" },
  { repo: "arXiv",    action: 'New preprint indexed',                    time: "1d ago",  icon: "📄" },
  { repo: "GitHub",   action: "NeuroSim v3.0 repository linked",        time: "3h ago",  icon: "🐙" },
  { repo: "ORCID",    action: "Citation count updated: +12 citations",   time: "2d ago",  icon: "🆔" },
  { repo: "arXiv",    action: "2 papers updated with DOI links",         time: "3d ago",  icon: "📄" },
];

const RepositoryDashboard = () => {
  const [repoStates, setRepoStates] = useState<Record<string, boolean>>(
    Object.fromEntries(repositories.map(r => [r.name, r.connected]))
  );
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [testing, setTesting] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, "success" | "error">>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterConnected, setFilterConnected] = useState<"all" | "connected" | "available">("all");
  const [connectingRepo, setConnectingRepo] = useState<typeof repositories[0] | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const toggleConnect = (name: string) => {
    const wasConnected = repoStates[name];
    setRepoStates(prev => ({ ...prev, [name]: !prev[name] }));
    toast[wasConnected ? "info" : "success"](`${wasConnected ? "Disconnected from" : "Connected to"} ${name}`);
  };

  const handleSync = (name: string) => {
    setSyncing(prev => new Set([...prev, name]));
    toast(`Syncing ${name}...`);
    setTimeout(() => {
      setSyncing(prev => { const n = new Set(prev); n.delete(name); return n; });
      toast.success(`${name} synced successfully`);
    }, 2000);
  };

  const handleTest = (name: string) => {
    setTesting(prev => new Set([...prev, name]));
    setTestResults(prev => { const n = { ...prev }; delete n[name]; return n; });
    setTimeout(() => {
      setTesting(prev => { const n = new Set(prev); n.delete(name); return n; });
      const success = repoStates[name] || Math.random() > 0.3;
      setTestResults(prev => ({ ...prev, [name]: success ? "success" : "error" }));
      if (success) toast.success(`${name} connection test passed`);
      else toast.error(`${name} connection test failed`);
    }, 1500);
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
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Repository Dashboard</h1>
              <p className="text-muted-foreground font-display text-sm">
                Manage connections to 12 scientific repositories. Connect, sync, and test integrations.
              </p>
            </div>
            <button className="h-10 px-5 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-sm flex items-center gap-2 shadow-gold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Repository
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Connected", value: String(connectedCount), icon: Shield, color: "text-emerald-brand" },
            { label: "Papers Synced", value: String(totalPapers), icon: FileText, color: "text-gold" },
            { label: "Total Repos", value: String(repositories.length), icon: Database, color: "text-foreground" },
            { label: "Last Sync", value: "2h ago", icon: Clock, color: "text-muted-foreground" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div>
            {/* Search + Filter */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search repositories..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
                {(["all", "connected", "available"] as const).map(f => (
                  <button key={f} onClick={() => setFilterConnected(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-display font-medium capitalize transition-all ${
                      filterConnected === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}>
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
                  const isTesting = testing.has(repo.name);
                  const testResult = testResults[repo.name];
                  return (
                    <motion.div key={repo.name} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.03 }}
                      className={`bg-card rounded-xl border p-5 hover:shadow-scholarly transition-all duration-300 flex flex-col ${
                        repo.connected ? "border-accent/20" : "border-border"
                      }`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{repo.icon}</div>
                          <div>
                            <h3 className="font-display font-semibold text-foreground">{repo.name}</h3>
                            {meta && (
                              <div className="flex items-center gap-2 mt-0.5">
                                {meta.status === "synced" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-brand" />}
                                {meta.status === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                                {meta.status === "error" && <AlertCircle className="w-3 h-3 text-destructive" />}
                                {meta.status === "none" && <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
                                <span className="text-[10px] text-muted-foreground font-display">
                                  {meta.status === "synced" ? `Synced ${meta.lastSync}` :
                                   meta.status === "pending" ? "Sync pending" :
                                   meta.status === "error" ? "Sync error" : "Not connected"}
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
                          <Badge variant="secondary" className="text-[10px]">Not connected</Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground font-display leading-relaxed mb-3 flex-1">{repo.description}</p>

                      {/* Meta info */}
                      {meta && (
                        <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-secondary/50 mb-3 text-[10px] font-display flex-wrap">
                          <span className="text-muted-foreground">Auth: <span className="text-foreground font-medium">{meta.authType}</span></span>
                          {meta.apiVersion && (
                            <span className="text-muted-foreground">API: <span className="text-foreground font-medium">{meta.apiVersion}</span></span>
                          )}
                          {repo.connected && meta.papers > 0 && (
                            <span className="text-muted-foreground"><span className="text-foreground font-medium">{meta.papers}</span> papers</span>
                          )}
                        </div>
                      )}

                      {/* Test result */}
                      {testResult && (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-3 text-[10px] font-display ${
                          testResult === "success" ? "bg-emerald-muted text-emerald-brand" : "bg-destructive/10 text-destructive"
                        }`}>
                          {testResult === "success" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {testResult === "success" ? "Connection test passed" : "Connection test failed"}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button onClick={() => repo.connected ? toggleConnect(repo.name) : setConnectingRepo(repo)}
                          className={`flex-1 h-9 rounded-lg font-display font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
                            repo.connected
                              ? "bg-secondary text-foreground hover:bg-secondary/80"
                              : "gradient-gold text-accent-foreground shadow-gold hover:opacity-90"
                          }`}>
                          {repo.connected ? <><ExternalLink className="w-3.5 h-3.5" /> Manage</> : <><Link2 className="w-3.5 h-3.5" /> Connect</>}
                        </button>
                        <button onClick={() => handleTest(repo.name)} disabled={isTesting}
                          className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                          title="Test connection">
                          {isTesting ? <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" /> : <TestTube className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                        {repo.connected && (
                          <button onClick={() => handleSync(repo.name)} disabled={isSyncing}
                            className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                            title="Sync now">
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

          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-5">
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

            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Test all connections", icon: TestTube },
                  { label: "Sync all connected", icon: RefreshCw },
                  { label: "Import from BibTeX", icon: FileText },
                  { label: "Import from DOI list", icon: Globe },
                ].map(item => (
                  <button key={item.label}
                    onClick={() => toast.info(item.label)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-display text-foreground">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
              className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">Connection Overview</h3>
              <div className="space-y-2">
                {repositories.map(repo => (
                  <div key={repo.name} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{repo.icon}</span>
                      <span className="text-[11px] font-display text-foreground">{repo.name}</span>
                    </div>
                    {repoStates[repo.name] ? (
                      <Wifi className="w-3 h-3 text-emerald-brand" />
                    ) : (
                      <WifiOff className="w-3 h-3 text-muted-foreground/40" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RepositoryDashboard;
