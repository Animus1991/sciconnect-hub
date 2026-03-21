import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Flag, AlertCircle, UserMinus, ShieldAlert, MessageSquareX, FileWarning, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";

/* ─── Types ─── */
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetName: string;
  context?: "profile" | "message" | "post" | "comment";
}

const REPORT_REASONS = [
  { id: "fake-credentials", icon: FileWarning, label: "Fake or misleading credentials", desc: "Falsely claiming academic positions, institutions, or qualifications" },
  { id: "misconduct", icon: AlertCircle, label: "Research misconduct", desc: "Data fabrication, plagiarism, or fraudulent research claims" },
  { id: "harassment", icon: ShieldAlert, label: "Harassment or threatening behaviour", desc: "Hostile, discriminatory, or threatening communications" },
  { id: "spam", icon: MessageSquareX, label: "Spam or unsolicited promotion", desc: "Repeated unsolicited commercial messages or self-promotion" },
  { id: "impersonation", icon: UserMinus, label: "Impersonating another researcher", desc: "Pretending to be another real person or researcher" },
  { id: "other", icon: Flag, label: "Other", desc: "Something not covered by the above categories" },
];

/* ─── Component ─── */
export function ReportUserModal({ open, onOpenChange, targetName, context = "profile" }: Props) {
  const [step, setStep] = useState<"reason" | "details" | "confirm">("reason");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [blockToo, setBlockToo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedReasonObj = REPORT_REASONS.find((r) => r.id === selectedReason);

  const reset = () => {
    setStep("reason");
    setSelectedReason(null);
    setDetails("");
    setBlockToo(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      handleClose(false);
      toast.success(
        blockToo
          ? `${targetName} has been reported and blocked. We'll review within 48 hours.`
          : `Report submitted. Our moderation team will review within 48 hours.`
      );
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Flag className="w-4 h-4 text-destructive" />
            </div>
            <DialogTitle className="text-[16px]">
              {step === "reason" && `Report ${targetName}`}
              {step === "details" && "Additional details"}
              {step === "confirm" && "Confirm report"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-[13px]">
            {step === "reason" && "Select the reason that best describes the issue. Reports are confidential."}
            {step === "details" && "Provide any additional context to help our moderation team review this report."}
            {step === "confirm" && "Review your report before submitting."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          {/* ── Step 1: Reason ── */}
          {step === "reason" && (
            <div className="space-y-1.5">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all ${
                    selectedReason === reason.id
                      ? "border-destructive bg-destructive/5 text-destructive"
                      : "border-border hover:bg-secondary/50 text-foreground"
                  }`}
                >
                  <reason.icon className="w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-tight">{reason.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{reason.desc}</p>
                  </div>
                  {selectedReason === reason.id && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: Details ── */}
          {step === "details" && selectedReasonObj && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 p-3 bg-secondary/50 rounded-xl">
                <selectedReasonObj.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-[13px] text-foreground">{selectedReasonObj.label}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-muted-foreground">
                  Additional details <span className="text-muted-foreground/60">(optional but helpful)</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  placeholder="Describe what you observed, including dates, links, or other relevant context…"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <p className="text-[11px] text-muted-foreground">{details.length}/500 characters</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => setBlockToo(!blockToo)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${blockToo ? "bg-destructive border-destructive" : "border-border group-hover:border-muted-foreground"}`}
                >
                  {blockToo && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-foreground">Also block this researcher</p>
                  <p className="text-[11px] text-muted-foreground">You won't see their content, and they won't be able to contact you.</p>
                </div>
              </label>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === "confirm" && selectedReasonObj && (
            <div className="space-y-3">
              <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Reporting</span>
                  <span className="font-medium text-foreground">{targetName}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="font-medium text-foreground">{selectedReasonObj.label}</span>
                </div>
                {details && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Details</span>
                    <span className="font-medium text-foreground max-w-[200px] text-right">{details.slice(0, 60)}{details.length > 60 ? "…" : ""}</span>
                  </div>
                )}
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Also blocking</span>
                  <span className={`font-medium ${blockToo ? "text-destructive" : "text-muted-foreground"}`}>{blockToo ? "Yes" : "No"}</span>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  Reports are reviewed by our moderation team, typically within 48 hours. False reports may affect your account standing.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-2">
          {step === "reason" && (
            <>
              <button onClick={() => handleClose(false)} className="flex-1 h-9 rounded-xl border border-border text-[13px] text-foreground hover:bg-secondary transition-colors">
                Cancel
              </button>
              <button
                onClick={() => setStep("details")}
                disabled={!selectedReason}
                className="flex-1 h-9 rounded-xl bg-destructive text-destructive-foreground text-[13px] font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                Continue <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {step === "details" && (
            <>
              <button onClick={() => setStep("reason")} className="flex-1 h-9 rounded-xl border border-border text-[13px] text-foreground hover:bg-secondary transition-colors">
                Back
              </button>
              <button
                onClick={() => setStep("confirm")}
                className="flex-1 h-9 rounded-xl bg-destructive text-destructive-foreground text-[13px] font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-1.5"
              >
                Review report <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {step === "confirm" && (
            <>
              <button onClick={() => setStep("details")} className="flex-1 h-9 rounded-xl border border-border text-[13px] text-foreground hover:bg-secondary transition-colors">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-9 rounded-xl bg-destructive text-destructive-foreground text-[13px] font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                ) : (
                  <><Flag className="w-3.5 h-3.5" />Submit Report</>
                )}
              </button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
