import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Check, Eye, EyeOff, Copy,
  Shield, Key, Globe, Settings, Loader2, CheckCircle, AlertCircle, Link2
} from "lucide-react";
import { toast } from "sonner";

interface ConnectionModalProps {
  repo: { name: string; icon: string; description: string; url: string };
  authType: string;
  apiVersion?: string;
  onClose: () => void;
  onConnect: (name: string) => void;
}

interface ConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "select" | "toggle";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  description?: string;
  defaultValue?: string | boolean;
}

const REPO_CONFIGS: Record<string, { steps: string[]; fields: ConfigField[]; scopes?: string[]; oauthUrl?: string }> = {
  ORCID: {
    steps: ["Authorize", "Configure", "Confirm"],
    fields: [
      { key: "clientId", label: "Client ID", type: "text", placeholder: "APP-XXXXXXXXXXXXXXXX", required: true, description: "From ORCID Developer Tools" },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "••••••••", required: true },
      { key: "sandbox", label: "Use Sandbox", type: "toggle", defaultValue: false, description: "Test with sandbox.orcid.org" },
    ],
    scopes: ["/authenticate", "/read-limited", "/activities/update", "/person/update"],
    oauthUrl: "https://orcid.org/oauth/authorize",
  },
  arXiv: {
    steps: ["API Key", "Configure", "Confirm"],
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter your arXiv API key", required: true, description: "From arxiv.org/user" },
      { key: "maxResults", label: "Default Results", type: "select", options: ["10", "25", "50", "100"], defaultValue: "25" },
      { key: "sortBy", label: "Default Sort", type: "select", options: ["relevance", "lastUpdatedDate", "submittedDate"], defaultValue: "relevance" },
    ],
  },
  PubMed: {
    steps: ["API Key", "Configure", "Confirm"],
    fields: [
      { key: "apiKey", label: "NCBI API Key", type: "password", placeholder: "Enter your NCBI API key", required: true, description: "From ncbi.nlm.nih.gov/account/settings" },
      { key: "email", label: "Contact Email", type: "text", placeholder: "researcher@university.edu", required: true, description: "Required by NCBI for API usage" },
      { key: "retmax", label: "Max Results", type: "select", options: ["20", "50", "100", "200"], defaultValue: "50" },
    ],
  },
  GitHub: {
    steps: ["Authorize", "Select Repos", "Confirm"],
    fields: [
      { key: "token", label: "Personal Access Token", type: "password", placeholder: "ghp_xxxxxxxxxxxx", required: true, description: "From github.com/settings/tokens" },
      { key: "syncPrivate", label: "Include Private Repos", type: "toggle", defaultValue: false },
      { key: "webhooks", label: "Enable Webhooks", type: "toggle", defaultValue: true, description: "Auto-sync on push events" },
    ],
    scopes: ["repo", "read:user", "read:org"],
    oauthUrl: "https://github.com/login/oauth/authorize",
  },
  Zenodo: {
    steps: ["Authorize", "Configure", "Confirm"],
    fields: [
      { key: "token", label: "Access Token", type: "password", placeholder: "Enter your Zenodo token", required: true, description: "From zenodo.org/account/settings/applications" },
      { key: "sandbox", label: "Use Sandbox", type: "toggle", defaultValue: false, description: "Test with sandbox.zenodo.org" },
      { key: "community", label: "Default Community", type: "text", placeholder: "e.g., zenodo" },
    ],
    oauthUrl: "https://zenodo.org/oauth/authorize",
  },
  "Google Scholar": {
    steps: ["Configure", "Verify", "Confirm"],
    fields: [
      { key: "profileUrl", label: "Scholar Profile URL", type: "text", placeholder: "https://scholar.google.com/citations?user=...", required: true },
      { key: "serpApiKey", label: "SerpAPI Key (optional)", type: "password", placeholder: "For enhanced access", description: "serpapi.com for automated access" },
      { key: "syncInterval", label: "Sync Interval", type: "select", options: ["Daily", "Weekly", "Monthly"], defaultValue: "Weekly" },
    ],
  },
  "Semantic Scholar": {
    steps: ["API Key", "Configure", "Confirm"],
    fields: [
      { key: "apiKey", label: "S2 API Key", type: "password", placeholder: "Enter your S2 API key", required: true, description: "From semanticscholar.org/product/api" },
      { key: "fields", label: "Default Fields", type: "text", placeholder: "title,authors,abstract,citations", defaultValue: "title,authors,abstract,year,citationCount" },
    ],
  },
  "IEEE Xplore": {
    steps: ["API Key", "Configure", "Confirm"],
    fields: [
      { key: "apiKey", label: "IEEE API Key", type: "password", placeholder: "Enter your IEEE Xplore API key", required: true, description: "From developer.ieee.org" },
      { key: "maxRecords", label: "Max Records", type: "select", options: ["25", "50", "100", "200"], defaultValue: "50" },
    ],
  },
  Scopus: {
    steps: ["API Key", "Institution", "Confirm"],
    fields: [
      { key: "apiKey", label: "Scopus API Key", type: "password", placeholder: "Enter your Scopus API key", required: true, description: "From dev.elsevier.com" },
      { key: "instToken", label: "Institution Token", type: "password", placeholder: "Optional institutional token" },
      { key: "view", label: "Response View", type: "select", options: ["STANDARD", "COMPLETE"], defaultValue: "STANDARD" },
    ],
  },
  "Web of Science": {
    steps: ["API Key", "Configure", "Confirm"],
    fields: [
      { key: "apiKey", label: "WoS API Key", type: "password", placeholder: "Enter your Web of Science API key", required: true, description: "From developer.clarivate.com" },
      { key: "database", label: "Database", type: "select", options: ["WOS", "BIOSIS", "CCC", "DRCI", "MEDLINE"], defaultValue: "WOS" },
    ],
  },
  Figshare: {
    steps: ["Authorize", "Configure", "Confirm"],
    fields: [
      { key: "token", label: "Personal Token", type: "password", placeholder: "Enter your Figshare token", required: true, description: "From figshare.com/account/applications" },
      { key: "defaultLicense", label: "Default License", type: "select", options: ["CC-BY 4.0", "CC0 1.0", "MIT", "Apache 2.0"], defaultValue: "CC-BY 4.0" },
    ],
    oauthUrl: "https://figshare.com/account/applications",
  },
  Mendeley: {
    steps: ["Authorize", "Configure", "Confirm"],
    fields: [
      { key: "clientId", label: "Application ID", type: "text", placeholder: "Your Mendeley app ID", required: true, description: "From dev.mendeley.com" },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "••••••••", required: true },
      { key: "syncGroups", label: "Sync Groups", type: "toggle", defaultValue: true, description: "Include group libraries" },
    ],
    scopes: ["all"],
    oauthUrl: "https://api.mendeley.com/oauth/authorize",
  },
};

