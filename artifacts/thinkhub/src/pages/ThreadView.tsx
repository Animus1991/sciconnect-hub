import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowUp, Bookmark, BookmarkCheck, Bell, BellOff, Share2, Flag,
  MessageSquare, Eye, Clock, CheckCircle2, Pin, Flame, Reply, MoreVertical,
  Bold, Italic, Code, Link2, Quote, List, ImageIcon, AtSign, Send, ThumbsUp,
  ChevronDown, ChevronRight, Smile, Paperclip
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

/* ─── Types ─── */
interface ReplyNode {
  id: string;
  author: string;
  initials: string;
  text: string;
  time: string;
  likes: number;
  isAccepted?: boolean;
  children: ReplyNode[];
}

/* ─── Mock thread data ─── */
const threadData: Record<string, {
  id: string; title: string; author: string; initials: string;
  body: string; time: string; likes: number; views: number;
  tags: string[]; pinned: boolean; solved: boolean; category: string;
  replies: ReplyNode[];
}> = {
  d1: {
    id: "d1",
    title: "Best practices for reproducible ML experiments in 2026?",
    author: "Dr. Sarah Chen", initials: "SC",
    body: `I've been struggling with getting consistent results across different hardware configurations. What tools and workflows are you using?\n\nSpecifically, I'm interested in:\n- **Environment management** — Docker vs Conda vs Nix?\n- **Experiment tracking** — MLflow, W&B, or something else?\n- **Data versioning** — DVC, LakeFS, or custom solutions?\n- **Hardware reproducibility** — How do you handle GPU non-determinism?\n\nOur lab recently moved to a shared cluster and the variance between runs has been unacceptable for publication-quality results. Any tips from people who've solved this at scale?`,
    time: "2h ago", likes: 89, views: 1240,
    tags: ["ML", "Reproducibility", "Best Practices"],
    pinned: true, solved: false, category: "methods",
    replies: [
      {
        id: "r1", author: "Prof. Marcus Lee", initials: "ML",
        text: "We've adopted **DVC + MLflow** combo with containerized environments. The key is pinning CUDA versions and using deterministic algorithms where possible.\n\nFor GPU non-determinism, we run each experiment 5 times and report the mean ± std. It adds compute cost but reviewers appreciate it.",
        time: "1h ago", likes: 34, isAccepted: false,
        children: [
          {
            id: "r1-1", author: "Dr. Sarah Chen", initials: "SC",
            text: "Thanks Marcus! Do you use Docker or Singularity on your cluster? We've had issues with Singularity not properly isolating CUDA drivers.",
            time: "45m ago", likes: 5,
            children: [
              {
                id: "r1-1-1", author: "Prof. Marcus Lee", initials: "ML",
                text: "We switched to Apptainer (the Singularity fork) and it handles CUDA driver binding much better. The `--nv` flag works reliably now.",
                time: "30m ago", likes: 8, children: []
              }
            ]
          },
          {
            id: "r1-2", author: "Dr. Yuki Tanaka", initials: "YT",
            text: "5 runs is a good minimum. We've found that some architectures (especially transformers) need 10+ runs for stable variance estimates.",
            time: "40m ago", likes: 12, children: []
          }
        ]
      },
      {
        id: "r2", author: "Dr. Elena Volkov", initials: "EV",
        text: "Nix is a game changer for this. We define our entire environment (including CUDA, cuDNN, Python packages) in a single `flake.nix` file. It's a steep learning curve but the reproducibility is *perfect*.\n\nHere's our approach:\n1. Nix for environment\n2. DVC for data\n3. Hydra for config management\n4. MLflow for tracking",
        time: "50m ago", likes: 56, isAccepted: false,
        children: [
          {
            id: "r2-1", author: "Dr. James Okafor", initials: "JK",
            text: "Interesting approach! How do you handle the Nix learning curve for new lab members? We had students give up after a week of fighting with it.",
            time: "25m ago", likes: 7, children: []
          }
        ]
      },
      {
        id: "r3", author: "Dr. Lisa Park", initials: "LP",
        text: "Don't overlook **random seed management**. We have a utility that sets seeds for Python, NumPy, PyTorch, and CUDA all at once, and logs them with every experiment. It sounds basic but it catches 80% of reproducibility issues.",
        time: "35m ago", likes: 41, children: []
      },
      {
        id: "r4", author: "Prof. Omar Hassan", initials: "OH",
        text: "From a reviewing perspective: the most helpful thing is when authors provide a single command that reproduces their main results. Something like `make reproduce` that pulls data, sets up the environment, and runs the experiment.\n\nBonus points for providing expected output ranges so reviewers can verify.",
        time: "15m ago", likes: 28, children: []
      }
    ]
  }
};

