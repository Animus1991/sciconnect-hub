import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Award, BookOpen, Eye, Quote } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

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

const metrics = [
  { label: "h-index", value: "18", icon: Award, description: "Based on 24 publications", color: "text-gold" },
  { label: "i10-index", value: "12", icon: BarChart3, description: "Papers with 10+ citations", color: "text-foreground" },
  { label: "Total Citations", value: "2,891", icon: Quote, description: "+342 this month", color: "text-gold" },
  { label: "Total Reads", value: "34.2K", icon: Eye, description: "+2.1K this month", color: "text-emerald-brand" },
];

const Impact = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Impact Dashboard</h1>
          <p className="text-muted-foreground font-display mb-8">Track your research impact, citation metrics, and readership analytics.</p>
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
              <p className={`text-3xl font-display font-bold ${m.color}`}>{m.value}</p>
              <p className="text-sm font-display font-medium text-foreground mt-1">{m.label}</p>
              <p className="text-[11px] text-muted-foreground">{m.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-gold" />
              <h3 className="font-display font-semibold text-foreground">Citation Growth</h3>
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
                <XAxis dataKey="year" tick={{ fontSize: 12, fontFamily: "Space Grotesk" }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12, fontFamily: "Space Grotesk" }} stroke="hsl(220, 10%, 46%)" />
                <Tooltip contentStyle={{ fontFamily: "Space Grotesk", borderRadius: 8, border: "1px solid hsl(220, 16%, 88%)" }} />
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
              <h3 className="font-display font-semibold text-foreground">Monthly Reads</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyReads}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: "Space Grotesk" }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12, fontFamily: "Space Grotesk" }} stroke="hsl(220, 10%, 46%)" />
                <Tooltip contentStyle={{ fontFamily: "Space Grotesk", borderRadius: 8, border: "1px solid hsl(220, 16%, 88%)" }} />
                <Bar dataKey="reads" fill="hsl(160, 60%, 40%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Impact;
