import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, Building2, BookOpen, Users, Award, Calendar, Mail,
  Globe, Share2, MessageSquare, ExternalLink, BarChart2, Heart,
  CheckCircle2, Link2, Flag, UserMinus, MoreHorizontal, Sparkles,
  Download, FlaskConical
} from "lucide-react";
import { BlockchainVerificationBadge } from "@/components/blockchain/BlockchainVerificationBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportUserModal } from "@/components/shared/ReportUserModal";
import { mockPapers } from "@/data/mockData";
import ResearchCard from "@/components/feed/ResearchCard";
import { toast } from "sonner";

/* ─── Mock Researcher Database ─── */
const RESEARCHERS: Record<string, {
  id: string; name: string; title: string; institution: string; location: string;
  field: string; bio: string; website: string; orcid: string;
  publications: number; citations: number; hIndex: number; followers: number;
  expertise: string[]; initials: string; availableForCollab: boolean;
  joinedDate: string; verified: boolean;
}> = {
  "sarah-chen": {
    id: "sarah-chen", name: "Dr. Sarah Chen", title: "Associate Professor of Computer Science", institution: "MIT", location: "Cambridge, MA", field: "Machine Learning",
    bio: "Researching the intersection of deep learning and scientific discovery. Interested in building AI systems that accelerate research across disciplines, from drug discovery to climate modelling. Previously at Google Brain and DeepMind.",
    website: "https://sarahchen.mit.edu", orcid: "0000-0002-1234-5678",
    publications: 47, citations: 2840, hIndex: 23, followers: 1250,
    expertise: ["Deep Learning", "NLP", "Computer Vision", "Transformers", "Scientific AI"],
    initials: "SC", availableForCollab: true, joinedDate: "January 2024", verified: true,
  },
  "michael-rodriguez": {
    id: "michael-rodriguez", name: "Prof. Michael Rodriguez", title: "Professor of Physics", institution: "Stanford University", location: "Palo Alto, CA", field: "Quantum Computing",
    bio: "Working on quantum error correction, quantum algorithms, and the theoretical foundations of quantum computing. PI of the Stanford Quantum Lab. ERC Starting Grant 2023 recipient.",
    website: "https://quantumlab.stanford.edu", orcid: "0000-0003-8765-4321",
    publications: 62, citations: 5100, hIndex: 31, followers: 890,
    expertise: ["Quantum Algorithms", "Quantum Error Correction", "Quantum Information Theory", "Topological Qubits"],
    initials: "MR", availableForCollab: false, joinedDate: "March 2024", verified: true,
  },
  "emily-watson": {
    id: "emily-watson", name: "Dr. Emily Watson", title: "Research Scientist", institution: "DeepMind", location: "London, UK", field: "Computational Biology",
    bio: "Applying machine learning to understand protein folding, drug target identification, and the molecular mechanisms of disease. Working at the interface of structural biology and deep learning.",
    website: "https://emilytwatson.com", orcid: "0000-0001-2222-3333",
    publications: 35, citations: 1920, hIndex: 18, followers: 2100,
    expertise: ["Protein Folding", "Molecular Dynamics", "Bioinformatics", "ML for Biology"],
    initials: "EW", availableForCollab: true, joinedDate: "June 2023", verified: true,
  },
};

const DEFAULT_RESEARCHER = {
  id: "unknown", name: "Researcher", title: "Researcher", institution: "Unknown Institution", location: "Unknown",
  field: "Research", bio: "This researcher has not added a bio yet.", website: "", orcid: "",
  publications: 0, citations: 0, hIndex: 0, followers: 0, expertise: [], initials: "R",
  availableForCollab: false, joinedDate: "2024", verified: false,
};

