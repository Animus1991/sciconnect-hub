import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeftRight, BookOpen, Quote, TrendingUp, Users, Award, GitBranch,
  Star, ChevronDown, Search, Check, Plus, X, ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ── Mock researcher data ── */
const RESEARCHERS = [
  {
    id: "r1",
    name: "Dr. Sarah Chen",
    title: "Associate Professor of Computer Science",
    institution: "MIT",
    avatar: "SC",
    field: "Machine Learning",
    expertise: ["Deep Learning", "NLP", "Computer Vision", "Transformers", "Federated Learning"],
    publications: 47,
    citations: 2840,
    hIndex: 23,
    i10Index: 31,
    followers: 1250,
    collaborations: 18,
    openAccess: 72,
    recentPapers: [
      { title: "Federated Transformers for Privacy-Preserving NLP", venue: "NeurIPS 2025", citations: 312 },
      { title: "Contrastive Learning with Hierarchical Embeddings", venue: "ICML 2025", citations: 187 },
      { title: "Self-Supervised Vision-Language Pretraining", venue: "CVPR 2024", citations: 543 },
    ],
    researchInterests: ["Responsible AI", "Multi-modal models", "Edge AI"],
    available: true,
    orcid: "0000-0002-1234-5678",
  },
  {
    id: "r2",
    name: "Prof. Michael Rodriguez",
    title: "Professor of Physics",
    institution: "Stanford University",
    avatar: "MR",
    field: "Quantum Computing",
    expertise: ["Quantum Algorithms", "Quantum Information", "Error Correction", "Quantum ML", "Topological Qubits"],
    publications: 62,
    citations: 5100,
    hIndex: 31,
    i10Index: 44,
    followers: 890,
    collaborations: 27,
    openAccess: 58,
    recentPapers: [
      { title: "Topological Quantum Error Correction at Scale", venue: "Nature 2025", citations: 891 },
      { title: "Variational Quantum Eigensolver Improvements", venue: "Physical Review 2025", citations: 240 },
      { title: "Quantum Advantage in Optimisation Problems", venue: "Science 2024", citations: 1043 },
    ],
    researchInterests: ["Quantum advantage", "Fault-tolerant computing", "Quantum networks"],
    available: false,
    orcid: "0000-0003-8765-4321",
  },
  {
    id: "r3",
    name: "Dr. Emily Watson",
    title: "Research Scientist",
    institution: "DeepMind",
    avatar: "EW",
    field: "Computational Biology",
    expertise: ["Protein Folding", "Molecular Dynamics", "Bioinformatics", "ML for Biology", "Drug Discovery"],
    publications: 35,
    citations: 1920,
    hIndex: 18,
    i10Index: 22,
    followers: 2100,
    collaborations: 14,
    openAccess: 89,
    recentPapers: [
      { title: "AlphaFold Extensions for Membrane Proteins", venue: "Cell 2025", citations: 670 },
      { title: "Graph Neural Networks for Drug-Target Interaction", venue: "Nature Methods 2025", citations: 298 },
      { title: "Cryo-EM Structure Prediction at Atomic Resolution", venue: "PNAS 2024", citations: 412 },
    ],
    researchInterests: ["mRNA therapeutics", "Structural genomics", "AI-driven drug design"],
    available: true,
    orcid: "0000-0001-5555-9999",
  },
  {
    id: "r4",
    name: "Dr. Yuki Tanaka",
    title: "Associate Professor of Bioinformatics",
    institution: "University of Tokyo",
    avatar: "YT",
    field: "Bioinformatics",
    expertise: ["Single-cell RNA-seq", "CRISPR screens", "Genomic networks", "Epigenomics"],
    publications: 41,
    citations: 3210,
    hIndex: 26,
    i10Index: 33,
    followers: 780,
    collaborations: 21,
    openAccess: 95,
    recentPapers: [
      { title: "Single-Cell Multi-omic Integration Methods", venue: "Nature Biotech 2025", citations: 520 },
      { title: "CRISPR Screen Deconvolution at Scale", venue: "Genome Research 2025", citations: 188 },
      { title: "Spatial Transcriptomics for Neural Circuits", venue: "Cell Systems 2024", citations: 345 },
    ],
    researchInterests: ["Spatial transcriptomics", "Network biology", "Phenotype prediction"],
    available: true,
    orcid: "0000-0004-2222-7777",
  },
];

