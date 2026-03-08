import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Download, FileText, Hash, Table, X, CheckCircle,
  AlertCircle, Loader2, Copy, FileUp, ArrowRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Paper {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  citations: number;
}

const sampleBibtex = `@article{vaswani2017attention,
  title={Attention is all you need},
  author={Vaswani, Ashish and Shazeer, Noam},
  journal={NeurIPS},
  year={2017}
}

@article{he2016deep,
  title={Deep residual learning},
  author={He, Kaiming and Zhang, Xiangyu},
  journal={CVPR},
  year={2016}
}`;

const sampleDois = `10.1038/s41586-024-07487-w
10.1126/science.adg7879
10.1016/j.cell.2024.01.029
10.1038/s41592-024-02201-0`;

const mockParsedPapers: Paper[] = [
  { title: "Attention is all you need", authors: ["Vaswani, A.", "Shazeer, N."], journal: "NeurIPS", year: 2017, doi: "10.48550/arXiv.1706.03762", citations: 95000 },
  { title: "Deep residual learning for image recognition", authors: ["He, K.", "Zhang, X."], journal: "CVPR", year: 2016, doi: "10.1109/CVPR.2016.90", citations: 180000 },
];

interface ImportExportManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function ImportExportManager({ open, onClose }: ImportExportManagerProps) {
  const [activeTab, setActiveTab] = useState("bibtex");
  const [bibtexInput, setBibtexInput] = useState("");
  const [doiInput, setDoiInput] = useState("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; papers: Paper[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBibtexImport = () => {
    if (!bibtexInput.trim()) {
      toast.error("Please paste BibTeX content or upload a .bib file");
      return;
    }
    setImporting(true);
    setImportResult(null);
    setTimeout(() => {
      setImporting(false);
      setImportResult({ success: 2, failed: 0, papers: mockParsedPapers });
      toast.success("Successfully imported 2 papers from BibTeX");
    }, 1500);
  };

