import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, Search, ChevronDown, ChevronRight, MessageSquare,
  BookOpen, Shield, Zap, Users, Bell, Settings, Mail, ExternalLink,
  FileText, Globe, Lock, Key, Database, LifeBuoy, Lightbulb, AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

/* ─── Types ─── */
interface FAQ {
  q: string;
  a: string;
  tags: string[];
}
interface Category {
  icon: typeof HelpCircle;
  label: string;
  desc: string;
  color: string;
  faqs: FAQ[];
}

/* ─── FAQ Data ─── */
const categories: Category[] = [
  {
    icon: BookOpen,
    label: "Getting Started",
    desc: "Account setup, onboarding, and first steps",
    color: "text-primary bg-primary/10",
    faqs: [
      {
        q: "How do I create my Think!Hub researcher profile?",
        a: "After signing up, you'll be guided through the onboarding flow where you can link your ORCID iD, add your institution, select your research fields, and import your publications from Google Scholar or BibTeX. Your profile is automatically enriched with verified research data.",
        tags: ["profile", "setup", "orcid"],
      },
      {
        q: "Can I import my publications automatically?",
        a: "Yes. Think!Hub supports importing publications from ORCID, Google Scholar, PubMed, arXiv, and BibTeX files. Go to Publications → Import and select your preferred source. DOI resolution fills in metadata automatically.",
        tags: ["publications", "import", "orcid"],
      },
      {
        q: "What is the ORCID iD and why should I link it?",
        a: "ORCID is an open, non-profit registry providing persistent digital identifiers for researchers. Linking your ORCID iD verifies your academic identity, enables automatic publication sync, and improves your reputation score. It takes under a minute to connect.",
        tags: ["orcid", "verification", "identity"],
      },
      {
        q: "How do I set my research fields and interests?",
        a: "During onboarding (or any time in Settings → Research Profile), you can select up to 5 primary research fields and add keyword tags for your specialisations. These drive personalised recommendations, collaborator suggestions, and your Discover feed.",
        tags: ["fields", "interests", "recommendations"],
      },
    ],
  },
  {
    icon: Users,
    label: "Collaboration",
    desc: "Projects, workspaces, and research teams",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    faqs: [
      {
        q: "How do I start a collaborative research project?",
        a: "Navigate to Projects → New Project. You can set the project title, description, research domain, and visibility (public, institution-only, or private). Then invite collaborators by email or Think!Hub username. The shared workspace becomes available immediately.",
        tags: ["projects", "collaboration", "teams"],
      },
      {
        q: "What can I do in the shared workspace?",
        a: "The Collaboration Hub provides a live document editor with co-authoring, file sharing (datasets, code, protocols), a team chat channel, and a blockchain audit trail logging every edit and contribution for provenance. All changes are version-controlled.",
        tags: ["workspace", "documents", "files"],
      },
      {
        q: "How does contribution tracking work?",
        a: "Every action in a project — writing, editing, uploading, reviewing — is logged with your identifier and timestamped. Contribution Tracking converts this into a CRediT-compatible attribution breakdown so all contributors get proper credit in publications.",
        tags: ["attribution", "credit", "contributions"],
      },
      {
        q: "Can I make a project private or public?",
        a: "Yes. Projects have three visibility levels: Public (discoverable by all researchers), Institution-only (visible within your university/lab), and Private (invitation-only). You can change this at any time in Project Settings. Public projects appear in the Discover feed.",
        tags: ["privacy", "visibility", "projects"],
      },
    ],
  },
  {
    icon: Shield,
    label: "Blockchain & Attribution",
    desc: "Provenance, reputation, and on-chain records",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20",
    faqs: [
      {
        q: "What does anchoring a research record to the blockchain mean?",
        a: "Anchoring creates a cryptographic hash of your research output (paper, dataset, idea, or collaboration record) and writes it to a public blockchain. This creates a tamper-proof timestamp proving you had that specific content at that specific time — useful for establishing priority and provenance.",
        tags: ["blockchain", "anchoring", "provenance"],
      },
      {
        q: "Are my conversations recorded on the blockchain without my consent?",
        a: "No. The default conversation mode is Standard Chat — no blockchain recording of any kind. Blockchain validation only occurs when you explicitly choose it from the conversation settings. One-Party Recording notifies the other party. Mutual Attribution requires both researchers to consent. Think!Hub never records covertly.",
        tags: ["privacy", "consent", "blockchain", "messaging"],
      },
      {
        q: "What is a Soulbound Token (SBT) and how do I earn one?",
        a: "SBTs are non-transferable on-chain badges representing verified research achievements: completing peer reviews, publishing high-impact papers, mentoring researchers, or sustained contributions to a community. They appear on your public profile and reputation score.",
        tags: ["sbt", "badges", "reputation"],
      },
      {
        q: "How is my Reputation Score calculated?",
        a: "Your Reputation Score is a composite of: citation impact (h-index, normalised by field), peer review quality ratings, blockchain-verified contribution history, community engagement, mentorship activity, and SBT collection. It is field-normalised and updated weekly.",
        tags: ["reputation", "score", "h-index"],
      },
    ],
  },
  {
    icon: MessageSquare,
    label: "Messaging",
    desc: "Conversations, chat modes, and notifications",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    faqs: [
      {
        q: "What are the three conversation modes in Think!Hub?",
        a: "1) Standard Chat: private, no recording. 2) Single-Party Research Record: one researcher records their side for personal provenance — the other party is notified. 3) Mutual Research Attribution: both researchers agree to jointly validate the conversation as a research record. Mode is always visible in the conversation header.",
        tags: ["blockchain", "conversation", "privacy", "consent"],
      },
      {
        q: "Can I export a conversation transcript?",
        a: "Yes, in Mutual Research Attribution mode and Single-Party mode (for your own side). Use the Export Transcript button in the conversation header. You can download as PDF or as a structured JSON research record that links to your Idea Provenance timeline.",
        tags: ["export", "transcript", "pdf"],
      },
      {
        q: "How do I use the AI Copilot in Messenger?",
        a: "Open any conversation and click the ✦ AI Copilot button. The copilot can summarise the conversation, suggest relevant papers based on the discussion, draft professional replies, or extract action items. It operates locally within the chat — it does not read your other conversations.",
        tags: ["ai", "copilot", "assistant"],
      },
      {
        q: "How do read receipts and typing indicators work?",
        a: "Read receipts appear as a small avatar icon next to messages once the recipient has viewed them. Typing indicators appear in real-time when the other researcher is composing. Both can be disabled individually in Settings → Messaging Privacy.",
        tags: ["read receipts", "typing", "privacy"],
      },
    ],
  },
  {
    icon: Settings,
    label: "Account & Settings",
    desc: "Profile, privacy, notifications, and data",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    faqs: [
      {
        q: "How do I change my notification preferences?",
        a: "Go to Settings → Notifications. You can control notifications for: new citations, peer review requests, collaboration invites, community activity, mentorship sessions, funding opportunities, and blockchain events. Each category can be set to immediate, daily digest, or off — separately for email and in-app.",
        tags: ["notifications", "preferences", "email"],
      },
      {
        q: "How do I make my profile public or private?",
        a: "In Settings → Privacy, you can control: who can view your full profile (everyone / researchers only / connections only), whether your publications list is public, whether your h-index and citations are displayed, and whether your profile appears in Discover search results.",
        tags: ["privacy", "profile", "visibility"],
      },
      {
        q: "How do I export my data for GDPR portability?",
        a: "Go to Settings → Data & Privacy → Export My Data. You'll receive a download link within 24 hours containing: your profile data, publications list, messages (your side), lab notebook entries, settings, and activity history in JSON and CSV formats.",
        tags: ["gdpr", "export", "data"],
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Account → Delete Account. Before deletion, you can export your data. Deletion removes your profile, personal data, and messages. Contributions to collaborative projects are anonymised (not deleted) to preserve research integrity for your co-authors.",
        tags: ["delete", "account", "gdpr"],
      },
    ],
  },
  {
    icon: Bell,
    label: "Peer Review & Publishing",
    desc: "Manuscript review, submissions, and journals",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
    faqs: [
      {
        q: "How does Think!Hub peer review work?",
        a: "Researchers submit manuscripts via Publications → Submit for Review. Editors assign reviewers based on field expertise and conflict-of-interest checks. Reviewers see the manuscript in the review queue with a structured form covering: novelty, methodology, clarity, and ethics. All reviews are timestamped and blockchain-logged.",
        tags: ["peer review", "submission", "manuscript"],
      },
      {
        q: "Are peer reviews anonymous?",
        a: "Think!Hub supports three review modes set by the submitting editor: Double-blind (both parties anonymous), Single-blind (reviewer anonymous), and Open Review (identities disclosed on publication). Reviewers can always optionally sign open reviews.",
        tags: ["anonymous", "blind review", "peer review"],
      },
      {
        q: "How do I track my submitted manuscripts?",
        a: "All submissions appear in Peer Review → My Submissions with real-time status indicators: Submitted, Under Review, Revisions Requested, Accepted, or Rejected. You receive notifications at each status change and can view detailed reviewer feedback when shared by the editor.",
        tags: ["submissions", "status", "tracking"],
      },
    ],
  },
];

