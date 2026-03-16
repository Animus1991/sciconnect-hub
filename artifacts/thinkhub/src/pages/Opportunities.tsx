import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Briefcase, Search, MapPin, Clock, DollarSign, Building2, ExternalLink, Bookmark, BookmarkCheck, GraduationCap, FlaskConical, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

const opportunities = [
  {
    id: "o1", type: "grant", title: "NIH R01 — AI for Drug Discovery",
    organization: "National Institutes of Health", location: "USA (Remote)",
    deadline: "Jun 30, 2026", daysLeft: 116, funding: "$1.5M over 5 years",
    description: "Research grants for developing machine learning methods to accelerate drug discovery pipelines.",
    tags: ["AI", "Drug Discovery", "Biomedical"], featured: true,
  },
  {
    id: "o2", type: "position", title: "Postdoctoral Research Fellow — Quantum Computing",
    organization: "MIT Lincoln Laboratory", location: "Lexington, MA",
    deadline: "Apr 15, 2026", daysLeft: 40, funding: "$85K/year + benefits",
    description: "Two-year postdoctoral appointment in quantum error correction and fault-tolerant quantum computation.",
    tags: ["Quantum", "Postdoc", "Physics"], featured: false,
  },
  {
    id: "o3", type: "grant", title: "EU Horizon Europe — Climate Adaptation",
    organization: "European Commission", location: "EU Member States",
    deadline: "Sep 1, 2026", daysLeft: 179, funding: "€2M over 3 years",
    description: "Collaborative research funding for climate change adaptation strategies using AI and modeling.",
    tags: ["Climate", "EU", "Modeling"], featured: true,
  },
  {
    id: "o4", type: "fellowship", title: "Schmidt AI in Science Fellowship",
    organization: "Schmidt Futures", location: "Global",
    deadline: "May 1, 2026", daysLeft: 56, funding: "$150K stipend",
    description: "Fellowships for early-career researchers applying AI methods to fundamental scientific challenges.",
    tags: ["AI", "Fellowship", "Interdisciplinary"], featured: true,
  },
  {
    id: "o5", type: "position", title: "Assistant Professor — Computational Neuroscience",
    organization: "University College London", location: "London, UK",
    deadline: "Jul 15, 2026", daysLeft: 131, funding: "Competitive salary",
    description: "Tenure-track faculty position in computational and cognitive neuroscience with teaching and research responsibilities.",
    tags: ["Neuroscience", "Faculty", "Tenure-track"], featured: false,
  },
  {
    id: "o6", type: "fellowship", title: "Marie Skłodowska-Curie Individual Fellowship",
    organization: "European Research Council", location: "EU/Associated",
    deadline: "Oct 9, 2026", daysLeft: 217, funding: "€188K over 2 years",
    description: "Postdoctoral fellowships supporting mobility and career development for experienced researchers.",
    tags: ["Postdoc", "EU", "Mobility"], featured: false,
  },
];

const typeConfig = {
  grant:      { icon: Award,          label: "Grant",      cls: "text-gold bg-gold-muted border-gold/30" },
  position:   { icon: Briefcase,      label: "Position",   cls: "text-info bg-info/10 border-info/30" },
  fellowship: { icon: GraduationCap,  label: "Fellowship", cls: "text-highlight bg-highlight/10 border-highlight/30" },
} as const;

