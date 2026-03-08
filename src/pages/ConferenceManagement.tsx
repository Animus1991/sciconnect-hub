import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Plus, Search, Filter, MapPin, Clock, Users, ExternalLink,
  Globe, Tag, Star, ChevronRight, Presentation, FileText, AlertTriangle,
  CheckCircle2, ArrowUpRight
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ─── Types & Mock Data ───
interface Conference {
  id: string;
  name: string;
  acronym: string;
  type: "conference" | "workshop" | "symposium" | "seminar" | "webinar";
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  website: string;
  description: string;
  deadlines: { label: string; date: string; status: "passed" | "upcoming" | "today" }[];
  submissions: ConferenceSubmission[];
  tags: string[];
  attendees: number;
  acceptanceRate?: number;
  hIndex?: number;
  keynotes: string[];
  isAttending: boolean;
  isPresenting: boolean;
}

interface ConferenceSubmission {
  id: string;
  title: string;
  type: "paper" | "poster" | "talk" | "workshop_proposal";
  status: "draft" | "submitted" | "under_review" | "accepted" | "rejected" | "revision";
  submittedDate?: string;
  coAuthors: string[];
}

const TYPE_META: Record<Conference["type"], { icon: string; label: string }> = {
  conference: { icon: "🏛️", label: "Conference" },
  workshop: { icon: "🔧", label: "Workshop" },
  symposium: { icon: "🎓", label: "Symposium" },
  seminar: { icon: "📢", label: "Seminar" },
  webinar: { icon: "💻", label: "Webinar" },
};

const SUB_STATUS_META: Record<ConferenceSubmission["status"], { color: string; label: string }> = {
  draft: { color: "bg-muted text-muted-foreground border-border", label: "Draft" },
  submitted: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Submitted" },
  under_review: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Under Review" },
  accepted: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Accepted" },
  rejected: { color: "bg-destructive/10 text-destructive border-destructive/20", label: "Rejected" },
  revision: { color: "bg-violet-500/10 text-violet-600 border-violet-500/20", label: "Revision" },
};

