import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Users, Radio, Bell, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import SharedWorkspace from "@/components/collaboration/SharedWorkspace";
import TeamChat from "@/components/collaboration/TeamChat";
import WorkspaceNotifications from "@/components/collaboration/WorkspaceNotifications";
import { BlockchainAuditTrail, type AuditEntry } from "@/components/blockchain/BlockchainVerificationBadge";
import { mockHash } from "@/lib/blockchain-utils";

const Collaboration = () => {
  const [notifCount, setNotifCount] = useState(0);

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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-success/10 text-success rounded-full px-3 py-1">
                <Shield className="w-3 h-3" />
                <span className="text-xs font-display font-medium">Blockchain Audit</span>
              </div>
              <div className="flex items-center gap-1.5 bg-success/10 text-success rounded-full px-3 py-1">
                <Radio className="w-3 h-3 animate-pulse" />
                <span className="text-xs font-display font-medium">Live</span>
              </div>
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
            <TabsTrigger value="audit" className="font-display text-xs gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Audit Trail
            </TabsTrigger>
            <TabsTrigger value="activity" className="font-display text-xs gap-1.5 relative">
              <Bell className="w-3.5 h-3.5" /> Activity
              {notifCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 bg-accent/10 text-accent">
                  {notifCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspaces">
            <SharedWorkspace />
          </TabsContent>

          <TabsContent value="chat">
            <TeamChat />
          </TabsContent>

          <TabsContent value="audit">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div>
                <h3 className="text-sm font-display font-semibold text-foreground mb-1">Blockchain Audit Trail</h3>
                <p className="text-[11px] text-muted-foreground font-display">
                  All collaboration actions are cryptographically hashed and timestamped for provenance tracking.
                </p>
              </div>
              <BlockchainAuditTrail
                entries={[
                  { id: "a1", action: "Document 'Quantum Error Correction Draft' created", actor: "Dr. Elena Vasquez", timestamp: "2h ago", hash: mockHash("doc-create-1"), status: "verified" },
                  { id: "a2", action: "Section 'Methods' edited by collaborator", actor: "Prof. James Chen", timestamp: "3h ago", hash: mockHash("doc-edit-2"), status: "verified" },
                  { id: "a3", action: "File 'dataset_v3.csv' uploaded to shared workspace", actor: "Dr. Yuki Tanaka", timestamp: "5h ago", hash: mockHash("file-upload-3"), status: "anchored" },
                  { id: "a4", action: "Review comment added on Figure 3", actor: "Dr. Sofia Martínez", timestamp: "1d ago", hash: mockHash("comment-4"), status: "verified" },
                  { id: "a5", action: "Workspace permissions updated", actor: "Dr. Elena Vasquez", timestamp: "1d ago", hash: mockHash("perm-5"), status: "anchored" },
                  { id: "a6", action: "Version 2.1 snapshot created", actor: "System", timestamp: "2d ago", hash: mockHash("snapshot-6"), status: "verified" },
                  { id: "a7", action: "New collaborator Dr. Priya Sharma invited", actor: "Prof. James Chen", timestamp: "3d ago", hash: mockHash("invite-7"), status: "pending" },
                ]}
                maxVisible={7}
              />
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="bg-card rounded-xl border border-border p-4">
              <WorkspaceNotifications onEventCount={setNotifCount} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Collaboration;
