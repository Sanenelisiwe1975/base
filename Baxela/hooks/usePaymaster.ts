import { useState, useCallback } from "react";
import { 
  isPaymasterConfigured,
  publicClient,
  sendSponsoredTransaction,
  type PaymasterSponsoredTransaction,
  type PaymasterResult 
} from "@/lib/paymaster";
import { useBaseAccount } from "@/components/FeatureAccess";
import { toast } from "react-hot-toast";

export function usePaymaster() {
  const { isConnected, address } = useBaseAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTransaction = useCallback(async (
    transaction: PaymasterSponsoredTransaction
  ): Promise<PaymasterResult | null> => {
    if (!isConnected || !address) {
      setError("Base Account not connected");
      return null;
    }

    if (!isPaymasterConfigured()) {
      setError("Paymaster not configured");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Note: This is a simplified implementation
      // In a real scenario, you would need to integrate with Base Account's transaction methods
      const result: PaymasterResult = {
        success: true,
        message: "Transaction would be sponsored (demo mode)",
        transactionHash: "0x" + Math.random().toString(16).substring(2, 66) as `0x${string}`,
      };

      toast.success("Transaction sponsored successfully (demo mode)!");
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
      toast.error(`Transaction failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
        message: "Transaction failed",
      };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  const sponsorTransaction = useCallback(async (
    transaction: PaymasterSponsoredTransaction
  ): Promise<boolean> => {
    const result = await executeTransaction(transaction);
    return result !== null;
  }, [executeTransaction]);

  return {
    executeTransaction,
    sponsorTransaction,
    isLoading,
    error,
    isConfigured: isPaymasterConfigured(),
    isAuthenticated: isConnected,
  };
}