const Opportunities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const toggleSave = (id: string, title: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info("Removed from saved"); }
      else { next.add(id); toast.success(`Saved: ${title}`); }
      return next;
    });
  };

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filtered = useMemo(() => {
    let result = opportunities;
    if (typeFilter) result = result.filter(o => o.type === typeFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.organization.toLowerCase().includes(q) ||
        o.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [debouncedSearch, typeFilter]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-[27px] font-bold text-foreground">Opportunities</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Grants, fellowships, and academic positions curated for researchers
              </p>
            </div>
          </div>
        </motion.div>

        {/* Featured banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="gradient-scholarly rounded-xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,hsl(40_90%_50%),transparent_60%)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="w-4 h-4 text-gold" />
              <span className="text-xs font-display font-semibold tracking-wider uppercase text-gold">Featured This Week</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {opportunities.filter(o => o.featured).map(o => (
                <div key={o.id} className="flex items-center gap-2">
                  <span className="text-sm font-display text-primary-foreground font-medium">{o.title.split(" — ")[0]}</span>
                  <Badge variant="outline" className="text-[10px] font-display border-gold/30 text-gold">{o.daysLeft}d left</Badge>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Search + Type filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search grants, positions, fellowships..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button onClick={() => setTypeFilter(null)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${!typeFilter ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
            All ({opportunities.length})
          </button>
          {Object.entries(typeConfig).map(([key, cfg]) => {
            const count = opportunities.filter(o => o.type === key).length;
            return (
              <button key={key} onClick={() => setTypeFilter(typeFilter === key ? null : key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${
                  typeFilter === key ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}>
                <cfg.icon className="w-3 h-3" /> {cfg.label}
                <span className="text-[9px] font-mono">{count}</span>
              </button>
            );
          })}
        </div>

        <Tabs defaultValue="all">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="all" className="font-display text-sm">All</TabsTrigger>
            <TabsTrigger value="saved" className="font-display text-sm">Saved ({saved.size})</TabsTrigger>
            <TabsTrigger value="deadlines" className="font-display text-sm">By Deadline</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground font-display">No opportunities match your search</p>
              </div>
            ) : filtered.map((opp, i) => {
              const cfg = typeConfig[opp.type as keyof typeof typeConfig];
              const TypeIcon = cfg.icon;
              return (
                <motion.div key={opp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 hover:shadow-scholarly transition-all cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] font-display ${cfg.cls}`}>
                          <TypeIcon className="w-2.5 h-2.5 mr-0.5" />{cfg.label}
                        </Badge>
                        {opp.featured && (
                          <Badge variant="outline" className="text-[9px] font-display text-gold border-gold/30 bg-gold-muted">Featured</Badge>
                        )}
                        {opp.daysLeft <= 30 && (
                          <Badge variant="outline" className="text-[9px] font-display text-warning border-warning/30 bg-warning/10">
                            <Clock className="w-2.5 h-2.5 mr-0.5" />{opp.daysLeft}d left
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">{opp.title}</h3>
                      <p className="text-xs text-muted-foreground font-display mb-2 line-clamp-2">{opp.description}</p>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-display mb-2">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {opp.organization}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {opp.location}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {opp.funding}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {opp.deadline}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {opp.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px] font-display">{tag}</Badge>)}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); toggleSave(opp.id, opp.title); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                        title={saved.has(opp.id) ? "Unsave" : "Save"}>
                        {saved.has(opp.id) ? <BookmarkCheck className="w-4 h-4 text-accent fill-accent" /> : <Bookmark className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </TabsContent>

          <TabsContent value="saved">
            {saved.size === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-display font-semibold text-foreground mb-2">No saved opportunities</h3>
                <p className="text-sm text-muted-foreground font-display max-w-md mx-auto">Save grants, positions, and fellowships to track them here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {opportunities.filter(o => saved.has(o.id)).map((opp, i) => (
                  <motion.div key={opp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground text-sm">{opp.title}</h3>
                      <p className="text-[11px] text-muted-foreground font-display">{opp.organization} · {opp.deadline}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-display">{opp.daysLeft}d left</Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-3">
            {[...opportunities].sort((a, b) => a.daysLeft - b.daysLeft).map((opp, i) => (
              <motion.div key={opp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-lg ${
                  opp.daysLeft < 30 ? "bg-warning/10 text-warning" : opp.daysLeft < 60 ? "bg-info/10 text-info" : "bg-secondary text-foreground"
                }`}>{opp.daysLeft}d</div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground text-sm">{opp.title}</h3>
                  <p className="text-[11px] text-muted-foreground font-display">{opp.organization} · Deadline: {opp.deadline}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] font-display ${typeConfig[opp.type as keyof typeof typeConfig].cls}`}>
                  {typeConfig[opp.type as keyof typeof typeConfig].label}
                </Badge>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Opportunities;
