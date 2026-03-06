import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { MapPin, Building2, ExternalLink, BookOpen, Users, Award, Calendar, Edit3, Mail, Globe, Heart, Share2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResearchCard from "@/components/feed/ResearchCard";
import { mockPapers } from "@/data/mockData";

const activityItems = [
  { type: "publication", text: 'Published "Attention Mechanisms in Transformer Architectures" in Nature Machine Intelligence', time: "2 days ago", icon: BookOpen },
  { type: "review", text: "Completed peer review for Physical Review X (manuscript #2026-0201)", time: "1 week ago", icon: Award },
  { type: "collaboration", text: "Joined project: Quantum-Classical Hybrid Neural Networks", time: "2 weeks ago", icon: Users },
  { type: "citation", text: "Received 50th citation on CRISPR-Cas13d paper in Cell", time: "3 weeks ago", icon: Heart },
  { type: "discussion", text: 'Started discussion: "Best practices for reproducible ML experiments in 2026?"', time: "1 month ago", icon: MessageSquare },
  { type: "publication", text: "Shared dataset: Global Ocean Microplastic Distribution Dataset on Zenodo", time: "1 month ago", icon: Share2 },
];

const Profile = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Cover + Avatar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="h-40 sm:h-48 rounded-xl gradient-scholarly relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(40_90%_50%_/_0.15),transparent_60%)]" />
            <button className="absolute top-4 right-4 bg-card/20 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-display font-medium flex items-center gap-1.5 hover:bg-card/30 transition-colors">
              <Edit3 className="w-3 h-3" /> Edit Profile
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 -mt-12 px-6">
            <Avatar className="w-24 h-24 border-4 border-background shadow-scholarly">
              <AvatarFallback className="bg-scholarly text-primary-foreground font-serif text-2xl font-bold">
                DR
              </AvatarFallback>
            </Avatar>
            <div className="pb-2 text-center sm:text-left">
              <h1 className="font-serif text-2xl font-bold text-foreground">Dr. Researcher</h1>
              <p className="text-sm text-muted-foreground font-display">@dr.researcher</p>
            </div>
            <div className="sm:ml-auto pb-2 flex gap-2">
              <button className="h-9 px-4 rounded-lg gradient-gold text-accent-foreground text-sm font-display font-semibold shadow-gold hover:opacity-90 transition-opacity">
                Follow
              </button>
              <button className="h-9 px-4 rounded-lg bg-secondary text-foreground text-sm font-display font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Message
              </button>
            </div>
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
            Computational neuroscientist exploring the intersection of AI and brain dynamics. 
            Passionate about open science, reproducible research, and interdisciplinary collaboration.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-display mb-4">
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> MIT CSAIL</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Cambridge, MA</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined 2023</span>
            <a href="#" className="flex items-center gap-1 text-accent hover:underline">
              <Globe className="w-4 h-4" /> lab-website.edu
            </a>
          </div>

          {/* Research Interests */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["Computational Neuroscience", "Deep Learning", "Brain-Computer Interfaces", "Network Dynamics", "Open Science"].map(tag => (
              <Badge key={tag} variant="secondary" className="font-display text-xs">{tag}</Badge>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Publications", value: "24", icon: BookOpen },
              { label: "Followers", value: "1,247", icon: Users },
              { label: "h-index", value: "18", icon: Award },
              { label: "Citations", value: "2,891", icon: BookOpen },
            ].map(stat => (
              <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center">
                <stat.icon className="w-4 h-4 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
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
                    {/* Timeline line */}
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
              <div className="space-y-3">
                {mockPapers.filter(p => p.type === "dataset").map((paper, i) => (
                  <ResearchCard key={i} index={i} {...paper} />
                ))}
              </div>
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
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Profile;