// Generate fallback thread for any ID
const getThread = (id: string) => threadData[id] || {
  ...threadData.d1!,
  id,
  title: "Discussion Thread",
  replies: threadData.d1!.replies.slice(0, 2)
};

/* ─── Online users (simulated) ─── */
const onlineUsers = [
  { name: "Dr. Sarah Chen", initials: "SC" },
  { name: "Prof. Marcus Lee", initials: "ML" },
  { name: "Dr. Elena Volkov", initials: "EV" },
];

/* ─── Rich Text Editor ─── */
/* ─── Mentionable Users ─── */
const mentionableUsers = [
  { name: "Dr. Sarah Chen", initials: "SC", role: "ML Researcher" },
  { name: "Prof. Marcus Lee", initials: "ML", role: "Computer Science" },
  { name: "Dr. Elena Volkov", initials: "EV", role: "Climate Science" },
  { name: "Dr. Yuki Tanaka", initials: "YT", role: "Bioinformatics" },
  { name: "Prof. Omar Hassan", initials: "OH", role: "Bioethics" },
  { name: "Dr. Lisa Park", initials: "LP", role: "Neuroscience" },
  { name: "Dr. Priya Sharma", initials: "PS", role: "Gene Therapy" },
  { name: "Dr. James Okafor", initials: "JK", role: "Publishing" },
  { name: "Prof. James Liu", initials: "JL", role: "Open Science" },
  { name: "Dr. Amara Osei", initials: "AO", role: "Genomics" },
];

