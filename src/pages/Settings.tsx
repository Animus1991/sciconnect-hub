import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Moon, Sun, Bell, Mail, Globe, Shield, Eye, Link2, ChevronRight, Check, Monitor, Smartphone, Palette, Download, Trash2, Keyboard, Languages, Clock, Zap, Settings2, Network, Hash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
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

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground font-display mt-1 mb-6">
            Manage your preferences, notifications, and connected accounts
          </p>
        </motion.div>

        <Tabs defaultValue="appearance">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="appearance" className="font-display text-sm">
              <Palette className="w-3.5 h-3.5 mr-1.5" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="font-display text-sm">
              <Bell className="w-3.5 h-3.5 mr-1.5" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="font-display text-sm">
              <Shield className="w-3.5 h-3.5 mr-1.5" /> Privacy
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="font-display text-sm">
              <Keyboard className="w-3.5 h-3.5 mr-1.5" /> Shortcuts
            </TabsTrigger>
            <TabsTrigger value="repositories" className="font-display text-sm">
              <Link2 className="w-3.5 h-3.5 mr-1.5" /> Repositories
            </TabsTrigger>
          </TabsList>

          {/* APPEARANCE TAB */}
          <TabsContent value="appearance">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold text-foreground mb-1">Theme</h3>
                <p className="text-xs text-muted-foreground font-display mb-5">Choose your preferred appearance</p>
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

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold text-foreground mb-1">Display</h3>
                <p className="text-xs text-muted-foreground font-display mb-5">Customize your reading experience</p>
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
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4 text-accent" />
                  <h3 className="font-display font-semibold text-foreground">In-App Notifications</h3>
                </div>
                <p className="text-xs text-muted-foreground font-display mb-5">Choose which notifications appear in your feed</p>
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
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-accent" />
                  <h3 className="font-display font-semibold text-foreground">Email Notifications</h3>
                </div>
                <p className="text-xs text-muted-foreground font-display mb-5">Manage which notifications are sent to your email</p>
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
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-accent" />
                  <h3 className="font-display font-semibold text-foreground">Profile Visibility</h3>
                </div>
                <p className="text-xs text-muted-foreground font-display mb-5">Control what others can see on your profile</p>
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
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold text-foreground mb-1">Data Management</h3>
                <p className="text-xs text-muted-foreground font-display mb-5">Export or delete your data</p>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-display font-medium text-foreground">Export all data</p>
                      <p className="text-xs text-muted-foreground">Download all your publications, metrics, and profile data</p>
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
                        <AlertDialogTitle className="font-serif">Are you absolutely sure?</AlertDialogTitle>
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
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Keyboard className="w-4 h-4 text-accent" />
                  <h3 className="font-display font-semibold text-foreground">Keyboard Shortcuts</h3>
                </div>
                <p className="text-xs text-muted-foreground font-display mb-5">
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
