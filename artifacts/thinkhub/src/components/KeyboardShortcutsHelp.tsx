import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Keyboard, X } from "lucide-react";
import { useEffect } from "react";

export function KeyboardShortcutsHelp() {
  const { shortcuts, showHelp, setShowHelp } = useKeyboardShortcuts();

  useEffect(() => {
    if (!showHelp) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowHelp(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showHelp, setShowHelp]);

  if (!showHelp) return null;

  const grouped = shortcuts.reduce<Record<string, typeof shortcuts>>((acc, s) => {
    const cat = s.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const formatKey = (s: typeof shortcuts[0]) => {
    const parts: string[] = [];
    if (s.ctrl) parts.push("Ctrl");
    if (s.shift) parts.push("Shift");
    if (s.alt) parts.push("Alt");
    parts.push(s.key.length === 1 ? s.key.toUpperCase() : s.key);
    return parts.join(" + ");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg max-h-[70vh] overflow-y-auto scrollbar-thin"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-accent" />
            <h2 className="font-display font-semibold text-foreground">Keyboard Shortcuts</h2>
          </div>
          <button onClick={() => setShowHelp(false)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Built-in hint */}
          <div className="text-[12px] text-muted-foreground font-display">
            Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[11px]">?</kbd> to toggle this panel
          </div>

          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground font-display font-medium mb-2">{category}</h3>
              <div className="space-y-1">
                {items.map(s => (
                  <div key={formatKey(s)} className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-secondary/50 transition-colors">
                    <span className="text-[14px] font-display text-foreground">{s.description}</span>
                    <kbd className="px-2 py-0.5 rounded-lg bg-secondary text-[11px] font-mono text-muted-foreground">{formatKey(s)}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
