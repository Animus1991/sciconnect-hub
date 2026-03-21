import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Shield, ShieldCheck, Clock, Hash, Link2, TrendingUp,
  CheckCircle2, ExternalLink, Copy, Plus, Search,
  ArrowRight, ChevronDown, ChevronRight, Fingerprint
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { mockContributions, CONTRIBUTION_TYPE_META, type ContributionType, type Contribution } from "@/data/blockchainMockData";
import { ContributionGraph } from "@/components/shared/ContributionGraph";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

// ─── Config ─────────────────────────────────────────────────────────────────
const anchorConfig = {
  pending:  { icon: Clock,       color: "text-warning",  bg: "bg-warning-muted",  label: "Pending" },
  anchored: { icon: Shield,      color: "text-info",     bg: "bg-info-muted",     label: "Anchored" },
  verified: { icon: ShieldCheck,  color: "text-success",  bg: "bg-success-muted",  label: "Verified" },
};

const ContributionTracking = () => {
  const [typeFilter, setTypeFilter] = useState<ContributionType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filtered = useMemo(() => {
    let result = mockContributions as Contribution[];
    if (typeFilter !== "all") result = result.filter(c => c.type === typeFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.author.name.toLowerCase().includes(q) ||
        c.field.toLowerCase().includes(q)
      );
    }
    return result;
  }, [typeFilter, debouncedSearch]);

  const stats = useMemo(() => ({
    total: mockContributions.length,
    verified: mockContributions.filter(c => c.anchorStatus === "verified").length,
    pending: mockContributions.filter(c => c.anchorStatus === "pending").length,
    avgImpact: Math.round(mockContributions.reduce((s, c) => s + c.impactScore, 0) / mockContributions.length),
    totalVerifications: mockContributions.reduce((s, c) => s + c.verifications, 0),
  }), []);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockContributions.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; });
    return counts;
  }, []);

  // Attribution chains
  const chains = useMemo(() => {
    const links: { source: Contribution; target: Contribution }[] = [];
    mockContributions.forEach(c => {
      c.linkedTo?.forEach(linkedId => {
        const target = mockContributions.find(x => x.id === linkedId);
        if (target) links.push({ source: c, target });
      });
    });
    return links;
  }, []);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast.success("Hash copied");
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-foreground mb-0.5">Contribution Tracking</h1>
              <p className="text-xs text-muted-foreground font-display">
                Cryptographically verified proof of {stats.total} scientific contributions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="h-8 px-3 rounded-lg bg-secondary border border-border text-xs font-display font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Fingerprint className="w-3.5 h-3.5" /> How it works
              </button>
              <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
                <DialogTrigger asChild>
                  <button className="h-8 px-4 rounded-lg gradient-gold text-accent-foreground text-xs font-display font-semibold shadow-gold hover:opacity-90 transition-opacity flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> New Contribution
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Register New Contribution</DialogTitle>
                    <DialogDescription className="text-xs">SHA-256 hashed and queued for blockchain anchoring.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Title</Label>
                      <Input placeholder="e.g., Novel approach to..." className="h-9 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Type</Label>
                        <Select defaultValue="ideation">
                          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(CONTRIBUTION_TYPE_META).map(([k, v]) => (
                              <SelectItem key={k} value={k} className="text-xs">{v.icon} {v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Field</Label>
                        <Input placeholder="e.g., Quantum Computing" className="h-9 text-xs" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea placeholder="Describe your contribution..." rows={3} className="text-xs" />
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2.5 border border-border">
                      <p className="text-[9px] text-muted-foreground font-display flex items-center gap-1.5">
                        <Shield className="w-3 h-3 shrink-0" /> SHA-256 hash generated on submit. Anchored via OpenTimestamps (~3s).
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => setShowNewForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={() => {
                      setShowNewForm(false);
                      toast.info("Contribution registered", { description: "Anchoring in progress..." });
                      setTimeout(() => toast.success("Anchored on-chain"), 3000);
                    }}>
                      <Hash className="w-3.5 h-3.5 mr-1.5" /> Hash & Submit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* How it works - collapsible */}
        <AnimatePresence>
          {showHowItWorks && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { step: "1", title: "Create", desc: "Content is SHA-256 hashed", icon: Hash },
                    { step: "2", title: "Anchor", desc: "Hash anchored to blockchain", icon: Shield },
                    { step: "3", title: "Verify", desc: "Anyone can verify timestamp", icon: ShieldCheck },
                    { step: "4", title: "Attribute", desc: "Form attribution chains", icon: Link2 },
                  ].map(s => (
                    <div key={s.step} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold shrink-0">
                        {s.step}
                      </div>
                      <div>
                        <p className="text-xs font-display font-semibold text-foreground">{s.title}</p>
                        <p className="text-[10px] text-muted-foreground font-display">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-3 mb-5"
        >
          <div className="flex items-center gap-5 flex-wrap">
            {[
              { label: "Total", value: stats.total, icon: Hash, color: "text-accent" },
              { label: "Verified", value: stats.verified, icon: ShieldCheck, color: "text-success" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "text-warning" },
              { label: "Avg Impact", value: stats.avgImpact, icon: TrendingUp, color: "text-gold" },
              { label: "Verifications", value: stats.totalVerifications, icon: CheckCircle2, color: "text-info" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className={`text-sm font-display font-bold ${s.color}`}>{s.value}</span>
                <span className="text-[10px] text-muted-foreground font-display">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* Main content */}
          <div>
            {/* Search + Type filters */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search contributions, authors, fields..."
                  className="w-full h-9 pl-9 pr-4 rounded-lg bg-card border border-border text-xs font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
            </div>

            {/* Type filter chips */}
            <div className="flex gap-1 mb-4 flex-wrap">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-display font-medium transition-all ${
                  typeFilter === "all"
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                All ({stats.total})
              </button>
              {Object.entries(CONTRIBUTION_TYPE_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key as ContributionType)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-display font-medium transition-all flex items-center gap-1 ${
                    typeFilter === key
                      ? "bg-accent/10 text-accent border border-accent/30"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  <span className="text-[10px]">{meta.icon}</span>
                  {meta.label}
                  {typeCounts[key] ? ` (${typeCounts[key]})` : ""}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-card rounded-xl border border-border">
                    <Hash className="w-8 h-8 mx-auto mb-3 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground font-display">No contributions match your search</p>
                  </motion.div>
                ) : filtered.map((c, i) => {
                  const typeMeta = CONTRIBUTION_TYPE_META[c.type];
                  const anchor = anchorConfig[c.anchorStatus];
                  const isExpanded = expandedId === c.id;

                  return (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: i * 0.03 }}
                      className="card-interactive p-4 cursor-pointer group"
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    >
                      {/* Top row */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm">{typeMeta.icon}</span>
                        <Badge variant="outline" className={`text-[9px] font-display px-1.5 py-0 h-4 ${typeMeta.color}`}>
                          {typeMeta.label}
                        </Badge>
                        <div className={`flex items-center gap-1 text-[9px] font-display px-1.5 py-0.5 rounded-full ${anchor.bg} ${anchor.color}`}>
                          <anchor.icon className="w-2.5 h-2.5" />
                          {anchor.label}
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono">{c.field}</span>
                        <span className="ml-auto text-[9px] text-muted-foreground font-display">
                          {new Date(c.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      {/* Title + author */}
                      <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">
                        {c.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-display mb-2">
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-accent/15 flex items-center justify-center text-[7px] font-bold text-accent">
                            {c.author.initials}
                          </span>
                          {c.author.name}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" /> {c.impactScore}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {c.verifications}
                        </span>
                        {c.linkedTo && (
                          <span className="flex items-center gap-0.5 text-accent">
                            <Link2 className="w-2.5 h-2.5" /> {c.linkedTo.length}
                          </span>
                        )}
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-[10px] text-muted-foreground/80 font-display leading-relaxed mb-3">
                              {c.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="text-[9px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded truncate max-w-[240px]">
                                SHA-256: {c.hashDigest.slice(0, 16)}…
                              </code>
                              <button
                                onClick={e => { e.stopPropagation(); copyHash(c.hashDigest); }}
                                className="p-1 rounded hover:bg-secondary transition-colors"
                              >
                                {copiedHash === c.hashDigest ? (
                                  <CheckCircle2 className="w-3 h-3 text-success" />
                                ) : (
                                  <Copy className="w-3 h-3 text-muted-foreground" />
                                )}
                              </button>
                              {c.anchorTxId && (
                                <button
                                  onClick={e => e.stopPropagation()}
                                  className="flex items-center gap-0.5 text-[9px] text-accent font-display hover:underline"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" /> View Tx
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Expand indicator */}
                      <div className="flex justify-center mt-1">
                        <ChevronDown className={`w-3 h-3 text-muted-foreground/30 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Verification Pipeline */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <h3 className="font-display font-semibold text-xs text-foreground mb-3">Verification Pipeline</h3>
              <div className="space-y-3">
                {(["pending", "anchored", "verified"] as const).map(status => {
                  const cfg = anchorConfig[status];
                  const items = mockContributions.filter(c => c.anchorStatus === status);
                  return (
                    <div key={status}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <cfg.icon className={`w-3 h-3 ${cfg.color}`} />
                        <span className="text-[10px] font-display font-semibold text-foreground">{cfg.label}</span>
                        <span className="text-[9px] text-muted-foreground font-display">({items.length})</span>
                      </div>
                      <div className="ml-4.5 space-y-1">
                        {items.slice(0, 3).map(c => (
                          <div key={c.id} className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-display">
                            <span>{CONTRIBUTION_TYPE_META[c.type].icon}</span>
                            <span className="truncate flex-1">{c.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Attribution Chains (compact) */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-center gap-1.5 mb-3">
                <Link2 className="w-3.5 h-3.5 text-accent" />
                <h3 className="font-display font-semibold text-xs text-foreground">Attribution Chains</h3>
                <span className="text-[9px] text-muted-foreground font-display ml-auto">{chains.length} links</span>
              </div>
              <div className="space-y-2">
                {chains.map(({ source, target }, i) => {
                  const sMeta = CONTRIBUTION_TYPE_META[source.type];
                  const tMeta = CONTRIBUTION_TYPE_META[target.type];
                  return (
                    <div key={`${source.id}-${target.id}`} className="flex items-center gap-1.5 text-[9px] font-display">
                      <span>{sMeta.icon}</span>
                      <span className="text-foreground truncate max-w-[80px]">{source.title.split(" ").slice(0, 3).join(" ")}…</span>
                      <ArrowRight className="w-2.5 h-2.5 text-muted-foreground/40 shrink-0" />
                      <span>{tMeta.icon}</span>
                      <span className="text-foreground truncate max-w-[80px]">{target.title.split(" ").slice(0, 3).join(" ")}…</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Activity Heatmap (compact) */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ContributionGraph colorScheme="emerald" title="Contribution Activity" weeks={26} />
            </motion.div>

            {/* Type Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <h3 className="font-display font-semibold text-xs text-foreground mb-3">By Type</h3>
              <div className="space-y-1.5">
                {Object.entries(CONTRIBUTION_TYPE_META).map(([key, meta]) => {
                  const count = typeCounts[key] || 0;
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <button
                      key={key}
                      onClick={() => setTypeFilter(typeFilter === key ? "all" : key as ContributionType)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left ${
                        typeFilter === key ? "bg-accent/10" : "hover:bg-secondary"
                      }`}
                    >
                      <span className="text-xs">{meta.icon}</span>
                      <span className="text-[10px] font-display text-foreground flex-1">{meta.label}</span>
                      <div className="w-12 h-1 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] font-display text-muted-foreground w-3 text-right">{count}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContributionTracking;
