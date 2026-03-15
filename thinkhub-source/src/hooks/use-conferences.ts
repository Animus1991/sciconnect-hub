import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conferences } from "@/lib/api";
import { toast } from "sonner";

export function useConferenceList(params?: { type?: string; field?: string }) {
  return useQuery({
    queryKey: ["conferences", params],
    queryFn: () => conferences.list(params),
    staleTime: 30_000,
  });
}

export function useConferenceDetail(id: string | null) {
  return useQuery({
    queryKey: ["conferences", id],
    queryFn: () => conferences.get(id!),
    enabled: !!id,
  });
}

export function useCreateConference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof conferences.create>[0]) => conferences.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conferences"] });
      toast.success("Conference added");
    },
    onError: () => toast.error("Failed to add conference"),
  });
}

export function useAddSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ confId, data }: { confId: string; data: { title: string; type: string } }) =>
      conferences.addSubmission(confId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conferences"] });
      toast.success("Submission added");
    },
    onError: () => toast.error("Failed to add submission"),
  });
}

export function useToggleAttend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conferences.toggleAttend(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conferences"] }),
  });
}

export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: ["conferences", "deadlines"],
    queryFn: () => conferences.upcomingDeadlines(),
    staleTime: 60_000,
  });
}
