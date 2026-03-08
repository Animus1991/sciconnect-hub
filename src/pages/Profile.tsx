import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { MapPin, Building2, BookOpen, Users, Award, Calendar, Edit3, Mail, Globe, Heart, Share2, MessageSquare, Code, FlaskConical, BarChart2, BrainCircuit, HandshakeIcon, GraduationCap, CheckCircle2, ExternalLink, Database, X, Download, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
  { label: "Google Scholar", url: "https://scholar.google.com", icon: "🎓", color: "text-blue-500" },
  { label: "ORCID", url: "https://orcid.org", icon: "🆔", color: "text-emerald-500", verified: true },
  { label: "Twitter/X", url: "https://x.com", icon: "𝕏", color: "text-foreground" },
  { label: "GitHub", url: "https://github.com", icon: "🐙", color: "text-foreground" },
  { label: "LinkedIn", url: "https://linkedin.com", icon: "in", color: "text-blue-600" },
];

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
          <button onClick={handleSave} className="h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">Save Changes</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Profile = () => {
  const { user } = useAuth();
  const [availableForCollab, setAvailableForCollab] = useState(true);
  const [openToMentoring, setOpenToMentoring] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const isOwnProfile = true;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Edit Profile Modal */}
        <EditProfileModal open={editModalOpen} onOpenChange={setEditModalOpen} user={user} />

        {/* Cover + Avatar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="h-40 sm:h-48 rounded-xl gradient-scholarly relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(40_90%_50%_/_0.15),transparent_60%)]" />
            {isOwnProfile && (
              <button onClick={() => setEditModalOpen(true)} className="absolute top-4 right-4 bg-card/20 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-display font-medium flex items-center gap-1.5 hover:bg-card/30 transition-colors">
                <Edit3 className="w-3 h-3" /> Edit Profile
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 -mt-12 px-6">
            <Avatar className="w-24 h-24 border-4 border-background shadow-scholarly">
              <AvatarFallback className="bg-scholarly text-primary-foreground font-serif text-2xl font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="pb-2 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-foreground">{user.name}</h1>
                <Badge variant="outline" className="text-[9px] font-display text-emerald-brand border-emerald-brand/20 bg-emerald-muted">
                  ✓ Verified
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-display">{user.username}</p>
            </div>
            {/* Only show Follow/Message if NOT own profile */}
            {!isOwnProfile && (
              <div className="sm:ml-auto pb-2 flex gap-2">
                <button className="h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
                  Follow
                </button>
                <button className="h-9 px-4 rounded-lg bg-secondary text-foreground text-sm font-display font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Message
                </button>
              </div>
            )}
            {isOwnProfile && (
              <div className="sm:ml-auto pb-2 flex gap-2">
                <button className="h-9 px-4 rounded-lg bg-secondary text-foreground text-sm font-display font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Share Profile
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 px-6"
        >
          <p className="text-foreground font-display leading-relaxed mb-4">
            {user.bio}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-display mb-4">
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {user.institution}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {user.location}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {user.joinedDate}</span>
            <a href="#" className="flex items-center gap-1 text-accent hover:underline">
              <Globe className="w-4 h-4" /> {user.website}
            </a>
          </div>

          {/* Social Links + Actions */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {socialLinks.map(link => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-xs font-display text-muted-foreground hover:text-foreground hover:border-accent/30 transition-all ${link.color || ''}`}
                title={link.label}>
                <span className="text-sm">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
                {link.verified && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-brand ml-0.5" />
                )}
              </a>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => {
                toast.success("Generating CV...");
                setTimeout(() => {
                  const cvContent = `CURRICULUM VITAE\n\n${user.name}\n${user.institution}\n${user.location}\n\n${user.bio}\n\nResearch Interests: ${user.researchInterests.join(", ")}\n\nPublications: ${user.stats.publications}\nCitations: ${user.stats.citations}\nh-index: ${user.stats.hIndex}`;
                  const blob = new Blob([cvContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${user.name.replace(/\s+/g, '_')}_CV.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("CV downloaded!");
                }, 500);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-xs font-display font-medium text-accent hover:bg-accent/20 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download CV
            </button>
          </div>

          {/* Research Interests */}
          <div className="flex flex-wrap gap-2 mb-6">
            {user.researchInterests.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="font-display text-xs">{tag}</Badge>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Publications", value: user.stats.publications.toLocaleString(), icon: BookOpen },
              { label: "Followers", value: user.stats.followers.toLocaleString(), icon: Users },
              { label: "h-index", value: user.stats.hIndex.toString(), icon: Award },
              { label: "Citations", value: user.stats.citations.toLocaleString(), icon: BookOpen },
            ].map(stat => (
              <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center">
                <stat.icon className="w-4 h-4 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Contribution Graph */}
          <div className="mb-6">
            <ContributionGraph title="Research Activity" colorScheme="gold" weeks={52} />
          </div>

          {/* Enhanced Skills & Expertise */}
          <div className="mb-8">
            <ProficiencyGrid skills={skills} />
          </div>
        </motion.div>

        {/* Sidebar-style cards */}
        <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Collaboration Status */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Collaboration Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HandshakeIcon className="w-4 h-4 text-accent" />
                  <span className="text-xs font-display text-foreground">Available for collaboration</span>
                </div>
                <Switch checked={availableForCollab} onCheckedChange={setAvailableForCollab} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-display text-foreground">Open to mentoring</span>
                </div>
                <Switch checked={openToMentoring} onCheckedChange={setOpenToMentoring} />
              </div>
            </div>
            {availableForCollab && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-muted border border-emerald-brand/20 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-brand shrink-0" />
                <p className="text-[11px] text-emerald-brand font-display">Open to new projects & collaborations</p>
              </div>
            )}
          </motion.div>

          {/* Research Focus Areas */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Research Focus Areas</h3>
            <div className="space-y-2">
              {[
                { icon: BrainCircuit, label: "AI & Machine Learning", color: "text-accent" },
                { icon: FlaskConical, label: "Computational Biology", color: "text-emerald-brand" },
                { icon: BarChart2, label: "Scientific Computing", color: "text-foreground" },
                { icon: Code, label: "Open Source Tools", color: "text-muted-foreground" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="text-xs font-display text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <Tabs defaultValue="publications">
            <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="publications" className="font-display text-sm">Publications</TabsTrigger>
              <TabsTrigger value="activity" className="font-display text-sm">Activity</TabsTrigger>
              <TabsTrigger value="datasets" className="font-display text-sm">Datasets</TabsTrigger>
              <TabsTrigger value="reviews" className="font-display text-sm">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="publications" className="space-y-4">
              {mockPapers.slice(0, 3).map((paper, i) => (
                <ResearchCard key={i} index={i} {...paper} />
              ))}
              <Link to="/publications" className="block text-center py-3 text-sm font-display text-accent hover:underline">
                View all {user.stats.publications} publications →
              </Link>
            </TabsContent>
            <TabsContent value="activity">
              <div className="space-y-1">
                {activityItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors relative"
                  >
                    {i < activityItems.length - 1 && (
                      <div className="absolute left-[27px] top-12 w-px h-[calc(100%-24px)] bg-border" />
                    )}
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 z-10">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display text-foreground leading-snug">{item.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{item.time}</p>
                    </div>
                  </motion.div>
                ))}
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
                  <Database className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                  <h3 className="font-display font-semibold text-foreground mb-1">No datasets shared yet</h3>
                  <p className="text-sm text-muted-foreground font-display max-w-md mx-auto">
                    Share your research datasets on platforms like Zenodo or Figshare and link them here.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="reviews">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">14</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-accent">4.7</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">12d</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Turnaround</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-display text-center">
                  Recognized as a top reviewer by Physical Review X and Nature Methods
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
