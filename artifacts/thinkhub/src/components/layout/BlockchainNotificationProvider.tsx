import React from 'react';
import { useBlockchainNotificationService } from '@/lib/blockchain-notification-service';

interface BlockchainNotificationProviderProps {
  children: React.ReactNode;
}

export function BlockchainNotificationProvider({ children }: BlockchainNotificationProviderProps) {
  // Initialize the blockchain notification service
  useBlockchainNotificationService();

  return <>{children}</>;
}