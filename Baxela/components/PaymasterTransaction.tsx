"use client";

import { useState } from "react";
import { usePaymaster } from "@/hooks/usePaymaster";
import { parseEther, isAddress } from "viem";

interface PaymasterTransactionProps {
  className?: string;
}

export function PaymasterTransaction({ className = "" }: PaymasterTransactionProps) {
  const { 
    executeTransaction, 
    isLoading, 
    error, 
    isConfigured, 
    isAuthenticated 
  } = usePaymaster();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      alert("Please fill in all fields");
      return;
    }

    if (!isAddress(recipient)) {
      alert("Invalid recipient address");
      return;
    }

    try {
      const result = await executeTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });

      if (result && result.success) {
        setTxHash(result.transactionHash || "");
        setRecipient("");
        setAmount("");
      }
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  const handleSampleTransaction = async () => {
    // Sample transaction to a test address (replace with actual test address)
    const sampleAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Example address
    
    try {
      const result = await executeTransaction({
        to: sampleAddress,
        value: parseEther("0.001"), // 0.001 ETH
      });

      if (result && result.success) {
        setTxHash(result.transactionHash || "");
      }
    } catch (err) {
      console.error("Sample transaction failed:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please sign in to use paymaster-sponsored transactions.
          </p>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-yellow-800">Paymaster Not Configured</h3>
          <p className="mt-1 text-sm text-yellow-600">
            Please configure your paymaster settings in the environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sponsored Transactions
        </h3>
        <p className="text-sm text-gray-600">
          Send transactions with gas fees sponsored by the Base paymaster.
        </p>
      </div>

      {/* Quick Sample Transaction */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-md font-medium text-blue-900 mb-2">Try a Sample Transaction</h4>
        <p className="text-sm text-blue-700 mb-3">
          Send a small amount (0.001 ETH) to a test address with sponsored gas.
        </p>
        <button
          onClick={handleSampleTransaction}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Send Sample Transaction</span>
            </>
          )}
        </button>
      </div>

      {/* Custom Transaction Form */}
      <form onSubmit={handleSendTransaction} className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (ETH)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.001"
            step="0.001"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !recipient || !amount}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Sending Transaction...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Send Sponsored Transaction</span>
            </>
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Transaction Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {txHash && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Transaction Successful!</h3>
              <p className="text-sm text-green-700 mt-1">
                Transaction Hash:{" "}
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs underline hover:no-underline"
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}