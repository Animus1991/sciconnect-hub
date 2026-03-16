import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, Share2, Bookmark, BookmarkCheck, ExternalLink, Quote, Clock, MoreHorizontal, ChevronDown, ChevronUp, Copy, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

function formatCitation(title: string, authors: string[], journal: string, date: string, doi?: string): string {
  const authorStr = authors.length > 2
    ? `${authors[0]} et al.`
    : authors.join(", ");
  return `${authorStr} (${date}). ${title}. ${journal}.${doi ? ` https://doi.org/${doi}` : ""}`;
}

const ResearchCard = ({
  index, title, authors, abstract, journal, date, tags, citations, likes, comments, doi, type,
}: ResearchCardProps) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [expanded, setExpanded] = useState(false);

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
    const citation = formatCitation(title, authors, journal, date, doi);
    navigator.clipboard.writeText(citation);
    toast.success("Citation copied to clipboard");
  };

  const handleCopyDOI = () => {
    if (doi) {
      navigator.clipboard.writeText(`https://doi.org/${doi}`);
      toast.success("DOI link copied");
    }
  };

  const typeStyle = typeConfig[type] || typeConfig.paper;

  return (
    <TooltipProvider>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.35 }}
        className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-accent/25 transition-all duration-300 group"
        style={{ boxShadow: "0 1px 4px hsl(225 20% 8% / 0.05)" }}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-10 h-10 ring-2 ring-border group-hover:ring-accent/30 transition-all shrink-0">
              <AvatarFallback className="bg-scholarly text-primary-foreground font-display text-[11px] font-semibold">
                {authors[0]?.split(" ").map(n => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-foreground truncate">{authors[0]}</p>
              {authors.length > 1 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-[12px] text-muted-foreground cursor-default hover:text-foreground transition-colors">
                      +{authors.length - 1} co-authors
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="text-[11px]">{authors.slice(1).join(", ")}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`${typeStyle.bg} ${typeStyle.text} text-[10px] uppercase tracking-wider font-semibold border-none px-2.5 py-0.5`}>
              {typeStyle.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={handleShare}>
                  <Copy className="w-3.5 h-3.5 mr-2" /> Copy citation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBookmark}>
                  <Bookmark className="w-3.5 h-3.5 mr-2" />
                  {bookmarked ? "Remove from list" : "Save to reading list"}
                </DropdownMenuItem>
                {doi && (
                  <DropdownMenuItem onClick={handleCopyDOI}>
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> Copy DOI link
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground">
                  <FileText className="w-3.5 h-3.5 mr-2" /> Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-[17px] font-semibold text-foreground mb-2.5 leading-snug group-hover:text-accent transition-colors cursor-pointer line-clamp-2">
          {title}
        </h3>

        {/* Abstract with expand/collapse */}
        <div className="mb-3.5">
          <AnimatePresence initial={false}>
            <motion.p
              className={`text-[13.5px] text-muted-foreground leading-relaxed ${expanded ? "" : "line-clamp-2"}`}
              initial={false}
              animate={{ height: "auto" }}
            >
              {abstract}
            </motion.p>
          </AnimatePresence>
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="mt-1.5 flex items-center gap-0.5 text-[12px] text-accent/70 hover:text-accent transition-colors font-medium"
          >
            {expanded ? (
              <><ChevronUp className="w-3 h-3" /> Show less</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> Read more</>
            )}
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              {tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="text-[11px] px-2 py-0.5 text-muted-foreground">+{tags.length - 4}</span>
          )}
        </div>

        {/* Meta Row */}
        <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-[12px] text-muted-foreground mb-3.5">
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
              <a
                href={`https://doi.org/${doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 hover:text-accent transition-colors"
                onClick={e => e.stopPropagation()}
              >
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
        <div className="flex items-center justify-between gap-2 mb-4 px-3 py-2 rounded-lg bg-secondary/40">
          <div className="flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="text-[11px] font-medium">
              <span className="text-gold font-bold">{citations}</span>
              <span className="text-muted-foreground"> citations </span>
              <span className="text-success">+{Math.round(citations * 0.12)} this year</span>
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleShare}
                className="text-[10px] px-2 py-1 rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-accent/40 hover:bg-accent/5 transition-all flex items-center gap-1"
              >
                <Copy className="w-2.5 h-2.5" /> Cite
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px]">
              Copy formatted citation
            </TooltipContent>
          </Tooltip>
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
    </TooltipProvider>
  );
};

export default ResearchCard;
