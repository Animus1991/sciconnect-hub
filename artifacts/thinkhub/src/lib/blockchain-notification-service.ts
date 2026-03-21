import { useCallback, useEffect, useRef } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { mockHash, mockTxId } from "./blockchain-utils";

export interface BlockchainEvent {
  type: "contribution_verified" | "sbt_earned" | "bounty_posted" | "identity_revealed" | "document_anchored";
  title: string;
  message: string;
  txId: string;
  blockchainStatus: "pending" | "anchored" | "verified";
  blockchainNetwork: string;
  explorerUrl: string;
  timestamp: string;
}

// Mock blockchain event simulator for demonstration
class BlockchainEventSimulator {
  private subscribers: Array<(event: BlockchainEvent) => void> = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  subscribe(callback: (event: BlockchainEvent) => void) {
    this.subscribers.push(callback);
    
    // Start simulating events if this is the first subscriber
    if (this.subscribers.length === 1) {
      this.startSimulation();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
      if (this.subscribers.length === 0) {
        this.stopSimulation();
      }
    };
  }

  private startSimulation() {
    // Simulate events every 30 seconds for demo purposes
    this.intervalId = setInterval(() => {
      // Respect the user's blockchain popup notification preference (off by default)
      if (localStorage.getItem("blockchain-notifications-enabled") !== "true") return;

      const eventTypes = ["contribution_verified", "sbt_earned", "bounty_posted"] as const;
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      const mockEvent = this.generateMockEvent(randomType);
      this.subscribers.forEach(callback => callback(mockEvent));
    }, 30000);
  }

  private stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private generateMockEvent(type: BlockchainEvent["type"]): BlockchainEvent {
    const now = new Date().toISOString();
    const txId = mockTxId(`${type}_${now}`);
    const network = "hedera-testnet";
    const explorerUrl = `https://hashscan.io/testnet/transaction/${txId}`;

    switch (type) {
      case "contribution_verified":
        return {
          type,
          title: "Contribution Verified On-Chain",
          message: "Your research contribution has been cryptographically verified and anchored to the blockchain.",
          txId,
          blockchainStatus: "verified",
          blockchainNetwork: network,
          explorerUrl,
          timestamp: now,
        };
      
      case "sbt_earned":
        return {
          type,
          title: "Soulbound Token Earned",
          message: "Congratulations! You earned a new SBT credential that is permanently bound to your academic identity.",
          txId,
          blockchainStatus: "verified",
          blockchainNetwork: network,
          explorerUrl,
          timestamp: now,
        };
      
      case "bounty_posted":
        return {
          type,
          title: "New Reproducibility Bounty",
          message: "A new bounty has been posted for research replication — 500 reputation tokens available.",
          txId,
          blockchainStatus: "anchored",
          blockchainNetwork: network,
          explorerUrl,
          timestamp: now,
        };
      
      default:
        return {
          type: "document_anchored",
          title: "Document Anchored",
          message: "Your document has been successfully anchored to the blockchain.",
          txId,
          blockchainStatus: "anchored",
          blockchainNetwork: network,
          explorerUrl,
          timestamp: now,
        };
    }
  }

  // Manual trigger methods for testing
  triggerContributionVerified(title: string) {
    const event = this.generateMockEvent("contribution_verified");
    event.message = `"${title}" has been cryptographically verified and anchored to the blockchain.`;
    this.subscribers.forEach(callback => callback(event));
  }

  triggerSBTEarned(tokenName: string, rarity: string = "rare") {
    const event = this.generateMockEvent("sbt_earned");
    event.title = `Soulbound Token Earned: ${tokenName}`;
    event.message = `Congratulations! You earned a ${rarity} SBT credential that is permanently bound to your academic identity.`;
    this.subscribers.forEach(callback => callback(event));
  }
}

// Singleton instance
export const blockchainEventSimulator = new BlockchainEventSimulator();

// React hook to use the blockchain notification service
export function useBlockchainNotificationService() {
  const { addNotification } = useNotifications();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleBlockchainEvent = useCallback((event: BlockchainEvent) => {
    // Add blockchain notification with all the special fields
    const notification = {
      id: `blockchain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "blockchain" as const,
      title: event.title,
      message: event.message,
      timestamp: new Date(event.timestamp),
      read: false,
      txId: event.txId,
      blockchainStatus: event.blockchainStatus,
      blockchainNetwork: event.blockchainNetwork,
      explorerUrl: event.explorerUrl,
    };

    // Use internal addNotification to avoid the toast
    addNotification("info", notification.title, notification.message);
  }, [addNotification]);

  // Subscribe to blockchain events
  useEffect(() => {
    unsubscribeRef.current = blockchainEventSimulator.subscribe(handleBlockchainEvent);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [handleBlockchainEvent]);

  // Return manual trigger functions for testing
  return {
    triggerContributionVerified: blockchainEventSimulator.triggerContributionVerified.bind(blockchainEventSimulator),
    triggerSBTEarned: blockchainEventSimulator.triggerSBTEarned.bind(blockchainEventSimulator),
  };
}