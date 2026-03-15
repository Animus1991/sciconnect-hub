import { useEffect, useCallback, useState, createContext, useContext, ReactNode } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  category?: string;
}

interface ShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string, modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }) => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

const ShortcutsContext = createContext<ShortcutsContextType | null>(null);

export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      const filtered = prev.filter(
        s => !(s.key === shortcut.key && s.ctrl === shortcut.ctrl && s.shift === shortcut.shift && s.alt === shortcut.alt)
      );
      return [...filtered, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback(
    (key: string, modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }) => {
      setShortcuts(prev =>
        prev.filter(
          s => !(s.key === key && s.ctrl === modifiers?.ctrl && s.shift === modifiers?.shift && s.alt === modifiers?.alt)
        )
      );
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        if (e.key !== "Escape") return;
      }

      // ? key shows help
      if (e.key === "?" && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey);
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (e.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  return (
    <ShortcutsContext.Provider value={{ shortcuts, registerShortcut, unregisterShortcut, showHelp, setShowHelp }}>
      {children}
    </ShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const ctx = useContext(ShortcutsContext);
  if (!ctx) throw new Error("useKeyboardShortcuts must be used within ShortcutsProvider");
  return ctx;
}
