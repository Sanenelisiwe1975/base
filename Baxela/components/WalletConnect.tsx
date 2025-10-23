"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from './TranslationProvider';
import toast from 'react-hot-toast';
import { useBaseAccount } from './FeatureAccess';
import { SignInWithBaseButton } from '@base-org/account-ui/react';

interface WalletConnectProps {
  className?: string;
}

interface BaseAccountProvider {
  request: (params: any) => Promise<any>;
}

declare global {
  interface Window {
    createBaseAccountSDK: (config: {
      appName: string;
      appLogoUrl?: string;
    }) => {
      getProvider: () => BaseAccountProvider;
    };
    base: {
      pay: (params: {
        amount: string;
        to: string;
        testnet?: boolean;
      }) => Promise<{ id: string }>;
      getPaymentStatus: (params: {
        id: string;
        testnet?: boolean;
      }) => Promise<{ status: string }>;
    };
  }
}

export function WalletConnect({ className = "" }: WalletConnectProps) {
  const { t } = useTranslation();
  const { isConnected, address, setConnection } = useBaseAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<BaseAccountProvider | null>(null);
  const [user, setUser] = useState<{
    address: string;
    signature?: string;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Base Account SDK
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@base-org/account/dist/base-account.min.js';
    script.onload = () => {
      if (window.createBaseAccountSDK) {
        const sdk = window.createBaseAccountSDK({
          appName: 'Baxela',
          appLogoUrl: '/sphere.svg',
        });
        setProvider(sdk.getProvider());
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const generateNonce = () => {
    return window.crypto.randomUUID().replace(/-/g, '');
  };

  const handleConnect = async () => {
    if (!provider) {
      toast.error('Base Account SDK not loaded');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get accounts first
      const { accounts } = await provider.request({
        method: 'wallet_connect',
        params: [{
          version: '1',
          capabilities: {
            signInWithEthereum: { 
              nonce: generateNonce(), 
              chainId: '0x2105' // Base Mainnet - 8453
            }
          }
        }]
      });
      
      const account = accounts[0];
      const userAddress = account.address;

      // Create authentication message
      const message = `Sign in to Baxela at ${Date.now()}`;
      
      // Sign the message
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, userAddress]
      });

      // Set user state with authentication data
      const userData = {
        address: userAddress,
        signature: signature,
        timestamp: Date.now()
      };

      setUser(userData);
      setConnection(true, userAddress);
      
      toast.success(`Connected to Base Account: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`);
      
      console.log('Authentication successful:', userData);
      
    } catch (error: any) {
      console.error('Connection error:', error);
      setError(error.message || 'Authentication failed');
      toast.error(`Connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setUser(null);
    setError(null);
    setConnection(false);
    toast.success('Disconnected from Base Account');
  };

  const handlePay = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      
      // Simulate Base Account payment
      const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Record the payment for analytics access
      const response = await fetch('/api/analytics/premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          transactionId: paymentId
        })
      });

      if (response.ok) {
        toast.success('Payment successful! Premium analytics unlocked for 30 days');
      } else {
        throw new Error('Payment recording failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected && address) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ✅ Base Account Connected
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          {user && (
            <p className="text-xs text-gray-500">
              Authenticated at {new Date(user.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handlePay}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Pay with Base (5 USDC)
          </button>
          
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Disconnect
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Base Account Features</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• One-tap USDC payments</li>
            <li>• Sign in with Ethereum (SIWE)</li>
            <li>• No seed phrases or private key management</li>
            <li>• Secure passkey authentication</li>
            <li>• Built on Base L2 for fast, low-cost transactions</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sign in with Base
        </h3>
        <p className="text-sm text-gray-600">
          Connect with your Base Account - no app or extension required
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="flex justify-center">
        <SignInWithBaseButton 
          align="center"
          variant="solid"
          colorScheme="light"
          size="large"
          disabled={isLoading || !provider}
          onClick={handleConnect}
          onSignInResult={(result) => {
            if (result.success) {
              console.log('Sign in successful via button callback');
            } else {
              console.error('Sign in failed via button callback:', result.error);
            }
          }}
        />
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm">Connecting...</span>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Base Account Features</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• One-tap USDC payments</li>
          <li>• Sign in with Ethereum (SIWE)</li>
          <li>• No seed phrases or private key management</li>
          <li>• Secure passkey authentication</li>
          <li>• Built on Base L2 for fast, low-cost transactions</li>
        </ul>
      </div>
    </div>
  );
}