/* ─── Stats Bar ─── */
function StatPill({ icon: Icon, value, label }: { icon: typeof BookOpen; value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <p className="text-[20px] font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

/* ─── Main ─── */
const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const researcher = (userId && RESEARCHERS[userId]) || DEFAULT_RESEARCHER;
  const [following, setFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const shareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => toast.success("Profile link copied!"));
  };

  if (!userId || !RESEARCHERS[userId]) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-[22px] font-semibold text-foreground mb-2">Researcher not found</h1>
          <p className="text-[14px] text-muted-foreground mb-6">This profile doesn't exist or the researcher has set their profile to private.</p>
          <Link to="/discover" className="px-5 h-10 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            <Users className="w-4 h-4" /> Browse Researchers
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Report Modal */}
        <ReportUserModal open={reportOpen} onOpenChange={setReportOpen} targetName={researcher.name} />

        {/* Header Card */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Cover / gradient */}
            <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />

            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-10 mb-4">
                <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                  <AvatarFallback className="text-[22px] font-semibold bg-secondary text-foreground">
                    {researcher.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 mt-10">
                  <button
                    onClick={() => { setFollowing(!following); toast.success(following ? `Unfollowed ${researcher.name}` : `Following ${researcher.name}`); }}
                    className={`px-4 h-9 rounded-xl text-[13px] font-medium transition-all ${following ? "border border-border bg-secondary text-foreground hover:bg-secondary/70" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                  >
                    {following ? <><CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />Following</> : <><Heart className="w-3.5 h-3.5 inline mr-1.5" />Follow</>}
                  </button>
                  <Link to="/messages" className="flex items-center gap-1.5 px-4 h-9 rounded-xl border border-border text-[13px] text-foreground hover:bg-secondary transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </Link>
                  <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg py-1 z-10 min-w-[160px]">
                        <button onClick={() => { shareProfile(); setMenuOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-secondary w-full text-left rounded-lg mx-0.5 transition-colors">
                          <Share2 className="w-3.5 h-3.5 text-muted-foreground" /> Copy profile link
                        </button>
                        <button onClick={() => { toast.info("Download coming soon"); setMenuOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-secondary w-full text-left rounded-lg mx-0.5 transition-colors">
                          <Download className="w-3.5 h-3.5 text-muted-foreground" /> Download CV
                        </button>
                        <div className="my-1 border-t border-border/50" />
                        <button onClick={() => { setReportOpen(true); setMenuOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-destructive hover:bg-destructive/10 w-full text-left rounded-lg mx-0.5 transition-colors">
                          <Flag className="w-3.5 h-3.5" /> Report
                        </button>
                        <button onClick={() => { toast.info("User blocked. You won't see their content."); setMenuOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-destructive hover:bg-destructive/10 w-full text-left rounded-lg mx-0.5 transition-colors">
                          <UserMinus className="w-3.5 h-3.5" /> Block
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Identity */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[22px] font-semibold text-foreground">{researcher.name}</h1>
                  {researcher.verified && <BlockchainVerificationBadge status="verified" />}
                  {researcher.availableForCollab && (
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 text-[10px]">
                      <Sparkles className="w-2.5 h-2.5 mr-1" />Open to Collaboration
                    </Badge>
                  )}
                </div>
                <p className="text-[14px] text-muted-foreground">{researcher.title} · {researcher.institution}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                  {researcher.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{researcher.location}</span>}
                  {researcher.orcid && <span className="flex items-center gap-1 font-mono"><span className="text-[10px] bg-secondary px-1 rounded">iD</span>{researcher.orcid}</span>}
                  {researcher.website && <a href={researcher.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><Globe className="w-3 h-3" />Website <ExternalLink className="w-2.5 h-2.5" /></a>}
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mt-2">{researcher.bio}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-5 pt-5 border-t border-border/50">
                <StatPill icon={BookOpen} value={researcher.publications} label="Publications" />
                <StatPill icon={BarChart2} value={researcher.citations.toLocaleString()} label="Citations" />
                <StatPill icon={Award} value={researcher.hIndex} label="h-index" />
                <StatPill icon={Users} value={researcher.followers.toLocaleString()} label="Followers" />
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {researcher.expertise.map((e) => (
                  <Badge key={e} variant="secondary" className="text-[11px] rounded-full px-3">{e}</Badge>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="publications">
          <TabsList className="bg-card border border-border rounded-xl p-1">
            <TabsTrigger value="publications" className="text-[13px] px-3.5 py-2 rounded-xl">Publications</TabsTrigger>
            <TabsTrigger value="projects" className="text-[13px] px-3.5 py-2 rounded-xl">Projects</TabsTrigger>
            <TabsTrigger value="activity" className="text-[13px] px-3.5 py-2 rounded-xl">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="publications" className="space-y-4 mt-4">
            {mockPapers.slice(0, 3).map((p, i) => (
              <ResearchCard key={`pub-${i}`} index={i} {...p} />
            ))}
          </TabsContent>

          <TabsContent value="projects" className="mt-4">
            <div className="space-y-3">
              {[
                { title: "Open Neuroscience Initiative", role: "Principal Investigator", status: "Active", collaborators: 8 },
                { title: "Cross-Domain Scientific AI", role: "Co-Investigator", status: "Active", collaborators: 12 },
                { title: "Reproducibility in ML Research", role: "Contributor", status: "Completed", collaborators: 5 },
              ].map((proj) => (
                <div key={proj.title} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-secondary/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FlaskConical className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{proj.title}</p>
                      <p className="text-[11px] text-muted-foreground">{proj.role} · {proj.collaborators} collaborators</p>
                    </div>
                  </div>
                  <Badge variant={proj.status === "Active" ? "default" : "secondary"} className={`text-[10px] ${proj.status === "Active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0" : ""}`}>
                    {proj.status}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <div className="space-y-3">
              {[
                { action: "Published a new paper", target: "Attention mechanisms in transformer architectures", time: "2 days ago", icon: BookOpen },
                { action: "Joined a project", target: "Cross-Domain Scientific AI", time: "1 week ago", icon: FlaskConical },
                { action: "Completed peer review", target: "Physical Review X manuscript", time: "2 weeks ago", icon: CheckCircle2 },
                { action: "Shared a dataset", target: "Climate model validation dataset v3", time: "3 weeks ago", icon: Share2 },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[13px] text-foreground"><span className="text-muted-foreground">{item.action}:</span> {item.target}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PublicProfile;
