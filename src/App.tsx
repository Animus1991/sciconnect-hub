import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Repositories from "./pages/Repositories";
import Discover from "./pages/Discover";
import Groups from "./pages/Groups";
import Discussions from "./pages/Discussions";
import Impact from "./pages/Impact";
import Notifications from "./pages/Notifications";
import Publications from "./pages/Publications";
import PeerReview from "./pages/PeerReview";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
