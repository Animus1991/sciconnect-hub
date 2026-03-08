import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Plus, Search, Clock, Users, Tag, FileText, Lock, Globe,
  GitBranch, Download, Copy, Star, Eye, MoreVertical, ChevronDown,
  ArrowUpDown, SortAsc, SortDesc, Share2, Trash2, Edit3, AlertTriangle,
  Beaker, Monitor, MapPin, BarChart3, TrendingUp, CheckCircle2
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { exportProtocolToPDF } from "@/lib/pdf-export";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ── Types ─────────────────────────────────────────────────────────────────────

type ProtocolCategory = "experimental" | "computational" | "clinical" | "field" | "analytical";
type ProtocolStatus = "published" | "draft" | "in_review" | "archived";
type SortKey = "modified" | "stars" | "title" | "views";
type FilterView = "all" | ProtocolStatus;

interface Step {
  order: number;
  title: string;
  content: string;
  duration?: string;
  caution?: string;
}

interface Protocol {
  id: string;
  title: string;
  category: ProtocolCategory;
  categoryColor: string;
  author: { name: string; initials: string };
  version: string;
  versions: { version: string; date: string; changes: string }[];
  status: ProtocolStatus;
  visibility: "public" | "private" | "team";
  description: string;
  steps: Step[];
  materials: string[];
  tags: string[];
  forks: number;
  stars: number;
  views: number;
  lastModified: string;
  collaborators: string[];
  comments: { author: string; text: string; date: string }[];
}

// ── Data ──────────────────────────────────────────────────────────────────────

const categoryConfig: Record<ProtocolCategory, { label: string; icon: typeof Beaker; color: string }> = {
  experimental:  { label: "Experimental",  icon: Beaker,       color: "hsl(var(--success))" },
  computational: { label: "Computational", icon: Monitor,      color: "hsl(var(--info))" },
  clinical:      { label: "Clinical",      icon: FlaskConical, color: "hsl(var(--destructive))" },
  field:         { label: "Field",         icon: MapPin,       color: "hsl(var(--gold))" },
  analytical:    { label: "Analytical",    icon: BarChart3,    color: "hsl(var(--highlight))" },
};

const statusConfig: Record<ProtocolStatus, { label: string; cls: string }> = {
  published: { label: "Published", cls: "bg-success/10 text-success border-success/20" },
  draft:     { label: "Draft",     cls: "bg-muted text-muted-foreground border-border" },
  in_review: { label: "In Review", cls: "bg-warning/10 text-warning border-warning/20" },
  archived:  { label: "Archived",  cls: "bg-secondary text-secondary-foreground border-border" },
};

