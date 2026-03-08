import React, { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLocation } from "react-router-dom";
import type { AIProvider, AIProviderType, ChatWindow, LayoutMode } from "./types";
import { listProviders, checkSession } from "@/lib/api/aiChat";
import AIChatWindow from "./AIChatWindow";
import AIChatProviderSelect from "./AIChatProviderSelect";
import AIChatAuthDialog from "./AIChatAuthDialog";

const LAYOUT_STORAGE_KEY = "thinkhub-ai-layout";
const CASCADE_OFFSET = 30;
const DEFAULT_W = 380;
const DEFAULT_H = 480;

function loadLayout(): Record<string, { x: number; y: number; w: number; h: number }> {
  try {
    return JSON.parse(localStorage.getItem(LAYOUT_STORAGE_KEY) || "{}");
  } catch { return {}; }
}

function saveLayout(windows: Map<string, ChatWindow>) {
  const data: Record<string, any> = {};
  windows.forEach((w, id) => {
    data[id] = { x: w.position.x, y: w.position.y, w: w.size.w, h: w.size.h };
  });
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(data));
}

const AIChatManager: React.FC = () => {
  const location = useLocation();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [windows, setWindows] = useState<Map<string, ChatWindow>>(new Map());
  const [layoutMode] = useState<LayoutMode>("floating");
  const [nextZ, setNextZ] = useState(100);
  const [authProvider, setAuthProvider] = useState<AIProvider | null>(null);
  const initDone = useRef(false);
  const isLoginPage = location.pathname === "/login";

  // Load providers on mount
  useEffect(() => {
    if (!isLoginPage) listProviders().then(setProviders);
  }, [isLoginPage]);

  // Auto-connect pipeline
  useEffect(() => {
    if (initDone.current || providers.length === 0) return;
    initDone.current = true;

    const autoConnect = async () => {
      const saved = loadLayout();
      for (const p of providers) {
        if (p.autoConnect) {
          const valid = await checkSession(p.id);
          if (valid) {
            openWindow(p.id, saved[p.id]);
          }
        }
      }
    };
    autoConnect();
  }, [providers]);

  const openWindow = useCallback((providerId: AIProviderType, savedLayout?: { x: number; y: number; w: number; h: number }) => {
    setWindows(prev => {
      if (prev.has(providerId)) {
        // Just restore if minimized
        const existing = prev.get(providerId)!;
        if (existing.minimized) {
          const updated = new Map(prev);
          updated.set(providerId, { ...existing, minimized: false });
          return updated;
        }
        return prev;
      }

      const provider = providers.find(p => p.id === providerId);
      if (!provider) return prev;

      const idx = prev.size;
      const x = savedLayout?.x ?? 80 + idx * CASCADE_OFFSET;
      const y = savedLayout?.y ?? 80 + idx * CASCADE_OFFSET;
      const w = savedLayout?.w ?? DEFAULT_W;
      const h = savedLayout?.h ?? DEFAULT_H;

      const win: ChatWindow = {
        id: providerId,
        providerId,
        providerName: provider.name,
        messages: [{
          id: `welcome_${Date.now()}`,
          role: "assistant",
          content: `👋 Connected to **${provider.name}** (${provider.model}).\n\nI can help with research analysis, writing, citations & more.\nType \`/help\` for commands.`,
          timestamp: Date.now(),
          provider: providerId,
          model: provider.model,
        }],
        position: { x, y },
        size: { w, h },
        zIndex: nextZ + idx,
        minimized: false,
        createdAt: Date.now(),
      };

      const updated = new Map(prev);
      updated.set(providerId, win);
      saveLayout(updated);
      return updated;
    });
    setNextZ(z => z + 1);
  }, [providers, nextZ]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      saveLayout(updated);
      return updated;
    });
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setWindows(prev => {
      const updated = new Map(prev);
      const w = updated.get(id);
      if (w) updated.set(id, { ...w, minimized: !w.minimized });
      saveLayout(updated);
      return updated;
    });
  }, []);

  const focusWindow = useCallback((id: string) => {
    setNextZ(z => {
      setWindows(prev => {
        const updated = new Map(prev);
        const w = updated.get(id);
        if (w) updated.set(id, { ...w, zIndex: z + 1 });
        return updated;
      });
      return z + 1;
    });
  }, []);

  const updatePosition = useCallback((id: string, pos: { x: number; y: number }) => {
    setWindows(prev => {
      const updated = new Map(prev);
      const w = updated.get(id);
      if (w) updated.set(id, { ...w, position: pos });
      saveLayout(updated);
      return updated;
    });
  }, []);

  const updateSize = useCallback((id: string, size: { w: number; h: number }) => {
    setWindows(prev => {
      const updated = new Map(prev);
      const w = updated.get(id);
      if (w) updated.set(id, { ...w, size });
      saveLayout(updated);
      return updated;
    });
  }, []);

  const updateMessages = useCallback((id: string, msgs: any[]) => {
    setWindows(prev => {
      const updated = new Map(prev);
      const w = updated.get(id);
      if (w) updated.set(id, { ...w, messages: msgs });
      return updated;
    });
  }, []);

  const handleProviderSelect = useCallback((id: AIProviderType) => {
    if (windows.has(id)) {
      const w = windows.get(id)!;
      if (w.minimized) toggleMinimize(id);
      else focusWindow(id);
    } else {
      openWindow(id);
    }
  }, [windows, toggleMinimize, focusWindow, openWindow]);

  const handleAuthSuccess = useCallback((id: AIProviderType) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, status: "connected" } : p));
    openWindow(id);
  }, [openWindow]);

  const windowArray = Array.from(windows.values());
  const openIds = windowArray.map(w => w.providerId);
  const minimizedWindows = windowArray.filter(w => w.minimized);
  const activeWindows = windowArray.filter(w => !w.minimized);

  return (
    <TooltipProvider>
      {/* Active windows */}
      <AnimatePresence>
        {activeWindows.map(win => {
          const provider = providers.find(p => p.id === win.providerId);
          return (
            <AIChatWindow
              key={win.id}
              window={win}
              providerIcon={provider?.icon ?? "?"}
              providerName={provider?.name ?? "AI"}
              isConnected={provider?.status === "connected"}
              layoutMode={layoutMode}
              onClose={closeWindow}
              onMinimize={toggleMinimize}
              onFocus={focusWindow}
              onPositionChange={updatePosition}
              onSizeChange={updateSize}
              onMessagesUpdate={updateMessages}
            />
          );
        })}
      </AnimatePresence>

      {/* Bottom-left control area */}
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-2">
        {/* Minimized pills */}
        <AnimatePresence>
          {minimizedWindows.map(win => {
            const provider = providers.find(p => p.id === win.providerId);
            return (
              <AIChatWindow
                key={`min_${win.id}`}
                window={win}
                providerIcon={provider?.icon ?? "?"}
                providerName={provider?.name ?? "AI"}
                isConnected={provider?.status === "connected"}
                layoutMode={layoutMode}
                onClose={closeWindow}
                onMinimize={toggleMinimize}
                onFocus={focusWindow}
                onPositionChange={updatePosition}
                onSizeChange={updateSize}
                onMessagesUpdate={updateMessages}
              />
            );
          })}
        </AnimatePresence>

        {/* Provider selector FAB */}
        <AIChatProviderSelect
          providers={providers}
          openWindowIds={openIds}
          onSelect={handleProviderSelect}
          onConnect={p => setAuthProvider(p)}
        />
      </div>

      {/* Auth dialog */}
      {authProvider && (
        <AIChatAuthDialog
          provider={authProvider}
          open={!!authProvider}
          onClose={() => setAuthProvider(null)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </TooltipProvider>
  );
};

export default AIChatManager;
