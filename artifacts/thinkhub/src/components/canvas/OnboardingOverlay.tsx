import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Plus, ArrowRightLeft, Sparkles, LayoutList, X, ChevronRight, ChevronLeft,
  BookOpen, Lightbulb, HelpCircle, FlaskConical, GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { markOnboardingDone } from "@/data/canvasData";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: string;
  accent: string;
  bgAccent: string;
}

const STEPS: Step[] = [
  {
    icon: <Layers className="w-8 h-8" />,
    title: "Welcome to Research Canvas",
    description: "Your intelligent visual thinking workspace for research.",
    detail: "Research Canvas is a spatial thinking environment where you can map ideas, evidence, arguments, and connections — then analyze them with AI and view them in multiple formats.",
    accent: "text-primary",
    bgAccent: "bg-primary/10",
  },
  {
    icon: <Plus className="w-8 h-8" />,
    title: "Create Research Objects",
    description: "11 node types for every research artifact.",
    detail: "Use the + Add menu to create Notes, Insights, Questions, Hypotheses, Citations, Evidence, Tasks, Documents, and more. Each type has distinct visual styling and purpose. Double-click any node to edit it inline or open it in full view.",
    accent: "text-amber-400",
    bgAccent: "bg-amber-400/10",
  },
  {
    icon: <ArrowRightLeft className="w-8 h-8" />,
    title: "Draw Connections",
    description: "Link nodes with typed, color-coded relationships.",
    detail: "Hover any node and click the ↔ button to enter Connect mode. Then click a target node to create a link. Choose from 7 relationship types: supports (green), contradicts (red), related, derived, compare, questions, or custom. Connections are visible in the canvas and in the node's Properties panel.",
    accent: "text-emerald-400",
    bgAccent: "bg-emerald-400/10",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "AI Research Intelligence",
    description: "Extract nodes from text, suggest connections, synthesize clusters.",
    detail: "Click the AI button in the toolbar to open the AI panel. Paste any research text and let AI extract structured concept, evidence, question, and hypothesis nodes. Select multiple nodes and ask AI to suggest meaningful connections between them. Select a cluster of nodes and synthesize them into a summary insight.",
    accent: "text-purple-400",
    bgAccent: "bg-purple-400/10",
  },
  {
    icon: <LayoutList className="w-8 h-8" />,
    title: "Multiple View Modes",
    description: "See your research from different cognitive angles.",
    detail: "Switch between Canvas (spatial thinking), Outline (hierarchical list grouped by node type), and Evidence Map (claims vs. supporting and contradicting evidence) using the View menu in the toolbar. The same knowledge base is re-rendered in each mode — useful for different cognitive tasks.",
    accent: "text-blue-400",
    bgAccent: "bg-blue-400/10",
  },
];

interface OnboardingOverlayProps {
  onDone: () => void;
}

export default function OnboardingOverlay({ onDone }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const current = STEPS[step];

  const finish = () => {
    setExiting(true);
    setTimeout(() => {
      markOnboardingDone();
      onDone();
    }, 300);
  };

  const next = () => {
    if (step === STEPS.length - 1) { finish(); return; }
    setStep(s => s + 1);
  };

  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, type: "spring", damping: 20 }}
            className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
          >
            {/* Skip */}
            <button
              onClick={finish}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors z-10"
              title="Skip tour"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top accent strip */}
            <div className={cn("h-1 w-full", step === 0 ? "bg-primary" : step === 1 ? "bg-amber-400" : step === 2 ? "bg-emerald-400" : step === 3 ? "bg-purple-400" : "bg-blue-400")} />

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="p-7"
              >
                {/* Icon */}
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-5", current.bgAccent, current.accent)}>
                  {current.icon}
                </div>

                {/* Step label */}
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Step {step + 1} of {STEPS.length}
                </p>

                <h2 className="text-lg font-semibold text-foreground mb-1.5 leading-snug">{current.title}</h2>
                <p className={cn("text-sm font-medium mb-3", current.accent)}>{current.description}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{current.detail}</p>

                {/* Node type showcase on step 1 */}
                {step === 1 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      { icon: <BookOpen className="w-3 h-3" />, label: "Citation", color: "text-slate-400" },
                      { icon: <HelpCircle className="w-3 h-3" />, label: "Question", color: "text-purple-400" },
                      { icon: <FlaskConical className="w-3 h-3" />, label: "Hypothesis", color: "text-blue-400" },
                      { icon: <GitBranch className="w-3 h-3" />, label: "Evidence", color: "text-teal-400" },
                      { icon: <Lightbulb className="w-3 h-3" />, label: "Insight", color: "text-emerald-400" },
                    ].map(({ icon, label, color }) => (
                      <span key={label} className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-[11px] font-medium", color)}>
                        {icon} {label}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="flex items-center justify-between px-7 pb-5">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={cn(
                      "rounded-full transition-all duration-200",
                      i === step ? "w-4 h-2 bg-primary" : "w-2 h-2 bg-border hover:bg-muted-foreground/40"
                    )}
                  />
                ))}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={back}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-[12px] font-medium transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                <button
                  onClick={next}
                  className={cn(
                    "flex items-center gap-1.5 h-8 px-4 rounded-lg text-[12px] font-medium transition-colors",
                    step === STEPS.length - 1
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  {step === STEPS.length - 1 ? "Start exploring" : "Next"}
                  {step < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
