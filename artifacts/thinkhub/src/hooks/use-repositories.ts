import { useState, useMemo, useCallback, useEffect } from "react";
import { repositories as repoData } from "@/data/mockData";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────
export type SyncStatus = "synced" | "pending" | "error" | "none";
export type RepoCategory = "identity" | "literature" | "code" | "data" | "citations";
export type FilterMode = "all" | "connected" | "available";

export interface RepoMeta {
  papers: number;
  lastSync: string;
  status: SyncStatus;
  apiVersion?: string;
  authType: string;
  category: RepoCategory;
  latencyMs?: number;
}

export interface RepoItem {
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  color: string;
  url: string;
}

export const REPO_META: Record<string, RepoMeta> = {
  ORCID:             { papers: 24, lastSync: "2 hours ago",   status: "synced",  apiVersion: "v3.0", authType: "OAuth 2.0",  category: "identity",   latencyMs: 120 },
  arXiv:             { papers: 8,  lastSync: "1 day ago",     status: "synced",  apiVersion: "v1",   authType: "API Key",    category: "literature", latencyMs: 340 },
  PubMed:            { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v2",   authType: "API Key",    category: "literature", latencyMs: undefined },
  GitHub:            { papers: 0,  lastSync: "3 hours ago",   status: "synced",  apiVersion: "v4",   authType: "OAuth 2.0",  category: "code",       latencyMs: 85 },
  Zenodo:            { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v1",   authType: "OAuth 2.0",  category: "data",       latencyMs: undefined },
  "Google Scholar":  { papers: 24, lastSync: "5 days ago",    status: "pending", apiVersion: "N/A",  authType: "Scraping",   category: "citations",  latencyMs: 890 },
  "Semantic Scholar":{ papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v1",   authType: "API Key",    category: "citations",  latencyMs: undefined },
  "IEEE Xplore":     { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v2",   authType: "API Key",    category: "literature", latencyMs: undefined },
  Scopus:            { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v2",   authType: "API Key",    category: "literature", latencyMs: undefined },
  "Web of Science":  { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v2",   authType: "API Key",    category: "citations",  latencyMs: undefined },
  Figshare:          { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v2",   authType: "OAuth 2.0",  category: "data",       latencyMs: undefined },
  Mendeley:          { papers: 0,  lastSync: "Never",         status: "none",    apiVersion: "v1",   authType: "OAuth 2.0",  category: "literature", latencyMs: undefined },
};

export const CATEGORY_LABELS: Record<RepoCategory, { label: string; icon: string }> = {
  identity:   { label: "Identity & Profile", icon: "🆔" },
  literature: { label: "Literature Databases", icon: "📚" },
  code:       { label: "Code & Software", icon: "💻" },
  data:       { label: "Data Repositories", icon: "📊" },
  citations:  { label: "Citation Networks", icon: "🔗" },
};

export const RECENT_ACTIVITY = [
  { repo: "ORCID",    action: "Synced 3 new publications",              time: "2h ago",  icon: "🆔" },
  { repo: "arXiv",    action: "New preprint indexed",                    time: "1d ago",  icon: "📄" },
  { repo: "GitHub",   action: "NeuroSim v3.0 repository linked",        time: "3h ago",  icon: "🐙" },
  { repo: "ORCID",    action: "Citation count updated: +12 citations",   time: "2d ago",  icon: "🆔" },
  { repo: "arXiv",    action: "2 papers updated with DOI links",         time: "3d ago",  icon: "📄" },
];

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useRepositories() {
  const [repoStates, setRepoStates] = useState<Record<string, boolean>>(
    Object.fromEntries(repoData.map(r => [r.name, r.connected]))
  );
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [syncProgress, setSyncProgress] = useState<Record<string, number>>({});
  const [testing, setTesting] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, "success" | "error">>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [categoryFilter, setCategoryFilter] = useState<RepoCategory | "all">("all");

  const debouncedSearch = useDebounce(searchQuery, 250);

  // Auto-dismiss test results after 5 seconds
  useEffect(() => {
    const keys = Object.keys(testResults);
    if (keys.length === 0) return;
    const timer = setTimeout(() => {
      setTestResults({});
    }, 5000);
    return () => clearTimeout(timer);
  }, [testResults]);

  const repos: RepoItem[] = useMemo(
    () => repoData.map(r => ({ ...r, connected: repoStates[r.name] ?? r.connected })),
    [repoStates]
  );

  const filteredRepos = useMemo(() => {
    let result = repos;
    if (filterMode === "connected") result = result.filter(r => r.connected);
    if (filterMode === "available") result = result.filter(r => !r.connected);
    if (categoryFilter !== "all") {
      result = result.filter(r => REPO_META[r.name]?.category === categoryFilter);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    return result;
  }, [repos, filterMode, categoryFilter, debouncedSearch]);

  // Group by category
  const groupedRepos = useMemo(() => {
    const groups: Record<RepoCategory, RepoItem[]> = {
      identity: [], literature: [], code: [], data: [], citations: [],
    };
    filteredRepos.forEach(r => {
      const cat = REPO_META[r.name]?.category || "literature";
      groups[cat].push(r);
    });
    return Object.entries(groups)
      .filter(([, items]) => items.length > 0) as [RepoCategory, RepoItem[]][];
  }, [filteredRepos]);

  const connectedCount = useMemo(() => Object.values(repoStates).filter(Boolean).length, [repoStates]);
  const totalPapers = useMemo(() => Object.values(REPO_META).reduce((s, m) => s + m.papers, 0), []);
  const errorCount = useMemo(
    () => Object.entries(REPO_META).filter(([name, m]) => repoStates[name] && (m.status === "error" || m.status === "pending")).length,
    [repoStates]
  );

  const connect = useCallback((name: string) => {
    setRepoStates(prev => ({ ...prev, [name]: true }));
    toast.success(`Connected to ${name}`);
  }, []);

  const disconnect = useCallback((name: string) => {
    setRepoStates(prev => ({ ...prev, [name]: false }));
    toast.info(`Disconnected from ${name}`);
  }, []);

  const syncRepo = useCallback((name: string) => {
    setSyncing(prev => new Set([...prev, name]));
    setSyncProgress(prev => ({ ...prev, [name]: 0 }));
    toast(`Syncing ${name}...`);

    // Simulate progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        const current = prev[name] || 0;
        if (current >= 90) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, [name]: current + Math.random() * 20 };
      });
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      setSyncProgress(prev => ({ ...prev, [name]: 100 }));
      setTimeout(() => {
        setSyncing(prev => { const n = new Set(prev); n.delete(name); return n; });
        setSyncProgress(prev => { const n = { ...prev }; delete n[name]; return n; });
        toast.success(`${name} synced successfully`);
      }, 300);
    }, 2500);
  }, []);

  const syncAll = useCallback(() => {
    const connected = repos.filter(r => r.connected);
    connected.forEach((r, i) => setTimeout(() => syncRepo(r.name), i * 300));
  }, [repos, syncRepo]);

  const testConnection = useCallback((name: string) => {
    setTesting(prev => new Set([...prev, name]));
    setTestResults(prev => { const n = { ...prev }; delete n[name]; return n; });
    setTimeout(() => {
      setTesting(prev => { const n = new Set(prev); n.delete(name); return n; });
      const success = repoStates[name] || Math.random() > 0.3;
      setTestResults(prev => ({ ...prev, [name]: success ? "success" : "error" }));
      toast[success ? "success" : "error"](`${name} connection test ${success ? "passed" : "failed"}`);
    }, 1500);
  }, [repoStates]);

  return {
    repos, filteredRepos, groupedRepos,
    repoStates, searchQuery, setSearchQuery,
    filterMode, setFilterMode,
    categoryFilter, setCategoryFilter,
    syncing, syncProgress, testing, testResults,
    connectedCount, totalPapers, errorCount,
    connect, disconnect, syncRepo, syncAll, testConnection,
  };
}
