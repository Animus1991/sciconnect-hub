import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, TrendingUp, Star, Shield, Users, Sparkles } from "lucide-react";
import { mockReputation, mockPeerReputations } from "@/data/blockchainMockData";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const dimensionLabels: Record<string, string> = {
  originality: "Originality",
  rigor: "Rigor",
  generosity: "Generosity",
  reproducibility: "Reproducibility",
  mentorship: "Mentorship",
  collaboration: "Collaboration",
};

const rarityColors: Record<string, string> = {
  common: "border-border text-muted-foreground",
  rare: "border-accent/40 text-accent bg-accent/5",
  legendary: "border-gold/40 text-gold bg-gold/5",
};

const ReputationScore = () => {
  const rep = mockReputation;

  const radarData = useMemo(() =>
    Object.entries(rep.dimensions).map(([key, value]) => ({
      dimension: dimensionLabels[key] || key,
      value,
      fullMark: 100,
    }))
  , [rep]);

  const peerRadarData = useMemo(() => {
    const dims = Object.keys(rep.dimensions);
    return dims.map(key => {
      const entry: Record<string, string | number> = { dimension: dimensionLabels[key] || key };
      entry["You"] = rep.dimensions[key as keyof typeof rep.dimensions];
      mockPeerReputations.forEach(p => {
        entry[p.initials] = p.dimensions[key as keyof typeof p.dimensions];
      });
      return entry;
    });
  }, [rep]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Reputation Score</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Multi-dimensional academic reputation beyond the h-index
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-display gap-1.5 px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-accent" />
              Soulbound Token Protocol
            </Badge>
          </div>
        </motion.div>

        {/* Profile + Overall Score */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card rounded-xl border border-border p-6 mb-6"
        >
          <div className="flex items-center gap-5 flex-wrap">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-xl font-display font-bold text-accent">
              {rep.initials}
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="font-serif text-lg font-bold text-foreground">{rep.name}</h2>
              <p className="text-xs text-muted-foreground font-display">{rep.institution}</p>
              <div className="flex items-center gap-4 mt-2 text-xs font-display text-muted-foreground">
                <span>h-index: <strong className="text-foreground">{rep.hIndex}</strong></span>
                <span>Contributions: <strong className="text-foreground">{rep.totalContributions}</strong></span>
              </div>
            </div>
            <div className="text-center">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="6"
                    strokeDasharray={`${rep.overallScore * 2.64} 264`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-display font-bold text-foreground">{rep.overallScore}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-display mt-1 uppercase tracking-wider">Overall Score</p>
            </div>
          </div>
        </motion.div>

        {/* Dimension Bars */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"
        >
          {Object.entries(rep.dimensions).map(([key, value]) => (
            <div key={key} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-display font-medium text-foreground">{dimensionLabels[key]}</span>
                <span className="text-sm font-display font-bold text-foreground">{value}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full bg-accent"
                />
              </div>
            </div>
          ))}
        </motion.div>

        <Tabs defaultValue="radar">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="radar" className="font-display text-sm">Radar Analysis</TabsTrigger>
            <TabsTrigger value="history" className="font-display text-sm">Score History</TabsTrigger>
            <TabsTrigger value="tokens" className="font-display text-sm">Soulbound Tokens</TabsTrigger>
            <TabsTrigger value="peers" className="font-display text-sm">Peer Comparison</TabsTrigger>
          </TabsList>

          {/* Radar */}
          <TabsContent value="radar">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif text-base font-semibold text-foreground mb-4">Dimension Radar</h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif text-base font-semibold text-foreground mb-4">Score Evolution</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rep.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--accent))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* SBTs */}
          <TabsContent value="tokens" className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rep.sbtTokens.map((token, i) => (
                <motion.div
                  key={token.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border-2 p-4 ${rarityColors[token.rarity]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {token.rarity === "legendary" ? <Sparkles className="w-4 h-4" /> : token.rarity === "rare" ? <Star className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                          {token.rarity}
                        </Badge>
                      </div>
                      <h4 className="font-display font-semibold text-sm text-foreground">{token.name}</h4>
                      <p className="text-[11px] text-muted-foreground font-display mt-1">{token.description}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-display mt-2">Earned: {token.earnedDate}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif text-sm font-semibold text-foreground mb-2">About Soulbound Tokens (SBTs)</h3>
              <p className="text-xs text-muted-foreground font-display leading-relaxed">
                Soulbound Tokens are non-transferable blockchain credentials that represent verified academic achievements. 
                Unlike traditional tokens, SBTs cannot be sold or traded — they are permanently bound to your academic identity, 
                ensuring authentic reputation that cannot be bought or gamed.
              </p>
            </div>
          </TabsContent>

          {/* Peer Comparison */}
          <TabsContent value="peers">
            <div className="bg-card rounded-xl border border-border p-5 mb-4">
              <h3 className="font-serif text-base font-semibold text-foreground mb-4">Peer Comparison Radar</h3>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={peerRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar name="You" dataKey="You" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} strokeWidth={2} />
                    {mockPeerReputations.map((p, i) => (
                      <Radar key={p.initials} name={p.name} dataKey={p.initials}
                        stroke={["hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))"][i]}
                        fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-3 justify-center">
                <span className="flex items-center gap-1.5 text-[11px] font-display">
                  <span className="w-3 h-0.5 bg-accent rounded" /> You
                </span>
                {mockPeerReputations.map((p, i) => (
                  <span key={p.initials} className="flex items-center gap-1.5 text-[11px] font-display text-muted-foreground">
                    <span className={`w-3 h-0.5 rounded ${["bg-info", "bg-success", "bg-warning"][i]}`} style={{ borderTop: "2px dashed" }} />
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
                    <div>
                      <p className="text-sm font-display font-semibold text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-display">{p.institution}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-display font-bold text-foreground">{p.overallScore}</span>
                    <p className="text-[10px] text-muted-foreground font-display uppercase">Overall Score</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReputationScore;