type Researcher = typeof RESEARCHERS[number];

/* ── Researcher picker ── */
function ResearcherPicker({
  selected,
  exclude,
  onChange,
  slot,
}: {
  selected: Researcher | null;
  exclude: string | null;
  onChange: (r: Researcher) => void;
  slot: "A" | "B";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = RESEARCHERS.filter(
    r => r.id !== exclude && r.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
          selected
            ? "bg-card border-border hover:border-primary/40"
            : "border-dashed border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-muted/50"
        )}
      >
        {selected ? (
          <>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
              {selected.avatar}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold truncate">{selected.name}</p>
              <p className="text-xs text-muted-foreground truncate">{selected.institution}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-border/60 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground flex-1 text-left">
              Select Researcher {slot}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder="Search researchers..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(r => (
              <button
                key={r.id}
                onClick={() => { onChange(r); setOpen(false); setQuery(""); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                  {r.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.institution} · {r.field}</p>
                </div>
                {selected?.id === r.id && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">No researchers found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Metric row ── */
function MetricRow({
  label,
  a,
  b,
  higher = "better",
  suffix = "",
  icon: Icon,
}: {
  label: string;
  a: number;
  b: number;
  higher?: "better" | "lower";
  suffix?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const aWins = higher === "better" ? a > b : a < b;
  const bWins = higher === "better" ? b > a : b < a;
  const maxVal = Math.max(a, b, 1);

  return (
    <div className="py-3 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2 mb-2.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* A side */}
        <div className="space-y-1">
          <div className={cn("text-sm font-bold", aWins ? "text-primary" : "text-foreground")}>
            {a.toLocaleString()}{suffix}
            {aWins && <span className="ml-1 text-[10px] text-primary">▲</span>}
          </div>
          <Progress
            value={(a / maxVal) * 100}
            className="h-1.5"
          />
        </div>
        {/* VS divider */}
        <span className="text-[10px] text-muted-foreground font-mono px-1">VS</span>
        {/* B side */}
        <div className="space-y-1">
          <div className={cn("text-sm font-bold text-right", bWins ? "text-primary" : "text-foreground")}>
            {bWins && <span className="mr-1 text-[10px] text-primary">▲</span>}
            {b.toLocaleString()}{suffix}
          </div>
          <Progress
            value={(b / maxVal) * 100}
            className="h-1.5 [&>div]:ml-auto"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Tags diff ── */
function TagsDiff({
  label,
  aItems,
  bItems,
}: {
  label: string;
  aItems: string[];
  bItems: string[];
}) {
  const shared = aItems.filter(x => bItems.includes(x));
  const onlyA = aItems.filter(x => !bItems.includes(x));
  const onlyB = bItems.filter(x => !aItems.includes(x));

  return (
    <div className="py-3 border-b border-border/40 last:border-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">{label}</p>
      <div className="grid grid-cols-[1fr_80px_1fr] gap-3">
        <div className="flex flex-wrap gap-1">
          {onlyA.map(t => (
            <Badge key={t} variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">{t}</Badge>
          ))}
          {shared.map(t => (
            <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1 pt-0.5">
          {shared.length > 0 && (
            <span className="text-[10px] text-success font-medium text-center">
              {shared.length} shared
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {shared.map(t => (
            <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
          ))}
          {onlyB.map(t => (
            <Badge key={t} variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">{t}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
const ResearcherComparison = () => {
  const [resA, setResA] = useState<Researcher | null>(null);
  const [resB, setResB] = useState<Researcher | null>(null);

  const canCompare = resA && resB;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto py-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowLeftRight className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Researcher Comparison</h1>
            <p className="text-sm text-muted-foreground">Compare two researchers side-by-side across metrics, expertise, and output</p>
          </div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-[1fr_40px_1fr] items-center gap-3 mt-6 mb-8">
          <ResearcherPicker
            selected={resA}
            exclude={resB?.id ?? null}
            onChange={setResA}
            slot="A"
          />
          <div className="flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              vs
            </div>
          </div>
          <ResearcherPicker
            selected={resB}
            exclude={resA?.id ?? null}
            onChange={setResB}
            slot="B"
          />
        </div>

        {/* Empty state */}
        {!canCompare && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <ArrowLeftRight className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-base font-medium">Select two researchers to compare</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose researchers from the dropdowns above to see a detailed side-by-side analysis
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Compares publications, citations, h-index, expertise overlap, and research interests
            </p>
          </div>
        )}

        {/* Comparison results */}
        {canCompare && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Researcher cards header */}
            <div className="grid grid-cols-[1fr_80px_1fr] gap-3">
              {[resA, resB].map((r, idx) => (
                <div key={r.id} className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary mx-auto flex items-center justify-center text-lg font-bold text-primary-foreground mb-2">
                    {r.avatar}
                  </div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.institution}</p>
                  <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">{r.field}</Badge>
                    {r.available && (
                      <Badge className="text-[10px] bg-success/10 text-success border-success/20">Open to collab</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <a href={`/profile/${r.id}`} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                      View profile <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-center col-start-2">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground mx-auto mb-1">vs</div>
                  <p className="text-[10px] text-muted-foreground">Comparison</p>
                </div>
              </div>
            </div>

            {/* Numeric metrics */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold mb-1">Research Output Metrics</h3>
              <p className="text-xs text-muted-foreground mb-4">Bibliometric comparison based on public records</p>
              <MetricRow label="Publications" a={resA.publications} b={resB.publications} icon={BookOpen} />
              <MetricRow label="Total Citations" a={resA.citations} b={resB.citations} icon={Quote} />
              <MetricRow label="h-index" a={resA.hIndex} b={resB.hIndex} icon={TrendingUp} />
              <MetricRow label="i10-index" a={resA.i10Index} b={resB.i10Index} icon={Award} />
              <MetricRow label="Collaborations" a={resA.collaborations} b={resB.collaborations} icon={Users} />
              <MetricRow label="Open Access %" a={resA.openAccess} b={resB.openAccess} icon={GitBranch} suffix="%" />
              <MetricRow label="Followers" a={resA.followers} b={resB.followers} icon={Star} />
            </div>

            {/* Expertise overlap */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold mb-1">Expertise & Interests</h3>
              <p className="text-xs text-muted-foreground mb-4">Unique areas highlighted, shared areas shown in outline</p>
              <TagsDiff label="Research Expertise" aItems={resA.expertise} bItems={resB.expertise} />
              <TagsDiff label="Research Interests" aItems={resA.researchInterests} bItems={resB.researchInterests} />
            </div>

            {/* Recent papers */}
            <div className="grid grid-cols-2 gap-4">
              {[resA, resB].map(r => (
                <div key={r.id} className="bg-card rounded-xl border border-border p-5">
                  <h3 className="text-sm font-semibold mb-3">{r.name.split(" ")[0]}'s Recent Papers</h3>
                  <div className="space-y-3">
                    {r.recentPapers.map((p, i) => (
                      <div key={i} className="group">
                        <p className="text-xs font-medium leading-tight group-hover:text-primary transition-colors cursor-pointer">
                          {p.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">{p.venue}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-primary">{p.citations} citations</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Compatibility insight */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowLeftRight className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Collaboration Compatibility</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {resA.expertise.filter(x => resB.expertise.includes(x)).length > 0
                      ? `Strong overlap in ${resA.expertise.filter(x => resB.expertise.includes(x)).join(", ")}. These researchers share ${resA.expertise.filter(x => resB.expertise.includes(x)).length} areas of expertise — indicating high collaboration potential.`
                      : `${resA.name.split(" ")[1]} and ${resB.name.split(" ")[1]} have complementary expertise with no direct overlap — ideal for interdisciplinary research and cross-field collaborations.`
                    }
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg">
                      <Users className="w-3 h-3 mr-1.5" />
                      Connect {resA.name.split(" ")[1]} + {resB.name.split(" ")[1]}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default ResearcherComparison;
