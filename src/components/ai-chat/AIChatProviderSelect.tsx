import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AIProvider, AIProviderType } from "./types";

interface Props {
  providers: AIProvider[];
  openWindowIds: AIProviderType[];
  onSelect: (id: AIProviderType) => void;
  onConnect: (provider: AIProvider) => void;
}

const AIChatProviderSelect: React.FC<Props> = ({ providers, openWindowIds, onSelect, onConnect }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-xl shadow-md"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-12 left-0 bg-card border border-border rounded-xl shadow-2xl p-2 w-56 z-50"
          >
            <p className="text-[10px] text-muted-foreground font-medium px-2 py-1">AI Providers</p>
            {providers.map(p => {
              const isOpen = openWindowIds.includes(p.id);
              const isConnected = p.status === "connected";
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (isConnected) {
                      onSelect(p.id);
                    } else {
                      onConnect(p);
                    }
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left ${
                    isOpen ? "bg-accent/8 border border-accent/15" : "hover:bg-secondary/50"
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{p.name}</p>
                    <p className="text-[9px] text-muted-foreground">{p.model}</p>
                  </div>
                  {isConnected ? (
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  ) : (
                    <span className="text-[9px] text-muted-foreground">Connect</span>
                  )}
                  {isOpen && <Check className="w-3 h-3 text-accent flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatProviderSelect;
