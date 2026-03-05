import { motion } from "framer-motion";
import { Heart, MessageSquare, Share2, Bookmark, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ResearchCardProps {
  index: number;
  title: string;
  authors: string[];
  abstract: string;
  journal: string;
  date: string;
  tags: string[];
  citations: number;
  likes: number;
  comments: number;
  doi?: string;
  type: "paper" | "preprint" | "dataset" | "code";
}

const typeColors: Record<string, string> = {
  paper: "bg-scholarly text-primary-foreground",
  preprint: "bg-gold-muted text-gold-foreground",
  dataset: "bg-emerald-muted text-foreground",
  code: "bg-secondary text-foreground",
};

const ResearchCard = ({
  index, title, authors, abstract, journal, date, tags, citations, likes, comments, doi, type,
}: ResearchCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-card rounded-xl border border-border p-6 shadow-scholarly hover:shadow-lg transition-shadow duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-xs font-semibold">
              {authors[0]?.split(" ").map(n => n[0]).join("") || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-display font-medium text-foreground">{authors[0]}</p>
            {authors.length > 1 && (
              <p className="text-xs text-muted-foreground">+{authors.length - 1} co-authors</p>
            )}
          </div>
        </div>
        <Badge className={`${typeColors[type]} text-[10px] uppercase tracking-wider font-display font-semibold border-none`}>
          {type}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="font-serif text-lg font-semibold text-foreground mb-2 leading-snug group-hover:text-accent transition-colors cursor-pointer">
        {title}
      </h3>

      {/* Abstract */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
        {abstract}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map((tag) => (
          <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-display font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
            {tag}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 font-display">
        <span>{journal}</span>
        <span>·</span>
        <span>{date}</span>
        {doi && (
          <>
            <span>·</span>
            <a href="#" className="flex items-center gap-1 hover:text-accent transition-colors">
              DOI <ExternalLink className="w-3 h-3" />
            </a>
          </>
        )}
        <span>·</span>
        <span className="text-gold font-semibold">{citations} citations</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-border">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-gold-muted transition-all text-sm font-display">
          <Heart className="w-4 h-4" /> {likes}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-sm font-display">
          <MessageSquare className="w-4 h-4" /> {comments}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-sm font-display">
          <Share2 className="w-4 h-4" /> Share
        </button>
        <button className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-gold-muted transition-all">
          <Bookmark className="w-4 h-4" />
        </button>
      </div>
    </motion.article>
  );
};

export default ResearchCard;
