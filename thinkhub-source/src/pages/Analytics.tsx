import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, TrendingUp, Users, BookOpen, Award, ArrowUpRight, ArrowDownRight,
  Globe, Eye, Quote, Target, Download, GitCompare, FileText, Flame,
  Calendar, ChevronDown, Sparkles, Zap, Trophy, Star, ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line
} from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Data ─────────────────────────────────────────────────────────────
const allMonthlyData = [
  { month: "Apr", citations: 8, reads: 220, downloads: 58 },
  { month: "May", citations: 10, reads: 280, downloads: 72 },
  { month: "Jun", citations: 11, reads: 310, downloads: 81 },
  { month: "Jul", citations: 12, reads: 340, downloads: 89 },
  { month: "Aug", citations: 18, reads: 420, downloads: 102 },
  { month: "Sep", citations: 15, reads: 380, downloads: 95 },
  { month: "Oct", citations: 22, reads: 510, downloads: 134 },
  { month: "Nov", citations: 28, reads: 620, downloads: 167 },
  { month: "Dec", citations: 35, reads: 780, downloads: 201 },
  { month: "Jan", citations: 31, reads: 690, downloads: 189 },
  { month: "Feb", citations: 42, reads: 890, downloads: 245 },
  { month: "Mar", citations: 48, reads: 1020, downloads: 278 },
];

const fieldDistribution = [
  { name: "Machine Learning", value: 42, cssVar: "--accent" },
  { name: "Neuroscience", value: 28, cssVar: "--highlight" },
  { name: "Climate Science", value: 15, cssVar: "--success" },
  { name: "Quantum Computing", value: 10, cssVar: "--warning" },
  { name: "Other", value: 5, cssVar: "--muted-foreground" },
];

const collaborationMap = [
  { country: "USA", collaborators: 12, papers: 8, flag: "🇺🇸" },
  { country: "UK", collaborators: 7, papers: 5, flag: "🇬🇧" },
  { country: "Germany", collaborators: 5, papers: 3, flag: "🇩🇪" },
  { country: "Japan", collaborators: 4, papers: 2, flag: "🇯🇵" },
  { country: "Canada", collaborators: 3, papers: 2, flag: "🇨🇦" },
];

const impactRadar = [
  { metric: "Citations", value: 82, fullMark: 100 },
  { metric: "h-index", value: 68, fullMark: 100 },
  { metric: "Downloads", value: 75, fullMark: 100 },
  { metric: "Collaboration", value: 90, fullMark: 100 },
  { metric: "Visibility", value: 85, fullMark: 100 },
  { metric: "Influence", value: 72, fullMark: 100 },
];

const topPapers = [
  { title: "Attention Mechanisms in Multi-Modal Transformers", citations: 142, reads: 3420, trend: "+18%" },
  { title: "CRISPR-Cas13d for Targeted RNA Editing", citations: 67, reads: 1890, trend: "+12%" },
  { title: "Ocean Microplastic Distribution Models", citations: 89, reads: 2100, trend: "+24%" },
  { title: "Federated Learning in Healthcare", citations: 54, reads: 1560, trend: "+9%" },
];

const achievements = [
  { icon: Trophy, label: "h-index crossed 19", time: "This month", color: "text-gold" },
  { icon: FileText, label: "100th citation on LLM paper", time: "2 weeks ago", color: "text-accent" },
  { icon: Globe, label: "5th international collaboration", time: "Last month", color: "text-emerald-brand" },
  { icon: Star, label: "Top 5% in your field", time: "Q1 2026", color: "text-highlight" },
  { icon: Flame, label: "1000+ monthly paper reads", time: "Mar 2026", color: "text-info" },
];

type DateRange = "3m" | "6m" | "9m" | "1y";
type ChartView = "citations" | "engagement" | "distribution" | "radar";

const dateRangeOptions: { value: DateRange; label: string; months: number }[] = [
  { value: "3m", label: "3M", months: 3 },
  { value: "6m", label: "6M", months: 6 },
  { value: "9m", label: "9M", months: 9 },
  { value: "1y", label: "1Y", months: 12 },
];

