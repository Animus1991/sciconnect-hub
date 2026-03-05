import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { MapPin, Building2, ExternalLink, BookOpen, Users, Award, Calendar, Edit3 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResearchCard from "@/components/feed/ResearchCard";
import { mockPapers } from "@/data/mockData";

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
          <div className="h-48 rounded-xl gradient-scholarly relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(40_90%_50%_/_0.15),transparent_60%)]" />
            <button className="absolute top-4 right-4 bg-card/20 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-display font-medium flex items-center gap-1.5 hover:bg-card/30 transition-colors">
              <Edit3 className="w-3 h-3" /> Edit Profile
            </button>
          </div>
          <div className="flex items-end gap-5 -mt-12 px-6">
            <Avatar className="w-24 h-24 border-4 border-background shadow-scholarly">
              <AvatarFallback className="bg-scholarly text-primary-foreground font-serif text-2xl font-bold">
                DR
              </AvatarFallback>
            </Avatar>
            <div className="pb-2">
              <h1 className="font-serif text-2xl font-bold text-foreground">Dr. Researcher</h1>
              <p className="text-sm text-muted-foreground font-display">@dr.researcher</p>
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
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-display mb-4">
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> MIT CSAIL</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Cambridge, MA</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined 2023</span>
            <a href="#" className="flex items-center gap-1 text-accent hover:underline">
              <ExternalLink className="w-4 h-4" /> lab-website.edu
            </a>
          </div>

          {/* Research Interests */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["Computational Neuroscience", "Deep Learning", "Brain-Computer Interfaces", "Network Dynamics", "Open Science"].map(tag => (
              <Badge key={tag} variant="secondary" className="font-display text-xs">{tag}</Badge>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Publications", value: "24", icon: BookOpen },
              { label: "Followers", value: "1,247", icon: Users },
              { label: "h-index", value: "18", icon: Award },
              { label: "Citations", value: "2,891", icon: BookOpen },
            ].map(stat => (
              <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center">
                <stat.icon className="w-4 h-4 mx-auto mb-2 text-gold" />
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="publications">
            <TabsList className="bg-secondary border border-border mb-6">
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
              <div className="text-center py-12 text-muted-foreground font-display">
                Activity timeline coming soon
              </div>
            </TabsContent>
            <TabsContent value="datasets">
              <div className="text-center py-12 text-muted-foreground font-display">
                Shared datasets will appear here
              </div>
            </TabsContent>
            <TabsContent value="reviews">
              <div className="text-center py-12 text-muted-foreground font-display">
                Peer review activity will appear here
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Profile;
