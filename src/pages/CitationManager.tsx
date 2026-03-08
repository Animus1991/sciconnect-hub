import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Plus, Search, Filter, Download, Upload, Copy, Star,
  Folder, Tag, ExternalLink, FileText, BarChart3, Link2, Trash2
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// ─── Types & Mock Data ───
interface Citation {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  volume?: string;
  pages?: string;
  doi: string;
  type: "article" | "book" | "conference" | "preprint" | "thesis" | "dataset";
  abstract: string;
  tags: string[];
  collections: string[];
  notes: string;
  starred: boolean;
  dateAdded: string;
  citedBy: number;
  pdfAvailable: boolean;
}

interface Collection {
  id: string;
  name: string;
  color: string;
  count: number;
}

const mockCollections: Collection[] = [
  { id: "col-1", name: "Quantum Error Correction", color: "bg-violet-500", count: 24 },
  { id: "col-2", name: "Federated Learning", color: "bg-blue-500", count: 18 },
  { id: "col-3", name: "CRISPR Therapeutics", color: "bg-emerald-500", count: 31 },
  { id: "col-4", name: "Climate Modeling", color: "bg-amber-500", count: 12 },
  { id: "col-5", name: "Neuromorphic Computing", color: "bg-rose-500", count: 9 },
];

const mockCitations: Citation[] = [
  {
    id: "cit-001", title: "Suppressing quantum errors by scaling a surface code logical qubit",
    authors: ["Google Quantum AI", "Acharya, R.", "Aleiner, I.", "Allen, R."],
    journal: "Nature", year: 2023, volume: "614", pages: "676-681",
    doi: "10.1038/s41586-022-05434-1", type: "article",
    abstract: "Practical quantum computing will require error rates well below those achievable with physical qubits...",
    tags: ["quantum computing", "error correction", "surface codes"], collections: ["col-1"],
    notes: "Key reference for our surface code braiding approach.", starred: true,
    dateAdded: "2025-03-15", citedBy: 1247, pdfAvailable: true,
  },
  {
    id: "cit-002", title: "Communication-Efficient Learning of Deep Networks from Decentralized Data",
    authors: ["McMahan, B.", "Moore, E.", "Ramage, D.", "Hampson, S."],
    journal: "AISTATS", year: 2017, volume: "", pages: "",
    doi: "10.48550/arXiv.1602.05629", type: "conference",
    abstract: "Modern mobile devices have access to a wealth of data suitable for learning models...",
    tags: ["federated learning", "deep learning", "privacy"], collections: ["col-2"],
    notes: "Foundational FedAvg paper. Compare our convergence rates.", starred: true,
    dateAdded: "2025-01-20", citedBy: 8934, pdfAvailable: true,
  },
  {
    id: "cit-003", title: "CRISPR-Cas13 for RNA editing and diagnostics",
    authors: ["Abudayyeh, O.O.", "Gootenberg, J.S.", "Konermann, S."],
    journal: "Nature Methods", year: 2019, volume: "16", pages: "887-893",
    doi: "10.1038/s41592-019-0538-3", type: "article",
    abstract: "Cas13 enzymes are RNA-guided RNA-targeting CRISPR effectors...",
    tags: ["CRISPR", "Cas13", "RNA editing", "diagnostics"], collections: ["col-3"],
    notes: "Core methodology reference for off-target study.", starred: false,
    dateAdded: "2025-04-10", citedBy: 2156, pdfAvailable: true,
  },
  {
    id: "cit-004", title: "Permafrost carbon feedback to climate change",
    authors: ["Schuur, E.A.G.", "McGuire, A.D.", "Schädel, C."],
    journal: "Nature", year: 2015, volume: "520", pages: "171-179",
    doi: "10.1038/nature14338", type: "article",
    abstract: "Large quantities of organic carbon are stored in frozen Arctic soils...",
    tags: ["permafrost", "carbon cycle", "climate change"], collections: ["col-4"],
    notes: "", starred: false,
    dateAdded: "2025-06-01", citedBy: 3421, pdfAvailable: false,
  },
  {
    id: "cit-005", title: "Attention Is All You Need",
    authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N.", "Uszkoreit, J."],
    journal: "NeurIPS", year: 2017, volume: "", pages: "",
    doi: "10.48550/arXiv.1706.03762", type: "conference",
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
    tags: ["transformers", "attention", "NLP", "deep learning"], collections: ["col-2", "col-5"],
    notes: "Foundation for all transformer-based approaches in our work.", starred: true,
    dateAdded: "2024-12-01", citedBy: 92456, pdfAvailable: true,
  },
  {
    id: "cit-006", title: "Neuromorphic computing with memristive devices",
    authors: ["Zidan, M.A.", "Strachan, J.P.", "Lu, W.D."],
    journal: "Nature Electronics", year: 2018, volume: "1", pages: "22-29",
    doi: "10.1038/s41928-017-0006-8", type: "article",
    abstract: "Neuromorphic computing systems aim to emulate the neural structure of the biological brain...",
    tags: ["neuromorphic", "memristors", "brain-inspired computing"], collections: ["col-5"],
    notes: "", starred: false,
    dateAdded: "2025-08-20", citedBy: 876, pdfAvailable: true,
  },
];

const TYPE_ICONS: Record<Citation["type"], string> = {
  article: "📄", book: "📚", conference: "🎤", preprint: "📋", thesis: "🎓", dataset: "📊",
};

