import { motion } from "framer-motion";
import { Heart, MessageSquare, Share2, Bookmark, BookmarkCheck, ExternalLink, Quote, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

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
  paper:    "bg-scholarly text-primary-foreground",
  preprint: "bg-gold-muted text-amber-700 dark:text-amber-400",
  dataset:  "bg-emerald-muted text-emerald-700 dark:text-emerald-400",
  code:     "bg-secondary text-muted-foreground",
};

const journalRank: Record<string, { rank: string; color: string }> = {
  "Nature Machine Intelligence": { rank: "Q1", color: "text-emerald-brand bg-emerald-muted" },
  "Cell":                        { rank: "Q1", color: "text-emerald-brand bg-emerald-muted" },
  "Physical Review X":           { rank: "Q1", color: "text-emerald-brand bg-emerald-muted" },
  "Scientific Data":             { rank: "Q1", color: "text-emerald-brand bg-emerald-muted" },
  "GitHub / JOSS":               { rank: "OA", color: "text-blue-400 bg-blue-400/10" },
};

function estimateReadTime(abstract: string): number {
  return Math.max(3, Math.ceil(abstract.split(" ").length / 200) + 5);
}

const ResearchCard = ({
  index, title, authors, abstract, journal, date, tags, citations, likes, comments, doi, type,
}: ResearchCardProps) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    if (!liked) toast.success("Paper liked");
  };

  const handleBookmark = () => {
    setBookmarked(prev => !prev);
    toast(bookmarked ? "Removed from reading list" : "Saved to reading list");
  };

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
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3 font-display">
        <div className="flex items-center gap-1.5">
          {journalRank[journal] && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-display font-bold ${journalRank[journal].color}`}>
              {journalRank[journal].rank}
            </span>
          )}
          <span className="font-medium text-foreground/80">{journal}</span>
        </div>
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
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {estimateReadTime(abstract)} min read
        </span>
      </div>

      {/* Citation highlight */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-secondary/50">
        <Quote className="w-3.5 h-3.5 text-gold shrink-0" />
        <span className="text-xs font-display">
          <span className="text-gold font-bold">{citations}</span>
          <span className="text-muted-foreground"> citations · </span>
          <span className="text-emerald-brand font-medium">+{Math.round(citations * 0.12)} this year</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-border">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-display ${
            liked ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-accent hover:bg-gold-muted"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} /> {likeCount}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-sm font-display">
          <MessageSquare className="w-4 h-4" /> {comments}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-sm font-display">
          <Share2 className="w-4 h-4" /> Share
        </button>
        <button
          onClick={handleBookmark}
          className={`ml-auto p-1.5 rounded-lg transition-all ${
            bookmarked ? "text-accent bg-gold-muted" : "text-muted-foreground hover:text-accent hover:bg-gold-muted"
          }`}
        >
          {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
    </motion.article>
  );
};

export default ResearchCard;
