import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Award, BookOpen, Eye, Quote, Medal, Globe, Users, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import CitationGraph from "@/components/impact/CitationGraph";
import AIRecommendations from "@/components/impact/AIRecommendations";

const peerComparison = [
  { label: "Your Institution",  rank: 3,  total: 28,  color: "text-gold",         bg: "gradient-gold" },
  { label: "Your Field (ML)",   rank: 12, total: 450, color: "text-accent",       bg: "bg-accent" },
  { label: "Global (All Fields)",rank: 847,total: 120000, color: "text-emerald-brand", bg: "bg-emerald-brand" },
];

const topPapers = [
  { title: "Attention Mechanisms in Transformer Architectures", journal: "Nature MI", citations: 142, reads: "14.2K", growth: "+28%" },
  { title: "CRISPR-Cas13d Enables Programmable RNA Editing",    journal: "Cell",      citations: 67,  reads: "8.1K",  growth: "+12%" },
  { title: "Global Ocean Microplastic Distribution Dataset",   journal: "Sci. Data", citations: 89,  reads: "11.3K", growth: "+19%" },
];

const citationData = [
  { year: "2020", citations: 45 },
  { year: "2021", citations: 120 },
  { year: "2022", citations: 310 },
  { year: "2023", citations: 580 },
  { year: "2024", citations: 890 },
  { year: "2025", citations: 1420 },
  { year: "2026", citations: 2891 },
];

const monthlyReads = [
  { month: "Sep", reads: 120 },
  { month: "Oct", reads: 180 },
  { month: "Nov", reads: 210 },
  { month: "Dec", reads: 340 },
  { month: "Jan", reads: 290 },
  { month: "Feb", reads: 410 },
  { month: "Mar", reads: 520 },
];

const timeRanges = ["All Time", "This Year", "6 Months", "30 Days"] as const;

const Impact = () => {
  const { user } = useAuth();
  const [range, setRange] = useState(0);

  const metrics = [
    { label: "h-index", value: String(user.stats.hIndex), icon: Award, description: `Based on ${user.stats.publications} publications`, color: "text-gold" },
    { label: "i10-index", value: "12", icon: BarChart3, description: "Papers with 10+ citations", color: "text-foreground" },
    { label: "Total Citations", value: user.stats.citations.toLocaleString(), icon: Quote, description: "+342 this month", color: "text-gold" },
    { label: "Total Reads", value: "34.2K", icon: Eye, description: "+2.1K this month", color: "text-emerald-brand" },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground mb-1">Impact Dashboard</h1>
          <p className="text-muted-foreground font-display mb-4">Track your research impact, citation metrics, and readership analytics.</p>
          <div className="flex gap-1 mb-8">
            {timeRanges.map((label, i) => (
              <button
                key={label}
                onClick={() => setRange(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                  i === range
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <m.icon className={`w-5 h-5 mb-3 ${m.color}`} />
              <p className={`text-xl font-semibold ${m.color}`}>{m.value}</p>
              <p className="text-[12px] font-display font-medium text-foreground mt-1">{m.label}</p>
              <p className="text-[11px] text-muted-foreground">{m.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-gold" />
              <h3 className="font-display text-[15px] font-semibold text-foreground">Citation Growth</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={citationData}>
                <defs>
                  <linearGradient id="citGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(40, 90%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(40, 90%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 88%)" />
                <XAxis dataKey="year" tick={{ fontSize: 13, fontFamily: "Space Grotesk" }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 13, fontFamily: "Space Grotesk" }} stroke="hsl(220, 10%, 46%)" />
                <Tooltip contentStyle={{ fontFamily: "Space Grotesk", borderRadius: 8, border: "1px solid hsl(220, 16%, 88%)", fontSize: "13px" }} />
                <Area type="monotone" dataKey="citations" stroke="hsl(40, 90%, 50%)" fillOpacity={1} fill="url(#citGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-4 h-4 text-emerald-brand" />
              <h3 className="font-display text-[15px] font-semibold text-foreground">Monthly Reads</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyReads}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 13, fontFamily: "Space Grotesk" }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 13, fontFamily: "Space Grotesk" }} stroke="hsl(220, 10%, 46%)" />
                <Tooltip contentStyle={{ fontFamily: "Space Grotesk", borderRadius: 8, border: "1px solid hsl(220, 16%, 88%)", fontSize: "13px" }} />
                <Bar dataKey="reads" fill="hsl(160, 60%, 40%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Peer Comparison + Top Papers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peer Ranking */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Medal className="w-4 h-4 text-gold" />
              <h3 className="font-display text-[15px] font-semibold text-foreground">Peer Ranking</h3>
            </div>
            <div className="space-y-4">
              {peerComparison.map((p, i) => (
                <div key={p.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {i === 0 ? <Users className="w-3.5 h-3.5 text-muted-foreground" /> :
                       i === 1 ? <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" /> :
                       <Globe className="w-3.5 h-3.5 text-muted-foreground" />}
                      <span className="text-[13px] font-display text-foreground">{p.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-display">of {p.total.toLocaleString()}</span>
                      <span className={`text-[14px] font-display font-bold ${p.color}`}>#{p.rank}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, ((p.total - p.rank) / p.total) * 100)}%` }}
                      transition={{ duration: 0.9, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                      className={`h-full rounded-full ${p.bg}`}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 font-display">
                    Top {((p.rank / p.total) * 100).toFixed(1)}% of researchers
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Performing Papers */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-4 h-4 text-accent" />
              <h3 className="font-display text-[15px] font-semibold text-foreground">Top Performing Papers</h3>
            </div>
            <div className="space-y-4">
              {topPapers.map((paper, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-display font-bold ${
                    i === 0 ? "gradient-gold text-accent-foreground" :
                    i === 1 ? "bg-accent/10 text-accent" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-display font-medium text-foreground leading-snug truncate">{paper.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{paper.journal}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] font-display text-muted-foreground">
                        <span className="text-foreground font-medium">{paper.citations}</span> citations
                      </span>
                      <span className="text-[11px] font-display text-muted-foreground">
                        <span className="text-foreground font-medium">{paper.reads}</span> reads
                      </span>
                      <span className="text-[11px] font-mono text-emerald-brand flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />{paper.growth}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Citation Graph */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-8">
          <CitationGraph />
        </motion.div>

        {/* AI Recommendations */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6">
          <AIRecommendations />
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Impact;
