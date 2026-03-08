/* ─── Page Context Detection ─── */
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import type { SharedContext } from "@/components/ai-chat/types";

const ROUTE_CONTEXT_MAP: Record<string, { type: SharedContext["type"]; title: string; description: string }> = {
  "/": { type: "workspace", title: "Dashboard", description: "Main dashboard with research overview, stats, and activity feed." },
  "/projects": { type: "project", title: "Projects", description: "Research projects management — create, track, and collaborate on scientific projects." },
  "/publications": { type: "document", title: "Publications", description: "Publication management — drafts, submitted, and published papers." },
  "/citations": { type: "document", title: "Citation Manager", description: "Citation tracking, import/export, and bibliography management." },
  "/lab-notebook": { type: "document", title: "Lab Notebook", description: "Digital lab notebook for experiments, observations, and protocols." },
  "/peer-review": { type: "document", title: "Peer Review", description: "Peer review submissions, assigned reviews, and feedback." },
  "/funding": { type: "project", title: "Funding", description: "Grant applications, funding opportunities, and budget tracking." },
  "/collaboration": { type: "workspace", title: "Collaboration", description: "Shared workspaces, document editing, and team communication." },
  "/analytics": { type: "workspace", title: "Analytics", description: "Research analytics, impact metrics, and productivity insights." },
  "/discover": { type: "workspace", title: "Discover", description: "Discover trending papers, researchers, and research opportunities." },
  "/repositories": { type: "project", title: "Repositories", description: "Connected code repositories, data repos, and sync management." },
  "/impact": { type: "workspace", title: "Impact", description: "Research impact metrics, citation graphs, and h-index tracking." },
  "/blockchain": { type: "project", title: "Blockchain", description: "Blockchain-verified research records and provenance tracking." },
  "/conferences": { type: "workspace", title: "Conferences", description: "Conference management, submissions, and event tracking." },
  "/community": { type: "workspace", title: "Community", description: "Research community, groups, discussions, and networking." },
  "/messages": { type: "workspace", title: "Messenger", description: "Team messaging, threads, and AI copilot conversations." },
  "/settings": { type: "workspace", title: "Settings", description: "Account settings, preferences, and integrations." },
  "/profile": { type: "workspace", title: "Profile", description: "User profile, skills, publications, and academic milestones." },
  "/wiki": { type: "document", title: "Wiki", description: "Research wiki, knowledge base, and documentation." },
  "/search": { type: "workspace", title: "Search", description: "Unified search across papers, projects, people, and data." },
};

export interface PageContext {
  context: SharedContext | null;
  contextLabel: string;
  routePath: string;
}

export function usePageContext(): PageContext {
  const location = useLocation();
  
  return useMemo(() => {
    const path = location.pathname;
    const match = ROUTE_CONTEXT_MAP[path];
    
    if (!match) {
      // Try prefix match for nested routes like /projects/123
      const prefix = "/" + path.split("/")[1];
      const prefixMatch = ROUTE_CONTEXT_MAP[prefix];
      if (prefixMatch) {
        return {
          context: {
            type: prefixMatch.type,
            title: prefixMatch.title,
            content: prefixMatch.description,
            source: path,
          },
          contextLabel: prefixMatch.title,
          routePath: path,
        };
      }
      return { context: null, contextLabel: "", routePath: path };
    }

    return {
      context: {
        type: match.type,
        title: match.title,
        content: match.description,
        source: path,
      },
      contextLabel: match.title,
      routePath: path,
    };
  }, [location.pathname]);
}
