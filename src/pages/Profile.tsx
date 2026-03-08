import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import {
  MapPin, Building2, BookOpen, Users, Award, Calendar, Edit3, Mail,
  Globe, Heart, Share2, MessageSquare, Code, FlaskConical, BarChart2,
  BrainCircuit, HandshakeIcon, GraduationCap, CheckCircle2, ExternalLink,
  Database, Download, FileText, Briefcase, Shield, Link2, Sparkles
} from "lucide-react";
import { BlockchainVerificationBadge } from "@/components/blockchain/BlockchainVerificationBadge";
import { BlockchainAuditTrail, type AuditEntry } from "@/components/blockchain/BlockchainVerificationBadge";
import { SBTGallery } from "@/components/blockchain/SBTGallery";
import { mockHash } from "@/lib/blockchain-utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ResearchCard from "@/components/feed/ResearchCard";
import { mockPapers } from "@/data/mockData";
import { useAuth } from "@/hooks/use-auth";
import { ContributionGraph } from "@/components/shared/ContributionGraph";
import { ProficiencyGrid } from "@/components/profile/ProficiencyGrid";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

/* ─── Data ─── */
const activityItems = [
  { type: "publication", text: 'Published "Attention Mechanisms in Transformer Architectures" in Nature Machine Intelligence', time: "2 days ago", icon: BookOpen },
  { type: "review", text: "Completed peer review for Physical Review X (manuscript #2026-0201)", time: "1 week ago", icon: Award },
  { type: "collaboration", text: "Joined project: Quantum-Classical Hybrid Neural Networks", time: "2 weeks ago", icon: Users },
  { type: "citation", text: "Received 50th citation on CRISPR-Cas13d paper in Cell", time: "3 weeks ago", icon: Heart },
  { type: "discussion", text: 'Started discussion: "Best practices for reproducible ML experiments in 2026?"', time: "1 month ago", icon: MessageSquare },
  { type: "publication", text: "Shared dataset: Global Ocean Microplastic Distribution Dataset on Zenodo", time: "1 month ago", icon: Share2 },
];

const skills = [
  { name: "Python", level: 95, category: "Programming" },
  { name: "R / Statistics", level: 88, category: "Programming" },
  { name: "Machine Learning", level: 92, category: "Methods" },
  { name: "Deep Learning", level: 85, category: "Methods" },
  { name: "Bayesian Analysis", level: 78, category: "Methods" },
  { name: "Transformer Architecture", level: 90, category: "Specialization" },
  { name: "NLP / LLMs", level: 88, category: "Specialization" },
  { name: "Quantum Computing", level: 65, category: "Specialization" },
];

const socialLinks = [
  { label: "Google Scholar", url: "#", icon: "🎓", verified: false },
  { label: "ORCID", url: "#", icon: "iD", verified: true },
  { label: "GitHub", url: "#", icon: "🐙", verified: false },
  { label: "LinkedIn", url: "#", icon: "in", verified: false },
];

