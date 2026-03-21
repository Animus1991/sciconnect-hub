import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { funding } from "@/lib/api";
import { toast } from "sonner";

export function useFundingList() {
  return useQuery({
    queryKey: ["funding"],
    queryFn: () => funding.list(),
    staleTime: 30_000,
  });
}

export function useFundingDetail(id: string | null) {
  return useQuery({
    queryKey: ["funding", id],
    queryFn: () => funding.get(id!),
    enabled: !!id,
  });
}

export function useFundingStats() {
  return useQuery({
    queryKey: ["funding", "stats"],
    queryFn: () => funding.stats(),
    staleTime: 60_000,
  });
}

export function useCreateGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof funding.create>[0]) => funding.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["funding"] });
      toast.success("Grant created successfully");
    },
    onError: () => toast.error("Failed to create grant"),
  });
}

export function useUpdateGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => funding.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["funding"] });
      toast.success("Grant updated");
    },
    onError: () => toast.error("Failed to update grant"),
  });
}
