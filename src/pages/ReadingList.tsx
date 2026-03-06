import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { BookmarkPlus, BookOpen, Clock, Folder, Plus, MoreVertical, CheckCircle2, Star, Tag, ExternalLink, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const readingLists = [
  {
    name: "Transformer Architectures Deep Dive",
    papers: 24,
    read: 18,
    lastUpdated: "2 hours ago",
    tags: ["Deep Learning", "NLP"],
    shared: true,
  },
  {
    name: "CRISPR Advances 2025-2026",
    papers: 15,
    read: 9,
    lastUpdated: "1 day ago",
    tags: ["Gene Editing", "Biology"],
    shared: false,
  },
  {
    name: "Quantum Error Correction Survey",
    papers: 31,
    read: 12,
    lastUpdated: "3 days ago",
    tags: ["Quantum Computing", "Physics"],
    shared: true,
  },
  {
    name: "Grant Proposal References",
    papers: 42,
    read: 42,
    lastUpdated: "1 week ago",
    tags: ["Mixed", "Grant"],
    shared: false,
  },
];

const savedPapers = [
  {
    title: "Foundation Models for Scientific Discovery: A Survey",
    authors: "Dr. Wei Zhang et al.",
    journal: "Nature Reviews Methods Primers",
    date: "Feb 2026",
    readStatus: "unread",
    priority: "high",
    notes: 2,
  },
  {
    title: "Self-Supervised Learning in Medical Imaging: Progress and Future",
    authors: "Prof. Ana Cardoso et al.",
    journal: "The Lancet Digital Health",
    date: "Jan 2026",
    readStatus: "reading",
    priority: "medium",
    notes: 5,
  },
  {
    title: "Probabilistic Programming for Bayesian Deep Learning",
    authors: "Dr. Marcus Kim, Dr. Julia Fischer",
    journal: "JMLR",
    date: "Mar 2026",
    readStatus: "read",
    priority: "low",
    notes: 0,
  },
  {
    title: "Ocean Carbon Sequestration: New Mechanisms and Global Implications",
    authors: "Dr. Elena Volkov et al.",
    journal: "Science",
    date: "Feb 2026",
    readStatus: "unread",
    priority: "medium",
    notes: 1,
  },
];

const readStatusStyles: Record<string, { label: string; className: string }> = {
  unread: { label: "Unread", className: "bg-accent/10 text-accent border-accent/20" },
  reading: { label: "Reading", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  read: { label: "Read", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

const ReadingList = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Reading List</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Organize papers, track reading progress, and annotate key findings
              </p>
            </div>
            <button className="flex items-center gap-2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> New List
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: "Saved Papers", value: "112", icon: BookmarkPlus },
            { label: "Lists", value: "4", icon: Folder },
            { label: "Read This Month", value: "14", icon: CheckCircle2 },
            { label: "Avg. per Week", value: "3.5", icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
              <stat.icon className="w-4 h-4 mb-2 text-accent" />
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <Tabs defaultValue="lists">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="lists" className="font-display text-sm">Collections</TabsTrigger>
            <TabsTrigger value="papers" className="font-display text-sm">All Papers</TabsTrigger>
            <TabsTrigger value="highlights" className="font-display text-sm">Highlights</TabsTrigger>
          </TabsList>

          <TabsContent value="lists" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readingLists.map((list, i) => (
              <motion.div
                key={list.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Folder className="w-5 h-5 text-accent" />
                  <div className="flex items-center gap-2">
                    {list.shared && (
                      <Badge variant="outline" className="text-[10px] font-display text-blue-400 border-blue-500/20">
                        Shared
                      </Badge>
                    )}
                    <button className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                  {list.name}
                </h3>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {list.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] font-display">{tag}</Badge>
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <Progress value={(list.read / list.papers) * 100} className="h-1.5 flex-1" />
                  <span className="text-[11px] text-muted-foreground font-display font-medium">
                    {list.read}/{list.papers}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground font-display">
                  Updated {list.lastUpdated}
                </p>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="papers">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search saved papers..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="space-y-3">
              {savedPapers.map((paper, i) => {
                const status = readStatusStyles[paper.readStatus];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={`text-[10px] font-display ${status.className}`}>
                            {status.label}
                          </Badge>
                          {paper.priority === "high" && (
                            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                          )}
                        </div>
                        <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">
                          {paper.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-display mb-1">{paper.authors}</p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-display">
                          <span>{paper.journal}</span>
                          <span>·</span>
                          <span>{paper.date}</span>
                          {paper.notes > 0 && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {paper.notes} notes</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="highlights" className="bg-card rounded-xl border border-border p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-display font-semibold text-foreground mb-2">No highlights yet</h3>
            <p className="text-sm text-muted-foreground font-display max-w-md mx-auto">
              Highlight key passages and findings while reading papers. They'll appear here for easy reference and export.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReadingList;
