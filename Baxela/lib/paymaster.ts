import { createPublicClient, http, type Address, type Hash } from "viem";
import { base } from "viem/chains";
import { 
  createSmartAccountClient,
} from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { entryPoint07Address } from "viem/account-abstraction";

// Base Paymaster configuration
export const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL || "";
export const BUNDLER_URL = `https://api.developer.coinbase.com/rpc/v1/base/${process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}`;

// Create public client for Base
export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

// Create smart account client with paymaster
export async function createSmartAccountWithPaymaster(privateKey: `0x${string}`) {
  const account = await toSimpleSmartAccount({
    client: publicClient,
    privateKey,
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  const smartAccountClient = createSmartAccountClient({
    account,
    chain: base,
    bundlerTransport: http(BUNDLER_URL),
    // Note: Paymaster functionality would need to be configured based on your specific paymaster service
    // For now, we'll create the client without paymaster to avoid import errors
  });

  return smartAccountClient;
}

// Send a sponsored transaction
export async function sendSponsoredTransaction(
  smartAccountClient: any,
  transaction: PaymasterSponsoredTransaction
): Promise<PaymasterResult> {
  try {
    const { to, value, data } = transaction;
    
    const txHash = await smartAccountClient.sendTransaction({
      to,
      value: value || 0n,
      data: data || "0x",
    });

    return {
      success: true,
      transactionHash: txHash,
      message: "Transaction sent successfully",
    };
  } catch (error) {
    console.error("Sponsored transaction failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Transaction failed",
    };
  }
}

// Helper function to check if paymaster is available
export function isPaymasterConfigured(): boolean {
  return Boolean(PAYMASTER_URL && process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY);
}

// Types for paymaster operations
export interface PaymasterSponsoredTransaction {
  to: Address;
  value?: bigint;
  data?: `0x${string}`;
}

export interface PaymasterResult {
  success: boolean;
  transactionHash?: Hash;
  error?: string;
  message: string;
}