/* ─── Edit Modal ─── */
function EditProfileModal({ open, onOpenChange, user }: { open: boolean; onOpenChange: (open: boolean) => void; user: any }) {
  const [form, setForm] = useState({
    name: user.name,
    username: user.username,
    bio: user.bio,
    institution: user.institution,
    location: user.location,
    website: user.website,
  });

  const handleSave = () => {
    toast.success("Profile updated successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Edit Profile</DialogTitle>
          <DialogDescription className="font-display text-sm">Update your profile information visible to other researchers.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-display text-xs">Full Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="font-display" />
            </div>
            <div className="space-y-2">
              <Label className="font-display text-xs">Username</Label>
              <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="font-display" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-display text-xs">Bio</Label>
            <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="font-display resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-display text-xs">Institution</Label>
              <Input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} className="font-display" />
            </div>
            <div className="space-y-2">
              <Label className="font-display text-xs">Location</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="font-display" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-display text-xs">Website</Label>
            <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="font-display" />
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="h-9 px-4 rounded-lg bg-secondary text-foreground text-sm font-display font-medium hover:bg-secondary/80 transition-colors">Cancel</button>
          <button onClick={handleSave} className="h-9 px-4 rounded-lg bg-accent text-accent-foreground text-sm font-display font-semibold hover:opacity-90 transition-opacity">Save Changes</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Stat Pill ─── */
const StatPill = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
  <div className="flex flex-col items-center gap-1 px-4 py-3">
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-lg font-display font-bold text-foreground tabular-nums">{value}</span>
    </div>
    <span className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{label}</span>
  </div>
);

/* ─── Profile Page ─── */
const Profile = () => {
  const { user } = useAuth();
  const [availableForCollab, setAvailableForCollab] = useState(true);
  const [openToMentoring, setOpenToMentoring] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const isOwnProfile = true;

  const handleDownloadCV = () => {
    toast.success("Generating CV...");
    setTimeout(() => {
      const cvContent = `CURRICULUM VITAE\n\n${user.name}\n${user.institution}\n${user.location}\n\n${user.bio}\n\nResearch Interests: ${user.researchInterests.join(", ")}\n\nPublications: ${user.stats.publications}\nCitations: ${user.stats.citations}\nh-index: ${user.stats.hIndex}`;
      const blob = new Blob([cvContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${user.name.replace(/\s+/g, "_")}_CV.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CV downloaded!");
    }, 500);
  };

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="max-w-5xl mx-auto">
          <EditProfileModal open={editModalOpen} onOpenChange={setEditModalOpen} user={user} />

          {/* ─── Hero Section ─── */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
            {/* Cover */}
            <div className="h-36 sm:h-44 rounded-xl bg-gradient-to-br from-secondary via-secondary/80 to-secondary/50 relative overflow-hidden border border-border">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,hsl(var(--accent)_/_0.08),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,hsl(var(--primary)_/_0.05),transparent_50%)]" />
              {isOwnProfile && (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="absolute top-3 right-3 bg-card/60 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-lg text-xs font-display font-medium flex items-center gap-1.5 hover:bg-card/80 transition-colors border border-border/50"
                >
                  <Edit3 className="w-3 h-3" /> Edit Profile
                </button>
              )}
            </div>

            {/* Avatar + Name row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 -mt-12 px-5">
              <Avatar className="w-24 h-24 border-4 border-background shadow-scholarly flex-shrink-0">
                <AvatarFallback className="bg-scholarly text-primary-foreground font-serif text-2xl font-bold">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1 text-center sm:text-left flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-foreground">{user.name}</h1>
                  <Badge variant="outline" className="text-[9px] font-display text-success border-success/20 bg-success-muted gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </Badge>
                  <Badge variant="outline" className="text-[9px] font-display font-bold text-accent border-accent/20 bg-accent/5 gap-0.5">
                    iD ORCID
                  </Badge>
                  <BlockchainVerificationBadge
                    status="verified"
                    hash={mockHash("profile-" + user.name)}
                    showHash
                  />
                </div>
                <p className="text-sm text-muted-foreground font-display mt-0.5">{user.title} · {user.username}</p>
              </div>
              {/* Actions */}
              <div className="pb-1 flex gap-2 flex-shrink-0">
                {isOwnProfile ? (
                  <button onClick={() => toast.info("Profile link copied!")} className="h-8 px-3 rounded-lg bg-secondary text-foreground text-xs font-display font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1.5 border border-border">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                ) : (
                  <>
                    <button className="h-8 px-4 rounded-lg bg-accent text-accent-foreground text-xs font-display font-semibold hover:opacity-90 transition-opacity">Follow</button>
                    <button className="h-8 px-3 rounded-lg bg-secondary text-foreground text-xs font-display font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1.5 border border-border">
                      <Mail className="w-3 h-3" /> Message
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* ─── Two-Column Layout ─── */}
          <div className="mt-6 flex flex-col lg:flex-row gap-5 px-5">

            {/* ─── Main Column ─── */}
            <div className="flex-1 min-w-0">
              {/* Bio */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <p className="text-sm text-foreground font-display leading-relaxed mb-3">{user.bio}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-display mb-4">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {user.institution}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {user.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {user.joinedDate}</span>
                  <a href="#" className="flex items-center gap-1 text-accent hover:underline">
                    <Globe className="w-3.5 h-3.5" /> {user.website}
                  </a>
                </div>

                {/* Research Interests */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {user.researchInterests.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="font-display text-[11px] px-2 py-0.5">{tag}</Badge>
                  ))}
                </div>

                {/* Social + CV row */}
                <div className="flex items-center gap-1.5 mb-5 flex-wrap">
                  {socialLinks.map(link => (
                    <Tooltip key={link.label}>
                      <TooltipTrigger asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/50 border border-border text-[11px] font-display text-muted-foreground hover:text-foreground hover:border-accent/20 transition-all"
                        >
                          <span className="text-xs">{link.icon}</span>
                          <span className="hidden sm:inline">{link.label}</span>
                          {link.verified && <CheckCircle2 className="w-2.5 h-2.5 text-success" />}
                        </a>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">{link.label}</p></TooltipContent>
                    </Tooltip>
                  ))}
                  <div className="flex-1" />
                  <button
                    onClick={handleDownloadCV}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/8 border border-accent/15 text-[11px] font-display font-medium text-accent hover:bg-accent/15 transition-colors"
                  >
                    <Download className="w-3 h-3" /> Download CV
                  </button>
                </div>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-4 bg-card rounded-xl border border-border divide-x divide-border mb-5"
              >
                <StatPill label="Publications" value={user.stats.publications.toLocaleString()} icon={BookOpen} />
                <StatPill label="Citations" value={user.stats.citations.toLocaleString()} icon={FileText} />
                <StatPill label="h-index" value={user.stats.hIndex.toString()} icon={Award} />
                <StatPill label="Followers" value={user.stats.followers.toLocaleString()} icon={Users} />
              </motion.div>

              {/* Contribution Graph */}
              <div className="mb-5">
                <ContributionGraph title="Research Activity" colorScheme="gold" weeks={52} />
              </div>

              {/* Skills */}
              <div className="mb-5">
                <ProficiencyGrid skills={skills} compact />
              </div>

              {/* Tabs */}
              <Tabs defaultValue="publications">
                <TabsList className="bg-secondary/50 border border-border mb-5 flex-wrap h-auto gap-0.5 p-0.5">
                  <TabsTrigger value="publications" className="font-display text-xs">Publications</TabsTrigger>
                  <TabsTrigger value="activity" className="font-display text-xs">Activity</TabsTrigger>
                  <TabsTrigger value="blockchain" className="font-display text-xs gap-1">
                    <Shield className="w-3 h-3" /> Credentials
                  </TabsTrigger>
                  <TabsTrigger value="datasets" className="font-display text-xs">Datasets</TabsTrigger>
                  <TabsTrigger value="reviews" className="font-display text-xs">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="publications" className="space-y-3">
                  {mockPapers.slice(0, 3).map((paper, i) => (
                    <ResearchCard key={i} index={i} {...paper} />
                  ))}
                  <Link to="/publications" className="block text-center py-3 text-xs font-display text-accent hover:underline">
                    View all {user.stats.publications} publications →
                  </Link>
                </TabsContent>

                <TabsContent value="activity">
                  <div className="space-y-0.5">
                    {activityItems.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors relative"
                      >
                        {i < activityItems.length - 1 && (
                          <div className="absolute left-[23px] top-11 w-px h-[calc(100%-16px)] bg-border/50" />
                        )}
                        <div className="w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center flex-shrink-0 z-10">
                          <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-display text-foreground leading-relaxed">{item.text}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="blockchain">
                  <div className="bg-card rounded-xl border border-border p-5 space-y-5">
                    <div>
                      <h3 className="text-sm font-display font-semibold text-foreground mb-1">Blockchain-Verified Credentials</h3>
                      <p className="text-[11px] text-muted-foreground font-display">
                        On-chain proof of academic achievements, publications, and peer review activity.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { label: "PhD Computational Neuroscience — MIT (2018)", status: "verified" as const, hash: mockHash("phd-mit-2018") },
                        { label: "47 Publications — blockchain-timestamped", status: "verified" as const, hash: mockHash("pubs-47") },
                        { label: "14 Peer Reviews — identity-sealed & verified", status: "verified" as const, hash: mockHash("reviews-14") },
                        { label: "h-index 19 — citation chain verified", status: "anchored" as const, hash: mockHash("hindex-19") },
                        { label: "ORCID Identity — cryptographic binding", status: "verified" as const, hash: mockHash("orcid-binding") },
                        { label: "NSF Grant PI Status — institutional verification", status: "anchored" as const, hash: mockHash("nsf-pi") },
                      ].map((cred, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                          <BlockchainVerificationBadge status={cred.status} hash={cred.hash} compact />
                          <span className="text-xs font-display text-foreground flex-1">{cred.label}</span>
                          <span className="text-[9px] font-mono text-muted-foreground/50">{cred.hash.slice(0, 8)}…</span>
                        </div>
                      ))}
                    </div>

                    <BlockchainAuditTrail
                      entries={[
                        { id: "pa1", action: "Publication hash anchored: 'Attention Mechanisms in Transformer Architectures'", actor: user.name, timestamp: "2d ago", hash: mockHash("pub-attn"), status: "verified" },
                        { id: "pa2", action: "Peer review completed — identity sealed", actor: user.name, timestamp: "1w ago", hash: mockHash("review-sealed"), status: "verified" },
                        { id: "pa3", action: "Citation milestone: 50th citation on CRISPR paper", actor: "System", timestamp: "3w ago", hash: mockHash("citation-50"), status: "anchored" },
                        { id: "pa4", action: "Soulbound Token minted: Distinguished Reviewer", actor: "System", timestamp: "1mo ago", hash: mockHash("sbt-reviewer"), status: "verified" },
                      ]}
                      maxVisible={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="datasets">
                  {mockPapers.filter(p => p.type === "dataset").length > 0 ? (
                    <div className="space-y-3">
                      {mockPapers.filter(p => p.type === "dataset").map((paper, i) => (
                        <ResearchCard key={i} index={i} {...paper} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                      <Database className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" />
                      <h3 className="font-display font-semibold text-sm text-foreground mb-1">No datasets shared yet</h3>
                      <p className="text-xs text-muted-foreground font-display max-w-sm mx-auto">
                        Share your research datasets on platforms like Zenodo or Figshare and link them here.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews">
                  <div className="bg-card rounded-xl border border-border p-5">
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                      <div>
                        <p className="text-xl font-display font-bold text-foreground tabular-nums">14</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">Completed</p>
                      </div>
                      <div>
                        <p className="text-xl font-display font-bold text-accent tabular-nums">4.7</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">Avg Rating</p>
                      </div>
                      <div>
                        <p className="text-xl font-display font-bold text-foreground tabular-nums">12d</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">Avg Turnaround</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-display text-center">
                      Recognized as a top reviewer by Physical Review X and Nature Methods
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* ─── Sidebar ─── */}
            <div className="w-full lg:w-[280px] flex-shrink-0 space-y-4">
              {/* Collaboration Status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h3 className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Availability</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HandshakeIcon className="w-3.5 h-3.5 text-accent" />
                      <span className="text-xs font-display text-foreground">Open to collaboration</span>
                    </div>
                    <Switch checked={availableForCollab} onCheckedChange={setAvailableForCollab} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-display text-foreground">Open to mentoring</span>
                    </div>
                    <Switch checked={openToMentoring} onCheckedChange={setOpenToMentoring} />
                  </div>
                </div>
                {availableForCollab && (
                  <div className="mt-3 px-2.5 py-2 rounded-lg bg-success-muted border border-success/15 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-success flex-shrink-0" />
                    <p className="text-[10px] text-success font-display font-medium">Looking for collaborators</p>
                  </div>
                )}
              </motion.div>

              {/* Research Focus */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h3 className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Research Focus</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: BrainCircuit, label: "AI & Machine Learning" },
                    { icon: FlaskConical, label: "Computational Biology" },
                    { icon: BarChart2, label: "Scientific Computing" },
                    { icon: Code, label: "Open Source Tools" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-secondary/60 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-display text-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Stats sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h3 className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Impact</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display text-muted-foreground">Following</span>
                    <span className="text-xs font-display font-semibold text-foreground tabular-nums">{user.stats.following}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display text-muted-foreground">i10-index</span>
                    <span className="text-xs font-display font-semibold text-foreground tabular-nums">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display text-muted-foreground">Peer Reviews</span>
                    <span className="text-xs font-display font-semibold text-foreground tabular-nums">14</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display text-muted-foreground">Datasets</span>
                    <span className="text-xs font-display font-semibold text-foreground tabular-nums">3</span>
                  </div>
                </div>
              </motion.div>

              {/* Verification */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <h3 className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Verification</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs font-display text-foreground">Email verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs font-display text-foreground">ORCID linked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs font-display text-foreground">Institution confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-display text-foreground">Blockchain identity</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default Profile;
