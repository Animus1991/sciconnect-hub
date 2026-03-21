import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const CONSENT_KEY = "thinkhub-cookie-consent";

interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(defaultConsent);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const save = (state: ConsentState) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
    setVisible(false);
  };

  const acceptAll = () => {
    save({ necessary: true, analytics: true, marketing: true, functional: true });
  };

  const declineAll = () => {
    save({ necessary: true, analytics: false, marketing: false, functional: false });
  };

  const savePreferences = () => {
    save(consent);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed bottom-0 left-0 right-0 z-[300] px-4 pb-4 sm:pb-6"
      >
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Main bar */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                <Cookie className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-0.5">We use cookies</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Think!Hub uses cookies to improve your experience, analyse platform usage, and support research collaboration features.
                  {" "}<a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                </p>
              </div>
              <button
                onClick={declineAll}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Decline and close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preferences panel */}
          <AnimatePresence>
            {managing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-3 space-y-2.5 border-t border-border/50 pt-3">
                  {[
                    {
                      key: "necessary" as const,
                      label: "Necessary",
                      desc: "Authentication, security, session management. Cannot be disabled.",
                      locked: true,
                    },
                    {
                      key: "functional" as const,
                      label: "Functional",
                      desc: "Remembers preferences, layout settings, and research context.",
                      locked: false,
                    },
                    {
                      key: "analytics" as const,
                      label: "Analytics",
                      desc: "Anonymised usage data to improve Think!Hub features and performance.",
                      locked: false,
                    },
                    {
                      key: "marketing" as const,
                      label: "Marketing",
                      desc: "Personalised research content and partnership communications.",
                      locked: false,
                    },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                      <div className="shrink-0">
                        {item.locked ? (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Shield className="w-3 h-3" />
                            <span>Required</span>
                          </div>
                        ) : (
                          <Switch
                            checked={consent[item.key]}
                            onCheckedChange={val =>
                              setConsent(prev => ({ ...prev, [item.key]: val }))
                            }
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="px-5 pb-4 flex flex-wrap items-center gap-2 justify-between">
            <button
              onClick={() => setManaging(m => !m)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              {managing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Manage preferences
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg" onClick={declineAll}>
                Decline non-essential
              </Button>
              {managing ? (
                <Button size="sm" className="h-8 text-xs rounded-lg" onClick={savePreferences}>
                  Save preferences
                </Button>
              ) : (
                <Button size="sm" className="h-8 text-xs rounded-lg" onClick={acceptAll}>
                  Accept all
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
