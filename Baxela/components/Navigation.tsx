"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<BaseAccountProvider | null>(null);
  const [user, setUser] = useState<{
    address: string;
    signature?: string;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

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
      setIsConnected(true);
      setAddress(userAddress);
      
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
    setIsConnected(false);
    setAddress(null);
    setShowAccountMenu(false);
    toast.success('Disconnected from Base Account');
  };

  const handlePay = async () => {
    if (!window.base) {
      toast.error('Base Pay not available');
      return;
    }

    try {
      toast.loading('Processing payment...');
      
      const result = await window.base.pay({
        amount: "5.00", // USD – SDK quotes equivalent USDC
        to: "0x2211d1D0020DAEA8039E46Cf1367962070d77DA9",
        testnet: true // set to false for Mainnet
      });

      const status = await window.base.getPaymentStatus({
        id: result.id,
        testnet: true
      });
      
      toast.dismiss();
      toast.success(`Payment completed! Status: ${status.status}`);
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Payment failed: ${error.message}`);
    }
  };

  return (
    <nav className={`flex items-center justify-between p-4 ${className}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
      {/* Logo */}
      <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#065f46', textDecoration: 'none' }}>
        Baxela
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-6" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link href="/report" style={{ color: '#1e40af', textDecoration: 'none', fontWeight: '600', transition: 'color 0.3s ease' }} 
              onMouseEnter={(e) => e.target.style.color = '#dc2626'}
              onMouseLeave={(e) => e.target.style.color = '#1e40af'}>
          Report an Incident
        </Link>
        <Link href="/dashboard" style={{ color: '#1e40af', textDecoration: 'none', fontWeight: '600', transition: 'color 0.3s ease' }}
              onMouseEnter={(e) => e.target.style.color = '#dc2626'}
              onMouseLeave={(e) => e.target.style.color = '#1e40af'}>
          View Dashboard
        </Link>
        <Link href="/analytics" style={{ color: '#1e40af', textDecoration: 'none', fontWeight: '600', transition: 'color 0.3s ease' }}
              onMouseEnter={(e) => e.target.style.color = '#dc2626'}
              onMouseLeave={(e) => e.target.style.color = '#1e40af'}>
          Analytics
        </Link>
        <Link href="/wallet" style={{ color: '#1e40af', textDecoration: 'none', fontWeight: '600', transition: 'color 0.3s ease' }}
              onMouseEnter={(e) => e.target.style.color = '#dc2626'}
              onMouseLeave={(e) => e.target.style.color = '#1e40af'}>
          Wallet
        </Link>
      </div>

      {/* Base Account Section */}
      <div className="flex items-center space-x-3">
        {isConnected && address ? (
          <div className="relative">
            {/* Connected State */}
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #bbf7d0',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f0fdf4'}
            >
              <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showAccountMenu && (
              <div style={{
                position: 'absolute',
                right: '0',
                marginTop: '0.5rem',
                width: '256px',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                zIndex: 50
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>Base Account</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {address}
                  </p>
                  {user && (
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      Connected at {new Date(user.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
                
                <div style={{ padding: '0.5rem' }}>
                  <button
                    onClick={handlePay}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#eff6ff';
                      e.target.style.color = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#374151';
                    }}
                  >
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Pay with Base (5 USDC)</span>
                  </button>
                  
                  <button
                    onClick={handleDisconnect}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Sign In Button */
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                marginRight: '0.5rem'
              }}>
                <p style={{ fontSize: '0.75rem', color: '#dc2626' }}>{error}</p>
              </div>
            )}
            
            <button
              onClick={handleConnect}
              disabled={isLoading || !provider}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                opacity: (isLoading || !provider) ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading && provider) {
                  e.target.style.backgroundColor = '#1d4ed8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && provider) {
                  e.target.style.backgroundColor = '#2563eb';
                }
              }}
            >
              Sign In with Base
            </button>
            
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2563eb', marginLeft: '0.5rem' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #2563eb',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ fontSize: '0.75rem' }}>Connecting...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Button (for future mobile responsiveness) */}
      <button className="md:hidden p-2 text-gray-600 hover:text-gray-900" style={{ display: 'none' }}>
        <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </nav>
  );
}