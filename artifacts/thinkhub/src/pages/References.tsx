import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { BookOpen, Search, Plus, Copy, Download, ExternalLink, Tag, Hash, Folder, CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

const references = [
  {
    id: "ref1",
    title: "Attention Is All You Need",
    authors: "Vaswani, A., Shazeer, N., Parmar, N., et al.",
    journal: "NeurIPS 2017",
    year: 2017,
    doi: "10.48550/arXiv.1706.03762",
    citations: 98421,
    tags: ["Transformer", "Attention", "NLP"],
    collection: "Core ML Papers",
    added: "Jan 15, 2026",
    notes: 3,
  },
  {
    id: "ref2",
    title: "Deep Residual Learning for Image Recognition",
    authors: "He, K., Zhang, X., Ren, S., Sun, J.",
    journal: "CVPR 2016",
    year: 2016,
    doi: "10.1109/CVPR.2016.90",
    citations: 178543,
    tags: ["ResNet", "Computer Vision", "Deep Learning"],
    collection: "Core ML Papers",
    added: "Dec 3, 2025",
    notes: 1,
  },
  {
    id: "ref3",
    title: "CRISPR-Cas9 Structures and Mechanisms",
    authors: "Jiang, F., Doudna, J.A.",
    journal: "Annual Review of Biophysics, 46",
    year: 2017,
    doi: "10.1146/annurev-biophys-062215-010822",
    citations: 1234,
    tags: ["CRISPR", "Gene Editing", "Review"],
    collection: "Biology References",
    added: "Feb 8, 2026",
    notes: 5,
  },
  {
    id: "ref4",
    title: "Climate Change 2021: The Physical Science Basis",
    authors: "IPCC Working Group I",
    journal: "Cambridge University Press",
    year: 2021,
    doi: "10.1017/9781009157896",
    citations: 4567,
    tags: ["Climate", "IPCC", "Assessment"],
    collection: "Climate Science",
    added: "Nov 20, 2025",
    notes: 0,
  },
  {
    id: "ref5",
    title: "Quantum Error Correction with Surface Codes",
    authors: "Fowler, A.G., Mariantoni, M., Martinis, J.M., Cleland, A.N.",
    journal: "Physical Review A, 86(3)",
    year: 2012,
    doi: "10.1103/PhysRevA.86.032324",
    citations: 2891,
    tags: ["Quantum", "Error Correction", "Surface Codes"],
    collection: "Quantum Computing",
    added: "Mar 1, 2026",
    notes: 2,
  },
];

const collections = [
  { name: "Core ML Papers", count: 24, color: "bg-violet-500" },
  { name: "Biology References", count: 18, color: "bg-emerald-500" },
  { name: "Climate Science", count: 12, color: "bg-teal-500" },
  { name: "Quantum Computing", count: 9, color: "bg-amber-500" },
  { name: "Grant Proposal Refs", count: 31, color: "bg-blue-500" },
];

const References = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [starred, setStarred] = useState<Set<string>>(new Set(["ref1", "ref3"]));

  const toggleStar = (id: string) => {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const copyBibtex = (ref: typeof references[0]) => {
    const bibtex = `@article{${ref.authors.split(",")[0].trim().toLowerCase()}${ref.year},\n  title={${ref.title}},\n  author={${ref.authors}},\n  journal={${ref.journal}},\n  year={${ref.year}},\n  doi={${ref.doi}}\n}`;
    navigator.clipboard.writeText(bibtex).then(() => toast.success("BibTeX copied to clipboard"));
  };

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filtered = useMemo(() => {
    let result = references;
    if (selectedCollection) result = result.filter(r => r.collection === selectedCollection);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.authors.toLowerCase().includes(q) ||
        r.journal.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [debouncedSearch, selectedCollection]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">References</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Manage your bibliography, organize by collection, and export citations
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toast.success("Exported all references as BibTeX")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm font-display text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-4 h-4" /> Export All
              </button>
              <button onClick={() => toast.info("Reference manager coming soon!")}
                className="flex items-center gap-2 h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Add Reference
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total References", value: "94", icon: BookOpen, color: "text-foreground" },
            { label: "Collections", value: String(collections.length), icon: Folder, color: "text-accent" },
            { label: "This Month", value: "7", icon: Plus, color: "text-emerald-brand" },
            { label: "Starred", value: String(starred.size), icon: Star, color: "text-gold" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4">
              <s.icon className={`w-4 h-4 mb-2 ${s.color}`} />
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search + Collection filter */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, DOI, or tag..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button onClick={() => setSelectedCollection(null)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${!selectedCollection ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
            All
          </button>
          {collections.map(col => (
            <button key={col.name} onClick={() => setSelectedCollection(selectedCollection === col.name ? null : col.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-medium transition-all ${
                selectedCollection === col.name ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}>
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              {col.name}
              <span className="text-[9px] font-mono text-muted-foreground">{col.count}</span>
            </button>
          ))}
        </div>

        {/* References list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground font-display">No references found</p>
            </div>
          ) : filtered.map((ref, i) => (
            <motion.div key={ref.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 hover:shadow-scholarly transition-all group">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] font-display text-accent border-accent/20 bg-accent/5">
                      <Hash className="w-2.5 h-2.5 mr-0.5" />{ref.collection}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">{ref.year}</span>
                    <span className="text-[10px] font-mono text-emerald-brand">{ref.citations.toLocaleString()} citations</span>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-foreground leading-snug mb-1 group-hover:text-accent transition-colors cursor-pointer">
                    {ref.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-display mb-1">{ref.authors}</p>
                  <p className="text-[11px] text-muted-foreground font-display mb-2">{ref.journal} · DOI: {ref.doi}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {ref.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px] font-display">{tag}</Badge>)}
                    {ref.notes > 0 && (
                      <span className="text-[10px] text-muted-foreground font-display ml-2">📝 {ref.notes} notes</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleStar(ref.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                    <Star className={`w-4 h-4 ${starred.has(ref.id) ? "text-gold fill-gold" : "text-muted-foreground"}`} />
                  </button>
                  <button onClick={() => copyBibtex(ref)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy BibTeX">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default References;