const RichTextEditor = ({ onSubmit, placeholder = "Write your reply...", replyTo }: {
  onSubmit: (text: string) => void;
  placeholder?: string;
  replyTo?: string;
}) => {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionPos, setMentionPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const mentionStartRef = useRef<number>(-1);
  const editorRef = useRef<HTMLDivElement>(null);

  const filteredMentions = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return mentionableUsers.filter(u =>
      u.name.toLowerCase().includes(q) || u.initials.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [mentionQuery]);

  const closeMention = useCallback(() => {
    setMentionQuery(null);
    setMentionIndex(0);
    mentionStartRef.current = -1;
  }, []);

  const insertMention = useCallback((user: typeof mentionableUsers[0]) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = mentionStartRef.current;
    const cursorPos = ta.selectionStart;
    const before = text.substring(0, start);
    const after = text.substring(cursorPos);
    const mention = `@${user.name} `;
    const newText = before + mention + after;
    setText(newText);
    closeMention();
    setTimeout(() => {
      ta.focus();
      const newPos = start + mention.length;
      ta.setSelectionRange(newPos, newPos);
    }, 0);
  }, [text, closeMention]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    const ta = e.target;
    const cursorPos = ta.selectionStart;
    const textBefore = val.substring(0, cursorPos);

    // Detect @ trigger
    const lastAt = textBefore.lastIndexOf("@");
    if (lastAt >= 0) {
      const charBefore = lastAt > 0 ? textBefore[lastAt - 1] : " ";
      if (charBefore === " " || charBefore === "\n" || lastAt === 0) {
        const query = textBefore.substring(lastAt + 1);
        if (!query.includes(" ") || query.length <= 20) {
          mentionStartRef.current = lastAt;
          setMentionQuery(query);
          setMentionIndex(0);

          // Estimate position for dropdown
          if (editorRef.current) {
            const lines = textBefore.split("\n");
            const lineNum = lines.length - 1;
            const charWidth = 7.5;
            const lineHeight = 22;
            const lastLineLen = lines[lines.length - 1]?.length || 0;
            setMentionPos({
              top: Math.min((lineNum + 1) * lineHeight + 8, 120),
              left: Math.min(lastLineLen * charWidth + 16, 280),
            });
          }
          return;
        }
      }
    }
    closeMention();
  }, [closeMention]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
      return;
    }

    if (mentionQuery !== null && filteredMentions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex(i => (i + 1) % filteredMentions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex(i => (i - 1 + filteredMentions.length) % filteredMentions.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredMentions[mentionIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeMention();
      }
    }
  }, [mentionQuery, filteredMentions, mentionIndex, insertMention, closeMention]);

  const insertFormat = (prefix: string, suffix: string = prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + (selected || "text") + suffix + text.substring(end);
    setText(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 0);
  };

  const triggerMentionFromToolbar = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const before = text.substring(0, pos);
    const after = text.substring(pos);
    const needsSpace = before.length > 0 && before[before.length - 1] !== " " && before[before.length - 1] !== "\n";
    const insert = (needsSpace ? " " : "") + "@";
    const newText = before + insert + after;
    setText(newText);
    const newPos = pos + insert.length;
    mentionStartRef.current = newPos - 1;
    setMentionQuery("");
    setMentionIndex(0);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertFormat("**"), tooltip: "Bold" },
    { icon: Italic, action: () => insertFormat("*"), tooltip: "Italic" },
    { icon: Code, action: () => insertFormat("`"), tooltip: "Code" },
    { icon: Link2, action: () => insertFormat("[", "](url)"), tooltip: "Link" },
    { icon: Quote, action: () => insertFormat("\n> ", "\n"), tooltip: "Quote" },
    { icon: List, action: () => insertFormat("\n- ", "\n"), tooltip: "List" },
  ];

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
    closeMention();
  };

  return (
    <div className={`rounded-xl border transition-all ${isFocused ? "border-accent/40 shadow-sm" : "border-border"} bg-card`}>
      {replyTo && (
        <div className="px-3 pt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-display">
          <Reply className="w-3 h-3" /> Replying to <span className="font-medium text-foreground/70">{replyTo}</span>
        </div>
      )}
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 pt-2 pb-1 border-b border-border/50">
        {toolbarButtons.map(btn => (
          <Tooltip key={btn.tooltip}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={btn.action}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <btn.icon className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">{btn.tooltip}</p></TooltipContent>
          </Tooltip>
        ))}
        <div className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={triggerMentionFromToolbar}
              className={`p-1.5 rounded-md transition-colors ${
                mentionQuery !== null ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <AtSign className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Mention (@)</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Attach file</p></TooltipContent>
        </Tooltip>
      </div>
      {/* Textarea with mention dropdown */}
      <div ref={editorRef} className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            // Delay closing mentions so click on dropdown works
            setTimeout(() => {
              if (!editorRef.current?.contains(document.activeElement)) {
                closeMention();
              }
            }, 200);
          }}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 text-sm font-display bg-transparent placeholder:text-muted-foreground focus:outline-none resize-none"
          onKeyDown={handleKeyDown}
        />
        {/* Mention autocomplete dropdown */}
        <AnimatePresence>
          {mentionQuery !== null && filteredMentions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute z-30 bg-popover border border-border rounded-lg shadow-scholarly overflow-hidden"
              style={{ top: mentionPos.top, left: Math.min(mentionPos.left, 200), minWidth: 240, maxWidth: 320 }}
            >
              <div className="px-3 py-1.5 border-b border-border/50 flex items-center gap-1.5">
                <AtSign className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Mention a user</span>
              </div>
              <div className="py-1 max-h-[220px] overflow-y-auto">
                {filteredMentions.map((user, idx) => (
                  <button
                    key={user.name}
                    onMouseDown={(e) => { e.preventDefault(); insertMention(user); }}
                    onMouseEnter={() => setMentionIndex(idx)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                      idx === mentionIndex ? "bg-accent/10 text-foreground" : "text-foreground/80 hover:bg-secondary/50"
                    }`}
                  >
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback className={`text-[8px] font-display font-semibold ${
                        idx === mentionIndex ? "bg-accent text-accent-foreground" : "bg-scholarly text-primary-foreground"
                      }`}>
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-display font-medium truncate">{user.name}</p>
                      <p className="text-[10px] font-display text-muted-foreground truncate">{user.role}</p>
                    </div>
                    {idx === mentionIndex && (
                      <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-muted-foreground">↵</kbd>
                    )}
                  </button>
                ))}
              </div>
              {mentionQuery && filteredMentions.length === 0 && (
                <div className="px-3 py-3 text-xs text-muted-foreground font-display text-center">
                  No users found for "{mentionQuery}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between px-3 pb-3">
        <span className="text-[10px] text-muted-foreground font-display">
          Markdown supported · @ to mention · Ctrl+Enter to submit
        </span>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="gap-1.5 font-display text-xs h-8"
        >
          <Send className="w-3 h-3" /> Reply
        </Button>
      </div>
    </div>
  );
};

