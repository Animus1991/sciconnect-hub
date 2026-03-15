import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { protocols } from "@/lib/api";
import { toast } from "sonner";

export function useProtocolList(params?: { category?: string; status?: string }) {
  return useQuery({
    queryKey: ["protocols", params],
    queryFn: () => protocols.list(params),
    staleTime: 30_000,
  });
}

export function useProtocolDetail(id: string | null) {
  return useQuery({
    queryKey: ["protocols", id],
    queryFn: () => protocols.get(id!),
    enabled: !!id,
  });
}

export function useCreateProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof protocols.create>[0]) => protocols.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["protocols"] });
      toast.success("Protocol created");
    },
    onError: () => toast.error("Failed to create protocol"),
  });
}

export function useForkProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => protocols.fork(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["protocols"] });
      toast.success("Protocol forked");
    },
  });
}

export function useStarProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => protocols.star(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["protocols"] }),
  });
}
