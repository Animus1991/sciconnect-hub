import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronLeft, Check, User, Building2, FlaskConical,
  BookOpen, Users, Brain, Atom, Globe, Dna, Zap, Microscope,
  BarChart3, Link2, Mail, ExternalLink, GraduationCap, Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/* ─── Data ─── */
const RESEARCH_FIELDS = [
  { icon: Brain, label: "AI & Machine Learning" },
  { icon: Dna, label: "Genomics & CRISPR" },
  { icon: Atom, label: "Quantum Computing" },
  { icon: Globe, label: "Climate Science" },
  { icon: FlaskConical, label: "Drug Discovery" },
  { icon: Microscope, label: "Neuroscience" },
  { icon: BarChart3, label: "Biostatistics" },
  { icon: BookOpen, label: "Computational Biology" },
  { icon: Zap, label: "Materials Science" },
  { icon: Globe, label: "Environmental Science" },
  { icon: Brain, label: "Cognitive Science" },
  { icon: FlaskConical, label: "Organic Chemistry" },
  { icon: Atom, label: "Astrophysics" },
  { icon: Microscope, label: "Cell Biology" },
  { icon: BarChart3, label: "Epidemiology" },
  { icon: Brain, label: "NLP & Linguistics" },
];

const ACADEMIC_POSITIONS = [
  "PhD Student", "Postdoctoral Researcher", "Research Associate",
  "Assistant Professor", "Associate Professor", "Full Professor",
  "Research Scientist (Industry)", "Principal Investigator",
  "Department Head", "Independent Researcher", "Other",
];

const SUGGESTED_RESEARCHERS = [
  { name: "Dr. Sarah Chen", field: "Machine Learning · MIT", initials: "SC", mutual: 4 },
  { name: "Prof. Michael Rodriguez", field: "Quantum Computing · Stanford", initials: "MR", mutual: 2 },
  { name: "Dr. Emily Watson", field: "Computational Biology · DeepMind", initials: "EW", mutual: 6 },
  { name: "Prof. Omar Hassan", field: "Neuroscience · ETH Zürich", initials: "OH", mutual: 1 },
  { name: "Dr. Yuki Tanaka", field: "Quantum Physics · U. Tokyo", initials: "YT", mutual: 3 },
  { name: "Dr. Lisa Park", field: "Computational Biology · Caltech", initials: "LP", mutual: 5 },
];

/* ─── Step Definitions ─── */
const STEPS = [
  { id: "identity", label: "Identity", desc: "Your academic identity" },
  { id: "research", label: "Research", desc: "Fields and specialisations" },
  { id: "connections", label: "Connect", desc: "Find your colleagues" },
  { id: "finish", label: "Ready", desc: "You're all set" },
];

/* ─── Progress Bar ─── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2 flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 transition-all duration-300 ${
            i < current ? "bg-primary text-primary-foreground" :
            i === current ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
            "bg-secondary text-muted-foreground"
          }`}>
            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${i < current ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main ─── */