/* ─── Nested Reply Component ─── */
const NestedReply = ({ reply, depth = 0, onReply }: {
  reply: ReplyNode; depth?: number; onReply: (id: string, author: string) => void;
}) => {
  const [liked, setLiked] = useState(false);
  const [collapsed, setCollapsed] = useState(depth > 2);
  const hasChildren = reply.children.length > 0;

  return (
    <div className={`${depth > 0 ? "ml-4 sm:ml-8 pl-3 sm:pl-4 border-l-2 border-border/40" : ""}`}>
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.05 }}
        className={`py-3 ${reply.isAccepted ? "bg-emerald-brand/5 rounded-lg px-3 border border-emerald-brand/20" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="bg-scholarly text-primary-foreground text-[8px] font-display font-semibold">
              {reply.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-display font-semibold text-foreground">{reply.author}</span>
          {reply.isAccepted && (
            <Badge className="bg-emerald-brand/10 text-emerald-brand border-emerald-brand/20 text-[9px] gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Accepted
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground font-display">{reply.time}</span>
        </div>

        {/* Body — render markdown-like formatting */}
        <div className="text-sm text-foreground/85 font-display leading-relaxed mb-2 whitespace-pre-wrap">
          {reply.text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**"))
              return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
            if (part.startsWith("*") && part.endsWith("*"))
              return <em key={i}>{part.slice(1, -1)}</em>;
            if (part.startsWith("`") && part.endsWith("`"))
              return <code key={i} className="px-1 py-0.5 rounded bg-secondary text-xs font-mono">{part.slice(1, -1)}</code>;
            return part;
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLiked(!liked); }}
            className={`flex items-center gap-1 text-[11px] font-display px-2 py-1 rounded-md transition-colors ${
              liked ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <ArrowUp className={`w-3 h-3 ${liked ? "fill-current" : ""}`} />
            {reply.likes + (liked ? 1 : 0)}
          </button>
          <button
            onClick={() => onReply(reply.id, reply.author)}
            className="flex items-center gap-1 text-[11px] font-display text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary/50 transition-colors"
          >
            <Reply className="w-3 h-3" /> Reply
          </button>
          {hasChildren && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-1 text-[11px] font-display text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary/50 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {reply.children.length} {reply.children.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {reply.children.map(child => (
              <NestedReply key={child.id} reply={child} depth={depth + 1} onReply={onReply} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Typing Indicator ─── */
const TypingIndicator = ({ users }: { users: string[] }) => {
  if (users.length === 0) return null;
  const label = users.length === 1
    ? `${users[0]} is typing`
    : users.length === 2
      ? `${users[0]} and ${users[1]} are typing`
      : `${users[0]} and ${users.length - 1} others are typing`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex items-center gap-2 px-4 py-2"
    >
      <div className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-accent/60"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground font-display italic">{label}</span>
    </motion.div>
  );
};

/* ─── Main Thread View ─── */
const ThreadView = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const thread = getThread(threadId || "d1");

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(true);
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string } | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Simulated typing indicator
  useEffect(() => {
    const t1 = setTimeout(() => setTypingUsers(["Dr. Elena Volkov"]), 5000);
    const t2 = setTimeout(() => setTypingUsers([]), 9000);
    const t3 = setTimeout(() => setTypingUsers(["Prof. Marcus Lee", "Dr. Yuki Tanaka"]), 15000);
    const t4 = setTimeout(() => setTypingUsers([]), 19000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const handleReply = useCallback((id: string, author: string) => {
    setReplyingTo({ id, author });
    document.getElementById("reply-editor")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSubmitReply = useCallback((text: string) => {
    toast.success("Reply posted!");
    setReplyingTo(null);
  }, []);

  const totalReplies = (replies: ReplyNode[]): number =>
    replies.reduce((sum, r) => sum + 1 + totalReplies(r.children), 0);

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="max-w-4xl mx-auto">
          {/* Back nav */}
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
            <button
              onClick={() => navigate("/discussions")}
              className="flex items-center gap-2 text-sm font-display text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Discussions
            </button>
          </motion.div>

          {/* Thread header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5 sm:p-6 mb-4"
          >
            {/* Title with badges */}
            <div className="flex items-start gap-2 mb-3 flex-wrap">
              {thread.pinned && <Pin className="w-4 h-4 text-gold mt-1 flex-shrink-0" />}
              {thread.solved && <CheckCircle2 className="w-4 h-4 text-emerald-brand mt-1 flex-shrink-0" />}
              <h1 className="font-serif text-xl sm:text-[27px] font-bold text-foreground flex-1">{thread.title}</h1>
            </div>

            {/* Author + meta */}
            <div className="flex items-center gap-3 mb-4 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-scholarly text-primary-foreground text-[9px] font-display font-semibold">{thread.initials}</AvatarFallback>
                </Avatar>
                <span className="font-display font-semibold text-foreground">{thread.author}</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" /> {thread.time}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="w-3 h-3" /> {thread.views} views</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare className="w-3 h-3" /> {totalReplies(thread.replies)} replies</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {thread.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="font-display text-[10px]">{tag}</Badge>
              ))}
            </div>

            {/* Body */}
            <div className="text-sm text-foreground/85 font-display leading-relaxed whitespace-pre-wrap">
              {thread.body.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**"))
                  return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
                return part;
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border flex-wrap">
              <button
                onClick={() => { setLiked(!liked); toast.success(liked ? "Removed upvote" : "Upvoted!"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                  liked ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <ArrowUp className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
                {thread.likes + (liked ? 1 : 0)}
              </button>
              <button
                onClick={() => { setBookmarked(!bookmarked); toast.success(bookmarked ? "Removed bookmark" : "Bookmarked!"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                  bookmarked ? "text-gold bg-gold-muted" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                {bookmarked ? "Bookmarked" : "Bookmark"}
              </button>
              <button
                onClick={() => { setFollowing(!following); toast.success(following ? "Unfollowed" : "Following!"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                  following ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {following ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                {following ? "Following" : "Follow"}
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <button
                onClick={() => toast.info("Report submitted")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all ml-auto"
              >
                <Flag className="w-3.5 h-3.5" /> Report
              </button>
            </div>

            {/* Online in this thread */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
              <div className="flex -space-x-1.5">
                {onlineUsers.map(u => (
                  <Tooltip key={u.name}>
                    <TooltipTrigger>
                      <div className="relative">
                        <Avatar className="w-5 h-5 ring-2 ring-card">
                          <AvatarFallback className="bg-scholarly text-primary-foreground text-[7px] font-display font-semibold">{u.initials}</AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-brand rounded-full ring-1 ring-card" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">{u.name} — online</p></TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground font-display">{onlineUsers.length} viewing this thread</span>
            </div>
          </motion.div>

          {/* Replies section */}
          <div className="bg-card rounded-xl border border-border mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-semibold text-sm text-foreground">
                {totalReplies(thread.replies)} Replies
              </h2>
              <span className="text-[10px] text-muted-foreground font-display">Sorted by most relevant</span>
            </div>

            <div className="px-4 sm:px-5 divide-y divide-border/30">
              {thread.replies.map(reply => (
                <NestedReply key={reply.id} reply={reply} onReply={handleReply} />
              ))}
            </div>

            {/* Typing indicator */}
            <AnimatePresence>
              {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
            </AnimatePresence>
          </div>

          {/* Reply editor */}
          <div id="reply-editor">
            <RichTextEditor
              onSubmit={handleSubmitReply}
              placeholder={replyingTo ? `Reply to ${replyingTo.author}...` : "Join the discussion..."}
              replyTo={replyingTo?.author}
            />
          </div>

          <div className="h-8" />
        </div>
      </TooltipProvider>
    </AppLayout>
  );
};

export default ThreadView;
