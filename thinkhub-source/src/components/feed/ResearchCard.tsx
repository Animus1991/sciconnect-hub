import { motion } from "framer-motion";
import { Heart, MessageSquare, Share2, Bookmark, BookmarkCheck, ExternalLink, Quote, Clock, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
  paper:    { bg: "bg-scholarly", text: "text-primary-foreground", label: "Paper" },
  preprint: { bg: "bg-warning-muted", text: "text-warning-foreground", label: "Preprint" },
  dataset:  { bg: "bg-success-muted", text: "text-success", label: "Dataset" },
  code:     { bg: "bg-info-muted", text: "text-info", label: "Code" },
};

const journalRank: Record<string, { rank: string; color: string }> = {
  "Nature Machine Intelligence": { rank: "Q1", color: "text-success bg-success-muted" },
  "Cell":                        { rank: "Q1", color: "text-success bg-success-muted" },
  "Physical Review X":           { rank: "Q1", color: "text-success bg-success-muted" },
  "Scientific Data":             { rank: "Q1", color: "text-success bg-success-muted" },
  "GitHub / JOSS":               { rank: "OA", color: "text-info bg-info-muted" },
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

  const handleShare = () => {
    navigator.clipboard.writeText(`${title} — ${journal}`);
    toast.success("Citation copied to clipboard");
  };

  const typeStyle = typeConfig[type] || typeConfig.paper;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-accent/20 transition-all duration-300 group"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-10 h-10 ring-2 ring-border group-hover:ring-accent/30 transition-all shrink-0">
            <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-xs font-semibold">
              {authors[0]?.split(" ").map(n => n[0]).join("") || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{authors[0]}</p>
            {authors.length > 1 && (
              <p className="text-[11px] text-muted-foreground">+{authors.length - 1} co-authors</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={`${typeStyle.bg} ${typeStyle.text} text-[9px] uppercase tracking-wider font-semibold border-none px-2 py-0.5`}>
            {typeStyle.label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleShare}>Copy citation</DropdownMenuItem>
              <DropdownMenuItem onClick={handleBookmark}>
                {bookmarked ? "Remove from list" : "Save to list"}
              </DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-serif text-lg font-semibold text-foreground mb-2 leading-snug group-hover:text-accent transition-colors cursor-pointer line-clamp-2">
        {title}
      </h3>

      {/* Abstract */}
      <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {abstract}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
            {tag}
          </span>
        ))}
        {tags.length > 4 && (
          <span className="text-[10px] px-2 py-0.5 text-muted-foreground">+{tags.length - 4}</span>
        )}
      </div>

      {/* Meta Row */}
      <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground mb-3">
        {journalRank[journal] && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${journalRank[journal].color}`}>
            {journalRank[journal].rank}
          </span>
        )}
        <span className="font-medium text-foreground/80">{journal}</span>
        <span className="text-border">·</span>
        <span>{date}</span>
        {doi && (
          <>
            <span className="text-border">·</span>
            <a href="#" className="flex items-center gap-0.5 hover:text-accent transition-colors">
              DOI <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </>
        )}
        <span className="text-border">·</span>
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {estimateReadTime(abstract)} min
        </span>
      </div>

      {/* Citation Row */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-secondary/40">
        <Quote className="w-3.5 h-3.5 text-gold shrink-0" />
        <span className="text-[11px] font-medium">
          <span className="text-gold font-bold">{citations}</span>
          <span className="text-muted-foreground"> citations </span>
          <span className="text-success">+{Math.round(citations * 0.12)} this year</span>
        </span>
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-1 pt-3 border-t border-border">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
            liked 
              ? "text-destructive bg-destructive/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span>{likeCount}</span>
        </button>
        
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
          <MessageSquare className="w-4 h-4" />
          <span>{comments}</span>
        </button>
        
        <button 
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
        
        <button
          onClick={handleBookmark}
          className={`ml-auto w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            bookmarked 
              ? "text-accent bg-gold-muted" 
              : "text-muted-foreground hover:text-accent hover:bg-gold-muted"
          }`}
        >
          {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
    </motion.article>
  );
};

export default ResearchCard;
