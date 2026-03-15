import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { citations } from "@/lib/api";
import { toast } from "sonner";

export function useCitationList(params?: { collection?: string; type?: string; q?: string }) {
  return useQuery({
    queryKey: ["citations", params],
    queryFn: () => citations.list(params),
    staleTime: 30_000,
  });
}

export function useCitationCollections() {
  return useQuery({
    queryKey: ["citations", "collections"],
    queryFn: () => citations.collections(),
    staleTime: 60_000,
  });
}

export function useCreateCitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof citations.create>[0]) => citations.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["citations"] });
      toast.success("Citation added");
    },
    onError: () => toast.error("Failed to add citation"),
  });
}

export function useImportBibtex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bibtex: string) => citations.importBibtex(bibtex),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["citations"] });
      toast.success(`Imported ${data.imported} citations`);
    },
    onError: () => toast.error("BibTeX import failed"),
  });
}

export function useImportDois() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dois: string[]) => citations.importDois(dois),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["citations"] });
      toast.success(`Resolved ${data.resolved} DOIs`);
    },
    onError: () => toast.error("DOI resolution failed"),
  });
}

export function useToggleCitationStar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => citations.toggleStar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["citations"] }),
  });
}

export function useExportBibtex() {
  return useMutation({
    mutationFn: (ids?: string[]) => citations.exportBibtex(ids),
    onSuccess: (data) => toast.success(`Exported ${data.count} citations as BibTeX`),
    onError: () => toast.error("Export failed"),
  });
}
