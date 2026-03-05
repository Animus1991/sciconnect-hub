import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { MessageSquare, ThumbsUp, Clock, Pin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const discussions = [
  { title: "Best practices for reproducible ML experiments in 2026?", author: "Dr. Sarah Chen", initials: "SC", replies: 47, likes: 89, time: "2h ago", tags: ["ML", "Reproducibility"], pinned: true },
  { title: "Preprint vs journal submission: has the balance shifted?", author: "Prof. James Liu", initials: "JL", replies: 123, likes: 234, time: "5h ago", tags: ["Publishing", "Open Access"], pinned: true },
  { title: "New CRISPR delivery methods for in vivo applications", author: "Dr. Priya Sharma", initials: "PS", replies: 31, likes: 56, time: "8h ago", tags: ["CRISPR", "Gene Therapy"], pinned: false },
  { title: "Climate model ensemble disagreements at regional scales", author: "Dr. Elena Volkov", initials: "EV", replies: 19, likes: 34, time: "1d ago", tags: ["Climate", "Modeling"], pinned: false },
  { title: "Ethical implications of synthetic biology in agriculture", author: "Prof. Omar Hassan", initials: "OH", replies: 67, likes: 112, time: "1d ago", tags: ["Bioethics", "SynBio"], pinned: false },
  { title: "Tips for writing compelling grant proposals (NIH R01)", author: "Dr. Lisa Park", initials: "LP", replies: 89, likes: 178, time: "2d ago", tags: ["Grants", "Career"], pinned: false },
];

const Discussions = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Discussions</h1>
            <p className="text-muted-foreground font-display">Engage in scientific discourse, ask questions, and share insights with the community.</p>
          </div>
          <button className="h-10 px-5 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-sm flex items-center gap-2 shadow-gold hover:opacity-90 transition-opacity">
            <MessageSquare className="w-4 h-4" /> Start Discussion
          </button>
        </motion.div>

        <div className="space-y-3">
          {discussions.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-scholarly transition-shadow cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 mt-0.5">
                  <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-xs font-semibold">
                    {d.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {d.pinned && <Pin className="w-3.5 h-3.5 text-gold flex-shrink-0" />}
                    <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {d.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-display mb-2">
                    <span>{d.author}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {d.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {d.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="font-display text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                    <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground font-display">
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {d.likes}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {d.replies}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Discussions;
