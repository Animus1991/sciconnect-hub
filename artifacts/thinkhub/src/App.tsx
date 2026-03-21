import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { CommandPalette } from "./components/CommandPalette";
import { AuthProvider } from "./hooks/use-auth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ScrollToTop } from "./components/ScrollToTop";
import { PageLoadingFallback } from "@/components/PageLoadingFallback";
import { NotificationProvider } from "./hooks/use-notifications";
import { ShortcutsProvider } from "./hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsHelp } from "./components/KeyboardShortcutsHelp";
import { UserDataProvider } from "./context/UserDataContext";
import { PageTransition } from "./components/layout/PageTransition";
import { AnimatePresence } from "framer-motion";
import AIChatManager from "./components/ai-chat/AIChatManager";
import { BlockchainNotificationProvider } from "./components/layout/BlockchainNotificationProvider";
import { CookieConsent } from "./components/layout/CookieConsent";

/* ─── Lazy-loaded pages ─── */
const Index = lazy(() => import("./pages/Index"));
const Profile = lazy(() => import("./pages/Profile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const Repositories = lazy(() => import("./pages/Repositories"));
const Discover = lazy(() => import("./pages/Discover"));
const Groups = lazy(() => import("./pages/Groups"));
const Discussions = lazy(() => import("./pages/Discussions"));
const ThreadView = lazy(() => import("./pages/ThreadView"));
const Impact = lazy(() => import("./pages/Impact"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Publications = lazy(() => import("./pages/Publications"));
const PeerReview = lazy(() => import("./pages/PeerReview"));
const Projects = lazy(() => import("./pages/Projects"));
const Settings = lazy(() => import("./pages/Settings"));
const ReadingList = lazy(() => import("./pages/ReadingList"));
const Events = lazy(() => import("./pages/Events"));
const Mentorship = lazy(() => import("./pages/Mentorship"));
const Activity = lazy(() => import("./pages/Activity"));
const Wiki = lazy(() => import("./pages/Wiki"));
const Community = lazy(() => import("./pages/Community"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const Courses = lazy(() => import("./pages/Courses"));
const Milestones = lazy(() => import("./pages/Milestones"));
const References = lazy(() => import("./pages/References"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Issues = lazy(() => import("./pages/Issues"));
const Collaboration = lazy(() => import("./pages/Collaboration"));
const UnifiedSearch = lazy(() => import("./pages/UnifiedSearch"));
const RepositoryDashboard = lazy(() => import("./pages/RepositoryDashboard"));
const ContributionTracking = lazy(() => import("./pages/ContributionTracking"));
const ReputationScore = lazy(() => import("./pages/ReputationScore"));
const IdeaProvenance = lazy(() => import("./pages/IdeaProvenance"));
const BlockchainDashboard = lazy(() => import("./pages/BlockchainDashboard"));
const BlockchainAnalytics = lazy(() => import("./pages/BlockchainAnalytics"));
const Funding = lazy(() => import("./pages/Funding"));
const LabNotebook = lazy(() => import("./pages/LabNotebook"));
const CitationManager = lazy(() => import("./pages/CitationManager"));
const ConferenceManagement = lazy(() => import("./pages/ConferenceManagement"));
const Messenger = lazy(() => import("./pages/Messenger"));

/* ─── Phase 1: New critical pages ─── */
const Help = lazy(() => import("./pages/Help"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Invite = lazy(() => import("./pages/Invite"));
const Calendar = lazy(() => import("./pages/Calendar"));

/* ─── Phase 2: New feature pages ─── */
const ResearcherComparison = lazy(() => import("./pages/ResearcherComparison"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ResearchCanvas = lazy(() => import("./pages/ResearchCanvas"));

/* ─── Workspace Suite ─── */
const Documents = lazy(() => import("./pages/Documents"));
const Sheets = lazy(() => import("./pages/Sheets"));

const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <UserDataProvider>
        <NotificationProvider>
          <BlockchainNotificationProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ShortcutsProvider>
                    <ScrollToTop />
                    <CommandPalette />
                    <KeyboardShortcutsHelp />
                    <ErrorBoundary>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <AnimatePresence mode="wait">
                          <PageTransition>
                            <Routes>
                              {/* ── Core ── */}
                              <Route path="/" element={<Index />} />
                              <Route path="/discover" element={<Discover />} />
                              <Route path="/messages" element={<Messenger />} />
                              <Route path="/notifications" element={<Notifications />} />
                              <Route path="/activity" element={<Activity />} />
                              <Route path="/unified-search" element={<UnifiedSearch />} />

                              {/* ── Profile ── */}
                              <Route path="/profile" element={<Profile />} />
                              <Route path="/profile/:userId" element={<PublicProfile />} />

                              {/* ── Research ── */}
                              <Route path="/publications" element={<Publications />} />
                              <Route path="/repositories" element={<Repositories />} />
                              <Route path="/repository-dashboard" element={<RepositoryDashboard />} />
                              <Route path="/projects" element={<Projects />} />
                              <Route path="/analytics" element={<Analytics />} />
                              <Route path="/reading-list" element={<ReadingList />} />
                              <Route path="/milestones" element={<Milestones />} />
                              <Route path="/wiki" element={<Wiki />} />
                              <Route path="/funding" element={<Funding />} />
                              <Route path="/lab-notebook" element={<LabNotebook />} />
                              <Route path="/citations" element={<CitationManager />} />
                              <Route path="/references" element={<References />} />
                              <Route path="/issues" element={<Issues />} />
                              <Route path="/impact" element={<Impact />} />
                              <Route path="/peer-review" element={<PeerReview />} />
                              <Route path="/calendar" element={<Calendar />} />

                              {/* ── Blockchain & Attribution ── */}
                              <Route path="/blockchain" element={<BlockchainDashboard />} />
                              <Route path="/blockchain-analytics" element={<BlockchainAnalytics />} />
                              <Route path="/contributions" element={<ContributionTracking />} />
                              <Route path="/reputation" element={<ReputationScore />} />
                              <Route path="/provenance" element={<IdeaProvenance />} />

                              {/* ── Community ── */}
                              <Route path="/community" element={<Community />} />
                              <Route path="/groups" element={<Groups />} />
                              <Route path="/discussions" element={<Discussions />} />
                              <Route path="/discussions/:threadId" element={<ThreadView />} />
                              <Route path="/events" element={<Events />} />
                              <Route path="/conferences" element={<ConferenceManagement />} />
                              <Route path="/collaboration" element={<Collaboration />} />

                              {/* ── Career ── */}
                              <Route path="/mentorship" element={<Mentorship />} />
                              <Route path="/opportunities" element={<Opportunities />} />
                              <Route path="/courses" element={<Courses />} />

                              {/* ── Account ── */}
                              <Route path="/settings" element={<Settings />} />
                              <Route path="/invite" element={<Invite />} />

                              {/* ── Onboarding ── */}
                              <Route path="/onboarding" element={<Onboarding />} />

                              {/* ── Tools ── */}
                              <Route path="/compare" element={<ResearcherComparison />} />
                              <Route path="/admin" element={<AdminDashboard />} />
                              <Route path="/canvas" element={<ResearchCanvas />} />

                              {/* ── Workspace Suite ── */}
                              <Route path="/documents" element={<Documents />} />
                              <Route path="/sheets" element={<Sheets />} />

                              {/* ── Legal & Support ── */}
                              <Route path="/help" element={<Help />} />
                              <Route path="/terms" element={<Terms />} />
                              <Route path="/privacy" element={<Privacy />} />

                              {/* ── 404 ── */}
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </PageTransition>
                        </AnimatePresence>
                      </Suspense>
                    </ErrorBoundary>
                    <AIChatManager />
                    <CookieConsent />
                  </ShortcutsProvider>
                </BrowserRouter>
              </TooltipProvider>
            </QueryClientProvider>
          </BlockchainNotificationProvider>
        </NotificationProvider>
      </UserDataProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
