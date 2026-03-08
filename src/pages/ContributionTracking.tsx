import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { 
  Shield, ShieldCheck, Clock, Hash, Link2, TrendingUp, 
  CheckCircle2, AlertCircle, ExternalLink, Copy, Filter, Plus
} from "lucide-react";
import { mockContributions, CONTRIBUTION_TYPE_META, type ContributionType } from "@/data/blockchainMockData";
import { ContributionGraph } from "@/components/shared/ContributionGraph";
import AttributionChainVisualization from "@/components/contributions/AttributionChainVisualization";
import { toast } from "sonner";

const anchorStatusConfig = {
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Pending Anchor" },
  anchored: { icon: Shield, color: "text-info", bg: "bg-info/10", label: "Anchored" },
  verified: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10", label: "Verified On-Chain" },
};

const ContributionTracking = () => {
  const [typeFilter, setTypeFilter] = useState<ContributionType | "all">("all");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedContribution, setSelectedContribution] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [anchoringId, setAnchoringId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return mockContributions;
    return mockContributions.filter(c => c.type === typeFilter);
  }, [typeFilter]);

  const stats = useMemo(() => ({
    total: mockContributions.length,
    verified: mockContributions.filter(c => c.anchorStatus === "verified").length,
    totalImpact: Math.round(mockContributions.reduce((s, c) => s + c.impactScore, 0) / mockContributions.length),
    totalVerifications: mockContributions.reduce((s, c) => s + c.verifications, 0),
  }), []);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Contribution Tracking</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Cryptographically verified proof of your scientific contributions
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-display gap-1.5 px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-accent" />
              Proof of Contribution Protocol v1
            </Badge>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Total Contributions", value: stats.total.toString(), icon: Hash, accent: true },
            { label: "On-Chain Verified", value: stats.verified.toString(), icon: ShieldCheck },
            { label: "Avg. Impact Score", value: stats.totalImpact.toString(), icon: TrendingUp },
            { label: "Peer Verifications", value: stats.totalVerifications.toString(), icon: CheckCircle2 },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.accent ? "bg-accent/5 border-accent/20" : "bg-card border-border"}`}>
              <s.icon className={`w-4 h-4 mb-2 ${s.accent ? "text-accent" : "text-gold"}`} />
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Activity heatmap */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ContributionGraph colorScheme="emerald" title="Contribution Activity" />
        </motion.div>

        {/* Attribution Chains */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-6">
          <AttributionChainVisualization 
            contributions={filtered} 
            onSelectContribution={setSelectedContribution} 
            selectedId={selectedContribution} 
          />
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="timeline" className="mt-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger value="timeline" className="font-display text-sm">Timeline</TabsTrigger>
              <TabsTrigger value="by-type" className="font-display text-sm">By Type</TabsTrigger>
              <TabsTrigger value="verification" className="font-display text-sm">Verification</TabsTrigger>
            </TabsList>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as ContributionType | "all")}
                className="text-xs font-display bg-secondary border border-border rounded-md px-2 py-1.5 text-foreground"
              >
                <option value="all">All Types</option>
                {Object.entries(CONTRIBUTION_TYPE_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.icon} {meta.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline */}
          <TabsContent value="timeline" className="space-y-3">
            {filtered.map((c, i) => {
              const typeMeta = CONTRIBUTION_TYPE_META[c.type];
              const anchor = anchorStatusConfig[c.anchorStatus];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header badges */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-base">{typeMeta.icon}</span>
                        <Badge variant="outline" className={`text-[10px] font-display ${typeMeta.color}`}>
                          {typeMeta.label}
                        </Badge>
                        <div className={`flex items-center gap-1 text-[10px] font-display px-2 py-0.5 rounded-full ${anchor.bg} ${anchor.color}`}>
                          <anchor.icon className="w-3 h-3" />
                          {anchor.label}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{c.field}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-display leading-relaxed mb-2">
                        {c.description}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display flex-wrap">
                        <span className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center text-[8px] font-bold text-accent">
                            {c.author.initials}
                          </div>
                          {c.author.name}
                        </span>
                        <span>{new Date(c.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Impact: {c.impactScore}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {c.verifications} verifications
                        </span>
                        {c.linkedTo && (
                          <span className="flex items-center gap-1 text-accent">
                            <Link2 className="w-3 h-3" /> {c.linkedTo.length} linked
                          </span>
                        )}
                      </div>

                      {/* Hash */}
                      <div className="mt-3 flex items-center gap-2">
                        <code className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded truncate max-w-[260px]">
                          SHA-256: {c.hashDigest.slice(0, 20)}…
                        </code>
                        <button
                          onClick={() => copyHash(c.hashDigest)}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                          title="Copy full hash"
                        >
                          {copiedHash === c.hashDigest ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </button>
                        {c.anchorTxId && (
                          <button className="flex items-center gap-1 text-[10px] text-accent font-display hover:underline" title="View on chain">
                            <ExternalLink className="w-3 h-3" /> View Tx
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* By Type */}
          <TabsContent value="by-type">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(CONTRIBUTION_TYPE_META).map(([key, meta]) => {
                const count = mockContributions.filter(c => c.type === key).length;
                return (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => { setTypeFilter(key as ContributionType); }}
                    className={`bg-card rounded-xl border p-4 text-left hover:border-accent/30 transition-all ${
                      typeFilter === key ? "border-accent/50 bg-accent/5" : "border-border"
                    }`}
                  >
                    <span className="text-2xl">{meta.icon}</span>
                    <p className="text-lg font-display font-bold text-foreground mt-2">{count}</p>
                    <p className={`text-xs font-display font-medium ${meta.color}`}>{meta.label}</p>
                  </motion.button>
                );
              })}
            </div>
          </TabsContent>

          {/* Verification */}
          <TabsContent value="verification" className="space-y-3">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif text-base font-semibold text-foreground mb-4">Verification Pipeline</h3>
              <div className="space-y-4">
                {(["pending", "anchored", "verified"] as const).map(status => {
                  const config = anchorStatusConfig[status];
                  const items = mockContributions.filter(c => c.anchorStatus === status);
                  return (
                    <div key={status}>
                      <div className="flex items-center gap-2 mb-2">
                        <config.icon className={`w-4 h-4 ${config.color}`} />
                        <span className="text-sm font-display font-semibold text-foreground">{config.label}</span>
                        <Badge variant="outline" className="text-[10px]">{items.length}</Badge>
                      </div>
                      <div className="ml-6 space-y-1.5">
                        {items.map(c => (
                          <div key={c.id} className="flex items-center gap-2 text-xs text-muted-foreground font-display">
                            <span>{CONTRIBUTION_TYPE_META[c.type].icon}</span>
                            <span className="truncate flex-1">{c.title}</span>
                            <code className="font-mono text-[9px] text-muted-foreground/60">{c.hashDigest.slice(0, 12)}…</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif text-base font-semibold text-foreground mb-3">How Proof of Contribution Works</h3>
              <div className="space-y-3 text-xs font-display text-muted-foreground leading-relaxed">
                {[
                  { step: "1", title: "Create", desc: "Your contribution is recorded with a cryptographic SHA-256 hash of the content." },
                  { step: "2", title: "Anchor", desc: "The hash is batched and anchored to a public blockchain (Bitcoin/Ethereum) via OpenTimestamps or EAS." },
                  { step: "3", title: "Verify", desc: "Anyone can independently verify that your contribution existed at the claimed timestamp by checking the on-chain proof." },
                  { step: "4", title: "Attribute", desc: "Linked contributions form an attribution chain — tracing the evolution of ideas across researchers." },
                ].map(s => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{s.title}</p>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ContributionTracking;
