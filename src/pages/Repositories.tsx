import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, Bell, FileText
} from "lucide-react";
import { toast } from "sonner";
import { useRepositories, CATEGORY_LABELS, REPO_META, type RepoCategory } from "@/hooks/use-repositories";
import RepoStatsBar from "@/components/repositories/RepoStatsBar";
import RepoConnectionCard from "@/components/repositories/RepoConnectionCard";
import RepoSidebar from "@/components/repositories/RepoSidebar";
import ConnectionModal from "@/components/repositories/ConnectionModal";
import DisconnectDialog from "@/components/repositories/DisconnectDialog";
import EditConnectionModal from "@/components/repositories/EditConnectionModal";
import AutoSyncScheduler from "@/components/repositories/AutoSyncScheduler";
import SyncNotificationCenter from "@/components/repositories/SyncNotificationCenter";
import ImportExportManager from "@/components/repositories/ImportExportManager";

const Repositories = () => {
  const {
    repos, filteredRepos, groupedRepos,
    repoStates, searchQuery, setSearchQuery,
    filterMode, setFilterMode,
    categoryFilter, setCategoryFilter,
    syncing, testing, testResults,
    connectedCount, totalPapers, errorCount,
    connect, disconnect, syncRepo, syncAll, testConnection,
  } = useRepositories();

  // Modal state
  const [connectingRepo, setConnectingRepo] = useState<typeof repos[0] | null>(null);
  const [disconnectingRepo, setDisconnectingRepo] = useState<typeof repos[0] | null>(null);
  const [editingRepo, setEditingRepo] = useState<typeof repos[0] | null>(null);
  const [schedulingRepo, setSchedulingRepo] = useState<typeof repos[0] | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped");

  const categories: (RepoCategory | "all")[] = ["all", "identity", "literature", "code", "data", "citations"];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Repository Connections</h1>
              <p className="text-muted-foreground font-display text-sm">
                Manage connections to {repos.length} scientific repositories. Connect, sync, and monitor integrations.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => toast.info("Custom repository support coming soon")}
                className="h-10 px-5 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-sm flex items-center gap-2 shadow-gold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Add Repository
              </button>
              <button
                onClick={() => setShowNotifications(true)}
                className="h-10 px-4 rounded-lg bg-secondary border border-border text-sm font-display font-medium text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2"
              >
                <Bell className="w-4 h-4 text-muted-foreground" /> Alerts
                {errorCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {errorCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowImportExport(true)}
                className="h-10 px-4 rounded-lg bg-secondary border border-border text-sm font-display font-medium text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-muted-foreground" /> Import / Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <RepoStatsBar
          connectedCount={connectedCount}
          totalPapers={totalPapers}
          totalRepos={repos.length}
          errorCount={errorCount}
          lastSync="2h ago"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div>
            {/* Search + Filter Bar */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
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
                    onClick={() => setFilterMode(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-display font-medium capitalize transition-all ${
                      filterMode === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter + View Toggle */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1.5 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-display font-medium transition-all flex items-center gap-1.5 ${
                      categoryFilter === cat
                        ? "bg-accent/10 text-accent border border-accent/30"
                        : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    {cat !== "all" && <span className="text-xs">{CATEGORY_LABELS[cat].icon}</span>}
                    {cat === "all" ? "All" : CATEGORY_LABELS[cat].label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 bg-card rounded-lg p-0.5 border border-border">
                {(["grouped", "flat"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-display font-medium capitalize transition-all ${
                      viewMode === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Repository Cards */}
            <AnimatePresence mode="popLayout">
              {viewMode === "grouped" && categoryFilter === "all" ? (
                // Grouped view
                <div className="space-y-6">
                  {groupedRepos.map(([category, items]) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm">{CATEGORY_LABELS[category].icon}</span>
                        <h2 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider">
                          {CATEGORY_LABELS[category].label}
                        </h2>
                        <span className="text-[10px] text-muted-foreground font-display">({items.length})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((repo, i) => (
                          <RepoConnectionCard
                            key={repo.name}
                            repo={repo}
                            index={i}
                            isSyncing={syncing.has(repo.name)}
                            isTesting={testing.has(repo.name)}
                            testResult={testResults[repo.name]}
                            onConnect={() => setConnectingRepo(repo)}
                            onManage={() => setEditingRepo(repo)}
                            onSync={() => syncRepo(repo.name)}
                            onTest={() => testConnection(repo.name)}
                            onSchedule={() => setSchedulingRepo(repo)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Flat view
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRepos.map((repo, i) => (
                    <RepoConnectionCard
                      key={repo.name}
                      repo={repo}
                      index={i}
                      isSyncing={syncing.has(repo.name)}
                      isTesting={testing.has(repo.name)}
                      testResult={testResults[repo.name]}
                      onConnect={() => setConnectingRepo(repo)}
                      onManage={() => setEditingRepo(repo)}
                      onSync={() => syncRepo(repo.name)}
                      onTest={() => testConnection(repo.name)}
                      onSchedule={() => setSchedulingRepo(repo)}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {filteredRepos.length === 0 && (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Filter className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground font-display">No repositories match your search</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <RepoSidebar
            repos={repos}
            repoStates={repoStates}
            onSyncAll={syncAll}
            onShowNotifications={() => setShowNotifications(true)}
            onShowImportExport={() => setShowImportExport(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {connectingRepo && (
          <ConnectionModal
            repo={connectingRepo}
            authType={REPO_META[connectingRepo.name]?.authType || "API Key"}
            apiVersion={REPO_META[connectingRepo.name]?.apiVersion}
            onClose={() => setConnectingRepo(null)}
            onConnect={(name) => {
              connect(name);
              setConnectingRepo(null);
            }}
          />
        )}
        {disconnectingRepo && (
          <DisconnectDialog
            repoName={disconnectingRepo.name}
            repoIcon={disconnectingRepo.icon}
            papers={REPO_META[disconnectingRepo.name]?.papers || 0}
            onClose={() => setDisconnectingRepo(null)}
            onConfirm={() => {
              disconnect(disconnectingRepo.name);
              setDisconnectingRepo(null);
              setEditingRepo(null);
            }}
          />
        )}
        {editingRepo && (
          <EditConnectionModal
            repo={editingRepo}
            authType={REPO_META[editingRepo.name]?.authType || "API Key"}
            apiVersion={REPO_META[editingRepo.name]?.apiVersion}
            papers={REPO_META[editingRepo.name]?.papers || 0}
            lastSync={REPO_META[editingRepo.name]?.lastSync || "Never"}
            onClose={() => setEditingRepo(null)}
            onSave={() => setEditingRepo(null)}
            onDisconnect={() => setDisconnectingRepo(editingRepo)}
            onSchedule={() => {
              setEditingRepo(null);
              setSchedulingRepo(editingRepo);
            }}
          />
        )}
        {schedulingRepo && (
          <AutoSyncScheduler
            repoName={schedulingRepo.name}
            repoIcon={schedulingRepo.icon}
            connected={repoStates[schedulingRepo.name] ?? false}
            onClose={() => setSchedulingRepo(null)}
          />
        )}
        {showNotifications && (
          <SyncNotificationCenter open={showNotifications} onClose={() => setShowNotifications(false)} />
        )}
        {showImportExport && (
          <ImportExportManager open={showImportExport} onClose={() => setShowImportExport(false)} />
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Repositories;
