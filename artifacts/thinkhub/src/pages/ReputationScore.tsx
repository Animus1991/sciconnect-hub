import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Award, TrendingUp, Star, Shield, Sparkles, ChevronDown, ChevronUp,
  Target, BookOpen, GitBranch, Users, Eye, Medal, Zap, ArrowUpRight,
  ArrowDownRight, Minus, Info, Download, Share2, Clock, Hash, CheckCircle2,
  Lightbulb, FlaskConical, Database, MessageSquare, Copy, ExternalLink
} from "lucide-react";
import { mockReputation, mockPeerReputations, mockContributions, CONTRIBUTION_TYPE_META } from "@/data/blockchainMockData";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid, AreaChart, Area,
  BarChart, Bar, Cell
} from "recharts";
import { toast } from "sonner";

const CONTRIBUTION_ICON_MAP: Record<string, typeof Lightbulb> = {
  ideation: Lightbulb,
  peer_review: Eye,
  data_sharing: Database,
  mentorship: Users,
  replication: FlaskConical,
  feedback: MessageSquare,
  curation: BookOpen,
  methodology: GitBranch,
};

// ─── Dimension metadata ───
const DIMENSION_META: Record<string, { label: string; icon: React.ElementType; description: string; color: string }> = {
  originality: { label: "Originality", icon: Lightbulb, description: "Novel ideas, hypotheses, and creative contributions", color: "text-accent" },
  rigor: { label: "Rigor", icon: Target, description: "Methodological quality and reproducibility standards", color: "text-info" },
  generosity: { label: "Generosity", icon: Database, description: "Data sharing, open-source contributions, and community support", color: "text-success" },
  reproducibility: { label: "Reproducibility", icon: FlaskConical, description: "Replication attempts and protocol documentation", color: "text-emerald" },
  mentorship: { label: "Mentorship", icon: Users, description: "Guidance of junior researchers and knowledge transfer", color: "text-warning" },
  collaboration: { label: "Collaboration", icon: GitBranch, description: "Cross-institutional teamwork and co-authorship", color: "text-highlight" },
};

const rarityConfig: Record<string, { border: string; bg: string; text: string; icon: React.ElementType; glow: string }> = {
  common: { border: "border-border", bg: "bg-card", text: "text-muted-foreground", icon: Award, glow: "" },
  rare: { border: "border-accent/40", bg: "bg-accent/5", text: "text-accent", icon: Star, glow: "shadow-sm shadow-accent/10" },
  legendary: { border: "border-gold/40", bg: "bg-gold/5", text: "text-gold", icon: Sparkles, glow: "shadow-md shadow-gold/15" },
};

const trendIcon = (curr: number, prev: number) => {
  const diff = curr - prev;
  if (diff > 0) return { Icon: ArrowUpRight, color: "text-success", label: `+${diff}` };
  if (diff < 0) return { Icon: ArrowDownRight, color: "text-destructive", label: `${diff}` };
  return { Icon: Minus, color: "text-muted-foreground", label: "0" };
};

