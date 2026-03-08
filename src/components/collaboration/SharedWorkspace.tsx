import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, FileText, MoreVertical, Clock, Lock, Globe, Star, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileSharing, { type SharedFile } from "./FileSharing";

interface WorkspaceMember {
  id: string;
  name: string;
  initials: string;
  role: "owner" | "editor" | "viewer";
  online: boolean;
  editing?: string;
  color: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  members: WorkspaceMember[];
  documents: { id: string; title: string; lastEdited: string; editedBy: string }[];
  files: SharedFile[];
  visibility: "private" | "team" | "public";
  starred: boolean;
  updatedAt: string;
}

const mockWorkspaces: Workspace[] = [
  {
    id: "ws1",
    name: "Quantum ML Paper Draft",
    description: "Collaborative workspace for the quantum neural network paper",
    visibility: "team",
    starred: true,
    updatedAt: "2 min ago",
    members: [
      { id: "u1", name: "Dr. Alex Thompson", initials: "AT", role: "owner", online: true, editing: "Section 3.2", color: "hsl(var(--gold))" },
      { id: "u2", name: "Dr. Sarah Chen", initials: "SC", role: "editor", online: true, editing: "Abstract", color: "hsl(var(--emerald))" },
      { id: "u3", name: "Prof. James Wilson", initials: "JW", role: "editor", online: false, color: "hsl(var(--accent))" },
      { id: "u4", name: "Maria Garcia", initials: "MG", role: "viewer", online: true, color: "hsl(160, 60%, 50%)" },
    ],
    documents: [
      { id: "d1", title: "Main Manuscript", lastEdited: "2 min ago", editedBy: "Dr. Alex Thompson" },
      { id: "d2", title: "Supplementary Materials", lastEdited: "1 hour ago", editedBy: "Dr. Sarah Chen" },
      { id: "d3", title: "Figures & Diagrams", lastEdited: "3 hours ago", editedBy: "Prof. James Wilson" },
    files: [
      { id: "f1", name: "variational-circuit-v2.png", type: "image", size: "1.2 MB", uploadedBy: "Dr. Sarah Chen", uploadedAt: "2 hours ago" },
      { id: "f2", name: "benchmark-results.pdf", type: "pdf", size: "3.4 MB", uploadedBy: "Dr. Alex Thompson", uploadedAt: "Yesterday" },
    ],
  },
  {
    id: "ws2",
    name: "Neuroimaging Pipeline Review",
    description: "Reviewing data processing pipelines for the open neuroscience platform",
    visibility: "private",
    starred: false,
    updatedAt: "1 hour ago",
    members: [
      { id: "u1", name: "Dr. Alex Thompson", initials: "AT", role: "owner", online: true, color: "hsl(var(--gold))" },
      { id: "u5", name: "Dr. Emily Park", initials: "EP", role: "editor", online: true, editing: "Pipeline Config", color: "hsl(200, 60%, 50%)" },
    ],
    documents: [
      { id: "d4", title: "Pipeline Architecture", lastEdited: "45 min ago", editedBy: "Dr. Emily Park" },
      { id: "d5", title: "Performance Benchmarks", lastEdited: "2 days ago", editedBy: "Dr. Alex Thompson" },
    files: [],
  },
  {
    id: "ws3",
    name: "Grant Proposal — EU Horizon 2027",
    description: "Collaborative grant writing for climate modeling framework",
    visibility: "team",
    starred: true,
    updatedAt: "Yesterday",
    members: [
      { id: "u1", name: "Dr. Alex Thompson", initials: "AT", role: "editor", online: true, color: "hsl(var(--gold))" },
      { id: "u6", name: "Prof. Klaus Richter", initials: "KR", role: "owner", online: false, color: "hsl(280, 50%, 55%)" },
      { id: "u7", name: "Dr. Yuki Tanaka", initials: "YT", role: "editor", online: false, color: "hsl(340, 60%, 55%)" },
    ],
    documents: [
      { id: "d6", title: "Project Narrative", lastEdited: "Yesterday", editedBy: "Prof. Klaus Richter" },
      { id: "d7", title: "Budget Justification", lastEdited: "2 days ago", editedBy: "Dr. Alex Thompson" },
      { id: "d8", title: "Timeline & Milestones", lastEdited: "3 days ago", editedBy: "Dr. Yuki Tanaka" },
    ],
    files: [
      { id: "f3", name: "budget-v4.docx", type: "document", size: "245 KB", uploadedBy: "Dr. Alex Thompson", uploadedAt: "2 days ago" },
    ],
  },
];

const visibilityIcons = { private: Lock, team: Users, public: Globe };

const SharedWorkspace = () => {
  const [workspaces, setWorkspaces] = useState(mockWorkspaces);
  const [selectedWs, setSelectedWs] = useState<string | null>(null);
  const [newWsName, setNewWsName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleStar = (id: string) => {
    setWorkspaces(prev => prev.map(ws => ws.id === id ? { ...ws, starred: !ws.starred } : ws));
  };

  const createWorkspace = () => {
    if (!newWsName.trim()) return;
    const ws: Workspace = {
      id: `ws_${Date.now()}`,
      name: newWsName,
      description: "",
      visibility: "team",
      starred: false,
      updatedAt: "Just now",
      members: [{ id: "u1", name: "Dr. Alex Thompson", initials: "AT", role: "owner", online: true, color: "hsl(var(--gold))" }],
      documents: [],
      files: [],
    };
    setWorkspaces(prev => [ws, ...prev]);
    setNewWsName("");
    setDialogOpen(false);
  };

  const active = workspaces.find(ws => ws.id === selectedWs);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-foreground">Shared Workspaces</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-gold text-accent-foreground font-display text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">Create Workspace</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Workspace name..." value={newWsName} onChange={e => setNewWsName(e.target.value)} onKeyDown={e => e.key === "Enter" && createWorkspace()} />
              <Button onClick={createWorkspace} className="w-full gradient-gold text-accent-foreground font-display">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workspace list */}
      <div className="space-y-2">
        {workspaces.map(ws => {
          const VisIcon = visibilityIcons[ws.visibility];
          const onlineCount = ws.members.filter(m => m.online).length;
          const editing = ws.members.filter(m => m.editing);
          return (
            <motion.div
              key={ws.id}
              layout
              onClick={() => setSelectedWs(selectedWs === ws.id ? null : ws.id)}
              className={`bg-card rounded-xl border p-4 cursor-pointer transition-colors ${selectedWs === ws.id ? "border-accent" : "border-border hover:border-accent/30"}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button onClick={e => { e.stopPropagation(); toggleStar(ws.id); }} className="flex-shrink-0">
                    <Star className={`w-4 h-4 ${ws.starred ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                  </button>
                  <h3 className="font-serif text-sm font-semibold text-foreground truncate">{ws.name}</h3>
                  <Badge variant="outline" className="text-[9px] font-display flex items-center gap-0.5 flex-shrink-0">
                    <VisIcon className="w-2.5 h-2.5" /> {ws.visibility}
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground font-display flex-shrink-0 ml-2">{ws.updatedAt}</span>
              </div>

              {/* Live presence */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {ws.members.slice(0, 5).map(m => (
                    <div key={m.id} className="relative" title={`${m.name}${m.editing ? ` — editing ${m.editing}` : ""}`}>
                      <div className="w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-[9px] font-display font-bold text-primary-foreground" style={{ backgroundColor: m.color }}>
                        {m.initials}
                      </div>
                      {m.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground font-display">
                  {onlineCount} online
                </span>
                {editing.length > 0 && (
                  <Badge variant="secondary" className="text-[9px] font-display flex items-center gap-0.5 animate-pulse">
                    <Edit3 className="w-2.5 h-2.5" /> {editing.length} editing
                  </Badge>
                )}
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {selectedWs === ws.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    {ws.description && <p className="text-xs text-muted-foreground font-display mb-3">{ws.description}</p>}

                    {/* Live editing indicators */}
                    {editing.length > 0 && (
                      <div className="mb-3 space-y-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium">Live Editing</p>
                        {editing.map(m => (
                          <div key={m.id} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: m.color }} />
                            <span className="text-xs font-display text-foreground">{m.name}</span>
                            <span className="text-[10px] text-muted-foreground">→ {m.editing}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Documents */}
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-medium mb-1.5">Documents</p>
                      {ws.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2 hover:bg-secondary/60 transition-colors">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-display text-foreground">{doc.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-display">
                            <Clock className="w-3 h-3" /> {doc.lastEdited}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SharedWorkspace;