// ─── Skeleton ─────────────────────────────────────────────────────────
function AnalyticsSkeleton() {
  return (
    <div className="max-w-[1280px] mx-auto">
      <div className="space-y-2 mb-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <Skeleton className="h-[320px] rounded-xl" />
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Tooltip styling ──────────────────────────────────────────────────
const tooltipStyle = {
  fontSize: 11,
  borderRadius: 10,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
  boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.12)",
};

// ─── Main Component ───────────────────────────────────────────────────
const Analytics = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("9m");
  const [comparisonMode, setComparisonMode] = useState(false);
  const [chartView, setChartView] = useState<ChartView>("citations");
  const [hoveredKpi, setHoveredKpi] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const rangeConfig = dateRangeOptions.find(o => o.value === dateRange)!;
  const monthlyData = useMemo(() => allMonthlyData.slice(-rangeConfig.months), [dateRange]);

  const prevPeriodData = useMemo(() => {
    const endIdx = allMonthlyData.length - rangeConfig.months;
    const startIdx = Math.max(0, endIdx - rangeConfig.months);
    return allMonthlyData.slice(startIdx, endIdx);
  }, [dateRange]);

  // Computed summaries
  const totals = useMemo(() => ({
    citations: monthlyData.reduce((s, d) => s + d.citations, 0),
    reads: monthlyData.reduce((s, d) => s + d.reads, 0),
    downloads: monthlyData.reduce((s, d) => s + d.downloads, 0),
  }), [monthlyData]);

  const handleChartClick = (data: any) => {
    if (data?.activePayload?.[0]) {
      const p = data.activePayload[0].payload;
      toast.info(`${p.month}: ${p.citations} citations, ${p.reads} reads, ${p.downloads} downloads`);
    }
  };

  const handleExportReport = () => {
    toast.success("Generating report...");
    setTimeout(() => {
      const content = `SciConnect Analytics Report\nGenerated: ${new Date().toLocaleDateString()}\nPeriod: ${rangeConfig.label}\n\n${kpis.map(k => `${k.label}: ${k.value} (${k.change})`).join('\n')}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded!");
    }, 600);
  };

  const kpis = [
    { label: "Citations", value: user.stats.citations.toLocaleString(), change: "+28%", up: true, icon: Quote, color: "text-accent", bgColor: "bg-accent/8" },
    { label: "h-index", value: String(user.stats.hIndex), change: "+2", up: true, icon: Award, color: "text-gold", bgColor: "bg-gold/8" },
    { label: "Reads", value: "14.2K", change: "+34%", up: true, icon: Eye, color: "text-emerald-brand", bgColor: "bg-emerald/8" },
    { label: "Downloads", value: "1.5K", change: "+22%", up: true, icon: Download, color: "text-info", bgColor: "bg-info/8" },
    { label: "Publications", value: String(user.stats.publications), change: "+3", up: true, icon: BookOpen, color: "text-foreground", bgColor: "bg-secondary" },
    { label: "Rank", value: "#847", change: "↑124", up: true, icon: Globe, color: "text-highlight", bgColor: "bg-highlight/8" },
  ];

  const chartTabs: { value: ChartView; label: string; icon: React.ElementType }[] = [
    { value: "citations", label: "Citations", icon: TrendingUp },
    { value: "engagement", label: "Engagement", icon: BarChart3 },
    { value: "distribution", label: "Fields", icon: Target },
    { value: "radar", label: "Impact Radar", icon: Sparkles },
  ];

  if (isLoading) {
    return <AppLayout><AnalyticsSkeleton /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-[1280px] mx-auto">
        {/* ── Header ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Analytics
              </h1>
              <p className="text-xs text-muted-foreground font-display mt-1">
                Impact metrics · Trends · Collaboration insights
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleExportReport}
                className="h-8 px-3 rounded-lg text-xs font-display font-medium flex items-center gap-1.5 border bg-card border-border text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button onClick={() => setComparisonMode(!comparisonMode)}
                className={`h-8 px-3 rounded-lg text-xs font-display font-medium flex items-center gap-1.5 border transition-colors ${
                  comparisonMode ? "bg-accent/10 border-accent/40 text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}>
                <GitCompare className="w-3.5 h-3.5" /> Compare
              </button>
              <div className="flex items-center bg-card border border-border rounded-lg p-0.5">
                {dateRangeOptions.map(opt => (
                  <button key={opt.value} onClick={() => setDateRange(opt.value)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-display font-medium transition-all ${
                      dateRange === opt.value ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── KPI Strip ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="grid grid-cols-3 md:grid-cols-6 gap-2.5 mb-6">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              onMouseEnter={() => setHoveredKpi(i)} onMouseLeave={() => setHoveredKpi(null)}
              className="card-interactive p-3 text-center relative overflow-hidden group cursor-default">
              <div className={`w-8 h-8 rounded-lg ${kpi.bgColor} flex items-center justify-center mx-auto mb-1.5 transition-transform group-hover:scale-110`}>
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <p className={`text-lg font-display font-bold ${kpi.color} leading-tight`}>{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground font-display mt-0.5 uppercase tracking-wider">{kpi.label}</p>
              <div className={`flex items-center justify-center gap-0.5 mt-1 text-[10px] font-mono font-medium ${kpi.up ? "text-success" : "text-destructive"}`}>
                {kpi.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                {kpi.change}
              </div>
              {/* Hover sparkline hint */}
              <AnimatePresence>
                {hoveredKpi === i && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <div className="w-[80%] h-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData.slice(-5)}>
                          <Line type="monotone" dataKey={i < 1 ? "citations" : i < 3 ? "reads" : "downloads"}
                            stroke={`hsl(var(${i === 0 ? "--accent" : i === 1 ? "--gold" : "--success"}))`}
                            strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main Content: Two-column ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* ── Left: Charts ────────────────────────── */}
          <div className="space-y-5">
            {/* Chart Card with tabs */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Tab strip */}
              <div className="flex items-center gap-1 px-4 pt-4 pb-2 border-b border-border/50 overflow-x-auto">
                {chartTabs.map(tab => (
                  <button key={tab.value} onClick={() => setChartView(tab.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all whitespace-nowrap ${
                      chartView === tab.value
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}>
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                  </button>
                ))}
                {comparisonMode && (
                  <Badge variant="outline" className="ml-auto text-[10px] border-accent/30 text-accent">
                    vs prev period
                  </Badge>
                )}
              </div>

              {/* Chart Area */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {chartView === "citations" && (
                    <motion.div key="citations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={monthlyData} onClick={handleChartClick} style={{ cursor: "pointer" }}>
                          <defs>
                            <linearGradient id="citGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="citGradPrev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
                          <RechartsTooltip contentStyle={tooltipStyle} />
                          <Area type="monotone" dataKey="citations" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#citGrad)" dot={{ r: 3, fill: "hsl(var(--accent))", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }} />
                          {comparisonMode && prevPeriodData.length > 0 && (
                            <Area type="monotone" data={prevPeriodData} dataKey="citations" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="5 5" fill="url(#citGradPrev)" />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex items-center justify-between mt-2 px-1">
                        <p className="text-[10px] text-muted-foreground font-display">
                          Total: <span className="font-medium text-foreground">{totals.citations}</span> citations in {rangeConfig.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-display">Click any point for details</p>
                      </div>
                    </motion.div>
                  )}

                  {chartView === "engagement" && (
                    <motion.div key="engagement" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyData} barGap={3} onClick={handleChartClick} style={{ cursor: "pointer" }}>
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} />
                          <RechartsTooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="reads" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Reads" />
                          <Bar dataKey="downloads" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} name="Downloads" />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="flex items-center gap-4 mt-2 px-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
                          <span className="text-[10px] text-muted-foreground font-display">Reads ({totals.reads.toLocaleString()})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "hsl(var(--gold))" }} />
                          <span className="text-[10px] text-muted-foreground font-display">Downloads ({totals.downloads.toLocaleString()})</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {chartView === "distribution" && (
                    <motion.div key="distribution" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="flex items-start gap-6">
                        <ResponsiveContainer width={200} height={200}>
                          <PieChart>
                            <Pie data={fieldDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value"
                              stroke="hsl(var(--background))" strokeWidth={2}>
                              {fieldDistribution.map((entry, i) => (
                                <Cell key={i} fill={`hsl(var(${entry.cssVar}))`} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-3 pt-2">
                          {fieldDistribution.map((f, i) => (
                            <div key={f.name} className="group">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: `hsl(var(${f.cssVar}))` }} />
                                  <span className="text-xs font-display text-foreground">{f.name}</span>
                                </div>
                                <span className="text-xs font-mono font-medium text-foreground">{f.value}%</span>
                              </div>
                              <div className="h-1.5 bg-secondary rounded-full overflow-hidden ml-[18px]">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${f.value}%` }}
                                  transition={{ duration: 0.8, delay: 0.1 + i * 0.08 }}
                                  className="h-full rounded-full" style={{ background: `hsl(var(${f.cssVar}))` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {chartView === "radar" && (
                    <motion.div key="radar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-center">
                      <ResponsiveContainer width={340} height={280}>
                        <RadarChart data={impactRadar}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                          <Radar name="Impact" dataKey="value" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Global Collaborations */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-accent" />
                  Global Collaborations
                </h3>
                <span className="text-[10px] text-muted-foreground font-display">
                  {collaborationMap.reduce((s, c) => s + c.collaborators, 0)} total collaborators
                </span>
              </div>
              <div className="space-y-3">
                {collaborationMap.map((country, i) => (
                  <div key={country.country} className="flex items-center gap-3 group">
                    <span className="text-sm">{country.flag}</span>
                    <span className="text-xs font-display font-medium text-foreground w-16">{country.country}</span>
                    <div className="flex-1">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(country.collaborators / 12) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                          className="h-full rounded-full bg-accent group-hover:bg-highlight transition-colors"
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <span className="text-xs font-display font-semibold text-foreground">{country.collaborators}</span>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">{country.papers} papers</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right: Sidebar Widgets ──────────────── */}
          <div className="space-y-4">
            {/* Top Papers */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display font-semibold text-xs text-foreground mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-3 h-3 text-warning" />
                Top Papers
              </h3>
              <div className="space-y-2.5">
                {topPapers.map((paper, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground mt-0.5 w-4 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-display font-medium text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                          {paper.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-muted-foreground">{paper.citations} cit.</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{paper.reads} reads</span>
                          <span className="text-[10px] font-mono text-success">{paper.trend}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display font-semibold text-xs text-foreground mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-3 h-3 text-gold" />
                Achievements
              </h3>
              <div className="space-y-2.5">
                {achievements.map((a, i) => (
                  <motion.div key={a.label}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="flex items-start gap-2.5">
                    <div className={`w-6 h-6 rounded-md bg-secondary/60 flex items-center justify-center shrink-0`}>
                      <a.icon className={`w-3 h-3 ${a.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-display font-medium text-foreground leading-snug">{a.label}</p>
                      <p className="text-[10px] text-muted-foreground font-display">{a.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Period Summary */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
              className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display font-semibold text-xs text-foreground mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                Period Summary
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Avg. Citations/mo", value: (totals.citations / rangeConfig.months).toFixed(1) },
                  { label: "Avg. Reads/mo", value: Math.round(totals.reads / rangeConfig.months).toLocaleString() },
                  { label: "Peak Month", value: monthlyData.reduce((max, d) => d.citations > max.citations ? d : max, monthlyData[0]).month },
                  { label: "Growth Rate", value: "+28%" },
                ].map(stat => (
                  <div key={stat.label} className="p-2 rounded-lg bg-secondary/40">
                    <p className="text-sm font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground font-display mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display font-semibold text-xs text-foreground mb-3 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="space-y-1.5">
                {[
                  { label: "Share Analytics", icon: ExternalLink },
                  { label: "Schedule Report", icon: Calendar },
                  { label: "Export CSV", icon: Download },
                ].map(action => (
                  <button key={action.label}
                    onClick={() => toast.info(`${action.label} — coming soon`)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-display text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors text-left">
                    <action.icon className="w-3 h-3" />
                    {action.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Analytics;