const ReputationScore = () => {
  const rep = mockReputation;
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"radar" | "history" | "tokens" | "peers" | "breakdown">("radar");

  // Computed data
  const scoreChange = rep.history.length >= 2 ? rep.history[rep.history.length - 1].score - rep.history[rep.history.length - 2].score : 0;
  const yearGrowth = rep.history.length >= 6 ? rep.history[rep.history.length - 1].score - rep.history[0].score : 0;
  const avgDimension = Math.round(Object.values(rep.dimensions).reduce((a, b) => a + b, 0) / Object.keys(rep.dimensions).length);
  const strongestDim = Object.entries(rep.dimensions).sort((a, b) => b[1] - a[1])[0];
  const weakestDim = Object.entries(rep.dimensions).sort((a, b) => a[1] - b[1])[0];

  const radarData = useMemo(() =>
    Object.entries(rep.dimensions).map(([key, value]) => ({
      dimension: DIMENSION_META[key]?.label || key,
      value,
      fullMark: 100,
    }))
  , [rep]);

  const peerRadarData = useMemo(() => {
    const dims = Object.keys(rep.dimensions);
    return dims.map(key => {
      const entry: Record<string, string | number> = { dimension: DIMENSION_META[key]?.label || key };
      entry["You"] = rep.dimensions[key as keyof typeof rep.dimensions];
      mockPeerReputations.forEach(p => {
        entry[p.initials] = p.dimensions[key as keyof typeof p.dimensions];
      });
      return entry;
    });
  }, [rep]);

  const contributionByType = useMemo(() => {
    const counts: Record<string, number> = {};
    mockContributions.forEach(c => {
      counts[c.type] = (counts[c.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type,
      label: CONTRIBUTION_TYPE_META[type as keyof typeof CONTRIBUTION_TYPE_META]?.label || type,
      icon: CONTRIBUTION_TYPE_META[type as keyof typeof CONTRIBUTION_TYPE_META]?.icon || "📄",
      count,
    })).sort((a, b) => b.count - a.count);
  }, []);

  const historyWithArea = rep.history.map((h, i) => ({
    ...h,
    prev: i > 0 ? rep.history[i - 1].score : h.score,
  }));

  const tabs = [
    { id: "radar" as const, label: "Radar", icon: Target },
    { id: "history" as const, label: "History", icon: TrendingUp },
    { id: "breakdown" as const, label: "Breakdown", icon: Hash },
    { id: "tokens" as const, label: "SBT Tokens", icon: Award, count: rep.sbtTokens.length },
    { id: "peers" as const, label: "Peers", icon: Users, count: mockPeerReputations.length },
  ];

  const handleExport = () => {
    const lines = [
      `Reputation Report — ${rep.name}`,
      `Institution: ${rep.institution}`,
      `Overall Score: ${rep.overallScore}/100`,
      `h-index: ${rep.hIndex}`,
      `Total Contributions: ${rep.totalContributions}`,
      ``,
      `Dimensions:`,
      ...Object.entries(rep.dimensions).map(([k, v]) => `  ${DIMENSION_META[k]?.label || k}: ${v}/100`),
      ``,
      `SBT Tokens: ${rep.sbtTokens.map(t => t.name).join(", ")}`,
      ``,
      `Generated: ${new Date().toISOString()}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reputation-report.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${rep.name} — Reputation Score: ${rep.overallScore}/100 | h-index: ${rep.hIndex}`);
    toast.success("Copied to clipboard");
  };

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Reputation Score</h1>
                <p className="text-sm text-muted-foreground font-display mt-1">
                  Multi-dimensional academic reputation beyond the h-index
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs font-display gap-1.5" onClick={handleExport}>
                  <Download className="w-3.5 h-3.5" /> Export
                </Button>
                <Button variant="outline" size="sm" className="text-xs font-display gap-1.5" onClick={handleShare}>
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <Badge variant="outline" className="text-xs font-display gap-1.5 px-3 py-1.5">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  SBT Protocol
                </Badge>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* ─── Main Column ─── */}
            <div className="space-y-6 min-w-0">
              {/* Profile Card */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center text-xl font-display font-bold text-accent ring-2 ring-accent/20">
                    {rep.initials}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <h2 className="text-base font-semibold tracking-tight text-foreground">{rep.name}</h2>
                    <p className="text-xs text-muted-foreground font-display">{rep.institution}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs font-display text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> h-index: <strong className="text-foreground">{rep.hIndex}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" /> Contributions: <strong className="text-foreground">{rep.totalContributions}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" /> SBTs: <strong className="text-foreground">{rep.sbtTokens.length}</strong>
                      </span>
                    </div>
                  </div>
                  {/* Score ring */}
                  <div className="text-center">
                    <div className="relative w-20 h-20">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
                        <motion.circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="5"
                          initial={{ strokeDasharray: "0 264" }}
                          animate={{ strokeDasharray: `${rep.overallScore * 2.64} 264` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-display font-bold text-foreground">{rep.overallScore}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {(() => {
                        const t = trendIcon(rep.overallScore, rep.history[rep.history.length - 2]?.score || rep.overallScore);
                        return (
                          <>
                            <t.Icon className={`w-3 h-3 ${t.color}`} />
                            <span className={`text-[10px] font-display font-medium ${t.color}`}>{t.label}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* KPI Row */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {[
                  { label: "Overall Score", value: rep.overallScore, suffix: "/100", change: scoreChange },
                  { label: "Year Growth", value: `+${yearGrowth}`, suffix: "pts", change: yearGrowth },
                  { label: "Avg Dimension", value: avgDimension, suffix: "/100", change: 0 },
                  { label: "Strongest", value: strongestDim[1], suffix: "", sublabel: DIMENSION_META[strongestDim[0]]?.label, change: 0 },
                ].map((kpi, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-4">
                    <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider mb-1">{kpi.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-display font-bold text-foreground">{kpi.value}</span>
                      {kpi.suffix && <span className="text-xs text-muted-foreground font-display">{kpi.suffix}</span>}
                    </div>
                    {kpi.sublabel && <p className="text-[10px] text-accent font-display mt-0.5">{kpi.sublabel}</p>}
                  </div>
                ))}
              </motion.div>

              {/* Dimension Bars (interactive) */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <h3 className="text-[15px] font-semibold tracking-tight text-foreground mb-4">Reputation Dimensions</h3>
                <div className="space-y-3">
                  {Object.entries(rep.dimensions).map(([key, value], i) => {
                    const meta = DIMENSION_META[key];
                    const isSelected = selectedDimension === key;
                    const Icon = meta?.icon || Target;
                    return (
                      <div key={key}>
                        <button
                          onClick={() => setSelectedDimension(isSelected ? null : key)}
                          className="w-full text-left group"
                        >
                          <div className="flex items-center gap-3 mb-1.5">
                            <Icon className={`w-3.5 h-3.5 ${meta?.color || "text-accent"}`} />
                            <span className="text-xs font-display font-medium text-foreground flex-1">{meta?.label || key}</span>
                            <span className="text-sm font-display font-bold text-foreground">{value}</span>
                            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isSelected ? "rotate-180" : ""}`} />
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${value}%` }}
                              transition={{ duration: 0.8, delay: i * 0.08 }}
                              className="h-full rounded-full bg-accent"
                            />
                          </div>
                        </button>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-2 pl-6.5 text-xs text-muted-foreground font-display leading-relaxed">
                                <p>{meta?.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-[10px]">
                                  <span>Percentile: <strong className="text-foreground">Top {100 - value + 5}%</strong></span>
                                  <span>Peer avg: <strong className="text-foreground">
                                    {Math.round(mockPeerReputations.reduce((s, p) => s + p.dimensions[key as keyof typeof p.dimensions], 0) / mockPeerReputations.length)}
                                  </strong></span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Tab Navigation */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <div className="flex items-center gap-1 bg-secondary rounded-xl border border-border p-1 mb-4 overflow-x-auto">
                  {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">{tab.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Radar */}
                {activeTab === "radar" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
                    <h3 className="text-[15px] font-semibold tracking-tight text-foreground mb-4">Dimension Radar</h3>
                    <div className="h-[340px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                          <Radar name="Score" dataKey="value" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--accent))" }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}

                {/* History */}
                {activeTab === "history" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Score Evolution</h3>
                      <span className="text-[10px] font-display text-muted-foreground">12-month view</span>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyWithArea}>
                          <defs>
                            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis domain={[65, 90]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <ReTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                          <Area type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#scoreGrad)" dot={{ r: 3, fill: "hsl(var(--accent))" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}

                {/* Breakdown */}
                {activeTab === "breakdown" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="bg-card rounded-xl border border-border p-5">
                      <h3 className="text-[15px] font-semibold tracking-tight text-foreground mb-4">Contributions by Type</h3>
                      <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={contributionByType} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={100} />
                            <ReTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="hsl(var(--accent))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-5">
                      <h3 className="text-[15px] font-semibold tracking-tight text-foreground mb-3">Dimension Comparison vs Peers</h3>
                      <div className="space-y-2">
                        {Object.entries(rep.dimensions).map(([key, value]) => {
                          const peerAvg = Math.round(mockPeerReputations.reduce((s, p) => s + p.dimensions[key as keyof typeof p.dimensions], 0) / mockPeerReputations.length);
                          const diff = value - peerAvg;
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <span className="text-xs font-display text-muted-foreground w-28">{DIMENSION_META[key]?.label}</span>
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden relative">
                                <div className="h-full bg-accent/30 rounded-full absolute" style={{ width: `${peerAvg}%` }} />
                                <div className="h-full bg-accent rounded-full relative" style={{ width: `${value}%` }} />
                              </div>
                              <span className={`text-[10px] font-display font-bold w-8 text-right ${diff > 0 ? "text-success" : diff < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {diff > 0 ? "+" : ""}{diff}
                              </span>
                            </div>
                          );
                        })}
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-display">
                          <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-accent rounded" /> You</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-accent/30 rounded" /> Peer avg</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SBT Tokens */}
                {activeTab === "tokens" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rep.sbtTokens.map((token, i) => {
                        const cfg = rarityConfig[token.rarity];
                        const isExpanded = expandedToken === token.name;
                        const TokenIcon = cfg.icon;
                        return (
                          <motion.div
                            key={token.name}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`rounded-xl border-2 p-4 cursor-pointer transition-shadow ${cfg.border} ${cfg.bg} ${cfg.glow}`}
                            onClick={() => setExpandedToken(isExpanded ? null : token.name)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <TokenIcon className={`w-4 h-4 ${cfg.text}`} />
                                  <Badge variant="outline" className={`text-[9px] uppercase tracking-wider ${cfg.text}`}>
                                    {token.rarity}
                                  </Badge>
                                </div>
                                <h4 className="font-display font-semibold text-sm text-foreground">{token.name}</h4>
                                <p className="text-[11px] text-muted-foreground font-display mt-1">{token.description}</p>
                              </div>
                              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform flex-shrink-0 mt-1 ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <div className="pt-3 mt-3 border-t border-border/50 space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] font-display text-muted-foreground">
                                      <Clock className="w-3 h-3" /> Earned: {token.earnedDate}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-display text-muted-foreground">
                                      <Shield className="w-3 h-3" /> Non-transferable · Blockchain verified
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-display text-muted-foreground">
                                      <CheckCircle2 className="w-3 h-3" /> Permanently bound to your academic identity
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="bg-card rounded-xl border border-border p-5">
                      <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-1">About Soulbound Tokens</h3>
                          <p className="text-xs text-muted-foreground font-display leading-relaxed">
                            SBTs are non-transferable blockchain credentials permanently bound to your academic identity.
                            They cannot be sold, traded, or gamed — ensuring authentic reputation built on verified contributions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Peer Comparison */}
                {activeTab === "peers" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="bg-card rounded-xl border border-border p-5">
                      <h3 className="text-[15px] font-semibold tracking-tight text-foreground mb-4">Peer Comparison Radar</h3>
                      <div className="h-[360px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={peerRadarData}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                            <Radar name="You" dataKey="You" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.12} strokeWidth={2} />
                            {mockPeerReputations.map((p, i) => (
                              <Radar key={p.initials} name={p.name} dataKey={p.initials}
                                stroke={["hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))"][i]}
                                fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
                            ))}
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3 justify-center">
                        <span className="flex items-center gap-1.5 text-[11px] font-display font-medium">
                          <span className="w-3 h-0.5 bg-accent rounded" /> You
                        </span>
                        {mockPeerReputations.map((p, i) => (
                          <span key={p.initials} className="flex items-center gap-1.5 text-[11px] font-display text-muted-foreground">
                            <span className={`w-3 h-0.5 rounded ${["bg-info", "bg-success", "bg-warning"][i]}`} />
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Peer cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {mockPeerReputations.map((p, i) => (
                        <motion.div key={p.initials} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="bg-card rounded-xl border border-border p-4"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-sm font-display font-bold text-accent">
                              {p.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-display font-semibold text-foreground truncate">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground font-display truncate">{p.institution}</p>
                            </div>
                          </div>
                          <div className="text-center mb-3">
                            <span className="text-xl font-semibold text-foreground">{p.overallScore}</span>
                            <p className="text-[10px] text-muted-foreground font-display uppercase">Overall Score</p>
                          </div>
                          <div className="space-y-1">
                            {Object.entries(p.dimensions).slice(0, 3).map(([k, v]) => (
                              <div key={k} className="flex items-center gap-2">
                                <span className="text-[9px] font-display text-muted-foreground w-16 truncate">{DIMENSION_META[k]?.label}</span>
                                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                                  <div className="h-full bg-accent/50 rounded-full" style={{ width: `${v}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* ─── Sidebar ─── */}
            <div className="space-y-4">
              {/* Quick Score Summary */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h4 className="text-sm font-semibold text-foreground mb-3">Score Summary</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-display">
                    <span className="text-muted-foreground">Current Score</span>
                    <span className="font-bold text-foreground">{rep.overallScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-display">
                    <span className="text-muted-foreground">Month Change</span>
                    <span className={`font-bold ${scoreChange > 0 ? "text-success" : scoreChange < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {scoreChange > 0 ? "+" : ""}{scoreChange}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-display">
                    <span className="text-muted-foreground">12-mo Growth</span>
                    <span className="font-bold text-success">+{yearGrowth}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-display">
                    <span className="text-muted-foreground">Peer Rank</span>
                    <span className="font-bold text-foreground">
                      #{[rep.overallScore, ...mockPeerReputations.map(p => p.overallScore)].sort((a, b) => b - a).indexOf(rep.overallScore) + 1}
                      /{mockPeerReputations.length + 1}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Strongest / Weakest */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h4 className="text-sm font-semibold text-foreground mb-3">Strengths & Growth Areas</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-success/5 border border-success/20">
                    <Zap className="w-4 h-4 text-success" />
                    <div className="min-w-0">
                      <p className="text-xs font-display font-semibold text-foreground">{DIMENSION_META[strongestDim[0]]?.label}</p>
                      <p className="text-[10px] text-muted-foreground font-display">Strongest · {strongestDim[1]}/100</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/5 border border-warning/20">
                    <Target className="w-4 h-4 text-warning" />
                    <div className="min-w-0">
                      <p className="text-xs font-display font-semibold text-foreground">{DIMENSION_META[weakestDim[0]]?.label}</p>
                      <p className="text-[10px] text-muted-foreground font-display">Growth area · {weakestDim[1]}/100</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Latest SBT */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h4 className="text-sm font-semibold text-foreground mb-3">Latest Token</h4>
                {(() => {
                  const latest = rep.sbtTokens[0];
                  const cfg = rarityConfig[latest.rarity];
                  const TokenIcon = cfg.icon;
                  return (
                    <div className={`p-3 rounded-lg border-2 ${cfg.border} ${cfg.bg} ${cfg.glow}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <TokenIcon className={`w-4 h-4 ${cfg.text}`} />
                        <Badge variant="outline" className={`text-[8px] uppercase ${cfg.text}`}>{latest.rarity}</Badge>
                      </div>
                      <p className="text-xs font-display font-semibold text-foreground">{latest.name}</p>
                      <p className="text-[10px] text-muted-foreground font-display mt-0.5">{latest.description}</p>
                      <p className="text-[9px] text-muted-foreground font-display mt-2">Earned {latest.earnedDate}</p>
                    </div>
                  );
                })()}
              </motion.div>

              {/* Recent Contributions */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h4 className="text-sm font-semibold text-foreground mb-3">Top Contributions</h4>
                <div className="space-y-2">
                  {mockContributions.sort((a, b) => b.impactScore - a.impactScore).slice(0, 4).map(c => {
                    const meta = CONTRIBUTION_TYPE_META[c.type as keyof typeof CONTRIBUTION_TYPE_META];
                    return (
                      <div key={c.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                        {(() => { const CtIcon = CONTRIBUTION_ICON_MAP[c.type]; return CtIcon ? <CtIcon className="w-3.5 h-3.5 text-muted-foreground/60 mt-0.5 shrink-0" /> : <BookOpen className="w-3.5 h-3.5 text-muted-foreground/60 mt-0.5 shrink-0" />; })()}
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-display font-medium text-foreground truncate">{c.title}</p>
                          <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-display mt-0.5">
                            <span>Impact: {c.impactScore}</span>
                            <span>·</span>
                            <Badge variant="outline" className={`text-[7px] ${c.anchorStatus === "verified" ? "text-success" : "text-warning"}`}>
                              {c.anchorStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* How Score is Calculated */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h4 className="text-sm font-semibold text-foreground mb-2">How It Works</h4>
                <ul className="space-y-1.5 text-[10px] font-display text-muted-foreground">
                  <li className="flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    <span>6 dimensions weighted by contribution type & peer validation</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    <span>On-chain verification ensures tamper-proof records</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    <span>SBT tokens earned at milestone thresholds</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Scores updated monthly based on verified activity</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default ReputationScore;
