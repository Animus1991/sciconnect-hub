import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Users, Lock, Globe, Plus, MessageSquare } from "lucide-react";

const groups = [
  { name: "Computational Neuroscience Lab", members: 34, posts: 156, type: "private", description: "Internal lab discussions and pre-publication drafts", initials: "CN" },
  { name: "Open Science Advocates", members: 1247, posts: 4521, type: "public", description: "Promoting open access, reproducibility, and transparent research practices", initials: "OS" },
  { name: "AI for Drug Discovery", members: 89, posts: 312, type: "public", description: "Intersection of machine learning and pharmaceutical research", initials: "AD" },
  { name: "Climate Modeling Consortium", members: 567, posts: 2103, type: "public", description: "Global collaboration on next-generation climate prediction models", initials: "CM" },
  { name: "Quantum Information Theory", members: 203, posts: 891, type: "public", description: "Theoretical foundations of quantum computing and communication", initials: "QI" },
  { name: "Bioethics Discussion Forum", members: 412, posts: 1567, type: "public", description: "Ethical considerations in modern biological and medical research", initials: "BE" },
];

const Groups = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Research Groups</h1>
            <p className="text-muted-foreground font-display">Collaborate with peers, share pre-prints, and discuss research in focused communities.</p>
          </div>
          <button className="h-10 px-5 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-sm flex items-center gap-2 shadow-gold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Create Group
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group, i) => (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-scholarly transition-shadow group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-scholarly flex items-center justify-center text-primary-foreground font-display font-bold text-sm flex-shrink-0">
                  {group.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                      {group.name}
                    </h3>
                    {group.type === "private" ? (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{group.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-display">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {group.members}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {group.posts} posts</span>
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

export default Groups;