/* ─── Accordion Item ─── */
function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-secondary/40 transition-colors"
      >
        <span className="text-[14px] font-medium text-foreground leading-snug">{faq.q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-0 text-[13px] text-muted-foreground leading-relaxed border-t border-border/50">
              <p className="pt-3">{faq.a}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {faq.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">{t}</Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Component ─── */
const Help = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const debouncedSearch = useDebounce(search, 200);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    const cats = activeCategory ? categories.filter((c) => c.label === activeCategory) : categories;
    if (!q) return cats;
    return cats
      .map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || f.tags.some((t) => t.includes(q))),
      }))
      .filter((cat) => cat.faqs.length > 0);
  }, [debouncedSearch, activeCategory]);

  const totalResults = filtered.reduce((a, c) => a + c.faqs.length, 0);

  const handleContact = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error("Please fill in both fields.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setContactForm({ subject: "", message: "" });
      toast.success("Message sent — we'll reply within 24 hours.");
    }, 1200);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center space-y-3 py-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <LifeBuoy className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Help Center</h1>
            <p className="text-[14px] text-muted-foreground max-w-md mx-auto">
              Find answers, explore documentation, and get support for Think!Hub.
            </p>
            {/* Search */}
            <div className="relative max-w-md mx-auto mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search help articles…"
                className="pl-9 h-10 rounded-xl bg-secondary border-border"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  ✕
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        {!search && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: Lightbulb, label: "Getting Started Guide", href: "#getting-started", color: "text-amber-500" },
              { icon: Globe, label: "Public API Docs", href: "#api", color: "text-blue-500" },
              { icon: Lock, label: "Privacy & Security", href: "#privacy", color: "text-violet-500" },
              { icon: Database, label: "Data Export (GDPR)", href: "#gdpr", color: "text-emerald-500" },
              { icon: Key, label: "ORCID Integration", href: "#orcid", color: "text-primary" },
              { icon: AlertCircle, label: "Report an Issue", href: "#contact", color: "text-rose-500" },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => toast.info(`Opening: ${link.label}`)}
                className="flex items-center gap-2.5 p-3.5 bg-card border border-border rounded-xl text-left hover:bg-secondary/60 transition-colors group"
              >
                <link.icon className={`w-4 h-4 flex-shrink-0 ${link.color}`} />
                <span className="text-[13px] text-foreground group-hover:text-foreground/80 leading-tight">{link.label}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${!activeCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5 ${activeCategory === cat.label ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results Count */}
        {search && (
          <p className="text-[13px] text-muted-foreground">
            {totalResults === 0 ? "No articles found." : `${totalResults} article${totalResults !== 1 ? "s" : ""} found`}
          </p>
        )}

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filtered.map((cat) => (
            <div key={cat.label} id={cat.label.toLowerCase().replace(/\s+/g, "-")}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                  <cat.icon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground">{cat.label}</h2>
                  <p className="text-[12px] text-muted-foreground">{cat.desc}</p>
                </div>
                <Badge variant="secondary" className="ml-auto text-[11px]">{cat.faqs.length} articles</Badge>
              </div>
              <div className="space-y-2">
                {cat.faqs.map((faq, i) => (
                  <FAQItem key={i} faq={faq} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-[14px] font-medium text-foreground mb-1">No articles found</p>
            <p className="text-[13px] text-muted-foreground">Try different keywords or browse all topics.</p>
            <button onClick={() => { setSearch(""); setActiveCategory(null); }} className="mt-4 text-[13px] text-primary hover:underline">
              Clear search
            </button>
          </div>
        )}

        {/* Contact Support */}
        <div id="contact" className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">Still need help?</h2>
              <p className="text-[12px] text-muted-foreground">Our support team responds within 24 hours on working days.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-muted-foreground">Subject</label>
              <Input
                value={contactForm.subject}
                onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="e.g. Issue with publication import"
                className="h-9 text-[13px] rounded-xl"
              />
            </div>
            <div className="space-y-1.5 sm:row-span-2">
              <label className="text-[12px] font-medium text-muted-foreground">Message</label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Describe the issue or question in detail…"
                rows={4}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleContact}
                disabled={sending}
                className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-2 border-t border-border/50">
            {[
              { icon: MessageSquare, label: "Live Chat", sub: "Mon–Fri 9am–6pm UTC" },
              { icon: FileText, label: "Documentation", sub: "Full developer docs" },
              { icon: Globe, label: "Community Forum", sub: "Ask the community" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => toast.info(`${item.label} coming soon`)}
                className="flex items-center gap-2 text-left hover:text-primary transition-colors"
              >
                <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <div>
                  <p className="text-[12px] font-medium text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground ml-1" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Help;
