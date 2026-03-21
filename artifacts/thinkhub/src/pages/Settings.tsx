import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Moon, Sun, Bell, Mail, Globe, Shield, Eye, Link2, ChevronRight, Check, Monitor, Smartphone, Palette, Download, Trash2, Keyboard, Languages, Clock, Zap, Settings2, Network, Hash, FileJson, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { repositories } from "@/data/mockData";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const languages = [
  { value: "en", label: "English" },
  { value: "el", label: "Ελληνικά" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
];

const timezones = [
  { value: "UTC-8", label: "UTC-8 (Los Angeles)" },
  { value: "UTC-5", label: "UTC-5 (New York)" },
  { value: "UTC+0", label: "UTC+0 (London)" },
  { value: "UTC+1", label: "UTC+1 (Berlin)" },
  { value: "UTC+2", label: "UTC+2 (Athens)" },
  { value: "UTC+3", label: "UTC+3 (Moscow)" },
  { value: "UTC+8", label: "UTC+8 (Beijing)" },
  { value: "UTC+9", label: "UTC+9 (Tokyo)" },
];

const keyboardShortcuts = [
  { keys: ["Ctrl", "K"], description: "Open command palette", category: "Navigation" },
  { keys: ["Ctrl", "B"], description: "Toggle sidebar", category: "Navigation" },
  { keys: ["?"], description: "Show keyboard shortcuts", category: "Navigation" },
  { keys: ["G", "H"], description: "Go to Home", category: "Navigation" },
  { keys: ["G", "P"], description: "Go to Publications", category: "Navigation" },
  { keys: ["G", "A"], description: "Go to Analytics", category: "Navigation" },
  { keys: ["Ctrl", "N"], description: "New publication", category: "Actions" },
  { keys: ["Ctrl", "S"], description: "Save changes", category: "Actions" },
  { keys: ["Esc"], description: "Close dialog / Cancel", category: "Actions" },
];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC+2");
  const [notifications, setNotifications] = useState({
    citations: true,
    reviews: true,
    collaborations: true,
    discussions: true,
    weeklyDigest: true,
    emailCitations: true,
    emailReviews: true,
    emailCollaborations: false,
    emailDigest: true,
    soundEnabled: false,
    desktopPush: true,
    blockchainPopups: localStorage.getItem("blockchain-notifications-enabled") === "true",
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    showAffiliation: true,
    showMetrics: true,
    allowMessages: true,
    searchable: true,
  });

  const [blockchainConfig, setBlockchainConfig] = useState({
    apiUrl: localStorage.getItem("VITE_BLOCKCHAIN_API_URL") || "https://testnet.hedera.com",
    network: localStorage.getItem("BLOCKCHAIN_NETWORK") || "testnet",
    topicId: localStorage.getItem("HCS_TOPIC_ID") || "0.0.123456"
  });

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "pdf">("json");
  const [exportSections, setExportSections] = useState({
    profile: true,
    publications: true,
    citations: true,
    notes: true,
    collaborations: false,
    messages: false,
    blockchain: false,
  });
  const [exportProgress, setExportProgress] = useState<null | number>(null);

  const handleExport = () => {
    setExportProgress(0);
    const steps = [10, 28, 45, 62, 78, 91, 100];
    let i = 0;
    const tick = () => {
      if (i < steps.length) {
        setExportProgress(steps[i]);
        i++;
        setTimeout(tick, 400 + Math.random() * 200);
      } else {
        setTimeout(() => {
          setExportProgress(null);
          setShowExportDialog(false);
          toast.success(`Data exported successfully as ${exportFormat.toUpperCase()}`);
        }, 600);
      }
    };
    tick();
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === "blockchainPopups") {
        localStorage.setItem("blockchain-notifications-enabled", next.blockchainPopups ? "true" : "false");
      }
      return next;
    });
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion initiated. This action cannot be undone.");
  };

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    const label = languages.find(l => l.value === val)?.label;
    toast.success(`Language changed to ${label}`);
  };

  const handleTimezoneChange = (val: string) => {
    setTimezone(val);
    const label = timezones.find(t => t.value === val)?.label;
    toast.success(`Timezone changed to ${label}`);
  };

  const handleBlockchainConfigChange = (key: keyof typeof blockchainConfig, value: string) => {
    setBlockchainConfig(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(
      key === "apiUrl" ? "VITE_BLOCKCHAIN_API_URL" : 
      key === "network" ? "BLOCKCHAIN_NETWORK" : "HCS_TOPIC_ID", 
      value
    );
    toast.success(`${key === "apiUrl" ? "API URL" : key === "network" ? "Network" : "Topic ID"} updated`);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-[13px] text-muted-foreground font-display mt-1 mb-6">
            Manage your preferences, notifications, and connected accounts
          </p>
        </motion.div>

        <Tabs defaultValue="appearance">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto gap-1 p-1 rounded-xl">
            <TabsTrigger value="appearance" className="font-display text-[13px] h-8 rounded-lg px-3.5">
              <Palette className="w-4 h-4 mr-1.5" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="font-display text-[13px] h-8 rounded-lg px-3.5">
              <Bell className="w-4 h-4 mr-1.5" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="font-display text-[13px] h-8 rounded-lg px-3.5">
              <Shield className="w-4 h-4 mr-1.5" /> Privacy
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="font-display text-[13px] h-8 rounded-lg px-3.5">
              <Keyboard className="w-4 h-4 mr-1.5" /> Shortcuts
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="font-display text-[13px] h-8 rounded-lg px-3.5">
              <Settings2 className="w-4 h-4 mr-1.5" /> Blockchain
            </TabsTrigger>
            <TabsTrigger value="repositories" className="font-display text-[13px] h-8 rounded-lg px-3.5">
              <Link2 className="w-4 h-4 mr-1.5" /> Repositories
            </TabsTrigger>
          </TabsList>

          {/* APPEARANCE TAB */}
          <TabsContent value="appearance">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-[15px] font-semibold text-foreground mb-1">Theme</h3>
                <p className="text-[13px] text-muted-foreground font-display mb-5">Choose your preferred appearance</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: "light" as const, label: "Light", icon: Sun, preview: "bg-white border-2" },
                    { value: "hitech" as const, label: "Hi-Tech", icon: Zap, preview: "bg-[hsl(220,14%,96%)] border-2 border-[hsl(172,66%,50%)]" },
                    { value: "dark" as const, label: "Dark", icon: Moon, preview: "bg-[hsl(225,14%,11%)] border-2" },
                    { value: "system" as const, label: "System", icon: Monitor, preview: "bg-gradient-to-r from-white to-[hsl(232,18%,13%)] border-2" },
                  ].map((option) => {
                    const isActive = theme === option.value;
                    return (
                      <button key={option.value} onClick={() => setTheme(option.value)}
                        className={`relative flex flex-col items-center gap-3 p-4 rounded-xl transition-all ${
                          isActive ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border bg-card hover:border-muted-foreground/30"
                        } border`}>
                        {isActive && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-gold flex items-center justify-center">
                            <Check className="w-3 h-3 text-accent-foreground" />
                          </div>
                        )}
                        <div className={`w-full h-16 rounded-lg ${option.preview} ${isActive ? "border-accent" : "border-border"}`} />
                        <div className="flex items-center gap-1.5">
                          <option.icon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-display font-medium text-foreground">{option.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-[15px] font-semibold text-foreground mb-1">Display</h3>
                <p className="text-[13px] text-muted-foreground font-display mb-5">Customize your reading experience</p>
                <div className="space-y-4">
                  <SettingRow icon={Languages} title="Language" description="Set your preferred language"
                    action={
                      <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-[160px] h-9 text-sm font-display">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(l => (
                            <SelectItem key={l.value} value={l.value} className="font-display text-sm">{l.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    } />
                  <Separator />
                  <SettingRow icon={Clock} title="Timezone" description="Used for deadlines and scheduling"
                    action={
                      <Select value={timezone} onValueChange={handleTimezoneChange}>
                        <SelectTrigger className="w-[200px] h-9 text-sm font-display">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map(t => (
                            <SelectItem key={t.value} value={t.value} className="font-display text-sm">{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    } />
                  <Separator />
                  <SettingRow icon={Smartphone} title="Compact mode" description="Show more content with less spacing"
                    action={<Switch />} />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-5 h-5 text-accent" />
                  <h3 className="text-[15px] font-semibold text-foreground">In-App Notifications</h3>
                </div>
                <p className="text-[13px] text-muted-foreground font-display mb-5">Choose which notifications appear in your feed</p>
                <div className="space-y-4">
                  <SettingToggle title="Citation alerts" description="When your papers are cited" checked={notifications.citations} onChange={() => toggleNotif("citations")} />
                  <Separator />
                  <SettingToggle title="Peer review updates" description="New review assignments and decisions" checked={notifications.reviews} onChange={() => toggleNotif("reviews")} />
                  <Separator />
                  <SettingToggle title="Collaboration requests" description="When researchers want to collaborate" checked={notifications.collaborations} onChange={() => toggleNotif("collaborations")} />
                  <Separator />
                  <SettingToggle title="Discussion replies" description="Replies to your posts and comments" checked={notifications.discussions} onChange={() => toggleNotif("discussions")} />
                  <Separator />
                  <SettingToggle title="Desktop push notifications" description="Browser notifications for important updates" checked={notifications.desktopPush} onChange={() => toggleNotif("desktopPush")} />
                  <Separator />
                  <SettingToggle title="Sound alerts" description="Play a sound for new notifications" checked={notifications.soundEnabled} onChange={() => toggleNotif("soundEnabled")} />
                  <Separator />
                  <SettingToggle title="Blockchain activity popups" description="Show Soulbound Token and on-chain event toasts" checked={notifications.blockchainPopups} onChange={() => toggleNotif("blockchainPopups")} />
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-5 h-5 text-accent" />
                  <h3 className="text-[15px] font-semibold text-foreground">Email Notifications</h3>
                </div>
                <p className="text-[13px] text-muted-foreground font-display mb-5">Manage which notifications are sent to your email</p>
                <div className="space-y-4">
                  <SettingToggle title="Citation alerts" description="Daily digest of new citations" checked={notifications.emailCitations} onChange={() => toggleNotif("emailCitations")} />
                  <Separator />
                  <SettingToggle title="Review deadlines" description="Reminders before review deadlines" checked={notifications.emailReviews} onChange={() => toggleNotif("emailReviews")} />
                  <Separator />
                  <SettingToggle title="Collaboration invites" description="Email when someone invites you" checked={notifications.emailCollaborations} onChange={() => toggleNotif("emailCollaborations")} />
                  <Separator />
                  <SettingToggle title="Weekly digest" description="Summary of your research activity" checked={notifications.emailDigest} onChange={() => toggleNotif("emailDigest")} />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* PRIVACY TAB */}
          <TabsContent value="privacy">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-5 h-5 text-accent" />
                  <h3 className="text-[15px] font-semibold text-foreground">Profile Visibility</h3>
                </div>
                <p className="text-[13px] text-muted-foreground font-display mb-5">Control what others can see on your profile</p>
                <div className="space-y-4">
                  <SettingToggle title="Public profile" description="Allow anyone to view your profile" checked={privacy.profilePublic} onChange={() => togglePrivacy("profilePublic")} />
                  <Separator />
                  <SettingToggle title="Show email address" description="Display your email on your profile" checked={privacy.showEmail} onChange={() => togglePrivacy("showEmail")} />
                  <Separator />
                  <SettingToggle title="Show affiliation" description="Display your institution and department" checked={privacy.showAffiliation} onChange={() => togglePrivacy("showAffiliation")} />
                  <Separator />
                  <SettingToggle title="Show metrics" description="Display h-index and citation counts publicly" checked={privacy.showMetrics} onChange={() => togglePrivacy("showMetrics")} />
                  <Separator />
                  <SettingToggle title="Allow messages" description="Let other researchers message you directly" checked={privacy.allowMessages} onChange={() => togglePrivacy("allowMessages")} />
                  <Separator />
                  <SettingToggle title="Searchable profile" description="Appear in search results and recommendations" checked={privacy.searchable} onChange={() => togglePrivacy("searchable")} />
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-[15px] font-semibold text-foreground mb-1">Data Management</h3>
                <p className="text-[13px] text-muted-foreground font-display mb-5">Export or delete your data</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowExportDialog(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left"
                  >
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-display font-medium text-foreground">Export all data</p>
                      <p className="text-xs text-muted-foreground">Download your publications, notes, citations, and profile — GDPR portability</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-destructive/10 transition-colors text-left group">
                        <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                        <div>
                          <p className="text-sm font-display font-medium text-foreground group-hover:text-destructive">Delete account</p>
                          <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="font-display">
                          This action cannot be undone. This will permanently delete your account, all publications, analytics data, collaborations, and remove your profile from the platform.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="font-display">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-display">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* KEYBOARD SHORTCUTS TAB */}
          <TabsContent value="shortcuts">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Keyboard className="w-5 h-5 text-accent" />
                  <h3 className="text-[15px] font-semibold text-foreground">Keyboard Shortcuts</h3>
                </div>
                <p className="text-[13px] text-muted-foreground font-display mb-5">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border text-[10px] font-mono">?</kbd> anywhere to view shortcuts
                </p>
                {Object.entries(
                  keyboardShortcuts.reduce((acc, s) => {
                    (acc[s.category] ??= []).push(s);
                    return acc;
                  }, {} as Record<string, typeof keyboardShortcuts>)
                ).map(([category, shortcuts]) => (
                  <div key={category} className="mb-5 last:mb-0">
                    <h4 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">{category}</h4>
                    <div className="space-y-2">
                      {shortcuts.map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors">
                          <span className="text-sm font-display text-foreground">{s.description}</span>
                          <div className="flex items-center gap-1">
                            {s.keys.map((key, ki) => (
                              <span key={ki}>
                                <kbd className="px-2 py-1 rounded-md bg-secondary border border-border text-xs font-mono text-foreground min-w-[28px] text-center inline-block">
                                  {key}
                                </kbd>
                                {ki < s.keys.length - 1 && <span className="text-muted-foreground mx-0.5 text-xs">+</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* BLOCKCHAIN TAB */}
          <TabsContent value="blockchain">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Settings2 className="w-5 h-5 text-accent" />
                  <h3 className="text-[15px] font-semibold text-foreground">Hedera Hashgraph Configuration</h3>
                </div>
                <p className="text-[13px] text-muted-foreground font-display mb-5">
                  Configure your connection to Hedera Consensus Service (HCS) for blockchain anchoring
                </p>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="blockchain-api-url" className="text-[13px] font-display font-medium text-foreground">
                      Blockchain API URL
                    </Label>
                    <Input
                      id="blockchain-api-url"
                      type="url"
                      value={blockchainConfig.apiUrl}
                      onChange={(e) => handleBlockchainConfigChange("apiUrl", e.target.value)}
                      placeholder="https://testnet.hedera.com"
                      className="font-mono text-[13px] rounded-xl h-10"
                    />
                    <p className="text-[13px] text-muted-foreground font-display">
                      The base URL for Hedera network API calls
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="blockchain-network" className="text-[13px] font-display font-medium text-foreground">
                      Network Environment
                    </Label>
                    <Select value={blockchainConfig.network} onValueChange={(val) => handleBlockchainConfigChange("network", val)}>
                      <SelectTrigger id="blockchain-network" className="w-full font-display rounded-xl h-10 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="testnet" className="font-display">
                          <div className="flex items-center gap-2">
                            <Network className="w-4 h-4 text-amber-500" />
                            <span>Testnet</span>
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                              Testing
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="mainnet" className="font-display">
                          <div className="flex items-center gap-2">
                            <Network className="w-4 h-4 text-success" />
                            <span>Mainnet</span>
                            <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
                              Production
                            </Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground font-display">
                      Choose testnet for development or mainnet for production use
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hcs-topic-id" className="text-sm font-display font-medium text-foreground">
                      HCS Topic ID
                    </Label>
                    <Input
                      id="hcs-topic-id"
                      type="text"
                      value={blockchainConfig.topicId}
                      onChange={(e) => handleBlockchainConfigChange("topicId", e.target.value)}
                      placeholder="0.0.123456"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground font-display">
                      Hedera Consensus Service Topic ID for timestamping and anchoring documents
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="w-4 h-4 text-accent" />
                  <h3 className="font-display font-semibold text-foreground">Cryptographic Settings</h3>
                </div>
                <p className="text-xs text-muted-foreground font-display mb-5">
                  Configure blockchain verification and hashing preferences
                </p>
                <div className="space-y-4">
                  <SettingToggle 
                    title="Auto-anchor important documents" 
                    description="Automatically anchor publications and research findings to blockchain" 
                    checked={true} 
                    onChange={() => toast.success("Auto-anchoring enabled")} 
                  />
                  <Separator />
                  <SettingToggle 
                    title="Show blockchain badges" 
                    description="Display verification status badges on anchored content" 
                    checked={true} 
                    onChange={() => toast.success("Blockchain badges enabled")} 
                  />
                  <Separator />
                  <SettingToggle 
                    title="Real-time verification" 
                    description="Check blockchain status in real-time for all documents" 
                    checked={false} 
                    onChange={() => toast.success("Real-time verification toggled")} 
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-success/5 to-accent/5 rounded-xl border border-success/20 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-semibold text-sm text-foreground mb-1">
                      Configuration Status
                    </h4>
                    <p className="text-xs text-muted-foreground font-display mb-3">
                      Your blockchain configuration is active. All document anchoring and verification features are operational.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network:</span>
                        <Badge variant="outline" className={`text-[9px] ${
                          blockchainConfig.network === "mainnet" ? "bg-success/10 text-success border-success/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}>
                          {blockchainConfig.network}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Topic:</span>
                        <code className="text-accent font-mono text-[9px]">{blockchainConfig.topicId}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-success font-medium">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* REPOSITORIES TAB */}
          <TabsContent value="repositories">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold text-foreground mb-1">Connected Repositories</h3>
                <p className="text-xs text-muted-foreground font-display mb-5">
                  Manage your integrations with scientific platforms and databases
                </p>
                <div className="space-y-3">
                  {repositories.map((repo) => (
                    <div key={repo.name} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                      <span className="text-2xl w-10 h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0 border border-border">
                        {repo.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-display font-medium text-foreground">{repo.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{repo.description}</p>
                      </div>
                      {repo.connected ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-display text-success border-success/20 bg-success/10">
                            Connected
                          </Badge>
                          <button className="text-xs font-display text-muted-foreground hover:text-destructive transition-colors">
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button className="h-8 px-3 rounded-lg bg-accent text-accent-foreground text-xs font-display font-semibold hover:opacity-90 transition-opacity">
                          Connect
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold text-foreground mb-1">Sync Preferences</h3>
                <p className="text-xs text-muted-foreground font-display mb-5">Configure how data syncs across platforms</p>
                <div className="space-y-4">
                  <SettingToggle title="Auto-sync publications" description="Automatically import new publications from connected repositories" checked={true} onChange={() => {}} />
                  <Separator />
                  <SettingToggle title="Sync citation metrics" description="Keep citation counts updated in real-time" checked={true} onChange={() => {}} />
                  <Separator />
                  <SettingToggle title="Cross-post preprints" description="Automatically share preprints across connected platforms" checked={false} onChange={() => {}} />
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── GDPR Data Export Dialog ── */}
      <Dialog open={showExportDialog} onOpenChange={open => { if (!exportProgress) setShowExportDialog(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              Export Your Data
            </DialogTitle>
            <DialogDescription>
              Download a copy of your Think!Hub data — your right under GDPR Article 20 (data portability).
            </DialogDescription>
          </DialogHeader>

          {exportProgress !== null ? (
            <div className="py-6 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
              <p className="text-sm font-medium">Preparing your export...</p>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{exportProgress}% — collecting your data</p>
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              {/* Format selection */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">Export format</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { fmt: "json", icon: FileJson, label: "JSON", desc: "Machine readable" },
                    { fmt: "csv", icon: FileSpreadsheet, label: "CSV", desc: "Spreadsheet" },
                    { fmt: "pdf", icon: FileText, label: "PDF", desc: "Human readable" },
                  ] as const).map(({ fmt, icon: Icon, label, desc }) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        exportFormat === fmt
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span className="text-xs font-semibold">{label}</span>
                      <span className="text-[10px] opacity-70">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section selection */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">Include sections</p>
                <div className="space-y-2">
                  {(Object.entries(exportSections) as [keyof typeof exportSections, boolean][]).map(([key, val]) => {
                    const labels: Record<keyof typeof exportSections, { label: string; desc: string }> = {
                      profile: { label: "Profile & Bio", desc: "Name, ORCID, affiliations, bio" },
                      publications: { label: "Publications", desc: "All submitted papers and preprints" },
                      citations: { label: "Citations & References", desc: "Your citation library" },
                      notes: { label: "Lab Notes", desc: "Private and shared research notes" },
                      collaborations: { label: "Collaborations", desc: "Projects and team memberships" },
                      messages: { label: "Messages", desc: "Conversation transcripts" },
                      blockchain: { label: "Blockchain Records", desc: "On-chain hashes and SBTs" },
                    };
                    return (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                          checked={val}
                          onCheckedChange={v =>
                            setExportSections(prev => ({ ...prev, [key]: !!v }))
                          }
                        />
                        <div>
                          <p className="text-sm font-medium">{labels[key].label}</p>
                          <p className="text-xs text-muted-foreground">{labels[key].desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleExport}
                  disabled={!Object.values(exportSections).some(Boolean)}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export {exportFormat.toUpperCase()}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

function SettingRow({ icon: Icon, title, description, action }: { icon: any; title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-display font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function SettingToggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-display font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default Settings;
