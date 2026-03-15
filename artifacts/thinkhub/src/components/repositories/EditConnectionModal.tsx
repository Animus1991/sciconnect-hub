import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, Eye, EyeOff, Key, Shield, Settings, Loader2,
  RefreshCw, Clock, Save, RotateCcw
} from "lucide-react";
import { toast } from "sonner";

interface EditConnectionModalProps {
  repo: { name: string; icon: string; description: string };
  authType: string;
  apiVersion?: string;
  papers: number;
  lastSync: string;
  onClose: () => void;
  onSave: (name: string) => void;
  onDisconnect: () => void;
  onSchedule: () => void;
}

interface EditField {
  key: string;
  label: string;
  type: "text" | "password" | "select" | "toggle";
  value: string | boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

const getEditFields = (repoName: string, authType: string): EditField[] => {
  const base: EditField[] = [];

  if (authType.includes("OAuth")) {
    base.push(
      { key: "clientId", label: "Client ID", type: "text", value: "APP-" + Math.random().toString(36).substring(2, 10).toUpperCase(), description: "Your application client ID" },
      { key: "clientSecret", label: "Client Secret", type: "password", value: "sk_" + Math.random().toString(36).substring(2, 18) },
      { key: "refreshToken", label: "Refresh Token", type: "password", value: "rt_" + Math.random().toString(36).substring(2, 22) },
    );
  } else {
    base.push(
      { key: "apiKey", label: "API Key", type: "password", value: "key_" + Math.random().toString(36).substring(2, 18), description: "Your API authentication key" },
    );
  }

  const repoSpecific: Record<string, EditField[]> = {
    ORCID: [
      { key: "sandbox", label: "Use Sandbox", type: "toggle", value: false, description: "Test with sandbox.orcid.org" },
    ],
    arXiv: [
      { key: "maxResults", label: "Default Results", type: "select", value: "25", options: ["10", "25", "50", "100"] },
      { key: "sortBy", label: "Default Sort", type: "select", value: "relevance", options: ["relevance", "lastUpdatedDate", "submittedDate"] },
    ],
    PubMed: [
      { key: "email", label: "Contact Email", type: "text", value: "researcher@university.edu", description: "Required by NCBI" },
      { key: "retmax", label: "Max Results", type: "select", value: "50", options: ["20", "50", "100", "200"] },
    ],
    GitHub: [
      { key: "syncPrivate", label: "Include Private Repos", type: "toggle", value: false },
      { key: "webhooks", label: "Enable Webhooks", type: "toggle", value: true, description: "Auto-sync on push events" },
    ],
    "Semantic Scholar": [
      { key: "fields", label: "Default Fields", type: "text", value: "title,authors,abstract,year,citationCount" },
    ],
  };

  return [...base, ...(repoSpecific[repoName] || [])];
};

const EditConnectionModal = ({ repo, authType, apiVersion, papers, lastSync, onClose, onSave, onDisconnect, onSchedule }: EditConnectionModalProps) => {
  const [fields, setFields] = useState<EditField[]>(getEditFields(repo.name, authType));
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const togglePassword = (key: string) => {
    setShowPasswords(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const updateField = (key: string, value: string | boolean) => {
    setFields(prev => prev.map(f => f.key === key ? { ...f, value } : f));
    setHasChanges(true);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave(repo.name);
      toast.success(`${repo.name} settings updated`);
    }, 1200);
  };

  const renderField = (field: EditField) => {
    switch (field.type) {
      case "password":
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-display font-medium text-foreground">{field.label}</label>
            {field.description && <p className="text-[10px] text-muted-foreground">{field.description}</p>}
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type={showPasswords.has(field.key) ? "text" : "password"}
                value={field.value as string}
                onChange={e => updateField(field.key, e.target.value)}
                className="w-full h-9 pl-9 pr-10 rounded-lg bg-secondary/30 border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button onClick={() => togglePassword(field.key)} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {showPasswords.has(field.key) ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
          </div>
        );
      case "text":
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-display font-medium text-foreground">{field.label}</label>
            {field.description && <p className="text-[10px] text-muted-foreground">{field.description}</p>}
            <input
              type="text"
              value={field.value as string}
              onChange={e => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full h-9 px-3 rounded-lg bg-secondary/30 border border-border text-xs font-display text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        );
      case "select":
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-display font-medium text-foreground">{field.label}</label>
            <select
              value={field.value as string}
              onChange={e => updateField(field.key, e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-secondary/30 border border-border text-xs font-display text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        );
      case "toggle":
        return (
          <div key={field.key} className="flex items-center justify-between py-1.5">
            <div>
              <p className="text-xs font-display font-medium text-foreground">{field.label}</p>
              {field.description && <p className="text-[10px] text-muted-foreground mt-0.5">{field.description}</p>}
            </div>
            <button onClick={() => updateField(field.key, !field.value)}
              className={`w-10 h-5 rounded-full transition-colors relative ${field.value ? "bg-accent" : "bg-muted"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${
                field.value ? "translate-x-[22px]" : "translate-x-0.5"
              }`} />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{repo.icon}</span>
            <div>
              <h2 className="font-display font-bold text-foreground">Edit {repo.name}</h2>
              <p className="text-[10px] text-muted-foreground font-display">{authType} · {apiVersion || "Latest"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Connection info */}
        <div className="px-5 py-3 border-b border-border/50 bg-secondary/10">
          <div className="flex items-center gap-4 text-[10px] font-display">
            <span className="text-muted-foreground">Papers: <span className="text-foreground font-medium">{papers}</span></span>
            <span className="text-muted-foreground">Last sync: <span className="text-foreground font-medium">{lastSync}</span></span>
            <span className="flex items-center gap-1 text-emerald-brand">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-brand" /> Connected
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <h3 className="text-xs font-display font-semibold text-foreground">Credentials</h3>
          </div>
          {fields.filter(f => f.type === "password" || (f.type === "text" && f.key.includes("Id"))).map(renderField)}

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-3.5 h-3.5 text-accent" />
              <h3 className="text-xs font-display font-semibold text-foreground">Configuration</h3>
            </div>
            {fields.filter(f => !(f.type === "password" || (f.type === "text" && f.key.includes("Id")))).map(renderField)}
          </div>

          {/* Quick actions */}
          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-display font-semibold text-foreground mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onSchedule}
                className="p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left">
                <Clock className="w-3.5 h-3.5 text-muted-foreground mb-1" />
                <p className="text-[10px] font-display font-medium text-foreground">Auto-Sync</p>
                <p className="text-[9px] text-muted-foreground">Schedule syncing</p>
              </button>
              <button onClick={() => toast.info("Refreshing token...")}
                className="p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left">
                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground mb-1" />
                <p className="text-[10px] font-display font-medium text-foreground">Refresh Token</p>
                <p className="text-[9px] text-muted-foreground">Re-authenticate</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-border">
          <button onClick={onDisconnect}
            className="h-9 px-4 rounded-lg text-destructive bg-destructive/10 font-display font-medium text-xs hover:bg-destructive/20 transition-colors">
            Disconnect
          </button>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="h-9 px-4 rounded-lg bg-secondary text-foreground font-display font-medium text-xs hover:bg-secondary/80 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!hasChanges || saving}
              className="h-9 px-5 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-xs shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditConnectionModal;
