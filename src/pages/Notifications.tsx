import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Bell, BookOpen, Users, MessageSquare, GitBranch, Award, Check, CheckCheck, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const notifications = [
  {
    id: 1,
    type: "citation",
    icon: BookOpen,
    title: 'Your paper "Attention Mechanisms in Transformer Architectures" was cited',
    description: "Cited by Dr. Emily Park in Nature Communications",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "collaboration",
    icon: Users,
    title: "Prof. Omar Hassan sent you a collaboration request",
    description: "Quantum-Classical Hybrid Neural Networks project",
    time: "5 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "review",
    icon: Award,
    title: "You have a new peer review invitation",
    description: "Review manuscript #2026-0341 for Physical Review Letters",
    time: "1 day ago",
    read: false,
  },
  {
    id: 4,
    type: "discussion",
    icon: MessageSquare,
    title: "Dr. Lisa Park replied to your comment",
    description: 'In thread: "Best practices for reproducible ML experiments"',
    time: "1 day ago",
    read: true,
  },
  {
    id: 5,
    type: "repository",
    icon: GitBranch,
    title: "Your arXiv preprint received 50 downloads",
    description: '"Quantum Error Correction Beyond the Surface Code"',
    time: "2 days ago",
    read: true,
  },
  {
    id: 6,
    type: "citation",
    icon: BookOpen,
    title: "Your h-index increased to 19",
    description: "Based on latest citation data from Google Scholar",
    time: "3 days ago",
    read: true,
  },
  {
    id: 7,
    type: "collaboration",
    icon: Users,
    title: "Dr. Sophie Martin followed you",
    description: "Climate Science researcher at ETH Zürich",
    time: "4 days ago",
    read: true,
  },
  {
    id: 8,
    type: "review",
    icon: Award,
    title: "Your peer review for manuscript #2026-0298 was accepted",
    description: "Thank you for your contribution to the review process",
    time: "5 days ago",
    read: true,
  },
];

const Notifications = () => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm font-display text-muted-foreground hover:text-foreground transition-colors">
                <Filter className="w-4 h-4" /> Filter
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm font-display text-muted-foreground hover:text-foreground transition-colors">
                <CheckCheck className="w-4 h-4" /> Mark all read
              </button>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="all">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="all" className="font-display text-sm">All</TabsTrigger>
            <TabsTrigger value="citations" className="font-display text-sm">Citations</TabsTrigger>
            <TabsTrigger value="reviews" className="font-display text-sm">Reviews</TabsTrigger>
            <TabsTrigger value="social" className="font-display text-sm">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                  notif.read
                    ? "bg-card border-border hover:bg-secondary/50"
                    : "bg-accent/5 border-accent/20 hover:bg-accent/10"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  notif.read ? "bg-secondary" : "gradient-gold"
                }`}>
                  <notif.icon className={`w-5 h-5 ${notif.read ? "text-muted-foreground" : "text-accent-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-display leading-snug ${notif.read ? "text-foreground/80" : "text-foreground font-medium"}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.description}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-2">{notif.time}</p>
                </div>
                {!notif.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                )}
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="citations" className="text-center py-12 text-muted-foreground font-display">
            Citation notifications filtered view coming soon
          </TabsContent>
          <TabsContent value="reviews" className="text-center py-12 text-muted-foreground font-display">
            Review notifications filtered view coming soon
          </TabsContent>
          <TabsContent value="social" className="text-center py-12 text-muted-foreground font-display">
            Social notifications filtered view coming soon
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Notifications;
