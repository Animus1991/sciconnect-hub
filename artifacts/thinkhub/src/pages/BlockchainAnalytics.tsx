/**
 * Blockchain Analytics Dashboard
 * Charts for verified vs pending contributions, SBT distribution, audit trail timeline
 */
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, ShieldCheck, Clock, TrendingUp, Award, Sparkles, Hash,
  BarChart3, PieChart, Activity, ArrowRight, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell,
  AreaChart, Area, Legend
} from "recharts";
import {
  mockContributions, mockReputation, mockBounties, mockBlindReviews,
  CONTRIBUTION_TYPE_META
} from "@/data/blockchainMockData";
import { mockHash } from "@/lib/blockchain-utils";

// ─── Derived Data ────────────────────────────────────────────────────────────
const statusData = [
  { name: "Verified", value: mockContributions.filter(c => c.anchorStatus === "verified").length, fill: "hsl(var(--success))" },
  { name: "Anchored", value: mockContributions.filter(c => c.anchorStatus === "anchored").length, fill: "hsl(var(--info))" },
  { name: "Pending", value: mockContributions.filter(c => c.anchorStatus === "pending").length, fill: "hsl(var(--warning))" },
];

const contributionsByType = Object.entries(
  mockContributions.reduce<Record<string, { total: number; verified: number }>>((acc, c) => {
    if (!acc[c.type]) acc[c.type] = { total: 0, verified: 0 };
    acc[c.type].total++;
    if (c.anchorStatus === "verified") acc[c.type].verified++;
    return acc;
  }, {})
).map(([type, data]) => ({
  type: CONTRIBUTION_TYPE_META[type as keyof typeof CONTRIBUTION_TYPE_META]?.label || type,
  ...data,
}));

const sbtDistribution = [
  { name: "Common", value: mockReputation.sbtTokens.filter(t => t.rarity === "common").length, fill: "hsl(var(--muted-foreground))" },
  { name: "Rare", value: mockReputation.sbtTokens.filter(t => t.rarity === "rare").length, fill: "hsl(var(--info))" },
  { name: "Legendary", value: mockReputation.sbtTokens.filter(t => t.rarity === "legendary").length, fill: "hsl(var(--gold))" },
];

const auditTimeline = [
  { date: "Jan '26", entries: 12, verifications: 8 },
  { date: "Feb '26", entries: 18, verifications: 14 },
  { date: "Mar '26", entries: 24, verifications: 19 },
  { date: "Apr '26", entries: 15, verifications: 11 },
  { date: "May '26", entries: 28, verifications: 22 },
  { date: "Jun '26", entries: 32, verifications: 27 },
];

const reputationHistory = mockReputation.history;

// ─── Component ───────────────────────────────────────────────────────────────
export default function BlockchainAnalytics() {
  const totalAnchored = mockContributions.filter(c => c.anchorStatus !== "pending").length;
  const verificationRate = Math.round((statusData[0].value / mockContributions.length) * 100);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-[27px] font-bold text-foreground">Blockchain Analytics</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                On-chain verification metrics, SBT distribution, and audit trail insights
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/blockchain">
                <Badge variant="outline" className="text-xs font-display gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-secondary transition-colors">
                  <Shield className="w-3.5 h-3.5 text-accent" /> Dashboard <ArrowRight className="w-3 h-3" />
                </Badge>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Total Contributions", value: mockContributions.length, icon: Hash, color: "text-foreground" },
            { label: "On-Chain Verified", value: statusData[0].value, icon: ShieldCheck, color: "text-success" },
            { label: "Verification Rate", value: `${verificationRate}%`, icon: TrendingUp, color: "text-accent" },
            { label: "SBT Tokens", value: mockReputation.sbtTokens.length, icon: Award, color: "text-gold" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <s.icon className={`w-4 h-4 mb-2 ${s.color}`} />
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <Tabs defaultValue="contributions" className="space-y-4">
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="contributions" className="font-display text-xs gap-1"><BarChart3 className="w-3 h-3" /> Contributions</TabsTrigger>
            <TabsTrigger value="sbt" className="font-display text-xs gap-1"><Sparkles className="w-3 h-3" /> SBT Distribution</TabsTrigger>
            <TabsTrigger value="audit" className="font-display text-xs gap-1"><Activity className="w-3 h-3" /> Audit Timeline</TabsTrigger>
            <TabsTrigger value="reputation" className="font-display text-xs gap-1"><TrendingUp className="w-3 h-3" /> Reputation</TabsTrigger>
          </TabsList>

          {/* Contributions Tab */}
          <TabsContent value="contributions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Verified vs Pending Pie */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-serif text-sm font-semibold text-foreground mb-4">Verification Status</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RPieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="hsl(var(--background))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </RPieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* By Type Bar */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-serif text-sm font-semibold text-foreground mb-4">Contributions by Type</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={contributionsByType} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="type" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="total" fill="hsl(var(--accent)/0.3)" radius={[4, 4, 0, 0]} name="Total" />
                    <Bar dataKey="verified" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Verified" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </TabsContent>

          {/* SBT Tab */}
          <TabsContent value="sbt">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-serif text-sm font-semibold text-foreground mb-4">SBT Rarity Distribution</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RPieChart>
                    <Pie data={sbtDistribution} cx="50%" cy="50%" outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {sbtDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="hsl(var(--background))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  </RPieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* SBT List */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-serif text-sm font-semibold text-foreground mb-4">Your Soulbound Tokens</h3>
                <div className="space-y-2.5">
                  {mockReputation.sbtTokens.map((token, i) => {
                    const rarityColors = { common: "text-muted-foreground", rare: "text-info", legendary: "text-gold" };
                    return (
                      <motion.div
                        key={token.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border hover:border-accent/20 transition-colors"
                      >
                        <Sparkles className={`w-4 h-4 ${rarityColors[token.rarity]} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-display font-semibold text-foreground">{token.name}</p>
                          <p className="text-[10px] text-muted-foreground font-display">{token.description}</p>
                        </div>
                        <Badge variant="outline" className={`text-[9px] ${rarityColors[token.rarity]}`}>
                          {token.rarity}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Audit Timeline Tab */}
          <TabsContent value="audit">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif text-sm font-semibold text-foreground mb-4">Audit Trail Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={auditTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="entries" stroke="hsl(var(--accent))" fill="hsl(var(--accent)/0.15)" strokeWidth={2} name="Total Entries" />
                  <Area type="monotone" dataKey="verifications" stroke="hsl(var(--success))" fill="hsl(var(--success)/0.1)" strokeWidth={2} name="Verified" />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>

          {/* Reputation Tab */}
          <TabsContent value="reputation">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif text-sm font-semibold text-foreground mb-4">Reputation Score Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={reputationHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--gold))" fill="hsl(var(--gold)/0.15)" strokeWidth={2} name="Score" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Recent Verified Contributions */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-6 bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-sm font-semibold text-foreground">Recently Verified</h3>
            <Link to="/contributions" className="text-[10px] font-display text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {mockContributions.filter(c => c.anchorStatus === "verified").slice(0, 5).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.03 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-display font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground font-display">{c.author.name} · {c.field}</p>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground/50">{c.hashDigest.slice(0, 10)}…</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
