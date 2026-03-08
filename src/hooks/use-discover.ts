import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export interface DiscoverCollection {
  id: string;
  title: string;
  description: string;
  curator: string;
  paperCount: number;
  followers: number;
  tags: string[];
}

// ─── API functions (fallback to mock when backend unavailable) ────────────────
async function fetchTrendingPapers(params?: { sort?: string; page?: number; limit?: number }): Promise<DiscoverPaper[]> {
  try {
    const res = await api.get("/discover/trending", { params });
    return res.data;
  } catch {
    // Fallback: return empty — components use their own mock data
    return [];
  }
}

async function fetchResearchers(params?: { query?: string }): Promise<DiscoverResearcher[]> {
  try {
    const res = await api.get("/discover/researchers", { params });
    return res.data;
  } catch {
    return [];
  }
}

async function fetchCollections(): Promise<DiscoverCollection[]> {
  try {
    const res = await api.get("/discover/collections");
    return res.data;
  } catch {
    return [];
  }
}

async function searchPapers(query: string): Promise<DiscoverPaper[]> {
  try {
    const res = await api.get("/search", { params: { q: query } });
    return res.data;
  } catch {
    return [];
  }
}

async function saveToReadingList(paperId: string): Promise<void> {
  await api.post("/reading-list", { paperId });
}

async function followResearcher(researcherId: string): Promise<void> {
  await api.post(`/researchers/${researcherId}/follow`);
}

// ─── Hooks ───────────────────────────────────────────────────────────────────
export function useTrendingPapers(sort: string = "velocity", page: number = 1) {
  return useQuery({
    queryKey: ["discover", "trending", sort, page],
    queryFn: () => fetchTrendingPapers({ sort, page, limit: 10 }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useDiscoverResearchers(query?: string) {
  return useQuery({
    queryKey: ["discover", "researchers", query],
    queryFn: () => fetchResearchers({ query }),
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });
}

export function useDiscoverCollections() {
  return useQuery({
    queryKey: ["discover", "collections"],
    queryFn: fetchCollections,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSearchPapers(query: string) {
  return useQuery({
    queryKey: ["discover", "search", query],
    queryFn: () => searchPapers(query),
    enabled: query.trim().length > 2,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSaveToReadingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveToReadingList,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reading-list"] });
    },
  });
}

export function useFollowResearcher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: followResearcher,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discover", "researchers"] });
    },
  });
}
