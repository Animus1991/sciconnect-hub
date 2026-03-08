import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FlaskConical, Plus, Search, Filter, Clock, Users, Tag, FileText,
  ChevronRight, Lock, Globe, GitBranch, Download, Copy, Star, Eye
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
import { Separator } from "@/components/ui/separator";

// ─── Types & Mock Data ───
interface Protocol {
  id: string;
  title: string;
  category: "experimental" | "computational" | "clinical" | "field" | "analytical";
  author: { name: string; initials: string };
  version: string;
  versions: { version: string; date: string; changes: string }[];
  status: "published" | "draft" | "in_review" | "archived";
  visibility: "public" | "private" | "team";
  description: string;
  steps: { order: number; title: string; content: string; duration?: string; caution?: string }[];
  materials: string[];
  tags: string[];
  forks: number;
  stars: number;
  views: number;
  lastModified: string;
  collaborators: string[];
  linkedProject?: string;
  comments: { author: string; text: string; date: string }[];
}

const CATEGORY_META: Record<Protocol["category"], { icon: string; label: string }> = {
  experimental: { icon: "🧪", label: "Experimental" },
  computational: { icon: "💻", label: "Computational" },
  clinical: { icon: "🏥", label: "Clinical" },
  field: { icon: "🌍", label: "Field Research" },
  analytical: { icon: "📊", label: "Analytical" },
};

const mockProtocols: Protocol[] = [
  {
    id: "proto-001",
    title: "CRISPR-Cas13 Off-Target Detection in HEK293T Cells",
    category: "experimental",
    author: { name: "Dr. Sofia Martínez", initials: "SM" },
    version: "3.2",
    versions: [
      { version: "3.2", date: "2026-03-01", changes: "Updated transfection conditions for improved efficiency" },
      { version: "3.1", date: "2026-01-15", changes: "Added Western blot validation step" },
      { version: "3.0", date: "2025-11-20", changes: "Major revision: switched to electroporation" },
      { version: "2.0", date: "2025-06-10", changes: "Added flow cytometry analysis" },
      { version: "1.0", date: "2025-02-01", changes: "Initial protocol" },
    ],
    status: "published",
    visibility: "public",
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
    lastModified: "2026-03-01",
    collaborators: ["Dr. Elena Vasquez", "Prof. James Chen"],
    comments: [
      { author: "Dr. Yuki Tanaka", text: "We replicated this with Cas13d and got similar results. Electroporation conditions worked perfectly.", date: "2026-03-05" },
      { author: "Prof. Amir Khalil", text: "Consider adding a scrambled guide control for better normalization.", date: "2026-02-20" },
    ],
  },
  {
    id: "proto-002",
    title: "Federated Learning Training Pipeline for Multi-Site MRI",
    category: "computational",
    author: { name: "Prof. James Chen", initials: "JC" },
    version: "2.0",
    versions: [
      { version: "2.0", date: "2026-02-15", changes: "Added differential privacy module" },
      { version: "1.0", date: "2025-09-01", changes: "Initial computational pipeline" },
    ],
    status: "published",
    visibility: "team",
    description: "End-to-end federated learning pipeline for training diagnostic models across multiple hospital sites without sharing patient imaging data.",
    steps: [
      { order: 1, title: "Data Preprocessing", content: "Standardize MRI volumes to 1mm³ isotropic. Apply N4 bias correction. Skull-strip with SynthStrip.", duration: "~2h/site" },
      { order: 2, title: "Model Architecture", content: "Initialize 3D ResNet-50 backbone with pre-trained weights from MedicalNet.", duration: "30 min" },
      { order: 3, title: "Federation Setup", content: "Configure Flower framework with FedAvg strategy. Set min_fit_clients=3, min_evaluate_clients=2.", duration: "1 hour" },
      { order: 4, title: "Training", content: "Run 100 federated rounds. Local epochs=5, batch_size=8, lr=1e-4 with cosine annealing.", duration: "12-24 hours" },
      { order: 5, title: "Privacy Audit", content: "Run membership inference attack test. Verify ε-differential privacy budget ≤ 8.", duration: "2 hours" },
    ],
    materials: ["Python 3.10+", "PyTorch 2.0+", "Flower 1.7+", "NVIDIA A100 GPU per site", "Docker containers"],
    tags: ["federated learning", "MRI", "privacy", "deep learning"],
    forks: 8, stars: 21, views: 456,
    lastModified: "2026-02-15",
    collaborators: ["Dr. Elena Vasquez"],
    comments: [],
  },
  {
    id: "proto-003",
    title: "Arctic Soil Core Sampling & Carbon Content Analysis",
    category: "field",
    author: { name: "Dr. Ingrid Nørgaard", initials: "IN" },
    version: "1.1",
    versions: [
      { version: "1.1", date: "2026-01-10", changes: "Added GPS coordinate logging requirement" },
      { version: "1.0", date: "2025-07-15", changes: "Initial field protocol" },
    ],
    status: "in_review",
    visibility: "public",
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
    lastModified: "2026-01-10",
    collaborators: ["Dr. Sofia Martínez"],
    comments: [],
  },
  {
    id: "proto-004",
    title: "Surface Code Braiding Simulation on IBM Quantum",
    category: "computational",
    author: { name: "Dr. Elena Vasquez", initials: "EV" },
    version: "1.0",
    versions: [{ version: "1.0", date: "2025-12-01", changes: "Initial simulation protocol" }],
    status: "draft",
    visibility: "private",
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
    lastModified: "2025-12-01",
    collaborators: [],
    comments: [],
  },
];

