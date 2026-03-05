import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, BookOpen, Users, Database, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categories = [
  { icon: BookOpen, label: "Papers", count: "2.4M" },
  { icon: Users, label: "Researchers", count: "890K" },
  { icon: Database, label: "Datasets", count: "145K" },
  { icon: Code, label: "Code", count: "67K" },
];

const fields = [
  "Computer Science", "Physics", "Biology", "Chemistry", "Mathematics",
  "Medicine", "Engineering", "Environmental Science", "Psychology", "Economics",
  "Neuroscience", "Materials Science", "Astronomy", "Genetics", "AI & ML",
];

const Discover = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Discover Research</h1>
          <p className="text-muted-foreground font-display text-lg mb-8">
            Explore millions of papers, datasets, and researchers across all scientific disciplines.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, author, DOI, keyword..."
              className="w-full h-14 pl-12 pr-24 rounded-xl bg-card border border-border text-foreground font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent shadow-scholarly"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-sm shadow-gold hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-display hover:bg-secondary/80 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            {["2025-2026", "Open Access", "Peer Reviewed", "High Impact"].map(filter => (
              <button key={filter} className="px-3 py-2 rounded-lg bg-card border border-border text-sm font-display text-muted-foreground hover:text-foreground hover:border-accent transition-all">
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-scholarly hover:border-accent/30 transition-all cursor-pointer group"
            >
              <cat.icon className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-accent transition-colors" />
              <p className="font-display font-semibold text-foreground mb-1">{cat.label}</p>
              <p className="text-sm text-muted-foreground font-mono">{cat.count}</p>
            </motion.div>
          ))}
        </div>

        {/* Fields */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h2 className="font-serif text-xl font-bold text-foreground mb-4">Browse by Field</h2>
          <div className="flex flex-wrap gap-2">
            {fields.map(field => (
              <Badge
                key={field}
                variant="secondary"
                className="font-display text-sm px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {field}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Discover;