export default function CitationManager() {
  const [search, setSearch] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showImport, setShowImport] = useState(false);

  const filtered = useMemo(() => {
    return mockCitations.filter(c => {
      if (collectionFilter !== "all" && !c.collections.includes(collectionFilter)) return false;
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.authors.some(a => a.toLowerCase().includes(q)) || c.journal.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, collectionFilter, typeFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleExportBibtex = () => {
    toast.success("Exported", { description: `${selectedIds.size || filtered.length} citations exported as BibTeX` });
  };

  return (
    <AppLayout>
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Citation Manager</h1>
          <p className="text-sm text-muted-foreground font-display mt-1">
            Organize, annotate, and export your research bibliography
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showImport} onOpenChange={setShowImport}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Import</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">Import Citations</DialogTitle>
                <DialogDescription>Import from BibTeX, DOI, or reference managers</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="bibtex">
                <TabsList className="w-full">
                  <TabsTrigger value="bibtex" className="flex-1">BibTeX</TabsTrigger>
                  <TabsTrigger value="doi" className="flex-1">DOI</TabsTrigger>
                  <TabsTrigger value="manager" className="flex-1">Zotero/Mendeley</TabsTrigger>
                </TabsList>
                <TabsContent value="bibtex" className="space-y-3 mt-3">
                  <Textarea placeholder="Paste BibTeX entries here..." rows={8} className="font-mono text-xs" />
                  <Button className="w-full" onClick={() => { setShowImport(false); toast.success("Imported 0 citations from BibTeX"); }}>
                    Parse & Import
                  </Button>
                </TabsContent>
                <TabsContent value="doi" className="space-y-3 mt-3">
                  <Textarea placeholder="Enter DOIs (one per line)..." rows={6} className="font-mono text-xs" />
                  <Button className="w-full" onClick={() => { setShowImport(false); toast.success("Resolving DOIs..."); }}>
                    Resolve & Import
                  </Button>
                </TabsContent>
                <TabsContent value="manager" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => toast.info("Zotero sync will be available with backend connection")}>
                      <span className="text-2xl">📚</span>
                      <span className="text-xs">Connect Zotero</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => toast.info("Mendeley sync will be available with backend connection")}>
                      <span className="text-2xl">📖</span>
                      <span className="text-xs">Connect Mendeley</span>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-2" onClick={handleExportBibtex}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button className="gap-2"><Plus className="w-4 h-4" /> Add Citation</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Citations", value: mockCitations.length, icon: BookOpen },
          { label: "Collections", value: mockCollections.length, icon: Folder },
          { label: "Starred", value: mockCitations.filter(c => c.starred).length, icon: Star },
          { label: "With PDF", value: mockCitations.filter(c => c.pdfAvailable).length, icon: FileText },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4">
            <stat.icon className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="text-xl font-serif font-bold text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground font-display">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Collections Sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3">Collections</h3>
          <div className="space-y-1">
            <button onClick={() => setCollectionFilter("all")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display transition-colors ${collectionFilter === "all" ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"}`}>
              <BookOpen className="w-3.5 h-3.5" /> All Citations
              <span className="ml-auto text-muted-foreground">{mockCitations.length}</span>
            </button>
            {mockCollections.map(col => (
              <button key={col.id} onClick={() => setCollectionFilter(col.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display transition-colors ${collectionFilter === col.id ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} /> {col.name}
                <span className="ml-auto text-muted-foreground">{col.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by title, author, or journal..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(TYPE_ICONS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v} {k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
              <span className="text-xs font-display text-primary">{selectedIds.size} selected</span>
              <Button variant="outline" size="sm" className="h-7 text-xs ml-auto" onClick={handleExportBibtex}>Export Selected</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>Clear</Button>
            </div>
          )}

          {/* Citation List */}
          <div className="space-y-2">
            {filtered.map((cit, i) => (
              <motion.div key={cit.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <Checkbox checked={selectedIds.has(cit.id)} onCheckedChange={() => toggleSelect(cit.id)} className="mt-1" />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedCitation(cit)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{TYPE_ICONS[cit.type]}</span>
                      <h4 className="text-sm font-serif font-semibold text-foreground line-clamp-1">{cit.title}</h4>
                      {cit.starred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground font-display">
                      {cit.authors.slice(0, 3).join(", ")}{cit.authors.length > 3 && ` et al.`}
                    </p>
                    <p className="text-xs text-muted-foreground font-display mt-0.5">
                      <span className="font-medium text-foreground/80">{cit.journal}</span>
                      {cit.volume && `, ${cit.volume}`}{cit.pages && `, ${cit.pages}`} ({cit.year})
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {cit.tags.slice(0, 3).map(t => <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>)}
                      <span className="text-[10px] text-muted-foreground ml-auto">Cited by {cit.citedBy.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                    navigator.clipboard.writeText(cit.doi);
                    toast.success("DOI copied");
                  }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Citation Detail */}
      <Dialog open={!!selectedCitation} onOpenChange={() => setSelectedCitation(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedCitation && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-lg leading-snug">{selectedCitation.title}</DialogTitle>
                <DialogDescription>
                  {selectedCitation.authors.join(", ")} · {selectedCitation.journal} ({selectedCitation.year})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline">{TYPE_ICONS[selectedCitation.type]} {selectedCitation.type}</Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">DOI: {selectedCitation.doi}</Badge>
                  <Badge variant="outline">Cited by {selectedCitation.citedBy.toLocaleString()}</Badge>
                  {selectedCitation.pdfAvailable && <Badge variant="outline" className="text-emerald-600">📎 PDF Available</Badge>}
                </div>
                <div>
                  <h4 className="text-xs font-display font-semibold mb-1">Abstract</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedCitation.abstract}</p>
                </div>
                {selectedCitation.notes && (
                  <div>
                    <h4 className="text-xs font-display font-semibold mb-1">Notes</h4>
                    <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">{selectedCitation.notes}</p>
                  </div>
                )}
                <div className="flex gap-1.5 flex-wrap">
                  {selectedCitation.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </AppLayout>
  );
}
