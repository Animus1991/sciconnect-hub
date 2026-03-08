import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Publication {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  journal: string;
  date: string;
  tags: string[];
  citations: number;
  likes: number;
  comments: number;
  doi?: string;
  type: "paper" | "preprint" | "dataset" | "code";
  status: "published" | "under review" | "draft" | "preprint";
  lastEdited: string;
  views: number;
  altmetric: number;
  openAccess?: boolean;
  impactFactor?: number;
  readingTime?: number;
  citationTrend?: number[];
}

export interface PublicationStats {
  total: number;
  published: number;
  underReview: number;
  drafts: number;
  totalCitations: number;
  totalViews: number;
  hIndex: number;
  i10Index: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────
async function fetchPublications(params?: { status?: string; sort?: string; q?: string }): Promise<Publication[]> {
  try {
    const res = await api.get("/publications", { params });
    return res.data;
  } catch {
    return [];
  }
}

async function fetchPublicationStats(): Promise<PublicationStats | null> {
  try {
    const res = await api.get("/publications/stats");
    return res.data;
  } catch {
    return null;
  }
}

async function createPublication(data: Partial<Publication>): Promise<Publication> {
  const res = await api.post("/publications", data);
  return res.data;
}

async function updatePublication(id: string, data: Partial<Publication>): Promise<Publication> {
  const res = await api.put(`/publications/${id}`, data);
  return res.data;
}

async function deletePublication(id: string): Promise<void> {
  await api.delete(`/publications/${id}`);
}

async function exportPublications(ids: string[], format: string): Promise<Blob> {
  const res = await api.post("/publications/export", { ids, format }, { responseType: "blob" });
  return res.data;
}

async function importPublications(file: File): Promise<{ count: number }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/publications/import", formData);
  return res.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────
export function usePublications(params?: { status?: string; sort?: string; q?: string }) {
  return useQuery({
    queryKey: ["publications", params],
    queryFn: () => fetchPublications(params),
    staleTime: 3 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function usePublicationStats() {
  return useQuery({
    queryKey: ["publications", "stats"],
    queryFn: fetchPublicationStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPublication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}

export function useUpdatePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Publication> }) => updatePublication(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}

export function useDeletePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePublication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}

export function useExportPublications() {
  return useMutation({
    mutationFn: ({ ids, format }: { ids: string[]; format: string }) => exportPublications(ids, format),
  });
}

export function useImportPublications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: importPublications,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}
