import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Users, Radio } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SharedWorkspace from "@/components/collaboration/SharedWorkspace";
import TeamChat from "@/components/collaboration/TeamChat";

const Collaboration = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Collaboration Hub</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                Real-time workspaces, live editing, and team communication
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 rounded-full px-3 py-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span className="text-xs font-display font-medium">Live</span>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="workspaces" className="space-y-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="workspaces" className="font-display text-xs gap-1.5">
              <Users className="w-3.5 h-3.5" /> Workspaces
            </TabsTrigger>
            <TabsTrigger value="chat" className="font-display text-xs gap-1.5">
              <Radio className="w-3.5 h-3.5" /> Team Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspaces">
            <SharedWorkspace />
          </TabsContent>

          <TabsContent value="chat">
            <TeamChat />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Collaboration;
