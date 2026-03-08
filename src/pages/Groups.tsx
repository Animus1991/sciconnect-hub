import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Users, Lock, Globe, Plus, MessageSquare, Search, Check, TrendingUp, Flame, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

const groups = [
  { name: "Computational Neuroscience Lab",  members: 34,   posts: 156,  type: "private", activity: "active",  description: "Internal lab discussions and pre-publication drafts",                        initials: "CN", color: "bg-highlight" },
  { name: "Open Science Advocates",           members: 1247, posts: 4521, type: "public",  activity: "hot",     description: "Promoting open access, reproducibility, and transparent research practices", initials: "OS", color: "bg-success" },
  { name: "AI for Drug Discovery",            members: 89,   posts: 312,  type: "public",  activity: "growing", description: "Intersection of machine learning and pharmaceutical research",              initials: "AD", color: "bg-info" },
  { name: "Climate Modeling Consortium",      members: 567,  posts: 2103, type: "public",  activity: "active",  description: "Global collaboration on next-generation climate prediction models",        initials: "CM", color: "bg-emerald-brand" },
  { name: "Quantum Information Theory",       members: 203,  posts: 891,  type: "public",  activity: "growing", description: "Theoretical foundations of quantum computing and communication",             initials: "QI", color: "bg-warning" },
  { name: "Bioethics Discussion Forum",       members: 412,  posts: 1567, type: "public",  activity: "new",     description: "Ethical considerations in modern biological and medical research",           initials: "BE", color: "bg-destructive" },
];

const MAX_MEMBERS = Math.max(...groups.map(g => g.members));

const activityConfig = {
  hot:     { label: "HOT",     icon: Flame,       cls: "text-warning bg-warning/10" },
  active:  { label: "Active",  icon: TrendingUp,  cls: "text-emerald-brand bg-emerald-muted" },
  growing: { label: "Growing", icon: TrendingUp,  cls: "text-info bg-info/10" },
  new:     { label: "New",     icon: Sparkles,    cls: "text-gold bg-gold-muted" },
} as const;

const Groups = () => {
  const [joined, setJoined] = useState<Set<string>>(new Set(["Computational Neuroscience Lab"]));
  const [searchQuery, setSearchQuery] = useState("");

  const toggleJoin = (name: string) => {
    setJoined(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        toast.info(`Left ${name}`);
      } else {
        next.add(name);
        toast.success(`Joined ${name}`);
      }
      return next;
    });
  };

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filteredGroups = useMemo(() => {
    if (!debouncedSearch.trim()) return groups;
    const q = debouncedSearch.toLowerCase();
    return groups.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
    );
  }, [debouncedSearch]);

  return (
    <AppLayout>
      <div className="max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Research Groups</h1>
            <p className="text-muted-foreground font-display">Collaborate with peers, share pre-prints, and discuss research in focused communities.</p>
          </div>
          <button className="h-10 px-5 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-sm flex items-center gap-2 shadow-gold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Create Group
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          {[
            { label: "Your Groups",     value: joined.size,         sub: "joined" },
            { label: "Total Members",   value: "2,552",             sub: "across all groups" },
            { label: "Active Today",    value: "4",                 sub: "groups with new posts" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4">
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs font-display font-medium text-foreground mt-0.5">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.map((group, i) => {
            const actCfg = activityConfig[group.activity as keyof typeof activityConfig];
            const ActIcon = actCfg.icon;
            return (
              <motion.div
                key={group.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-scholarly hover:border-accent/30 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${group.color} flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0`}>
                    {group.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors truncate flex-1">
                        {group.name}
                      </h3>
                      {group.type === "private" ? (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-display font-bold ${actCfg.cls}`}>
                        <ActIcon className="w-2.5 h-2.5" /> {actCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{group.description}</p>

                    {/* Member popularity bar */}
                    <div className="mb-3">
                      <div className="h-1 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(group.members / MAX_MEMBERS) * 100}%` }}
                          transition={{ duration: 0.7, delay: 0.3 + i * 0.06, ease: "easeOut" }}
                          className={`h-full rounded-full ${group.color}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-display">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {group.members.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {group.posts.toLocaleString()}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleJoin(group.name); }}
                        className={`ml-auto text-xs font-display font-semibold px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                          joined.has(group.name)
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "text-accent hover:bg-accent/10"
                        }`}
                      >
                        {joined.has(group.name) ? <><Check className="w-3 h-3" /> Joined</> : "+ Join"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Groups;
