import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, X, Sparkles, BookOpen, FileText, Lightbulb, Loader2
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import type { Message } from "./types";
import { getContactName } from "./mockData";

interface AICopilotResponse {
  id: string;
  command: string;
  content: string;
  timestamp: number;
}

/* ─── Mock AI responses ─── */
function generateMockResponse(command: string, messages: Message[]): string {
  const visibleMsgs = messages.filter(m => !m.deleted);

  if (command === "summarize") {
    const topics = visibleMsgs.slice(-6).map(m => m.text.slice(0, 50));
    return `**📋 Conversation Summary** (${visibleMsgs.length} messages)\n\n` +
      `**Key Topics:**\n` +
      topics.map((t, i) => `${i + 1}. ${t}…`).join("\n") +
      `\n\n**Action Items:**\n- Review experiment parameters\n- Draft methodology section by Friday\n- Prepare reproducibility update\n\n` +
      `**Evidence Tagged:** ${visibleMsgs.filter(m => m.evidenceTag).length} items\n` +
      `**Blockchain Verified:** ${visibleMsgs.filter(m => m.blockchainHash).length} messages`;
  }

  if (command === "cite") {
    return `**📚 Relevant Citations Found:**\n\n` +
      `1. **Smith et al. (2024)** — "Reproducibility in ML: A Systematic Review" — *Nature Machine Intelligence*, 6(2), 112-128. DOI: 10.1038/s42256-024-00812-2\n\n` +
      `2. **Chen & Williams (2023)** — "Containerized Experiment Pipelines for Research" — *ICML 2023 Workshop on Reproducibility*\n\n` +
      `3. **Tanaka et al. (2024)** — "DVC-based Version Control for Scientific Datasets" — *IEEE TDSC*, 21(4), 445-460\n\n` +
      `_Based on conversation context: reproducibility, containerization, seed logging, DVC pipelines_`;
  }

  if (command === "action") {
    return `**✅ Action Items Extracted:**\n\n` +
      `| Priority | Task | Assignee | Deadline |\n` +
      `|----------|------|----------|----------|\n` +
      `| 🔴 High | Draft methodology section | You | Friday |\n` +
      `| 🟡 Med | Prepare abstract for workshop | Dr. Sarah Chen | Next week |\n` +
      `| 🟢 Low | Add DVC pipeline diagram | You | TBD |\n` +
      `| 🟡 Med | Review experiment config | You | Tonight |`;
  }

  if (command === "ideas") {
    return `**💡 Research Ideas from this Conversation:**\n\n` +
      `1. **Automated Reproducibility Score** — Create a metric that quantifies experiment reproducibility based on containerization level, seed logging, and parameter documentation\n\n` +
      `2. **Cross-lab Validation Pipeline** — Extend the Docker setup to allow other labs to run your exact experiments with one command\n\n` +
      `3. **Incremental Verification** — Use blockchain hashing not just for chat, but for intermediate experiment results to create a full audit trail`;
  }

  return `I understood your request: "${command}". Here's what I found based on the conversation context with ${visibleMsgs.length} messages.`;
}

/* ─── AI Copilot Banner (shown when @AI is detected) ─── */
interface AICopilotPanelProps {
  messages: Message[];
  onClose: () => void;
  onInsertResponse: (text: string) => void;
}

const AICopilotPanel = ({ messages, onClose, onInsertResponse }: AICopilotPanelProps) => {
  const [responses, setResponses] = useState<AICopilotResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  const commands = [
    { id: "summarize", label: "Summarize", icon: FileText, description: "Summarize conversation" },
    { id: "cite", label: "Find Citations", icon: BookOpen, description: "Find relevant papers" },
    { id: "action", label: "Action Items", icon: Sparkles, description: "Extract action items" },
    { id: "ideas", label: "Research Ideas", icon: Lightbulb, description: "Generate research ideas" },
  ];

  const runCommand = (cmd: string) => {
    setLoading(true);
    setActiveCommand(cmd);
    setTimeout(() => {
      const content = generateMockResponse(cmd, messages);
      setResponses(prev => [{
        id: `ai_${Date.now()}`,
        command: cmd,
        content,
        timestamp: Date.now(),
      }, ...prev]);
      setLoading(false);
      setActiveCommand(null);
    }, 1500 + Math.random() * 1000);
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-b border-border"
    >
      <div className="bg-accent/3 border-b border-accent/10">
        {/* Header */}
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-[13px] font-display font-semibold text-foreground">AI Co-pilot</span>
            <span className="text-[10px] text-muted-foreground font-display">Analyze this conversation</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Command buttons */}
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-thin">
          {commands.map(cmd => (
            <button
              key={cmd.id}
              onClick={() => runCommand(cmd.id)}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-display font-medium transition-all border whitespace-nowrap ${
                activeCommand === cmd.id
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card border-border hover:bg-secondary/50 text-foreground"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {activeCommand === cmd.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <cmd.icon className="w-3 h-3" />
              )}
              {cmd.label}
            </button>
          ))}
        </div>

        {/* Responses */}
        {responses.length > 0 && (
          <div className="max-h-[280px] overflow-y-auto scrollbar-thin">
            {responses.map(r => (
              <div key={r.id} className="px-4 py-3 border-t border-border/30">
                <div className="flex items-start gap-2">
                  <Avatar className="w-6 h-6 ring-1 ring-accent/30 flex-shrink-0 mt-0.5">
                    <AvatarFallback className="bg-accent/10 text-accent text-[8px] font-bold">AI</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-display font-semibold text-accent">@AI {r.command}</span>
                      <span className="text-[9px] text-muted-foreground tabular-nums">
                        {new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="text-[12px] font-display text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {r.content}
                    </div>
                    <button
                      onClick={() => onInsertResponse(r.content)}
                      className="mt-2 text-[10px] font-display font-medium text-accent hover:underline"
                    >
                      Insert into chat →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && responses.length === 0 && (
          <div className="px-4 py-4 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
            <span className="text-xs text-muted-foreground font-display">Analyzing conversation…</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AICopilotPanel;

/* ─── Helper to detect @AI commands in input ─── */
export function detectAICommand(text: string): string | null {
  const match = text.match(/^@AI\s+(\w+)/i);
  if (!match) return null;
  const cmd = match[1].toLowerCase();
  if (["summarize", "cite", "action", "ideas", "help"].includes(cmd)) return cmd;
  return null;
}
