import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, ShieldCheck, Hash, TrendingUp, Eye, EyeOff, Trophy, Award, 
  GitBranch, Star, Clock, CheckCircle2, ArrowRight, Sparkles, Link2
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  mockContributions, mockBlindReviews, mockBounties, mockReputation, 
  mockProvenanceNodes, mockProvenanceEdges, CONTRIBUTION_TYPE_META, PROVENANCE_NODE_META 
} from "@/data/blockchainMockData";

const BlockchainDashboard = () => {
  const verifiedCount = mockContributions.filter(c => c.anchorStatus === "verified").length;
  const pendingCount = mockContributions.filter(c => c.anchorStatus === "pending").length;
  const openBounties = mockBounties.filter(b => b.status === "open").length;
  const revealedReviews = mockBlindReviews.filter(r => r.phase === "revealed").length;
  const rep = mockReputation;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Blockchain Dashboard</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Unified overview of your Proof of Contribution protocol
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-display gap-1.5 px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-accent" />
              PoC Protocol v1
            </Badge>
          </div>
        </motion.div>

        {/* Top Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6"
        >
          {[
            { label: "Contributions", value: mockContributions.length, icon: Hash, accent: true },
            { label: "On-Chain Verified", value: verifiedCount, icon: ShieldCheck },
            { label: "Reputation Score", value: rep.overallScore, icon: TrendingUp },
            { label: "SBT Tokens", value: rep.sbtTokens.length, icon: Award },
            { label: "Open Bounties", value: openBounties, icon: Trophy },
            { label: "Provenance Nodes", value: mockProvenanceNodes.length, icon: GitBranch },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-5 ${s.accent ? "bg-accent/5 border-accent/20" : "bg-card border-border"}`}>
              <s.icon className={`w-5 h-5 mb-3 ${s.accent ? "text-accent" : "text-gold"}`} />
              <p className="text-[24px] font-display font-bold text-foreground leading-tight mb-1">{s.value}</p>
              <p className="text-[12px] text-muted-foreground font-display uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Contributions */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <SectionCard title="Recent Contributions" linkTo="/contributions" linkLabel="View all">
              <div className="space-y-3">
                {mockContributions.slice(0, 4).map(c => {
                  const meta = CONTRIBUTION_TYPE_META[c.type];
                  return (
                    <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                      <span className="text-xl mt-0.5">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-display font-medium text-foreground truncate">{c.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[12px] text-muted-foreground font-display flex-wrap">
                          <span className="truncate max-w-[140px]">{c.author.name}</span>
                          <span>•</span>
                          <Badge variant="outline" className={`text-[11px] px-2 py-0.5 font-medium ${c.anchorStatus === "verified" ? "text-success border-success/20 bg-success/10" : c.anchorStatus === "anchored" ? "text-info border-info/20 bg-info/10" : "text-warning border-warning/20 bg-warning/10"}`}>
                            {c.anchorStatus}
                          </Badge>
                          <span>Impact: {c.impactScore}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>

          {/* Reputation Overview */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <SectionCard title="Reputation Overview" linkTo="/reputation" linkLabel="Details">
              <div className="flex items-center gap-5 mb-5">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="8"
                      strokeDasharray={`${rep.overallScore * 2.64} 264`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[20px] font-display font-bold text-foreground">{rep.overallScore}</span>
                  </div>
                </div>
                <div className="flex-1">
                  {Object.entries(rep.dimensions).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 mb-2">
                      <span className="text-[12px] font-display text-muted-foreground w-24 capitalize">{key}</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${value}%` }} />
                      </div>
                      <span className="text-[12px] font-display font-bold text-foreground w-8 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Latest SBT */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gold/5 border border-gold/20">
                <Sparkles className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-[13px] font-display font-semibold text-foreground mb-0.5">{rep.sbtTokens[0].name}</p>
                  <p className="text-[12px] text-muted-foreground font-display">{rep.sbtTokens[0].description}</p>
                </div>
              </div>
            </SectionCard>
          </motion.div>

          {/* Blind Reviews */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <SectionCard title="Blind-then-Reveal Reviews" linkTo="/peer-review" linkLabel="Manage">
              <div className="space-y-3">
                {mockBlindReviews.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {r.phase === "blind" ? <EyeOff className="w-4 h-4 text-info flex-shrink-0" /> :
                       r.phase === "revealed" ? <Eye className="w-4 h-4 text-success flex-shrink-0" /> :
                       <Shield className="w-4 h-4 text-warning flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-[13px] font-display font-medium text-foreground truncate">{r.manuscriptTitle}</p>
                        <p className="text-[12px] text-muted-foreground font-display mt-0.5">{r.journal} · {r.field}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s < r.qualityScore ? "text-gold fill-gold" : "text-muted-foreground/20"}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>

          {/* Reproducibility Bounties */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <SectionCard title="Reproducibility Bounties" linkTo="/peer-review" linkLabel="Browse">
              <div className="space-y-3">
                {mockBounties.map(b => {
                  const statusColor = b.status === "open" ? "text-info" : b.status === "completed" ? "text-success" : b.status === "disputed" ? "text-destructive" : "text-warning";
                  return (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-display font-medium text-foreground truncate">{b.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[12px] text-muted-foreground font-display flex-wrap">
                          <span className={`font-medium ${statusColor}`}>{b.status}</span>
                          <span>•</span>
                          <span>{b.attempts} attempts</span>
                          <span>•</span>
                          <span>{b.successfulReplications} successful</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-accent ml-3 bg-accent/10 px-2 py-1 rounded-md">
                        <Award className="w-4 h-4" />
                        <span className="text-[13px] font-display font-bold">{b.rewardTokens}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>

          {/* Provenance Summary */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <SectionCard title="Idea Provenance Summary" linkTo="/provenance" linkLabel="Explore graph">
              <div className="flex items-center gap-6 flex-wrap mb-5">
                {[
                  { label: "Nodes", value: mockProvenanceNodes.length },
                  { label: "Edges", value: mockProvenanceEdges.length },
                  { label: "Contributors", value: new Set(mockProvenanceNodes.map(n => n.author.name)).size },
                ].map(s => (
                  <div key={s.label} className="text-center px-4">
                    <p className="text-[20px] font-display font-bold text-foreground mb-1">{s.value}</p>
                    <p className="text-[12px] text-muted-foreground font-display uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {mockProvenanceNodes.slice(0, 6).map(node => {
                  const meta = PROVENANCE_NODE_META[node.type];
                  return (
                    <div key={node.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
                      <div className={`w-5 h-5 rounded-full ${meta.color} flex items-center justify-center text-white text-[9px] font-bold`}>
                        {node.author.initials}
                      </div>
                      <span className="text-[12px] font-display text-foreground truncate max-w-[160px]">{node.title}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">{meta.label}</Badge>
                    </div>
                  );
                })}
                {mockProvenanceNodes.length > 6 && (
                  <div className="flex items-center px-3 py-1.5 text-[12px] font-display text-muted-foreground font-medium">
                    +{mockProvenanceNodes.length - 6} more
                  </div>
                )}
              </div>
            </SectionCard>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

function SectionCard({ title, linkTo, linkLabel, children }: { title: string; linkTo: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-[15px] font-semibold text-foreground">{title}</h3>
        <Link to={linkTo} className="text-[13px] font-display font-medium text-accent hover:underline flex items-center gap-1">
          {linkLabel} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

export default BlockchainDashboard;
