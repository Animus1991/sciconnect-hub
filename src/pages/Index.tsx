import AppLayout from "@/components/layout/AppLayout";
import ResearchCard from "@/components/feed/ResearchCard";
import TrendingTopics from "@/components/feed/TrendingTopics";
import QuickStats from "@/components/feed/QuickStats";
import { mockPapers } from "@/data/mockData";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Feed */}
        <div className="space-y-5">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-scholarly rounded-xl p-6 text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,hsl(40_90%_50%),transparent_60%)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <span className="text-xs font-display font-semibold tracking-wider uppercase text-gold">
                  AI-Powered Recommendations
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold mb-1">Good morning, Dr. Researcher</h2>
              <p className="text-sm opacity-80 font-display">
                12 new papers match your interests · 3 collaboration requests · 2 peer review invitations
              </p>
            </div>
          </motion.div>

          {/* Feed Tabs */}
          <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
            {["For You", "Following", "Latest", "Top Papers", "Preprints"].map((tab, i) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-md text-sm font-display font-medium transition-all ${
                  i === 0
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {mockPapers.map((paper, i) => (
              <ResearchCard key={i} index={i} {...paper} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 hidden lg:block">
          <QuickStats />
          <TrendingTopics />

          {/* Suggested Researchers */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Suggested Collaborators</h3>
            <div className="space-y-3">
              {[
                { name: "Dr. Lisa Park", field: "Computational Biology", initials: "LP" },
                { name: "Prof. Omar Hassan", field: "Quantum Physics", initials: "OH" },
                { name: "Dr. Sophie Martin", field: "Climate Science", initials: "SM" },
              ].map((researcher) => (
                <div key={researcher.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-scholarly flex items-center justify-center text-primary-foreground text-xs font-display font-semibold">
                    {researcher.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-medium text-foreground truncate">{researcher.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{researcher.field}</p>
                  </div>
                  <button className="text-xs font-display font-semibold text-accent hover:underline">Follow</button>
                </div>
              ))}
            </div>
          </motion.div>
        </aside>
      </div>
    </AppLayout>
  );
};

export default Index;