const STATUS_COLORS: Record<Protocol["status"], string> = {
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  draft: "bg-muted text-muted-foreground border-border",
  in_review: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  archived: "bg-secondary text-secondary-foreground border-border",
};

export default function LabNotebook() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const filtered = useMemo(() => {
    return mockProtocols.filter(p => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Lab Notebook & Protocols</h1>
          <p className="text-sm text-muted-foreground font-display mt-1">
            Create, version, and share experimental & computational protocols
          </p>
        </div>
        <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Protocol</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">New Protocol</DialogTitle>
              <DialogDescription>Create a new experimental or computational protocol.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Protocol Title</Label>
                <Input placeholder="e.g., Western Blot for..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select defaultValue="experimental">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_META).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select defaultValue="private">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">🔒 Private</SelectItem>
                      <SelectItem value="team">👥 Team</SelectItem>
                      <SelectItem value="public">🌍 Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Brief description..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
              <Button onClick={() => setShowNewForm(false)}>Create Draft</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Protocols", value: mockProtocols.length, icon: FileText },
          { label: "Published", value: mockProtocols.filter(p => p.status === "published").length, icon: Globe },
          { label: "Total Forks", value: mockProtocols.reduce((s, p) => s + p.forks, 0), icon: GitBranch },
          { label: "Total Stars", value: mockProtocols.reduce((s, p) => s + p.stars, 0), icon: Star },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4">
            <stat.icon className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="text-xl font-serif font-bold text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground font-display">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search protocols..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <Filter className="w-3.5 h-3.5 mr-2" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_META).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Protocol Cards */}
      <div className="space-y-3">
        {filtered.map((proto, i) => {
          const cat = CATEGORY_META[proto.category];
          return (
            <motion.div key={proto.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedProtocol(proto)}
              className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base">{cat.icon}</span>
                    <h3 className="font-serif font-semibold text-foreground text-sm">{proto.title}</h3>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[proto.status]}`}>{proto.status}</Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {proto.visibility === "private" ? <Lock className="w-3 h-3 mr-0.5" /> : proto.visibility === "team" ? <Users className="w-3 h-3 mr-0.5" /> : <Globe className="w-3 h-3 mr-0.5" />}
                      {proto.visibility}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-display">
                    {proto.author.name} · v{proto.version} · {proto.steps.length} steps
                  </p>
                  <p className="text-xs text-muted-foreground font-display mt-1">{proto.description.slice(0, 140)}...</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-display flex-shrink-0">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" />{proto.stars}</span>
                  <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{proto.forks}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{proto.views}</span>
                </div>
              </div>
              {proto.tags.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {proto.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Protocol Detail Dialog */}
      <Dialog open={!!selectedProtocol} onOpenChange={() => setSelectedProtocol(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedProtocol && (() => {
            const cat = CATEGORY_META[selectedProtocol.category];
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <DialogTitle className="font-serif">{selectedProtocol.title}</DialogTitle>
                  </div>
                  <DialogDescription>
                    {selectedProtocol.author.name} · Version {selectedProtocol.version} · Last modified {selectedProtocol.lastModified}
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="steps" className="mt-2">
                  <TabsList>
                    <TabsTrigger value="steps">Steps ({selectedProtocol.steps.length})</TabsTrigger>
                    <TabsTrigger value="materials">Materials</TabsTrigger>
                    <TabsTrigger value="versions">History ({selectedProtocol.versions.length})</TabsTrigger>
                    <TabsTrigger value="comments">Comments ({selectedProtocol.comments.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="steps" className="space-y-3 mt-3">
                    {selectedProtocol.steps.map(step => (
                      <div key={step.order} className="p-4 bg-secondary/30 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{step.order}</span>
                          <h4 className="text-sm font-display font-semibold text-foreground">{step.title}</h4>
                          {step.duration && <Badge variant="outline" className="text-[10px] ml-auto"><Clock className="w-3 h-3 mr-1" />{step.duration}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground pl-8">{step.content}</p>
                        {step.caution && (
                          <div className="mt-2 ml-8 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-700 dark:text-amber-400">
                            ⚠️ {step.caution}
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="materials" className="mt-3">
                    <ul className="space-y-1.5">
                      {selectedProtocol.materials.map((m, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-foreground font-display">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />{m}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="versions" className="mt-3 space-y-2">
                    {selectedProtocol.versions.map(v => (
                      <div key={v.version} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                        <Badge variant="outline" className="text-xs font-mono">v{v.version}</Badge>
                        <div>
                          <p className="text-xs text-foreground font-display">{v.changes}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{v.date}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="comments" className="mt-3 space-y-3">
                    {selectedProtocol.comments.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No comments yet.</p>
                    ) : selectedProtocol.comments.map((c, i) => (
                      <div key={i} className="p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-display font-semibold text-foreground">{c.author}</span>
                          <span className="text-[10px] text-muted-foreground">{c.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{c.text}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
