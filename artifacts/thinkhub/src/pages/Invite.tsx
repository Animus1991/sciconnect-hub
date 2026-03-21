import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import {
  Users, Mail, Link2, Copy, Check, Send, Gift, Star,
  ChevronRight, ExternalLink, Plus, X, Sparkles, BookOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

/* ─── Mock Data ─── */
const INVITE_LINK = "https://thinkhub.science/join?ref=dr-researcher-2026";

const pendingInvites = [
  { email: "prof.amelia.carter@cambridge.ac.uk", sent: "3 days ago", status: "pending" as const },
  { email: "j.nakamura@oist.jp", sent: "1 week ago", status: "pending" as const },
  { email: "sofia.ramos@cnrs.fr", sent: "2 weeks ago", status: "joined" as const },
  { email: "t.okonkwo@uct.ac.za", sent: "3 weeks ago", status: "joined" as const },
];

const leaderboard = [
  { name: "Prof. Marcus Chen", initials: "MC", invited: 23, points: 230 },
  { name: "Dr. Elena Vasquez", initials: "EV", invited: 17, points: 170 },
  { name: "Dr. Sarah Kim", initials: "SK", invited: 14, points: 140 },
  { name: "You", initials: "DR", invited: 4, points: 40, isYou: true },
  { name: "Dr. Yuki Tanaka", initials: "YT", invited: 3, points: 30 },
];

const perks = [
  { icon: BookOpen, label: "Extended Lab Notebook", desc: "10 extra private notebook entries per invited researcher", milestone: 1 },
  { icon: Star, label: "Reputation Boost", desc: "+5 reputation points per accepted invitation", milestone: 1 },
  { icon: Sparkles, label: "SBT: Community Builder", desc: "Earn the Community Builder Soulbound Token at 10 invitations", milestone: 10 },
  { icon: Gift, label: "Priority Peer Review", desc: "Move up the peer review queue at 20 invitations", milestone: 20 },
];

/* ─── Component ─── */
const Invite = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [message, setMessage] = useState("I've been using Think!Hub for my research collaboration and attribution tracking — it's genuinely transformed how I work with co-authors. I think you'd find it useful too. Join me using my invite link.");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const joined = pendingInvites.filter((i) => i.status === "joined").length;
  const pending = pendingInvites.filter((i) => i.status === "pending").length;

  const copyLink = () => {
    navigator.clipboard.writeText(INVITE_LINK).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Invite link copied!");
    });
  };

  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { toast.error("Please enter a valid email address."); return; }
    if (emails.includes(trimmed)) { toast.error("Already added."); return; }
    setEmails((prev) => [...prev, trimmed]);
    setEmailInput("");
  };

  const removeEmail = (e: string) => setEmails((prev) => prev.filter((x) => x !== e));

  const handleSend = () => {
    if (emails.length === 0) { toast.error("Add at least one email address."); return; }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success(`Invited ${emails.length} researcher${emails.length > 1 ? "s" : ""}!`);
      setEmails([]);
    }, 1400);
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(INVITE_LINK)}&summary=${encodeURIComponent("Join me on Think!Hub — the research collaboration platform for scientists.")}`;
    window.open(url, "_blank");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">Invite Colleagues</h1>
              <p className="text-[13px] text-muted-foreground">Grow your research network and earn rewards.</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Invitations sent", value: pendingInvites.length, icon: Send, color: "text-primary" },
            { label: "Researchers joined", value: joined, icon: Check, color: "text-emerald-600" },
            { label: "Awaiting response", value: pending, icon: Users, color: "text-amber-500" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
              <p className="text-[22px] font-semibold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Invite Link */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <p className="text-[13px] font-semibold text-foreground">Your personal invite link</p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-xl border border-border bg-secondary text-[12px] text-muted-foreground font-mono overflow-hidden">
              <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{INVITE_LINK}</span>
            </div>
            <button onClick={copyLink} className={`flex items-center gap-1.5 px-4 h-10 rounded-xl text-[13px] font-medium transition-all ${copied ? "bg-emerald-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={shareOnLinkedIn} className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border text-[12px] text-foreground hover:bg-secondary transition-colors">
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" /> Share on LinkedIn
            </button>
            <button onClick={() => toast.info("Twitter/X share coming soon")} className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border text-[12px] text-foreground hover:bg-secondary transition-colors">
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" /> Share on X
            </button>
            <button onClick={() => {
              const subject = "Join me on Think!Hub — research collaboration platform";
              const body = `Hi,\n\n${message}\n\n${INVITE_LINK}\n\nBest regards`;
              window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
            }} className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border text-[12px] text-foreground hover:bg-secondary transition-colors">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Share via Email
            </button>
          </div>
        </div>

        {/* Email Invite Form */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <p className="text-[13px] font-semibold text-foreground">Invite by email</p>

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-muted-foreground">Email addresses</label>
            <div className="flex gap-2">
              <Input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEmail()}
                placeholder="colleague@university.edu"
                className="rounded-xl h-9 text-[13px]"
              />
              <button onClick={addEmail} className="flex items-center gap-1 px-3 h-9 rounded-xl border border-border text-[12px] text-foreground hover:bg-secondary transition-colors flex-shrink-0">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            {emails.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {emails.map((e) => (
                  <Badge key={e} variant="secondary" className="text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    {e}
                    <button onClick={() => removeEmail(e)} className="hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-muted-foreground">Personal message (optional)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <button onClick={handleSend} disabled={sending || emails.length === 0} className="flex items-center gap-2 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {sending ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</>
            ) : (
              <><Send className="w-3.5 h-3.5" />Send {emails.length > 0 ? `${emails.length} ` : ""}Invite{emails.length !== 1 ? "s" : ""}</>
            )}
          </button>
        </div>

        {/* Pending Invites */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-[13px] font-semibold text-foreground">Sent invitations</p>
          </div>
          {pendingInvites.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-[13px]">No invitations sent yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {pendingInvites.map((inv) => (
                <div key={inv.email} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[13px] text-foreground truncate">{inv.email}</p>
                      <p className="text-[11px] text-muted-foreground">Sent {inv.sent}</p>
                    </div>
                  </div>
                  <Badge variant={inv.status === "joined" ? "default" : "secondary"} className={`text-[10px] flex-shrink-0 ${inv.status === "joined" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : ""}`}>
                    {inv.status === "joined" ? "✓ Joined" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rewards */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <p className="text-[13px] font-semibold text-foreground">Invitation rewards</p>
            <Badge variant="secondary" className="text-[11px]">{joined} / 20 joined</Badge>
          </div>
          <div className="divide-y divide-border">
            {perks.map((p) => {
              const unlocked = joined >= p.milestone;
              return (
                <div key={p.label} className={`flex items-center gap-3 px-5 py-3.5 ${unlocked ? "" : "opacity-50"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${unlocked ? "bg-primary/10" : "bg-secondary"}`}>
                    <p.icon className={`w-4 h-4 ${unlocked ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                  </div>
                  {unlocked ? (
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 text-[10px] flex-shrink-0">Unlocked</Badge>
                  ) : (
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">At {p.milestone} joined</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-[13px] font-semibold text-foreground">Community leaderboard</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Top researchers growing the Think!Hub community</p>
          </div>
          <div className="divide-y divide-border">
            {leaderboard.map((r, i) => (
              <div key={r.name} className={`flex items-center gap-3 px-5 py-3 ${r.isYou ? "bg-primary/5" : "hover:bg-secondary/30 transition-colors"}`}>
                <span className={`w-6 text-center text-[12px] font-bold ${i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarFallback className="text-[10px] bg-secondary">{r.initials}</AvatarFallback>
                </Avatar>
                <span className={`text-[13px] flex-1 ${r.isYou ? "font-semibold text-primary" : "text-foreground"}`}>{r.name}{r.isYou && " (you)"}</span>
                <span className="text-[12px] text-muted-foreground">{r.invited} joined</span>
                <span className="text-[12px] font-medium text-foreground">{r.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Invite;
