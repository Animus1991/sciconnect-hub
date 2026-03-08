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

// Lazy-loaded pages for code splitting (AI_ORGANIZER pattern)
const Index = lazy(() => import("./pages/Index"));
const Profile = lazy(() => import("./pages/Profile"));
const Repositories = lazy(() => import("./pages/Repositories"));
const Discover = lazy(() => import("./pages/Discover"));
const Groups = lazy(() => import("./pages/Groups"));
const Discussions = lazy(() => import("./pages/Discussions"));
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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <UserDataProvider>
        <NotificationProvider>
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
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/repositories" element={<Repositories />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/discussions" element={<Discussions />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/peer-review" element={<PeerReview />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reading-list" element={<ReadingList />} />
            <Route path="/events" element={<Events />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/community" element={<Community />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/milestones" element={<Milestones />} />
            <Route path="/references" element={<References />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/collaboration" element={<Collaboration />} />
            <Route path="/unified-search" element={<UnifiedSearch />} />
            <Route path="/repository-dashboard" element={<RepositoryDashboard />} />
            <Route path="/contributions" element={<ContributionTracking />} />
            <Route path="/reputation" element={<ReputationScore />} />
            <Route path="/provenance" element={<IdeaProvenance />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
                </PageTransition>
                </AnimatePresence>
              </Suspense>
            </ErrorBoundary>
            </ShortcutsProvider>
          </BrowserRouter>
        </TooltipProvider>
        </QueryClientProvider>
        </NotificationProvider>
      </UserDataProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
