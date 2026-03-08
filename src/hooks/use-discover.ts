import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { search, community } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface DiscoverPaper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  date: string;
  citations: number;
  tags: string[];
  type: "paper" | "preprint" | "dataset" | "code";
  abstract?: string;
  doi?: string;
  velocity?: number;
  daysAgo?: number;
}

export interface DiscoverResearcher {
  id: string;
  name: string;
  title: string;
  institution: string;
  field: string;
  expertise: string[];
  publications: number;
  citations: number;
  hIndex: number;
  avatar: string;
  availableForCollab: boolean;
  followers: number;
  compatibilityScore?: number;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────
export function useSearchPapers(query: string) {
  return useQuery({
    queryKey: ["discover", "search", query],
    queryFn: () => search.query(query).catch(() => ({ results: [], total: 0 })),
    enabled: query.trim().length > 2,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDiscoverResearchers(query?: string) {
  return useQuery({
    queryKey: ["discover", "researchers", query],
    queryFn: () => community.researchers({ q: query }).catch(() => ({ researchers: [], total: 0 })),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFollowResearcher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (researcherId: string) => community.follow(researcherId).catch(() => {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discover", "researchers"] });
    },
  });
}
