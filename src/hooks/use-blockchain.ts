import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blockchain } from "@/lib/api";
import { toast } from "sonner";

export function useContributions(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ["blockchain", "contributions", params],
    queryFn: () => blockchain.contributions(params),
    staleTime: 30_000,
  });
}

export function useCreateContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof blockchain.createContribution>[0]) => blockchain.createContribution(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blockchain"] });
      toast.success("Contribution registered");
    },
    onError: () => toast.error("Failed to register contribution"),
  });
}

export function useVerifyContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blockchain.verifyContribution(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blockchain"] });
      toast.success("Contribution verified");
    },
  });
}

export function useProvenanceGraph() {
  return useQuery({
    queryKey: ["blockchain", "provenance"],
    queryFn: () => blockchain.provenance(),
    staleTime: 60_000,
  });
}

export function useBlockchainReviews() {
  return useQuery({
    queryKey: ["blockchain", "reviews"],
    queryFn: () => blockchain.reviews(),
    staleTime: 30_000,
  });
}

export function useBounties(params?: { status?: string }) {
  return useQuery({
    queryKey: ["blockchain", "bounties", params],
    queryFn: () => blockchain.bounties(params),
    staleTime: 30_000,
  });
}

export function useReputation() {
  return useQuery({
    queryKey: ["blockchain", "reputation"],
    queryFn: () => blockchain.reputation(),
    staleTime: 60_000,
  });
}

export function useBlockchainEvents(params?: { type?: string; unread?: string }) {
  return useQuery({
    queryKey: ["blockchain", "events", params],
    queryFn: () => blockchain.events(params),
    staleTime: 15_000,
  });
}

export function useVerifyDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { documentType: string; documentId: string; title: string; content?: string; author?: string }) =>
      fetch("/api/blockchain/verify-document", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blockchain"] });
      toast.success("Document hash anchored to blockchain");
    },
    onError: () => toast.error("Document verification failed"),
  });
}

export function useVerifyCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { credentialType: string; holder: string; institution?: string; details?: string }) =>
      fetch("/api/blockchain/verify-credential", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blockchain"] });
      toast.success("Credential verified on-chain");
    },
    onError: () => toast.error("Credential verification failed"),
  });
}

export function useAuditTrail(workspace?: string) {
  return useQuery({
    queryKey: ["blockchain", "audit-trail", workspace],
    queryFn: () => blockchain.events({ type: workspace }),
    staleTime: 30_000,
  });
}

export function useSmartContractMilestones(grantId?: string) {
  return useQuery({
    queryKey: ["blockchain", "milestones", grantId],
    queryFn: () => fetch(`/api/blockchain/milestones/${grantId}`).then(r => r.json()),
    enabled: !!grantId,
    staleTime: 60_000,
  });
}