  const handleDoiImport = () => {
    const dois = doiInput.trim().split("\n").filter(Boolean);
    if (dois.length === 0) {
      toast.error("Please enter at least one DOI");
      return;
    }
    setImporting(true);
    setImportResult(null);
    setTimeout(() => {
      setImporting(false);
      const result = {
        success: Math.min(dois.length, 4),
        failed: Math.max(0, dois.length - 4),
        papers: mockParsedPapers.slice(0, Math.min(dois.length, 2)),
      };
      setImportResult(result);
      toast.success(`Resolved ${result.success} DOIs, ${result.failed} failed`);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".bib") && !file.name.endsWith(".bibtex")) {
      toast.error("Please upload a .bib or .bibtex file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      setBibtexInput(evt.target?.result as string);
      toast.info(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleCSVExport = () => {
    setExporting(true);
    setTimeout(() => {
      const csv = [
        "Title,Authors,Journal,Year,DOI,Citations",
        ...mockParsedPapers.map(p =>
          `"${p.title}","${p.authors.join("; ")}","${p.journal}",${p.year},"${p.doi || ""}",${p.citations}`
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sciconnect_papers_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
      toast.success("CSV exported successfully");
    }, 1000);
  };

  const handleBibtexExport = () => {
    setExporting(true);
    setTimeout(() => {
      const bib = mockParsedPapers.map(p => {
        const key = p.authors[0]?.split(",")[0]?.toLowerCase() || "unknown";
        return `@article{${key}${p.year},\n  title={${p.title}},\n  author={${p.authors.join(" and ")}},\n  journal={${p.journal}},\n  year={${p.year}},\n  doi={${p.doi || ""}}\n}`;
      }).join("\n\n");
      const blob = new Blob([bib], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sciconnect_papers_${new Date().toISOString().slice(0, 10)}.bib`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
      toast.success("BibTeX exported successfully");
    }, 1000);
  };

  const resetState = () => {
    setBibtexInput("");
    setDoiInput("");
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onClose(); resetState(); } }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
              <FileText className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <DialogTitle className="font-display font-semibold text-foreground">
                Import & Export Papers
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-display">
                BibTeX import, DOI batch import, and CSV/BibTeX export
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setImportResult(null); }}
          className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 bg-secondary border border-border">
            <TabsTrigger value="bibtex" className="font-display text-sm flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> BibTeX Import
            </TabsTrigger>
            <TabsTrigger value="doi" className="font-display text-sm flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> DOI Import
            </TabsTrigger>
            <TabsTrigger value="export" className="font-display text-sm flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
            {/* BIBTEX IMPORT */}
            <TabsContent value="bibtex" className="mt-0 space-y-4">
              <div>
                <label className="text-sm font-display font-medium text-foreground mb-2 block">
                  Paste BibTeX or upload .bib file
                </label>
                <textarea
                  value={bibtexInput}
                  onChange={e => setBibtexInput(e.target.value)}
                  placeholder={sampleBibtex}
                  rows={8}
                  className="w-full rounded-lg border border-border bg-secondary p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent resize-none scrollbar-thin"
                />
                <div className="flex items-center gap-3 mt-3">
                  <input ref={fileInputRef} type="file" accept=".bib,.bibtex" onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-4 rounded-lg bg-secondary border border-border text-sm font-display font-medium text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2">
                    <FileUp className="w-3.5 h-3.5" /> Upload .bib
                  </button>
                  <button onClick={() => setBibtexInput(sampleBibtex)}
                    className="text-[11px] font-display text-accent hover:underline">
                    Load sample
                  </button>
                  <button onClick={handleBibtexImport} disabled={importing || !bibtexInput.trim()}
                    className="ml-auto h-9 px-5 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                    {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    {importing ? "Parsing..." : "Import"}
                  </button>
                </div>
              </div>

              <ImportResultView result={importResult} />
            </TabsContent>

            {/* DOI IMPORT */}
            <TabsContent value="doi" className="mt-0 space-y-4">
              <div>
                <label className="text-sm font-display font-medium text-foreground mb-2 block">
                  Enter DOIs (one per line)
                </label>
                <textarea
                  value={doiInput}
                  onChange={e => setDoiInput(e.target.value)}
                  placeholder={sampleDois}
                  rows={6}
                  className="w-full rounded-lg border border-border bg-secondary p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent resize-none scrollbar-thin"
                />
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => setDoiInput(sampleDois)}
                    className="text-[11px] font-display text-accent hover:underline">
                    Load sample DOIs
                  </button>
                  <span className="text-[10px] text-muted-foreground font-display">
                    {doiInput.trim().split("\n").filter(Boolean).length} DOIs entered
                  </span>
                  <button onClick={handleDoiImport} disabled={importing || !doiInput.trim()}
                    className="ml-auto h-9 px-5 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                    {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Hash className="w-3.5 h-3.5" />}
                    {importing ? "Resolving..." : "Resolve & Import"}
                  </button>
                </div>
              </div>

              <ImportResultView result={importResult} />
            </TabsContent>

            {/* EXPORT */}
            <TabsContent value="export" className="mt-0 space-y-4">
              <p className="text-sm text-muted-foreground font-display">
                Export your synced papers from all connected repositories.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCSVExport}
                  disabled={exporting}
                  className="bg-card rounded-xl border border-border p-5 text-left hover:border-accent/30 hover:shadow-scholarly transition-all disabled:opacity-50 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-muted flex items-center justify-center mb-3">
                    <Table className="w-5 h-5 text-emerald-brand" />
                  </div>
                  <h4 className="font-display font-semibold text-foreground text-sm mb-1 group-hover:text-accent transition-colors">
                    CSV Export
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-display leading-relaxed">
                    Spreadsheet-compatible format with title, authors, journal, year, DOI, and citations.
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-display text-muted-foreground">
                    <FileText className="w-3 h-3" /> {mockParsedPapers.length} papers · .csv
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleBibtexExport}
                  disabled={exporting}
                  className="bg-card rounded-xl border border-border p-5 text-left hover:border-accent/30 hover:shadow-scholarly transition-all disabled:opacity-50 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold-muted flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-gold" />
                  </div>
                  <h4 className="font-display font-semibold text-foreground text-sm mb-1 group-hover:text-accent transition-colors">
                    BibTeX Export
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-display leading-relaxed">
                    LaTeX-ready citation format for reference managers like Zotero, Mendeley, and EndNote.
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-display text-muted-foreground">
                    <FileText className="w-3 h-3" /> {mockParsedPapers.length} papers · .bib
                  </div>
                </motion.button>
              </div>

              {exporting && (
                <div className="flex items-center gap-2 justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span className="text-sm font-display text-muted-foreground">Preparing export...</span>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ImportResultView({ result }: { result: { success: number; failed: number; papers: Paper[] } | null }) {
  if (!result) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-brand" />
        <div>
          <p className="text-sm font-display font-medium text-foreground">Import complete</p>
          <p className="text-[11px] text-muted-foreground font-display">
            {result.success} imported · {result.failed} failed
          </p>
        </div>
      </div>
      {result.papers.length > 0 && (
        <div className="space-y-2">
          {result.papers.map((p, i) => (
            <div key={i} className="p-3 rounded-lg bg-secondary">
              <p className="text-xs font-display font-medium text-foreground leading-snug">{p.title}</p>
              <p className="text-[10px] text-muted-foreground font-display mt-0.5">
                {p.authors.join(", ")} · {p.journal} ({p.year})
              </p>
              {p.doi && (
                <Badge variant="outline" className="text-[9px] font-mono mt-1">{p.doi}</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
