"use client";

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { pay, getPaymentStatus } from '@base-org/account';
import toast from 'react-hot-toast';
import { parseUnits } from 'viem';
import { USDC_CONTRACT_ADDRESS } from '@/lib/wagmi';
import { useBaseAccount } from '@/components/FeatureAccess';

interface BasePayProps {
  amount: string;
  currency: string;
  description: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  recipientAddress?: string; // Address to receive the payment
}

export default function BasePay({
  amount,
  currency,
  description,
  onSuccess,
  onError,
  disabled = false,
  recipientAddress = process.env.NEXT_PUBLIC_BASE_PAY_RECIPIENT_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e' // Default recipient address
}: BasePayProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { address, isConnected } = useBaseAccount();
  const { writeContract } = useWriteContract();

  // USDC ERC-20 ABI (minimal for transfer)
  const USDC_ABI = [
    {
      name: 'transfer',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    }
  ] as const;

  const handlePayment = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      onError('Wallet not connected');
      return;
    }

    setIsProcessing(true);
    
    try {
      toast.loading('Initiating Base Pay transaction...');
      
      // Use the official Base Pay SDK
      const payment = await pay({
        amount: amount, // USD amount (USDC used internally)
        to: recipientAddress, // Recipient address
        testnet: true // Set to true for Base Sepolia
      });
      
      toast.loading('Confirming payment...');
      
      // Poll for payment status
      const pollPaymentStatus = async (paymentId: string): Promise<any> => {
        let attempts = 0;
        const maxAttempts = 30; // 30 attempts with 2-second intervals = 1 minute timeout
        
        while (attempts < maxAttempts) {
          try {
            const { status, ...statusData } = await getPaymentStatus({
              id: paymentId,
              testnet: true // Must match the testnet setting used in pay()
            });
            
            if (status === 'completed') {
              return { status, ...statusData };
            } else if (status === 'failed') {
              throw new Error('Payment failed during processing');
            }
            
            // Wait 2 seconds before next check
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
          } catch (error) {
            console.error('Error checking payment status:', error);
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        throw new Error('Payment confirmation timeout');
      };
      
      // Wait for payment confirmation
      const finalStatus = await pollPaymentStatus(payment.id);
      
      toast.success(`Payment successful! Transaction ID: ${payment.id}`);
      onSuccess(payment.id);
      
    } catch (error: any) {
      console.error('Base Pay SDK error:', error);
      
      // Try fallback payment method using direct USDC transfer
      try {
        toast.loading('Trying alternative payment method...');
        
        const amountInWei = parseUnits(amount.toString(), 6); // USDC has 6 decimals
        
        writeContract({
          address: USDC_CONTRACT_ADDRESS,
          abi: USDC_ABI,
          functionName: 'transfer',
          args: [recipientAddress as `0x${string}`, amountInWei],
        });
        
        toast.success('Payment initiated! Please confirm the transaction in your wallet.');
        onSuccess('Payment initiated via fallback method');
        
      } catch (fallbackError: any) {
        console.error('Fallback payment error:', fallbackError);
        let errorMessage = 'Payment failed';
        
        // Extract error message from various error formats
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.reason) {
          errorMessage = error.reason;
        } else if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        // Handle specific error cases with user-friendly messages
        if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
          errorMessage = 'Payment was cancelled by user';
        } else if (errorMessage.includes('insufficient') || errorMessage.includes('Insufficient')) {
          errorMessage = 'Insufficient USDC balance. Please add USDC to your wallet.';
        } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
          errorMessage = 'Network error - please check your connection and try again';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
          errorMessage = 'Payment confirmation timeout - please check your transaction status';
        } else if (errorMessage.includes('not supported') || errorMessage.includes('unsupported')) {
          errorMessage = 'This wallet does not support payments. Please use a compatible wallet.';
        } else if (errorMessage.includes('failed during processing')) {
          errorMessage = 'Payment failed during processing. Please try again.';
        } else if (errorMessage.includes('Invalid') || errorMessage.includes('invalid')) {
          errorMessage = 'Invalid payment parameters. Please contact support.';
        } else if (errorMessage === 'Payment failed') {
          errorMessage = 'Payment failed. Please ensure you have USDC on Base Sepolia and try again.';
        }
        
        toast.error(errorMessage);
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        disabled={disabled || isProcessing || !isConnected}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing Payment...
          </>
        ) : (
          <>
            Pay ${amount} USDC with Base Pay
          </>
        )}
      </button>
      
      {!isConnected && (
        <p className="text-sm text-gray-600 text-center">
          Connect your wallet to make payments
        </p>
      )}
      
      {isConnected && address && (
        <p className="text-xs text-green-600 text-center">
          Wallet connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      )}
      
      <p className="text-xs text-gray-500 text-center">
        Powered by Base Pay • Testnet Mode
      </p>
    </div>
  );
}