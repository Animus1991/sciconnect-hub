import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, BookOpen, Award, ArrowUpRight, ArrowDownRight, Globe, Eye, Quote, Target, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/hooks/use-auth";

const monthlyData = [
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
  { name: "Machine Learning", value: 42, color: "#8b5cf6" },
  { name: "Neuroscience", value: 28, color: "#ec4899" },
  { name: "Climate Science", value: 15, color: "#10b981" },
  { name: "Quantum Computing", value: 10, color: "#f59e0b" },
  { name: "Other", value: 5, color: "#6b7280" },
];

const collaborationMap = [
  { country: "USA", collaborators: 12, papers: 8 },
  { country: "UK", collaborators: 7, papers: 5 },
  { country: "Germany", collaborators: 5, papers: 3 },
  { country: "Japan", collaborators: 4, papers: 2 },
  { country: "Canada", collaborators: 3, papers: 2 },
];

const Analytics = () => {
  const { user } = useAuth();

  const kpis = [
    { label: "Total Citations", value: user.stats.citations.toLocaleString(), change: "+28%", up: true, icon: Quote, color: "text-accent" },
    { label: "h-index", value: String(user.stats.hIndex), change: "+2", up: true, icon: Award, color: "text-gold" },
    { label: "Paper Reads", value: "14.2K", change: "+34%", up: true, icon: Eye, color: "text-emerald-brand" },
    { label: "Collaborators", value: "31", change: "+5", up: true, icon: Users, color: "text-blue-400" },
    { label: "Publications", value: String(user.stats.publications), change: "+3", up: true, icon: BookOpen, color: "text-foreground" },
    { label: "Global Rank", value: "#847", change: "-124", up: true, icon: Globe, color: "text-violet-400" },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Research performance metrics, impact trends, and collaboration insights
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-display text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" /> Last 9 months
            </Badge>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
              className="bg-card rounded-xl border border-border p-4 hover:shadow-scholarly transition-shadow">
              <kpi.icon className={`w-4 h-4 mb-2 ${kpi.color}`} />
              <p className={`text-xl font-display font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider mt-0.5">{kpi.label}</p>
              <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-mono font-medium ${kpi.up ? "text-emerald-brand" : "text-red-400"}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Citation Trend */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-sm text-foreground">Citation Growth</h3>
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="citGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Area type="monotone" dataKey="citations" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#citGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Reads & Downloads */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-sm text-foreground">Reads & Downloads</h3>
              <BarChart3 className="w-4 h-4 text-gold" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barGap={2}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="reads" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="downloads" fill="hsl(40, 90%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Field Distribution */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Research Focus Distribution</h3>
            <div className="flex items-center justify-center mb-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={fieldDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {fieldDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {fieldDistribution.map(f => (
                <div key={f.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: f.color }} />
                  <span className="text-xs font-display text-foreground flex-1">{f.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{f.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Collaboration Map */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-accent" /> Global Collaborations
            </h3>
            <div className="space-y-3">
              {collaborationMap.map((country, i) => (
                <div key={country.country} className="flex items-center gap-3">
                  <span className="text-sm font-display font-medium text-foreground w-16">{country.country}</span>
                  <div className="flex-1">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(country.collaborators / 12) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.08, ease: "easeOut" }}
                        className="h-full rounded-full bg-accent"
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-display font-semibold text-foreground">{country.collaborators}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">({country.papers} papers)</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Research Milestones Summary */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-gold" /> Recent Achievements
            </h3>
            <div className="space-y-3">
              {[
                { icon: "🏆", label: "h-index crossed 19", time: "This month", color: "text-gold" },
                { icon: "📄", label: "100th citation on LLM paper", time: "2 weeks ago", color: "text-accent" },
                { icon: "🌍", label: "5th international collaboration", time: "Last month", color: "text-emerald-brand" },
                { icon: "⭐", label: "Top 5% in your field", time: "Q1 2026", color: "text-violet-400" },
                { icon: "📊", label: "1000+ monthly paper reads", time: "Mar 2026", color: "text-blue-400" },
              ].map(achievement => (
                <div key={achievement.label} className="flex items-start gap-3">
                  <span className="text-base mt-0.5">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-display font-medium ${achievement.color}`}>{achievement.label}</p>
                    <p className="text-[10px] text-muted-foreground font-display">{achievement.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Analytics;