const protocols: Protocol[] = [
  {
    id: "proto-001",
    title: "CRISPR-Cas13 Off-Target Detection in HEK293T Cells",
    category: "experimental", categoryColor: "hsl(var(--success))",
    author: { name: "Dr. Sofia Martínez", initials: "SM" },
    version: "3.2",
    versions: [
      { version: "3.2", date: "2026-03-01", changes: "Updated transfection conditions for improved efficiency" },
      { version: "3.1", date: "2026-01-15", changes: "Added Western blot validation step" },
      { version: "3.0", date: "2025-11-20", changes: "Major revision: switched to electroporation" },
      { version: "2.0", date: "2025-06-10", changes: "Added flow cytometry analysis" },
      { version: "1.0", date: "2025-02-01", changes: "Initial protocol" },
    ],
    status: "published", visibility: "public",
    description: "Comprehensive protocol for detecting off-target effects of CRISPR-Cas13 RNA editing in human embryonic kidney cells using next-generation sequencing.",
    steps: [
      { order: 1, title: "Cell Culture Preparation", content: "Maintain HEK293T cells in DMEM + 10% FBS at 37°C, 5% CO₂. Passage at 80% confluency.", duration: "3 days" },
      { order: 2, title: "Guide RNA Design", content: "Design 3 guides targeting PCSK9 mRNA using CRISPRscan. Validate secondary structure with RNAfold.", duration: "2 hours", caution: "Avoid guides with >3 consecutive G residues" },
      { order: 3, title: "Transfection", content: "Electroporate 2×10⁶ cells with 500ng Cas13 plasmid + 200ng guide RNA using Neon system (1150V, 20ms, 2 pulses).", duration: "1 hour", caution: "Cells must be >90% viable pre-transfection" },
      { order: 4, title: "RNA Extraction", content: "48h post-transfection, extract total RNA using TRIzol. Assess quality with Bioanalyzer (RIN ≥ 8).", duration: "4 hours" },
      { order: 5, title: "Library Prep & Sequencing", content: "Prepare RNA-seq libraries with TruSeq Stranded mRNA kit. Sequence on NovaSeq 6000, PE150, 30M reads/sample.", duration: "2 days" },
      { order: 6, title: "Bioinformatic Analysis", content: "Align reads with STAR. Quantify with featureCounts. Identify off-targets using CRISPResso2.", duration: "1 day" },
    ],
    materials: ["HEK293T cells (ATCC CRL-3216)", "DMEM + 10% FBS", "Cas13 plasmid", "Neon Transfection System", "TRIzol", "TruSeq Stranded mRNA Kit"],
    tags: ["CRISPR", "Cas13", "off-target", "RNA editing", "NGS"],
    forks: 12, stars: 34, views: 892,
    lastModified: "Mar 1, 2026",
    collaborators: ["EV", "JC"],
    comments: [
      { author: "Dr. Yuki Tanaka", text: "We replicated this with Cas13d and got similar results. Electroporation conditions worked perfectly.", date: "2026-03-05" },
      { author: "Prof. Amir Khalil", text: "Consider adding a scrambled guide control for better normalization.", date: "2026-02-20" },
    ],
  },
  {
    id: "proto-002",
    title: "Federated Learning Training Pipeline for Multi-Site MRI",
    category: "computational", categoryColor: "hsl(var(--info))",
    author: { name: "Prof. James Chen", initials: "JC" },
    version: "2.0",
    versions: [
      { version: "2.0", date: "2026-02-15", changes: "Added differential privacy module" },
      { version: "1.0", date: "2025-09-01", changes: "Initial computational pipeline" },
    ],
    status: "published", visibility: "team",
    description: "End-to-end federated learning pipeline for training diagnostic models across multiple hospital sites without sharing patient imaging data.",
    steps: [
      { order: 1, title: "Data Preprocessing", content: "Standardize MRI volumes to 1mm³ isotropic. Apply N4 bias correction. Skull-strip with SynthStrip.", duration: "~2h/site" },
      { order: 2, title: "Model Architecture", content: "Initialize 3D ResNet-50 backbone with pre-trained weights from MedicalNet.", duration: "30 min" },
      { order: 3, title: "Federation Setup", content: "Configure Flower framework with FedAvg strategy. Set min_fit_clients=3, min_evaluate_clients=2.", duration: "1 hour" },
      { order: 4, title: "Training", content: "Run 100 federated rounds. Local epochs=5, batch_size=8, lr=1e-4 with cosine annealing.", duration: "12-24h" },
      { order: 5, title: "Privacy Audit", content: "Run membership inference attack test. Verify ε-differential privacy budget ≤ 8.", duration: "2 hours" },
    ],
    materials: ["Python 3.10+", "PyTorch 2.0+", "Flower 1.7+", "NVIDIA A100 GPU per site", "Docker containers"],
    tags: ["federated learning", "MRI", "privacy", "deep learning"],
    forks: 8, stars: 21, views: 456,
    lastModified: "Feb 15, 2026",
    collaborators: ["EV"],
    comments: [],
  },
  {
    id: "proto-003",
    title: "Arctic Soil Core Sampling & Carbon Content Analysis",
    category: "field", categoryColor: "hsl(var(--gold))",
    author: { name: "Dr. Ingrid Nørgaard", initials: "IN" },
    version: "1.1",
    versions: [
      { version: "1.1", date: "2026-01-10", changes: "Added GPS coordinate logging requirement" },
      { version: "1.0", date: "2025-07-15", changes: "Initial field protocol" },
    ],
    status: "in_review", visibility: "public",
    description: "Standardized field protocol for collecting permafrost soil cores and analyzing organic carbon content across Arctic research stations.",
    steps: [
      { order: 1, title: "Site Selection", content: "Select 3 transects per station, 100m apart. Mark GPS coordinates.", duration: "1 hour", caution: "Avoid disturbed permafrost areas" },
      { order: 2, title: "Core Extraction", content: "Use motorized SIPRE corer to extract 1m cores. Store in insulated containers at -20°C.", duration: "30 min/core", caution: "Do not refreeze thawed cores" },
      { order: 3, title: "Lab Processing", content: "Section cores at 10cm intervals. Subsample for TOC, δ¹³C, and radiocarbon dating.", duration: "4 hours" },
      { order: 4, title: "Carbon Analysis", content: "Measure TOC with Elementar vario MACRO. Report as %C per dry weight.", duration: "2 days" },
    ],
    materials: ["SIPRE corer", "Insulated transport containers", "GPS device", "Elementar vario MACRO analyzer", "Liquid nitrogen"],
    tags: ["permafrost", "carbon", "Arctic", "soil science", "field work"],
    forks: 3, stars: 15, views: 234,
    lastModified: "Jan 10, 2026",
    collaborators: ["SM"],
    comments: [],
  },
  {
    id: "proto-004",
    title: "Surface Code Braiding Simulation on IBM Quantum",
    category: "computational", categoryColor: "hsl(var(--info))",
    author: { name: "Dr. Elena Vasquez", initials: "EV" },
    version: "1.0",
    versions: [{ version: "1.0", date: "2025-12-01", changes: "Initial simulation protocol" }],
    status: "draft", visibility: "private",
    description: "Protocol for simulating topological quantum error correction via surface code braiding on IBM's 127-qubit Eagle processor.",
    steps: [
      { order: 1, title: "Circuit Design", content: "Define distance-3 surface code on 17 data + 8 ancilla qubits using Stim.", duration: "2 hours" },
      { order: 2, title: "Noise Model", content: "Calibrate depolarizing noise from IBM device characterization data.", duration: "1 hour" },
      { order: 3, title: "Simulation", content: "Run 10⁶ shots with Stim. Decode with PyMatching (MWPM decoder).", duration: "4-8 hours" },
      { order: 4, title: "Analysis", content: "Compute logical error rates. Compare braided vs non-braided overhead.", duration: "2 hours" },
    ],
    materials: ["Stim 1.12+", "PyMatching 2.0+", "Qiskit Runtime", "IBM Quantum access"],
    tags: ["quantum computing", "surface codes", "error correction", "simulation"],
    forks: 1, stars: 8, views: 127,
    lastModified: "Dec 1, 2025",
    collaborators: [],
    comments: [],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function LabNotebook() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterView>("all");
  const [sortKey, setSortKey] = useState<SortKey>("modified");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTab, setExpandedTab] = useState<"steps" | "materials" | "history" | "comments">("steps");
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set(["proto-001"]));
  const [showNewForm, setShowNewForm] = useState(false);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(p => { if (p === id) return null; setExpandedTab("steps"); return id; });
  }, []);

  const toggleStar = useCallback((id: string) => {
    setStarredIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  }, [sortKey]);

  // ── Derived ──

  const stats = useMemo(() => ({
    total: protocols.length,
    published: protocols.filter(p => p.status === "published").length,
    drafts: protocols.filter(p => p.status === "draft").length,
    inReview: protocols.filter(p => p.status === "in_review").length,
    totalStars: protocols.reduce((s, p) => s + p.stars, 0),
    totalForks: protocols.reduce((s, p) => s + p.forks, 0),
  }), []);

  const filtered = useMemo(() => {
    let result = [...protocols];
    if (statusFilter !== "all") result = result.filter(p => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.author.name.toLowerCase().includes(q)
      );
    }
    // Starred first
    const dir = sortAsc ? 1 : -1;
    result.sort((a, b) => {
      const sa = starredIds.has(a.id) ? 0 : 1;
      const sb = starredIds.has(b.id) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      switch (sortKey) {
        case "stars": return dir * (a.stars - b.stars);
        case "views": return dir * (a.views - b.views);
        case "title": return dir * a.title.localeCompare(b.title);
        default: return 0;
      }
    });
    return result;
  }, [statusFilter, search, sortKey, sortAsc, starredIds]);

  // Category breakdown for sidebar
  const catBreakdown = useMemo(() => {
    const map = new Map<ProtocolCategory, number>();
    protocols.forEach(p => map.set(p.category, (map.get(p.category) || 0) + 1));
    return Array.from(map.entries()).map(([cat, count]) => ({ ...categoryConfig[cat], cat, count }));
  }, []);

  return (
    <AppLayout>
      <TooltipProvider delayDuration={300}>
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Lab Notebook</h1>
                <p className="text-sm text-muted-foreground font-display mt-0.5">
                  {stats.total} protocols · {stats.totalStars} stars · {stats.totalForks} forks
                </p>
              </div>
              <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent text-accent-foreground text-sm font-display font-semibold hover:bg-accent/90 transition-colors">
                    <Plus className="w-4 h-4" /> New Protocol
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-serif">New Protocol</DialogTitle>
                    <DialogDescription>Create a new experimental or computational protocol.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-display">Protocol Title</Label>
                      <Input placeholder="e.g., Western Blot for..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-display">Category</Label>
                        <Select defaultValue="experimental">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(categoryConfig).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-display">Visibility</Label>
                        <Select defaultValue="private">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="team">Team</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-display">Description</Label>
                      <Textarea placeholder="Brief description..." rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => setShowNewForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={() => setShowNewForm(false)}>Create Draft</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Filter Strip */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg border border-border mb-5 overflow-x-auto"
          >
            {([
              { key: "all" as FilterView, label: "All", count: stats.total },
              { key: "published" as FilterView, label: "Published", count: stats.published },
              { key: "draft" as FilterView, label: "Drafts", count: stats.drafts },
              { key: "in_review" as FilterView, label: "In Review", count: stats.inReview },
            ]).map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-display font-medium transition-colors whitespace-nowrap ${
                  statusFilter === f.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
                <span className="text-[10px] text-muted-foreground">{f.count}</span>
              </button>
            ))}

            <div className="flex-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowUpDown className="w-3 h-3" /> Sort
                  {sortAsc ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {([["modified", "Last Modified"], ["stars", "Stars"], ["views", "Views"], ["title", "Title"]] as [SortKey, string][]).map(([k, l]) => (
                  <DropdownMenuItem key={k} onClick={() => handleSort(k)} className="text-xs font-display">
                    {l} {sortKey === k && (sortAsc ? "↑" : "↓")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
            {/* ═══ MAIN ═══ */}
            <div className="min-w-0">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search protocols, tags, authors..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-card border border-border text-sm font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                />
              </div>

              {/* Protocol List */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                  <FlaskConical className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground font-display">No protocols match your search</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((proto, i) => {
                    const cat = categoryConfig[proto.category];
                    const CatIcon = cat.icon;
                    const sc = statusConfig[proto.status];
                    const isExpanded = expandedId === proto.id;
                    const isStarred = starredIds.has(proto.id);

                    return (
                      <motion.div
                        key={proto.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-card rounded-xl border border-border hover:border-accent/20 transition-colors group"
                        style={{ borderLeftWidth: "3px", borderLeftColor: proto.categoryColor }}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Badges */}
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-[10px] font-display font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1" style={{ color: proto.categoryColor, backgroundColor: `${proto.categoryColor}15` }}>
                                  <CatIcon className="w-3 h-3" />{cat.label}
                                </span>
                                <Badge variant="outline" className={`text-[10px] font-display px-1.5 py-0 h-5 ${sc.cls}`}>
                                  {sc.label}
                                </Badge>
                                <span className="text-[10px] font-mono text-muted-foreground">v{proto.version}</span>
                                {proto.visibility === "private" && (
                                  <Tooltip><TooltipTrigger asChild><Lock className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                                    <TooltipContent className="text-xs">Private</TooltipContent></Tooltip>
                                )}
                                {proto.visibility === "team" && (
                                  <Tooltip><TooltipTrigger asChild><Users className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                                    <TooltipContent className="text-xs">Team only</TooltipContent></Tooltip>
                                )}
                                {isStarred && <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />}
                              </div>

                              {/* Title */}
                              <button onClick={() => toggleExpand(proto.id)} className="text-left w-full">
                                <h3 className="font-serif text-[15px] font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">
                                  {proto.title}
                                </h3>
                              </button>

                              <p className="text-xs text-muted-foreground font-display mt-0.5 line-clamp-2">{proto.description}</p>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {proto.tags.slice(0, 4).map(t => (
                                  <span key={t} className="text-[10px] font-display text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">{t}</span>
                                ))}
                                {proto.tags.length > 4 && <span className="text-[10px] text-muted-foreground">+{proto.tags.length - 4}</span>}
                              </div>

                              {/* Meta */}
                              <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground font-display flex-wrap">
                                <span>{proto.author.name}</span>
                                <span className="text-border">·</span>
                                <span>{proto.steps.length} steps</span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-0.5"><Star className="w-3 h-3" />{proto.stars}</span>
                                <span className="flex items-center gap-0.5"><GitBranch className="w-3 h-3" />{proto.forks}</span>
                                <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{proto.views}</span>
                                <span className="text-border">·</span>
                                <span>{proto.lastModified}</span>

                                {proto.collaborators.length > 0 && (
                                  <div className="flex -space-x-1.5 ml-auto">
                                    {proto.collaborators.map(c => (
                                      <div key={c} className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[7px] font-bold text-foreground border-2 border-card">{c}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => toggleStar(proto.id)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                                    <Star className={`w-3.5 h-3.5 ${isStarred ? "text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" : "text-muted-foreground"}`} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">{isStarred ? "Unstar" : "Star"}</TooltipContent>
                              </Tooltip>

                              <button onClick={() => toggleExpand(proto.id)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all">
                                    <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem className="text-xs font-display gap-2" onClick={() => exportProtocolToPDF(proto)}><Download className="w-3 h-3" /> Export PDF</DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-display gap-2"><Copy className="w-3 h-3" /> Fork</DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-display gap-2"><Edit3 className="w-3 h-3" /> Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-display gap-2"><Share2 className="w-3 h-3" /> Share</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-xs font-display gap-2 text-destructive"><Trash2 className="w-3 h-3" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Detail */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-border">
                                {/* Inline tab switcher */}
                                <div className="flex items-center gap-1 mt-3 mb-3 p-0.5 bg-secondary/50 rounded-md w-fit">
                                  {([
                                    ["steps", `Steps (${proto.steps.length})`],
                                    ["materials", `Materials (${proto.materials.length})`],
                                    ["history", `History (${proto.versions.length})`],
                                    ["comments", `Comments (${proto.comments.length})`],
                                  ] as [typeof expandedTab, string][]).map(([key, label]) => (
                                    <button
                                      key={key}
                                      onClick={() => setExpandedTab(key)}
                                      className={`px-2.5 py-1 rounded text-[11px] font-display font-medium transition-colors ${
                                        expandedTab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>

                                {/* Steps */}
                                {expandedTab === "steps" && (
                                  <div className="space-y-2">
                                    {proto.steps.map(step => (
                                      <div key={step.order} className="p-3 bg-secondary/20 rounded-lg border border-border">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shrink-0">{step.order}</span>
                                          <h4 className="text-xs font-display font-semibold text-foreground">{step.title}</h4>
                                          {step.duration && (
                                            <span className="text-[10px] text-muted-foreground font-display ml-auto flex items-center gap-0.5"><Clock className="w-3 h-3" />{step.duration}</span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground font-display ml-7 leading-relaxed">{step.content}</p>
                                        {step.caution && (
                                          <div className="mt-1.5 ml-7 p-1.5 bg-warning/10 border border-warning/20 rounded text-[10px] text-warning font-display flex items-start gap-1">
                                            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> {step.caution}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Materials */}
                                {expandedTab === "materials" && (
                                  <div className="grid grid-cols-2 gap-1">
                                    {proto.materials.map((m, i) => (
                                      <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-secondary/30 transition-colors">
                                        <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                                        <span className="text-xs font-display text-foreground">{m}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* History */}
                                {expandedTab === "history" && (
                                  <div className="space-y-1.5">
                                    {proto.versions.map(v => (
                                      <div key={v.version} className="flex items-start gap-2 p-2 rounded-md bg-secondary/20">
                                        <span className="text-[10px] font-mono text-accent font-semibold bg-accent/10 px-1.5 py-0.5 rounded shrink-0">v{v.version}</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-display text-foreground">{v.changes}</p>
                                          <p className="text-[10px] text-muted-foreground font-display mt-0.5">{v.date}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Comments */}
                                {expandedTab === "comments" && (
                                  <div className="space-y-2">
                                    {proto.comments.length === 0 ? (
                                      <p className="text-xs text-muted-foreground font-display text-center py-4">No comments yet</p>
                                    ) : proto.comments.map((c, i) => (
                                      <div key={i} className="p-2.5 rounded-lg bg-secondary/20 border border-border">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-xs font-display font-semibold text-foreground">{c.author}</span>
                                          <span className="text-[10px] text-muted-foreground font-display">{c.date}</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground font-display leading-relaxed">{c.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ═══ SIDEBAR ═══ */}
            <div className="hidden lg:flex flex-col gap-4">
              {/* By Category */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-accent" /> By Category
                </h3>
                <div className="space-y-2">
                  {catBreakdown.map(c => {
                    const CIcon = c.icon;
                    return (
                      <div key={c.cat} className="flex items-center gap-2">
                        <CIcon className="w-3.5 h-3.5 shrink-0" style={{ color: c.color }} />
                        <span className="text-xs font-display text-foreground flex-1">{c.label}</span>
                        <span className="text-[10px] font-display text-muted-foreground">{c.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Most Starred */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-success" /> Most Popular
                </h3>
                <div className="space-y-2.5">
                  {[...protocols].sort((a, b) => b.stars - a.stars).slice(0, 3).map(p => (
                    <div key={p.id} className="group cursor-pointer" onClick={() => toggleExpand(p.id)}>
                      <p className="text-xs font-display font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">{p.title}</p>
                      <p className="text-[10px] text-muted-foreground font-display flex items-center gap-2">
                        <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5" />{p.stars}</span>
                        <span className="flex items-center gap-0.5"><GitBranch className="w-2.5 h-2.5" />{p.forks}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Versions */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-info" /> Recent Updates
                </h3>
                <div className="space-y-2.5">
                  {protocols.slice(0, 3).map(p => (
                    <div key={p.id} className="group cursor-pointer" onClick={() => toggleExpand(p.id)}>
                      <p className="text-xs font-display font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">{p.title}</p>
                      <p className="text-[10px] text-muted-foreground font-display">
                        v{p.version} · {p.lastModified}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3">
                  Stats
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Total steps", value: String(protocols.reduce((s, p) => s + p.steps.length, 0)) },
                    { label: "Total materials", value: String(protocols.reduce((s, p) => s + p.materials.length, 0)) },
                    { label: "Comments", value: String(protocols.reduce((s, p) => s + p.comments.length, 0)) },
                    { label: "Avg. versions", value: (protocols.reduce((s, p) => s + p.versions.length, 0) / protocols.length).toFixed(1) },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-display">{s.label}</span>
                      <span className="text-xs font-display font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
