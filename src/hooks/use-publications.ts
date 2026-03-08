import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { publications as pubApi } from "@/lib/api";

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
}

// ─── Hooks ───────────────────────────────────────────────────────────────────
export function usePublications(params?: { status?: string; sort?: string; q?: string }) {
  return useQuery({
    queryKey: ["publications", params],
    queryFn: () => pubApi.list(params).catch(() => ({ publications: [], total: 0, stats: null })),
    staleTime: 3 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useCreatePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Publication>) => pubApi.create(data as any).catch(() => null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}

export function useDeletePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pubApi.get(id).catch(() => null), // placeholder until delete endpoint exists
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}
      qc.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}
