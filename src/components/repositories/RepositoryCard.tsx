import { motion } from "framer-motion";
import { ExternalLink, Check, Link2 } from "lucide-react";

interface RepositoryCardProps {
  index: number;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  color: string;
  url: string;
}

const RepositoryCard = ({ index, name, description, icon, connected, color, url }: RepositoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card rounded-xl border border-border p-5 hover:shadow-scholarly transition-shadow duration-300 flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{icon}</div>
        {connected ? (
          <span className="flex items-center gap-1 text-[11px] font-display font-semibold text-emerald-brand bg-emerald-muted px-2.5 py-1 rounded-full">
            <Check className="w-3 h-3" /> Connected
          </span>
        ) : (
          <span className="text-[11px] font-display text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
            Not connected
          </span>
        )}
      </div>
      <h3 className="font-display font-semibold text-foreground mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4 flex-1">{description}</p>
      <button
        className={`w-full h-10 rounded-lg font-display font-medium text-sm flex items-center justify-center gap-2 transition-all ${
          connected
            ? "bg-secondary text-foreground hover:bg-secondary/80"
            : "gradient-gold text-accent-foreground shadow-gold hover:opacity-90"
        }`}
      >
        {connected ? (
          <>
            <ExternalLink className="w-4 h-4" /> Manage
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" /> Connect
          </>
        )}
      </button>
    </motion.div>
  );
};

export default RepositoryCard;