const DEFAULT_CONFIG: { steps: string[]; fields: ConfigField[]; scopes?: string[]; oauthUrl?: string } = {
  steps: ["Credentials", "Configure", "Confirm"],
  fields: [
    { key: "apiKey", label: "API Key", type: "password" as const, placeholder: "Enter API key", required: true },
  ],
};

const ConnectionModal = ({ repo, authType, apiVersion, onClose, onConnect }: ConnectionModalProps) => {
  const config = REPO_CONFIGS[repo.name] || DEFAULT_CONFIG;
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set(config.scopes || []));
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const totalSteps = config.steps.length;
  const isLastStep = step === totalSteps - 1;
  const isOAuth = authType.includes("OAuth");

  const togglePassword = (key: string) => {
    setShowPasswords(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev => {
      const n = new Set(prev);
      n.has(scope) ? n.delete(scope) : n.add(scope);
      return n;
    });
  };

  const updateField = (key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    if (step === totalSteps - 1) return true;
    const stepFields = getStepFields();
    return stepFields.filter(f => f.required).every(f => {
      const val = formData[f.key];
      return typeof val === "string" ? val.trim().length > 0 : val !== undefined;
    });
  };

  const getStepFields = (): ConfigField[] => {
    const fieldsPerStep = Math.ceil(config.fields.length / Math.max(totalSteps - 1, 1));
    const start = step * fieldsPerStep;
    return step < totalSteps - 1 ? config.fields.slice(start, start + fieldsPerStep) : [];
  };

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      setTimeout(() => {
        onConnect(repo.name);
        onClose();
      }, 1200);
    }, 2000);
  };

  const renderField = (field: ConfigField) => {
    switch (field.type) {
      case "password":
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-display font-medium text-foreground flex items-center gap-1">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </label>
            {field.description && <p className="text-[10px] text-muted-foreground">{field.description}</p>}
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type={showPasswords.has(field.key) ? "text" : "password"}
                value={(formData[field.key] as string) || ""}
                onChange={e => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full h-10 pl-9 pr-16 rounded-lg bg-secondary/30 border border-border text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => togglePassword(field.key)} className="p-1.5 rounded hover:bg-secondary transition-colors">
                  {showPasswords.has(field.key) ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {formData[field.key] && (
                  <button onClick={() => { navigator.clipboard.writeText(formData[field.key] as string); toast.success("Copied"); }}
                    className="p-1.5 rounded hover:bg-secondary transition-colors">
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      case "text":
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-display font-medium text-foreground flex items-center gap-1">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </label>
            {field.description && <p className="text-[10px] text-muted-foreground">{field.description}</p>}
            <input
              type="text"
              value={(formData[field.key] as string) || (field.defaultValue as string) || ""}
              onChange={e => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full h-10 px-3 rounded-lg bg-secondary/30 border border-border text-sm font-display text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        );
      case "select":
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-display font-medium text-foreground">{field.label}</label>
            {field.description && <p className="text-[10px] text-muted-foreground">{field.description}</p>}
            <select
              value={(formData[field.key] as string) || (field.defaultValue as string) || field.options?.[0]}
              onChange={e => updateField(field.key, e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-secondary/30 border border-border text-sm font-display text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        );
      case "toggle":
        return (
          <div key={field.key} className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-display font-medium text-foreground">{field.label}</p>
              {field.description && <p className="text-[10px] text-muted-foreground mt-0.5">{field.description}</p>}
            </div>
            <button
              onClick={() => updateField(field.key, !(formData[field.key] ?? field.defaultValue ?? false))}
              className={`w-10 h-5.5 rounded-full transition-colors relative ${
                (formData[field.key] ?? field.defaultValue) ? "bg-accent" : "bg-secondary"
              }`}
            >
              <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-background shadow transition-transform ${
                (formData[field.key] ?? field.defaultValue) ? "translate-x-5" : "translate-x-0.5"
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
        className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{repo.icon}</span>
            <div>
              <h2 className="font-display font-bold text-foreground">{connected ? "Connected!" : `Connect ${repo.name}`}</h2>
              <p className="text-[10px] text-muted-foreground font-display">
                {authType} · {apiVersion || "Latest"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress steps */}
        {!connected && (
          <div className="px-5 py-3 border-b border-border/50">
            <div className="flex items-center gap-1">
              {config.steps.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`flex items-center gap-1.5 ${i <= step ? "text-foreground" : "text-muted-foreground/40"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-display font-bold transition-colors ${
                      i < step ? "bg-accent text-accent-foreground" :
                      i === step ? "bg-primary text-primary-foreground" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {i < step ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className="text-[10px] font-display font-medium hidden sm:inline">{s}</span>
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`flex-1 h-px mx-2 ${i < step ? "bg-accent" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {connected ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-muted flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-brand" />
                </div>
                <h3 className="font-display font-bold text-foreground text-lg mb-1">Successfully Connected</h3>
                <p className="text-sm text-muted-foreground font-display text-center">
                  {repo.name} is now linked. Your data will sync shortly.
                </p>
              </motion.div>
            ) : isLastStep ? (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-accent" />
                    <h3 className="font-display font-semibold text-sm text-foreground">Review & Confirm</h3>
                  </div>

                  <div className="bg-secondary/30 rounded-lg p-4 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground font-display">Repository</span>
                      <span className="text-xs font-display font-medium text-foreground">{repo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground font-display">Auth Method</span>
                      <span className="text-xs font-display font-medium text-foreground">{authType}</span>
                    </div>
                    {apiVersion && (
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground font-display">API Version</span>
                        <span className="text-xs font-display font-medium text-foreground">{apiVersion}</span>
                      </div>
                    )}
                    {config.fields.filter(f => formData[f.key] && f.type !== "password").map(f => (
                      <div key={f.key} className="flex justify-between">
                        <span className="text-xs text-muted-foreground font-display">{f.label}</span>
                        <span className="text-xs font-display font-medium text-foreground">{String(formData[f.key])}</span>
                      </div>
                    ))}
                    {config.fields.filter(f => formData[f.key] && f.type === "password").map(f => (
                      <div key={f.key} className="flex justify-between">
                        <span className="text-xs text-muted-foreground font-display">{f.label}</span>
                        <span className="text-xs font-display font-medium text-foreground">••••••••</span>
                      </div>
                    ))}
                  </div>

                  {config.scopes && selectedScopes.size > 0 && (
                    <div>
                      <p className="text-xs font-display font-medium text-foreground mb-2">Authorized Scopes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[...selectedScopes].map(scope => (
                          <span key={scope} className="text-[10px] font-mono bg-accent/10 text-accent rounded-full px-2.5 py-1">
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <Shield className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                    <p className="text-[10px] text-muted-foreground font-display leading-relaxed">
                      Credentials are encrypted and stored securely. You can revoke access at any time from the dashboard.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="space-y-4">
                  {isOAuth && step === 0 && config.oauthUrl && (
                    <div className="bg-secondary/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-accent" />
                        <h4 className="text-xs font-display font-semibold text-foreground">OAuth Authorization</h4>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-display mb-3">
                        You can authorize via OAuth or enter credentials manually below.
                      </p>
                      <button
                        onClick={() => toast.info(`OAuth redirect to ${repo.name} would open here`)}
                        className="w-full h-9 rounded-lg bg-accent text-accent-foreground font-display font-medium text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <Globe className="w-3.5 h-3.5" /> Authorize with {repo.name}
                      </button>
                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] text-muted-foreground font-display">or enter manually</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    </div>
                  )}

                  {getStepFields().map(field => renderField(field))}

                  {isOAuth && config.scopes && step === 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-display font-medium text-foreground mb-2 flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5" /> Permission Scopes
                      </p>
                      <div className="space-y-1.5">
                        {config.scopes.map(scope => (
                          <label key={scope} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              selectedScopes.has(scope) ? "bg-accent border-accent" : "border-border"
                            }`}>
                              {selectedScopes.has(scope) && <Check className="w-2.5 h-2.5 text-accent-foreground" />}
                            </div>
                            <span className="text-xs font-mono text-foreground">{scope}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!connected && (
          <div className="flex items-center justify-between p-5 border-t border-border">
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
              className="h-9 px-4 rounded-lg bg-secondary text-foreground font-display font-medium text-xs flex items-center gap-1.5 hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {step > 0 ? "Back" : "Cancel"}
            </button>
            <button
              onClick={() => isLastStep ? handleConnect() : setStep(s => s + 1)}
              disabled={(!canProceed() && !isLastStep) || connecting}
              className="h-9 px-5 rounded-lg gradient-gold text-accent-foreground font-display font-semibold text-xs flex items-center gap-1.5 shadow-gold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {connecting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting...</>
              ) : isLastStep ? (
                <><Link2 className="w-3.5 h-3.5" /> Connect</>
              ) : (
                <>Next <ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ConnectionModal;
