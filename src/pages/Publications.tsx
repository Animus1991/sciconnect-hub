import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Plus, Search, Filter, SortAsc, FileText, Upload, BookOpen, ExternalLink, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPapers } from "@/data/mockData";

const statusColors: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "under review": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  draft: "bg-muted text-muted-foreground border-border",
  preprint: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const publications = [
  { ...mockPapers[0], status: "published", lastEdited: "2 days ago", views: 1243 },
  { ...mockPapers[1], status: "under review", lastEdited: "1 week ago", views: 876 },
  { ...mockPapers[2], status: "preprint", lastEdited: "3 days ago", views: 542 },
  { ...mockPapers[3], status: "published", lastEdited: "2 weeks ago", views: 3201 },
  { ...mockPapers[4], status: "draft", lastEdited: "Today", views: 0 },
];

const Publications = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Publications</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Manage your papers, preprints, and datasets
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm font-display text-muted-foreground hover:text-foreground transition-colors">
                <Upload className="w-4 h-4" /> Import
              </button>
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> New Publication
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: "Total", value: "24", sub: "publications" },
            { label: "Published", value: "18", sub: "peer-reviewed" },
            { label: "Under Review", value: "3", sub: "manuscripts" },
            { label: "Drafts", value: "3", sub: "in progress" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-display">{stat.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your publications..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm font-display text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm font-display text-muted-foreground hover:text-foreground transition-colors">
            <SortAsc className="w-4 h-4" /> Sort
          </button>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="all" className="font-display text-sm">All</TabsTrigger>
            <TabsTrigger value="published" className="font-display text-sm">Published</TabsTrigger>
            <TabsTrigger value="review" className="font-display text-sm">Under Review</TabsTrigger>
            <TabsTrigger value="drafts" className="font-display text-sm">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {publications.map((pub, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-[10px] font-display ${statusColors[pub.status]}`}>
                        {pub.status}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-display capitalize">
                        {pub.type}
                      </Badge>
                    </div>
                    <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors cursor-pointer">
                      {pub.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-display mb-2">
                      {pub.authors.join(", ")}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-display">
                      <span>{pub.journal}</span>
                      <span>·</span>
                      <span>{pub.date}</span>
                      <span>·</span>
                      <span>{pub.citations} citations</span>
                      <span>·</span>
                      <span>{pub.views} views</span>
                      <span>·</span>
                      <span>Edited {pub.lastEdited}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pub.doi && (
                      <a href="#" className="text-accent hover:underline text-xs font-display flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> DOI
                      </a>
                    )}
                    <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="published" className="text-center py-12 text-muted-foreground font-display">
            Published papers filtered view
          </TabsContent>
          <TabsContent value="review" className="text-center py-12 text-muted-foreground font-display">
            Papers under review filtered view
          </TabsContent>
          <TabsContent value="drafts" className="text-center py-12 text-muted-foreground font-display">
            Draft papers filtered view
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Publications;
