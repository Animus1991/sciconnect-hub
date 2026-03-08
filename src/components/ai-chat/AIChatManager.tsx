import React, { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLocation } from "react-router-dom";
import { LayoutGrid, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AIProvider, AIProviderType, ChatWindow, LayoutMode } from "./types";
import { listProviders, checkSession } from "@/lib/api/aiChat";
import AIChatWindow from "./AIChatWindow";
import AIChatProviderSelect from "./AIChatProviderSelect";
import AIChatAuthDialog from "./AIChatAuthDialog";

const LAYOUT_STORAGE_KEY = "thinkhub-ai-layout";
const LAYOUT_MODE_KEY = "thinkhub-ai-layout-mode";
const CASCADE_OFFSET = 30;
const DEFAULT_W = 380;
const DEFAULT_H = 480;
const STICKY_GAP = 12;
const STICKY_BOTTOM = 70; // above FAB
const STICKY_RIGHT = 24;

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

function loadLayoutMode(): LayoutMode {
  return (localStorage.getItem(LAYOUT_MODE_KEY) as LayoutMode) || "floating";
}

function saveLayoutMode(mode: LayoutMode) {
  localStorage.setItem(LAYOUT_MODE_KEY, mode);
}

/**
 * Compute sticky positions: windows dock bottom-right, arranged leftward.
 */
function computeStickyPositions(
  windowArray: ChatWindow[]
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let rightOffset = STICKY_RIGHT;

  const active = windowArray.filter(w => !w.minimized);
  // Reverse so first opened is rightmost
  for (const win of [...active].reverse()) {
    const x = vw - rightOffset - win.size.w;
    const y = vh - STICKY_BOTTOM - win.size.h;
    positions[win.id] = { x: Math.max(0, x), y: Math.max(0, y) };
    rightOffset += win.size.w + STICKY_GAP;
  }
  return positions;
}

const AIChatManager: React.FC = () => {
  const location = useLocation();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [windows, setWindows] = useState<Map<string, ChatWindow>>(new Map());
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(loadLayoutMode);
  const [nextZ, setNextZ] = useState(100);
  const [authProvider, setAuthProvider] = useState<AIProvider | null>(null);
  const initDone = useRef(false);
  const isLoginPage = location.pathname === "/login";

  // Load providers
  useEffect(() => {
    if (!isLoginPage) listProviders().then(setProviders);
  }, [isLoginPage]);

  // Auto-connect
  useEffect(() => {
    if (initDone.current || providers.length === 0 || isLoginPage) return;
    initDone.current = true;
    const autoConnect = async () => {
      const saved = loadLayout();
      for (const p of providers) {
        if (p.autoConnect) {
          const valid = await checkSession(p.id);
          if (valid) openWindow(p.id, saved[p.id]);
        }
      }
    };
    autoConnect();
  }, [providers]);

  // Recompute sticky positions when layout mode changes or windows change
  useEffect(() => {
    if (layoutMode !== "sticky") return;
    setWindows(prev => {
      const arr = Array.from(prev.values());
      const positions = computeStickyPositions(arr);
      const updated = new Map(prev);
      for (const [id, pos] of Object.entries(positions)) {
        const w = updated.get(id);
        if (w && !w.minimized) updated.set(id, { ...w, position: pos });
      }
      return updated;
    });
  }, [layoutMode]);

  const toggleLayoutMode = useCallback(() => {
    setLayoutMode(prev => {
      const next = prev === "floating" ? "sticky" : "floating";
      saveLayoutMode(next);

      if (next === "sticky") {
        // Recompute all positions
        setWindows(prevWins => {
          const arr = Array.from(prevWins.values());
          const positions = computeStickyPositions(arr);
          const updated = new Map(prevWins);
          for (const [id, pos] of Object.entries(positions)) {
            const w = updated.get(id);
            if (w) updated.set(id, { ...w, position: pos });
          }
          saveLayout(updated);
          return updated;
        });
      }
      return next;
    });
  }, []);

  const openWindow = useCallback((providerId: AIProviderType, savedLayout?: { x: number; y: number; w: number; h: number }) => {
    setWindows(prev => {
      if (prev.has(providerId)) {
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
      const w = savedLayout?.w ?? DEFAULT_W;
      const h = savedLayout?.h ?? DEFAULT_H;
      let x = savedLayout?.x ?? 80 + idx * CASCADE_OFFSET;
      let y = savedLayout?.y ?? 80 + idx * CASCADE_OFFSET;

      // If sticky, compute proper position
      if (layoutMode === "sticky") {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let rightOffset = STICKY_RIGHT;
        const existing = Array.from(prev.values()).filter(ww => !ww.minimized);
        for (const ew of existing) {
          rightOffset += ew.size.w + STICKY_GAP;
        }
        x = Math.max(0, vw - rightOffset - w);
        y = Math.max(0, vh - STICKY_BOTTOM - h);
      }

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
  }, [providers, nextZ, layoutMode]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      saveLayout(updated);

      // Recompute sticky if needed
      if (layoutMode === "sticky") {
        const arr = Array.from(updated.values());
        const positions = computeStickyPositions(arr);
        for (const [wid, pos] of Object.entries(positions)) {
          const w = updated.get(wid);
          if (w && !w.minimized) updated.set(wid, { ...w, position: pos });
        }
      }
      return updated;
    });
  }, [layoutMode]);

  const toggleMinimize = useCallback((id: string) => {
    setWindows(prev => {
      const updated = new Map(prev);
      const w = updated.get(id);
      if (w) updated.set(id, { ...w, minimized: !w.minimized });

      // Recompute sticky
      if (layoutMode === "sticky") {
        const arr = Array.from(updated.values());
        const positions = computeStickyPositions(arr);
        for (const [wid, pos] of Object.entries(positions)) {
          const ww = updated.get(wid);
          if (ww && !ww.minimized) updated.set(wid, { ...ww, position: pos });
        }
      }
      saveLayout(updated);
      return updated;
    });
  }, [layoutMode]);

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
    if (layoutMode === "sticky") return; // No manual dragging in sticky
    setWindows(prev => {
      const updated = new Map(prev);
      const w = updated.get(id);
      if (w) updated.set(id, { ...w, position: pos });
      saveLayout(updated);
      return updated;
    });
  }, [layoutMode]);

  const updateSize = useCallback((id: string, size: { w: number; h: number }) => {
    setWindows(prev => {
      const updated = new Map(prev);
      const w = updated.get(id);
      if (w) updated.set(id, { ...w, size });
      saveLayout(updated);
      return updated;
    });
  }, []);

  const updateMessages = useCallback((id: string, msgs: ChatMessage[]) => {
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

  if (isLoginPage) return null;

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

      {/* Bottom-right control area */}
      <div className="fixed bottom-6 right-6 z-[100] flex items-end gap-2">
        {/* Minimized pills */}
        <div className="flex flex-col items-end gap-1.5 mb-1">
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
        </div>

        {/* Controls column */}
        <div className="flex flex-col items-center gap-2">
          {/* Layout mode toggle */}
          {windowArray.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg shadow-sm"
                  onClick={toggleLayoutMode}
                >
                  {layoutMode === "floating"
                    ? <Layers className="w-3.5 h-3.5" />
                    : <LayoutGrid className="w-3.5 h-3.5" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-[10px]">{layoutMode === "floating" ? "Switch to Sticky" : "Switch to Floating"}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Provider selector FAB */}
          <AIChatProviderSelect
            providers={providers}
            openWindowIds={openIds}
            onSelect={handleProviderSelect}
            onConnect={p => setAuthProvider(p)}
          />
        </div>
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
