import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { AIProvider, AIProviderType } from "./types";
import { connectProvider } from "@/lib/api/aiChat";

interface Props {
  provider: AIProvider;
  open: boolean;
  onClose: () => void;
  onSuccess: (providerId: AIProviderType) => void;
}

const AIChatAuthDialog: React.FC<Props> = ({ provider, open, onClose, onSuccess }) => {
  const [tab, setTab] = useState<"oauth" | "apikey">("oauth");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (oauthProvider: string) => {
    setLoading(true);
    // Mock OAuth — in real impl, opens popup with authorizationUrl
    await new Promise(r => setTimeout(r, 1000));
    await connectProvider(provider.id, "oauth", { provider: oauthProvider });
    toast.success(`Connected to ${provider.name} via ${oauthProvider}`);
    setLoading(false);
    onSuccess(provider.id);
    onClose();
  };

  const handleApiKey = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    await connectProvider(provider.id, "apikey", { key: apiKey });
    toast.success(`Connected to ${provider.name} via API Key`);
    setLoading(false);
    setApiKey("");
    onSuccess(provider.id);
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-background/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{provider.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-foreground">Connect {provider.name}</h3>
                <p className="text-[10px] text-muted-foreground">{provider.model}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["oauth", "apikey"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  tab === t ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "oauth" ? "OAuth / Social" : "API Key"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            {tab === "oauth" ? (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 text-xs"
                  onClick={() => handleOAuth("google")}
                  disabled={loading}
                >
                  <Globe className="w-4 h-4" /> Continue with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 text-xs"
                  onClick={() => handleOAuth("github")}
                  disabled={loading}
                >
                  <Mail className="w-4 h-4" /> Continue with GitHub
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  OAuth connects securely without sharing your password
                </p>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground font-medium">API Key</label>
                  <Input
                    type="password"
                    placeholder={`Enter your ${provider.name} API key`}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <Button
                  className="w-full h-9 text-xs"
                  onClick={handleApiKey}
                  disabled={loading || !apiKey.trim()}
                >
                  <Key className="w-3.5 h-3.5 mr-1.5" /> Connect
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Keys are stored in memory only — never persisted
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIChatAuthDialog;
