import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Bell, FileText, LayoutGrid, List } from "lucide-react";
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
    syncing, syncProgress, testing, testResults,
    connectedCount, totalPapers, errorCount,
    connect, disconnect, syncRepo, syncAll, testConnection,
  } = useRepositories();

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
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <h1 className="text-[27px] font-semibold text-foreground mb-0.5 tracking-[-0.02em]">Repository Connections</h1>
              <p className="text-muted-foreground font-display text-[13px]">
                Manage {repos.length} scientific repository integrations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotifications(true)}
                className="h-9 px-4 rounded-xl bg-secondary border border-border text-[13px] font-display font-medium text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                Alerts
                {errorCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                    {errorCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowImportExport(true)}
                className="h-9 px-4 rounded-xl bg-secondary border border-border text-[13px] font-display font-medium text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Import / Export
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div>
            {/* Search + Filter Bar */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search repositories..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border text-[13px] font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
              <div className="flex gap-0.5 bg-card rounded-xl p-1 border border-border">
                {(["all", "connected", "available"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterMode(f)}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-display font-medium capitalize transition-all ${
                      filterMode === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex gap-0.5 bg-card rounded-xl p-1 border border-border">
                <button
                  onClick={() => setViewMode("grouped")}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === "grouped" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="Grouped view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("flat")}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === "flat" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="Flat view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-2 rounded-xl text-[13px] font-display font-medium transition-all flex items-center gap-1.5 ${
                    categoryFilter === cat
                      ? "bg-accent/10 text-accent border border-accent/30"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  {cat !== "all" && <span className="text-[13px]">{CATEGORY_LABELS[cat].icon}</span>}
                  {cat === "all" ? "All" : CATEGORY_LABELS[cat].label}
                </button>
              ))}
            </div>

            {/* Repository Cards */}
            <AnimatePresence mode="popLayout">
              {viewMode === "grouped" && categoryFilter === "all" ? (
                <div className="space-y-5">
                  {groupedRepos.map(([category, items]) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-xs">{CATEGORY_LABELS[category].icon}</span>
                        <h2 className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">
                          {CATEGORY_LABELS[category].label}
                        </h2>
                        <span className="text-[9px] text-muted-foreground/60 font-display">({items.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map((repo, i) => (
                          <RepoConnectionCard
                            key={repo.name}
                            repo={repo}
                            index={i}
                            isSyncing={syncing.has(repo.name)}
                            syncProgress={syncProgress[repo.name]}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredRepos.map((repo, i) => (
                    <RepoConnectionCard
                      key={repo.name}
                      repo={repo}
                      index={i}
                      isSyncing={syncing.has(repo.name)}
                      syncProgress={syncProgress[repo.name]}
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
                <Filter className="w-6 h-6 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground font-display">No repositories match your search</p>
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
