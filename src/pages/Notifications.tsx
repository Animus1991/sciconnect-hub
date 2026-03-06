import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Bell, BookOpen, Users, MessageSquare, GitBranch, Award, CheckCheck, Filter, Trash2, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const allNotifications = [
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
    type: "social",
    icon: MessageSquare,
    title: "Dr. Lisa Park replied to your comment",
    description: 'In thread: "Best practices for reproducible ML experiments"',
    time: "1 day ago",
    read: true,
  },
  {
    id: 5,
    type: "citation",
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
    type: "social",
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
  const [notifications, setNotifications] = useState(allNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const filterByType = (type: string) => {
    if (type === "all") return notifications;
    return notifications.filter((n) => n.type === type);
  };

  const renderNotifications = (items: typeof notifications) => (
    <div className="space-y-2">
      {items.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground font-display">No notifications in this category</p>
        </div>
      ) : (
        items.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => toggleRead(notif.id)}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
              notif.read
                ? "bg-card border-border hover:bg-secondary/50"
                : "bg-accent/5 border-accent/20 hover:bg-accent/10"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                notif.read ? "bg-secondary" : "gradient-gold"
              }`}
            >
              <notif.icon
                className={`w-5 h-5 ${notif.read ? "text-muted-foreground" : "text-accent-foreground"}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-display leading-snug ${
                  notif.read ? "text-foreground/80" : "text-foreground font-medium"
                }`}
              >
                {notif.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{notif.description}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-2">{notif.time}</p>
            </div>
            {!notif.read && <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 mt-1.5 animate-pulse-gold" />}
          </motion.div>
        ))
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-sm text-muted-foreground font-display mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm font-display text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck className="w-4 h-4" /> Mark all read
              </button>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="all">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="font-display text-sm">
              All
              {unreadCount > 0 && (
                <span className="ml-1.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="citations" className="font-display text-sm">Citations</TabsTrigger>
            <TabsTrigger value="reviews" className="font-display text-sm">Reviews</TabsTrigger>
            <TabsTrigger value="social" className="font-display text-sm">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderNotifications(notifications)}</TabsContent>
          <TabsContent value="citations">{renderNotifications(filterByType("citation"))}</TabsContent>
          <TabsContent value="reviews">{renderNotifications(filterByType("review"))}</TabsContent>
          <TabsContent value="social">{renderNotifications(filterByType("social"))}</TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Notifications;