const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "Dr. Researcher",
    orcid: "",
    institution: "",
    position: "",
    website: "",
    bio: "",
    fields: [] as string[],
    keywords: "",
    followedResearchers: [] as string[],
  });

  const next = () => {
    if (step === 0 && !form.institution.trim()) { toast.error("Please enter your institution."); return; }
    if (step === 1 && form.fields.length === 0) { toast.error("Please select at least one research field."); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const toggleField = (f: string) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.includes(f) ? prev.fields.filter((x) => x !== f) : prev.fields.length < 5 ? [...prev.fields, f] : prev.fields,
    }));
  };

  const toggleFollow = (name: string) => {
    setForm((prev) => ({
      ...prev,
      followedResearchers: prev.followedResearchers.includes(name)
        ? prev.followedResearchers.filter((n) => n !== name)
        : [...prev.followedResearchers, name],
    }));
  };

  const finish = () => {
    toast.success("Welcome to Think!Hub! Your profile is ready.");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Atom className="w-4.5 h-4.5 text-primary" />
          </div>
          <span className="text-[16px] font-semibold text-foreground">Think!Hub</span>
        </div>

        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          {/* ── Step 0: Identity ── */}
          {step === 0 && (
            <motion.div key="identity" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-5">
              <div>
                <h2 className="text-[22px] font-semibold text-foreground">Your academic identity</h2>
                <p className="text-[13px] text-muted-foreground mt-1">Help other researchers find and verify your work.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-muted-foreground">Full name *</label>
                  <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="rounded-xl h-10" placeholder="e.g. Dr. Jane Smith" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-muted-foreground">Institution / Affiliation *</label>
                  <Input value={form.institution} onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))} className="rounded-xl h-10" placeholder="e.g. MIT, ETH Zürich, DeepMind" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-muted-foreground">Academic position</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select position…</option>
                    {ACADEMIC_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                    <span className="font-mono text-[11px] bg-secondary px-1.5 py-0.5 rounded">iD</span>
                    ORCID iD (recommended)
                  </label>
                  <div className="flex gap-2">
                    <Input value={form.orcid} onChange={(e) => setForm((p) => ({ ...p, orcid: e.target.value }))} className="rounded-xl h-10" placeholder="0000-0000-0000-0000" />
                    <button onClick={() => toast.info("ORCID OAuth flow — connect your existing ORCID account")} className="px-3 h-10 rounded-xl border border-border text-[12px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5 flex-shrink-0">
                      <Link2 className="w-3.5 h-3.5" /> Connect
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Linking your ORCID enables automatic publication sync and identity verification.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-muted-foreground">Short bio (optional)</label>
                  <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={3} placeholder="What do you research? What are you excited about?" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Research Fields ── */}
          {step === 1 && (
            <motion.div key="research" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-5">
              <div>
                <h2 className="text-[22px] font-semibold text-foreground">Your research fields</h2>
                <p className="text-[13px] text-muted-foreground mt-1">Select up to 5 primary fields. These personalise your Feed and collaborator suggestions.</p>
              </div>

              {form.fields.length >= 5 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 text-[12px] text-amber-700 dark:text-amber-400">
                  Maximum 5 fields selected. Remove one to add another.
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {RESEARCH_FIELDS.map((f) => {
                  const selected = form.fields.includes(f.label);
                  return (
                    <button
                      key={f.label}
                      onClick={() => toggleField(f.label)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left text-[13px] transition-all duration-150 ${
                        selected ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-card text-foreground hover:bg-secondary/60"
                      }`}
                    >
                      <f.icon className={`w-4 h-4 flex-shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="leading-tight">{f.label}</span>
                      {selected && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {form.fields.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[12px] font-medium text-muted-foreground">Selected: {form.fields.join(", ")}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-muted-foreground">Additional keywords (optional)</label>
                <Input value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} className="rounded-xl h-10" placeholder="e.g. transformer architecture, protein folding, reinforcement learning" />
                <p className="text-[11px] text-muted-foreground">Comma-separated. Used to refine recommendations beyond broad fields.</p>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Connect ── */}
          {step === 2 && (
            <motion.div key="connect" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-5">
              <div>
                <h2 className="text-[22px] font-semibold text-foreground">Find your colleagues</h2>
                <p className="text-[13px] text-muted-foreground mt-1">Follow researchers in your field to personalise your Feed. You can always find more in Discover.</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => toast.info("ORCID import coming soon — sync your co-authors automatically")} className="flex items-center gap-2 px-3.5 h-9 rounded-xl border border-border text-[12px] text-foreground hover:bg-secondary transition-colors">
                  <span className="font-mono text-[11px]">iD</span> Import from ORCID
                </button>
                <button onClick={() => toast.info("BibTeX co-author import coming soon")} className="flex items-center gap-2 px-3.5 h-9 rounded-xl border border-border text-[12px] text-foreground hover:bg-secondary transition-colors">
                  <BookOpen className="w-3.5 h-3.5" /> From BibTeX
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[12px] font-medium text-muted-foreground">Suggested based on your research fields ({form.followedResearchers.length} followed)</p>
                {SUGGESTED_RESEARCHERS.map((r) => {
                  const following = form.followedResearchers.includes(r.name);
                  return (
                    <div key={r.name} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-[12px] font-medium text-foreground flex-shrink-0">
                        {r.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{r.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{r.field}</p>
                        {r.mutual > 0 && <p className="text-[10px] text-muted-foreground/70">{r.mutual} mutual connections</p>}
                      </div>
                      <button
                        onClick={() => toggleFollow(r.name)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex-shrink-0 ${
                          following ? "bg-secondary text-foreground border border-border" : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {following ? (
                          <><Check className="w-3 h-3 inline mr-1" />Following</>
                        ) : "Follow"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Finish ── */}
          {step === 3 && (
            <motion.div key="finish" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-[24px] font-semibold text-foreground">You're ready, {form.name}!</h2>
                <p className="text-[13px] text-muted-foreground mt-2 max-w-sm mx-auto">Your researcher profile is set up. Start exploring your personalised feed, connecting with colleagues, and organising your research.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 text-left space-y-3">
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Your profile summary</p>
                {[
                  { icon: User, label: "Name", value: form.name },
                  { icon: Building2, label: "Institution", value: form.institution || "Not set" },
                  { icon: GraduationCap, label: "Position", value: form.position || "Not set" },
                  { icon: FlaskConical, label: "Research fields", value: form.fields.length > 0 ? form.fields.slice(0, 3).join(", ") + (form.fields.length > 3 ? ` +${form.fields.length - 3}` : "") : "None selected" },
                  { icon: Users, label: "Following", value: `${form.followedResearchers.length} researchers` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-[12px] text-muted-foreground w-24 flex-shrink-0">{item.label}</span>
                    <span className="text-[13px] text-foreground font-medium truncate">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2.5">
                <button onClick={finish} className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-[14px] font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  Go to my Feed <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate("/profile")} className="w-full h-10 rounded-xl border border-border text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  Complete my profile first
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < STEPS.length - 1 && (
          <div className="flex items-center justify-between mt-8">
            <button onClick={back} disabled={step === 0} className="flex items-center gap-1.5 px-4 h-9 rounded-xl border border-border text-[13px] text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-1.5">
              {STEPS.slice(0, -1).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? "bg-primary w-3" : i < step ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>
            <button onClick={next} className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors">
              {step === STEPS.length - 2 ? "Finish" : "Continue"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Skip */}
        {step < STEPS.length - 1 && (
          <div className="text-center mt-4">
            <button onClick={() => navigate("/")} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
              Skip for now — complete later in Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
