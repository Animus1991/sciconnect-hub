import { useCallback } from "react";
import { useNotifications } from "./use-notifications";

export type BlockchainEventType = "contribution_verified" | "bounty_posted" | "identity_revealed" | "sbt_earned";

interface BlockchainEvent {
  type: BlockchainEventType;
  title: string;
  message: string;
}

const EVENT_TYPE_MAP: Record<BlockchainEventType, "success" | "info" | "warning"> = {
  contribution_verified: "success",
  bounty_posted: "info",
  identity_revealed: "warning",
  sbt_earned: "success",
};

export function useBlockchainNotifications() {
  const { addNotification } = useNotifications();

  const notifyContributionVerified = useCallback((title: string) => {
    addNotification("success", "Contribution Verified On-Chain", `"${title}" has been cryptographically verified and anchored to the blockchain.`);
  }, [addNotification]);

  const notifyBountyPosted = useCallback((title: string, tokens: number) => {
    addNotification("info", "New Reproducibility Bounty", `"${title}" — ${tokens} reputation tokens available for successful replication.`);
  }, [addNotification]);

  const notifyIdentityRevealed = useCallback((reviewerName: string, manuscriptTitle: string) => {
    addNotification("warning", "Reviewer Identity Revealed", `${reviewerName} has revealed their identity for the review of "${manuscriptTitle}".`);
  }, [addNotification]);

  const notifySBTEarned = useCallback((tokenName: string, rarity: string) => {
    addNotification("success", `Soulbound Token Earned: ${tokenName}`, `Congratulations! You earned a ${rarity} SBT credential that is permanently bound to your academic identity.`);
  }, [addNotification]);

  const notifyBlockchainEvent = useCallback((event: BlockchainEvent) => {
    const notifType = EVENT_TYPE_MAP[event.type] || "info";
    addNotification(notifType, event.title, event.message);
  }, [addNotification]);

  return {
    notifyContributionVerified,
    notifyBountyPosted,
    notifyIdentityRevealed,
    notifySBTEarned,
    notifyBlockchainEvent,
  };
}