const mockConferences: Conference[] = [
  {
    id: "conf-001",
    name: "International Conference on Machine Learning",
    acronym: "ICML 2026",
    type: "conference",
    field: "Machine Learning",
    location: "Vienna, Austria",
    startDate: "2026-07-21",
    endDate: "2026-07-27",
    website: "https://icml.cc/2026",
    description: "Premier venue for machine learning research. Covers deep learning, reinforcement learning, optimization, and applications.",
    deadlines: [
      { label: "Abstract Submission", date: "2026-01-30", status: "passed" },
      { label: "Full Paper Deadline", date: "2026-02-06", status: "passed" },
      { label: "Author Notification", date: "2026-05-01", status: "upcoming" },
      { label: "Camera Ready", date: "2026-06-01", status: "upcoming" },
    ],
    submissions: [
      { id: "sub-001", title: "Scalable Federated Learning with Differential Privacy for Multi-Site Medical Imaging", type: "paper", status: "under_review", submittedDate: "2026-02-05", coAuthors: ["Prof. James Chen", "Dr. Elena Vasquez"] },
    ],
    tags: ["ML", "deep learning", "AI", "top-tier"],
    attendees: 6000,
    acceptanceRate: 24.6,
    hIndex: 280,
    keynotes: ["Yann LeCun", "Fei-Fei Li"],
    isAttending: true,
    isPresenting: false,
  },
  {
    id: "conf-002",
    name: "Quantum Information Processing",
    acronym: "QIP 2026",
    type: "conference",
    field: "Quantum Computing",
    location: "Singapore",
    startDate: "2026-06-15",
    endDate: "2026-06-19",
    website: "https://qip2026.org",
    description: "Leading conference on quantum information science covering theory, experiment, and applications.",
    deadlines: [
      { label: "Talk Submission", date: "2026-02-15", status: "passed" },
      { label: "Poster Submission", date: "2026-03-15", status: "upcoming" },
      { label: "Notification", date: "2026-04-20", status: "upcoming" },
      { label: "Registration", date: "2026-05-30", status: "upcoming" },
    ],
    submissions: [
      { id: "sub-002", title: "Topological Quantum Error Correction via Surface Code Braiding", type: "talk", status: "submitted", submittedDate: "2026-02-14", coAuthors: ["Dr. Elena Vasquez"] },
      { id: "sub-003", title: "Benchmarking Noise Models on IBM Eagle Processors", type: "poster", status: "draft", coAuthors: [] },
    ],
    tags: ["quantum computing", "QIP", "error correction"],
    attendees: 800,
    acceptanceRate: 35,
    hIndex: 120,
    keynotes: ["John Preskill", "Michelle Simmons"],
    isAttending: true,
    isPresenting: true,
  },
  {
    id: "conf-003",
    name: "AGU Fall Meeting 2026",
    acronym: "AGU 2026",
    type: "conference",
    field: "Earth Sciences",
    location: "San Francisco, CA",
    startDate: "2026-12-14",
    endDate: "2026-12-18",
    website: "https://agu.org/fall-meeting",
    description: "Largest international earth and space science meeting. Over 25,000 attendees from 100+ countries.",
    deadlines: [
      { label: "Abstract Submission", date: "2026-08-01", status: "upcoming" },
      { label: "Early Registration", date: "2026-10-15", status: "upcoming" },
      { label: "Presentation Upload", date: "2026-12-01", status: "upcoming" },
    ],
    submissions: [],
    tags: ["earth science", "climate", "geophysics"],
    attendees: 25000,
    hIndex: 200,
    keynotes: [],
    isAttending: false,
    isPresenting: false,
  },
  {
    id: "conf-004",
    name: "Workshop on Reproducibility in ML",
    acronym: "ReproML 2026",
    type: "workshop",
    field: "Machine Learning",
    location: "Virtual",
    startDate: "2026-05-10",
    endDate: "2026-05-10",
    website: "https://reproml.org",
    description: "One-day workshop focused on reproducibility challenges in machine learning research.",
    deadlines: [
      { label: "Extended Abstract", date: "2026-03-20", status: "upcoming" },
      { label: "Notification", date: "2026-04-10", status: "upcoming" },
    ],
    submissions: [
      { id: "sub-004", title: "Reproducibility Bounties: Incentivizing Replication in ML Research", type: "workshop_proposal", status: "draft", coAuthors: ["Dr. Sofia Martínez"] },
    ],
    tags: ["reproducibility", "ML", "methodology"],
    attendees: 200,
    keynotes: ["Joelle Pineau"],
    isAttending: false,
    isPresenting: false,
  },
  {
    id: "conf-005",
    name: "CRISPR & Gene Editing Summit",
    acronym: "CGES 2026",
    type: "symposium",
    field: "Molecular Biology",
    location: "Boston, MA",
    startDate: "2026-09-08",
    endDate: "2026-09-10",
    website: "https://crisprge-summit.org",
    description: "Symposium bringing together leading researchers in CRISPR technology and gene editing applications.",
    deadlines: [
      { label: "Abstract Submission", date: "2026-05-15", status: "upcoming" },
      { label: "Early Bird Registration", date: "2026-07-01", status: "upcoming" },
    ],
    submissions: [
      { id: "sub-005", title: "CRISPR-Cas13 Off-Target Profiling: A Comprehensive Protocol", type: "poster", status: "accepted", submittedDate: "2026-04-20", coAuthors: ["Dr. Sofia Martínez", "Prof. James Chen"] },
    ],
    tags: ["CRISPR", "gene editing", "therapeutics"],
    attendees: 500,
    acceptanceRate: 55,
    keynotes: ["Jennifer Doudna", "Feng Zhang"],
    isAttending: true,
    isPresenting: true,
  },
];

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default function ConferenceManagement() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tab, setTab] = useState("upcoming");
  const [selectedConf, setSelectedConf] = useState<Conference | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const filtered = useMemo(() => {
    let result = [...mockConferences];
    if (typeFilter !== "all") result = result.filter(c => c.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.acronym.toLowerCase().includes(q) || c.field.toLowerCase().includes(q));
    }
    if (tab === "attending") result = result.filter(c => c.isAttending);
    if (tab === "presenting") result = result.filter(c => c.isPresenting);
    if (tab === "submissions") result = result.filter(c => c.submissions.length > 0);
    return result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [search, typeFilter, tab]);

  // Upcoming deadlines across all conferences
  const upcomingDeadlines = useMemo(() => {
    const all: { conf: Conference; label: string; date: string; daysLeft: number }[] = [];
    mockConferences.forEach(conf => {
      conf.deadlines.filter(d => d.status === "upcoming").forEach(d => {
        all.push({ conf, label: d.label, date: d.date, daysLeft: daysUntil(d.date) });
      });
    });
    return all.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 6);
  }, []);

  const stats = useMemo(() => ({
    total: mockConferences.length,
    attending: mockConferences.filter(c => c.isAttending).length,
    presenting: mockConferences.filter(c => c.isPresenting).length,
    submissions: mockConferences.reduce((s, c) => s + c.submissions.length, 0),
  }), []);

  return (
    <AppLayout>
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Conferences & Events</h1>
          <p className="text-sm text-muted-foreground font-display mt-1">
            Track conferences, deadlines, submissions, and travel plans
          </p>
        </div>
        <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Track Conference</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">Track a Conference</DialogTitle>
              <DialogDescription>Add a conference or event to your tracking list.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Conference Name</Label>
                <Input placeholder="e.g., NeurIPS 2026" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select defaultValue="conference">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_META).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Field</Label>
                  <Input placeholder="e.g., Machine Learning" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="e.g., Vienna, Austria" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input placeholder="https://..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
              <Button onClick={() => setShowNewForm(false)}>Add Conference</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tracked Events", value: stats.total, icon: Calendar },
          { label: "Attending", value: stats.attending, icon: Users },
          { label: "Presenting", value: stats.presenting, icon: Presentation },
          { label: "Submissions", value: stats.submissions, icon: FileText },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4">
            <stat.icon className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="text-xl font-serif font-bold text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground font-display">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Deadlines Banner */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Upcoming Deadlines
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {upcomingDeadlines.map((d, i) => (
              <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                d.daysLeft <= 7 ? "bg-destructive/5 border-destructive/20" : d.daysLeft <= 30 ? "bg-amber-500/5 border-amber-500/20" : "bg-secondary/50 border-border"
              }`}>
                <div className="min-w-0">
                  <p className="text-xs font-display font-medium text-foreground truncate">{d.label}</p>
                  <p className="text-[10px] text-muted-foreground">{d.conf.acronym} · {d.date}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${d.daysLeft <= 7 ? "text-destructive border-destructive/30" : d.daysLeft <= 30 ? "text-amber-600 border-amber-500/30" : ""}`}>
                  {d.daysLeft}d
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="upcoming">All</TabsTrigger>
            <TabsTrigger value="attending">Attending</TabsTrigger>
            <TabsTrigger value="presenting">Presenting</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36"><Filter className="w-3.5 h-3.5 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(TYPE_META).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conference List */}
      <div className="space-y-3">
        {filtered.map((conf, i) => {
          const meta = TYPE_META[conf.type];
          const days = daysUntil(conf.startDate);
          const nextDeadline = conf.deadlines.find(d => d.status === "upcoming");

          return (
            <motion.div
              key={conf.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedConf(conf)}
              className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base">{meta.icon}</span>
                    <h3 className="font-serif font-semibold text-foreground text-sm">{conf.acronym}</h3>
                    <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                    {conf.isAttending && <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Attending</Badge>}
                    {conf.isPresenting && <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 border-violet-500/20">Presenting</Badge>}
                  </div>
                  <p className="text-xs text-foreground font-display">{conf.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground font-display flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{conf.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{conf.startDate} → {conf.endDate}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{conf.attendees.toLocaleString()} attendees</span>
                    {conf.acceptanceRate && <span>Accept rate: {conf.acceptanceRate}%</span>}
                  </div>
                  {conf.submissions.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {conf.submissions.map(sub => {
                        const sm = SUB_STATUS_META[sub.status];
                        return (
                          <Badge key={sub.id} variant="outline" className={`text-[9px] ${sm.color}`}>
                            📄 {sub.title.slice(0, 40)}... — {sm.label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {days > 0 ? (
                    <>
                      <p className="text-lg font-serif font-bold text-foreground">{days}</p>
                      <p className="text-[10px] text-muted-foreground font-display">days away</p>
                    </>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">Happening now</Badge>
                  )}
                  {nextDeadline && (
                    <div className="mt-2">
                      <p className="text-[10px] text-muted-foreground font-display">Next: {nextDeadline.label}</p>
                      <p className="text-xs font-display font-medium text-foreground">{nextDeadline.date}</p>
                    </div>
                  )}
                </div>
              </div>
              {conf.tags.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {conf.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                </div>
              )}
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-display">No events found.</p>
          </div>
        )}
      </div>

      {/* Conference Detail Dialog */}
      <Dialog open={!!selectedConf} onOpenChange={() => setSelectedConf(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedConf && (() => {
            const meta = TYPE_META[selectedConf.type];
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meta.icon}</span>
                    <DialogTitle className="font-serif">{selectedConf.acronym}</DialogTitle>
                    <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                  </div>
                  <DialogDescription>{selectedConf.name}</DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-2">
                  <p className="text-sm text-muted-foreground">{selectedConf.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground font-display">Location</p>
                      <p className="text-xs font-display font-semibold text-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedConf.location}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground font-display">Dates</p>
                      <p className="text-xs font-display font-semibold text-foreground">{selectedConf.startDate}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground font-display">Attendees</p>
                      <p className="text-xs font-display font-semibold text-foreground">{selectedConf.attendees.toLocaleString()}</p>
                    </div>
                    {selectedConf.acceptanceRate && (
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-[10px] text-muted-foreground font-display">Acceptance Rate</p>
                        <p className="text-xs font-display font-semibold text-foreground">{selectedConf.acceptanceRate}%</p>
                      </div>
                    )}
                  </div>

                  {/* Deadlines */}
                  <div>
                    <h4 className="text-xs font-display font-semibold text-foreground mb-2">Deadlines</h4>
                    <div className="space-y-1.5">
                      {selectedConf.deadlines.map((d, i) => (
                        <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${
                          d.status === "passed" ? "bg-secondary/30 opacity-60" : "bg-secondary/50"
                        }`}>
                          <div className="flex items-center gap-2">
                            {d.status === "passed" ? <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" /> :
                             <Clock className={`w-3.5 h-3.5 ${daysUntil(d.date) <= 7 ? "text-destructive" : "text-amber-500"}`} />}
                            <span className="text-xs font-display">{d.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground font-display">{d.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submissions */}
                  {selectedConf.submissions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-display font-semibold text-foreground mb-2">Your Submissions</h4>
                      <div className="space-y-2">
                        {selectedConf.submissions.map(sub => {
                          const sm = SUB_STATUS_META[sub.status];
                          return (
                            <div key={sub.id} className="p-3 bg-secondary/30 rounded-lg border border-border">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-display font-semibold text-foreground">{sub.title}</span>
                                <Badge variant="outline" className={`text-[10px] ${sm.color}`}>{sm.label}</Badge>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span>{sub.type}</span>
                                {sub.submittedDate && <span>Submitted: {sub.submittedDate}</span>}
                                {sub.coAuthors.length > 0 && <span>With: {sub.coAuthors.join(", ")}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Keynotes */}
                  {selectedConf.keynotes.length > 0 && (
                    <div>
                      <h4 className="text-xs font-display font-semibold text-foreground mb-2">Keynote Speakers</h4>
                      <div className="flex gap-2 flex-wrap">
                        {selectedConf.keynotes.map(k => <Badge key={k} variant="outline" className="text-xs">{k}</Badge>)}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
