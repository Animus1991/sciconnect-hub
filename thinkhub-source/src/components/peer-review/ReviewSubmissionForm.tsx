import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { X, Send, Star, AlertCircle, Plus, Trash2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlockchainNotifications } from "@/hooks/use-blockchain-notifications";

const reviewSchema = z.object({
  manuscriptTitle: z.string().trim().min(5, "Title must be at least 5 characters").max(300, "Title must be under 300 characters"),
  journal: z.string().trim().min(2, "Journal name is required").max(200),
  field: z.string().trim().min(2, "Field is required").max(100),
  summary: z.string().trim().min(20, "Summary must be at least 20 characters").max(3000, "Summary must be under 3000 characters"),
  majorComments: z.array(z.string().trim().min(10, "Each comment must be at least 10 characters").max(1000)),
  minorComments: z.array(z.string().trim().min(5, "Each comment must be at least 5 characters").max(500)),
  recommendation: z.enum(["accept", "minor_revisions", "major_revisions", "reject"]),
  qualityScore: z.number().min(1).max(5),
  confidentialComments: z.string().max(2000).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewSubmissionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => void;
}

const recOptions = [
  { value: "accept", label: "Accept", color: "text-success" },
  { value: "minor_revisions", label: "Minor Revisions", color: "text-warning" },
  { value: "major_revisions", label: "Major Revisions", color: "text-orange-500" },
  { value: "reject", label: "Reject", color: "text-destructive" },
] as const;

export default function ReviewSubmissionForm({ open, onClose, onSubmit }: ReviewSubmissionFormProps) {
  const [form, setForm] = useState<ReviewFormData>({
    manuscriptTitle: "",
    journal: "",
    field: "",
    summary: "",
    majorComments: [""],
    minorComments: [""],
    recommendation: "minor_revisions",
    qualityScore: 3,
    confidentialComments: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0); // 0: meta, 1: review, 2: recommendation

  const updateField = useCallback(<K extends keyof ReviewFormData>(key: K, value: ReviewFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  }, []);

  const addComment = useCallback((type: "majorComments" | "minorComments") => {
    setForm(prev => ({ ...prev, [type]: [...prev[type], ""] }));
  }, []);

  const removeComment = useCallback((type: "majorComments" | "minorComments", index: number) => {
    setForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  }, []);

  const updateComment = useCallback((type: "majorComments" | "minorComments", index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      [type]: prev[type].map((c, i) => (i === index ? value : c)),
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    const result = reviewSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      // Jump to first step with error
      if (fieldErrors.manuscriptTitle || fieldErrors.journal || fieldErrors.field) setStep(0);
      else if (fieldErrors.summary || Object.keys(fieldErrors).some(k => k.startsWith("major") || k.startsWith("minor"))) setStep(1);
      else setStep(2);
      return;
    }
    onSubmit(result.data);
    onClose();
  }, [form, onSubmit, onClose]);

  if (!open) return null;

  const steps = ["Manuscript Info", "Review Content", "Recommendation"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">Submit Blind Review</h2>
              <p className="text-xs text-muted-foreground font-display mt-0.5">
                Your identity will be cryptographically sealed until you choose to reveal it
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 px-6 py-3 border-b border-border">
            {steps.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`flex items-center gap-1.5 text-xs font-display px-3 py-1.5 rounded-full transition-colors ${
                  step === i ? "bg-accent/10 text-accent font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === i ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                }`}>{i + 1}</span>
                {s}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {step === 0 && (
              <div className="space-y-4">
                <FieldGroup label="Manuscript Title" error={errors.manuscriptTitle}>
                  <input
                    value={form.manuscriptTitle}
                    onChange={e => updateField("manuscriptTitle", e.target.value)}
                    placeholder="Full title of the manuscript being reviewed"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
                    maxLength={300}
                  />
                </FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Journal" error={errors.journal}>
                    <input
                      value={form.journal}
                      onChange={e => updateField("journal", e.target.value)}
                      placeholder="e.g. Nature Methods"
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
                      maxLength={200}
                    />
                  </FieldGroup>
                  <FieldGroup label="Field" error={errors.field}>
                    <input
                      value={form.field}
                      onChange={e => updateField("field", e.target.value)}
                      placeholder="e.g. Machine Learning"
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
                      maxLength={100}
                    />
                  </FieldGroup>
                </div>
                <div className="bg-accent/5 rounded-lg border border-accent/20 p-3 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] font-display text-muted-foreground leading-relaxed">
                    Your identity will be sealed with a SHA-256 hash. Only you can reveal it after the editorial decision is published.
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <FieldGroup label="Summary" error={errors.summary} hint={`${form.summary.length}/3000`}>
                  <textarea
                    value={form.summary}
                    onChange={e => updateField("summary", e.target.value)}
                    placeholder="Provide a concise summary of the manuscript's key contributions, strengths, and overall assessment..."
                    rows={4}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                    maxLength={3000}
                  />
                </FieldGroup>

                <FieldGroup label="Major Comments" error={Object.keys(errors).find(k => k.startsWith("majorComments")) ? "Each major comment must be at least 10 characters" : undefined}>
                  <div className="space-y-2">
                    {form.majorComments.map((comment, i) => (
                      <div key={i} className="flex gap-2">
                        <textarea
                          value={comment}
                          onChange={e => updateComment("majorComments", i, e.target.value)}
                          placeholder={`Major comment ${i + 1} — significant issues requiring author response...`}
                          rows={2}
                          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                          maxLength={1000}
                        />
                        {form.majorComments.length > 1 && (
                          <button onClick={() => removeComment("majorComments", i)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors self-start">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addComment("majorComments")} className="flex items-center gap-1 text-xs font-display text-accent hover:text-accent/80 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add major comment
                    </button>
                  </div>
                </FieldGroup>

                <FieldGroup label="Minor Comments" error={Object.keys(errors).find(k => k.startsWith("minorComments")) ? "Each minor comment must be at least 5 characters" : undefined}>
                  <div className="space-y-2">
                    {form.minorComments.map((comment, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={comment}
                          onChange={e => updateComment("minorComments", i, e.target.value)}
                          placeholder={`Minor comment ${i + 1} — typos, formatting, suggestions...`}
                          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
                          maxLength={500}
                        />
                        {form.minorComments.length > 1 && (
                          <button onClick={() => removeComment("minorComments", i)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addComment("minorComments")} className="flex items-center gap-1 text-xs font-display text-accent hover:text-accent/80 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add minor comment
                    </button>
                  </div>
                </FieldGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <FieldGroup label="Recommendation">
                  <div className="grid grid-cols-2 gap-2">
                    {recOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateField("recommendation", opt.value)}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-display font-medium transition-all ${
                          form.recommendation === opt.value
                            ? "border-accent bg-accent/5 text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-accent/30"
                        }`}
                      >
                        <span className={form.recommendation === opt.value ? opt.color : ""}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Quality Score">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        onClick={() => updateField("qualityScore", s)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star className={`w-6 h-6 ${s <= form.qualityScore ? "text-gold fill-gold" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                    <span className="text-xs text-muted-foreground font-display ml-2">{form.qualityScore}/5</span>
                  </div>
                </FieldGroup>

                <FieldGroup label="Confidential Comments to Editor (Optional)" hint="Not visible to authors">
                  <textarea
                    value={form.confidentialComments}
                    onChange={e => updateField("confidentialComments", e.target.value)}
                    placeholder="Private notes for the editor only..."
                    rows={3}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                    maxLength={2000}
                  />
                </FieldGroup>

                {/* Preview */}
                <div className="bg-secondary/50 rounded-xl border border-border p-4">
                  <h4 className="text-xs font-display font-semibold text-foreground mb-2">Review Summary</h4>
                  <div className="space-y-1.5 text-[11px] font-display text-muted-foreground">
                    <p><strong className="text-foreground">Manuscript:</strong> {form.manuscriptTitle || "—"}</p>
                    <p><strong className="text-foreground">Journal:</strong> {form.journal || "—"} · {form.field || "—"}</p>
                    <p><strong className="text-foreground">Recommendation:</strong> <span className={recOptions.find(r => r.value === form.recommendation)?.color}>{recOptions.find(r => r.value === form.recommendation)?.label}</span></p>
                    <p><strong className="text-foreground">Major comments:</strong> {form.majorComments.filter(c => c.trim()).length} · <strong className="text-foreground">Minor:</strong> {form.minorComments.filter(c => c.trim()).length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} className="font-display">
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose} className="font-display">Cancel</Button>
              {step < 2 ? (
                <Button size="sm" onClick={() => setStep(step + 1)} className="font-display">
                  Continue
                </Button>
              ) : (
                <Button size="sm" onClick={handleSubmit} className="font-display gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Submit Review
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FieldGroup({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-display font-semibold text-foreground">{label}</label>
        {hint && <span className="text-[10px] font-display text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive font-display mt-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
