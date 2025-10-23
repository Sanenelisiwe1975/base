"use client";

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';

// Context for Base Account connection state
interface BaseAccountContextType {
  isConnected: boolean;
  address: string | null;
  setConnection: (connected: boolean, address?: string) => void;
}

const BaseAccountContext = createContext<BaseAccountContextType>({
  isConnected: false,
  address: null,
  setConnection: () => {},
});

// Provider component to wrap the app
export function BaseAccountProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const setConnection = (connected: boolean, userAddress?: string) => {
    setIsConnected(connected);
    setAddress(connected ? userAddress || null : null);
  };

  // Check for existing connection on mount
  useEffect(() => {
    // Check localStorage or other persistence mechanism if needed
    const savedConnection = localStorage.getItem('baseAccountConnected');
    const savedAddress = localStorage.getItem('baseAccountAddress');
    
    if (savedConnection === 'true' && savedAddress) {
      setConnection(true, savedAddress);
    }
  }, []);

  // Save connection state to localStorage
  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem('baseAccountConnected', 'true');
      localStorage.setItem('baseAccountAddress', address);
    } else {
      localStorage.removeItem('baseAccountConnected');
      localStorage.removeItem('baseAccountAddress');
    }
  }, [isConnected, address]);

  return (
    <BaseAccountContext.Provider value={{ isConnected, address, setConnection }}>
      {children}
    </BaseAccountContext.Provider>
  );
}

// Hook to use Base Account connection state
export function useBaseAccount() {
  return useContext(BaseAccountContext);
}

// Hook for feature access (backward compatibility)
export function useFeatureAccess() {
  const { isConnected, address } = useBaseAccount();
  
  return {
    isConnected,
    address,
    hasAccess: (feature?: string) => {
      if (isConnected && address) {
        return true;
      }
      return false;
    }
  };
}

interface FeatureAccessProps {
  children: ReactNode;
  feature?: 'reporting' | 'analytics' | 'premium' | 'all';
  fallback?: ReactNode;
  className?: string;
}

export function FeatureAccess({ 
  children, 
  feature = 'all', 
  fallback,
  className = "" 
}: FeatureAccessProps) {
  const { isConnected, address } = useBaseAccount();

  // Check if user has access to the feature
  const hasAccess = () => {
    // If user is connected with Base Account, they have access to all features
    if (isConnected && address) {
      return true;
    }
    
    return false;
  };

  // If user has access, render the children
  if (hasAccess()) {
    return <div className={className}>{children}</div>;
  }

  // If fallback is provided, render it
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Default fallback based on feature type
  const getDefaultFallback = () => {
    const baseClasses = "bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center";
    
    switch (feature) {
      case 'reporting':
        return (
          <div className={baseClasses}>
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Incident Reporting Locked
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Base Account to report incidents and help improve community safety.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
              Connect Base Account
            </button>
          </div>
        );
      
      case 'analytics':
        return (
          <div className={baseClasses}>
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Analytics Dashboard Locked
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Base Account to access detailed analytics and insights about incident data.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
              Connect Base Account
            </button>
          </div>
        );
      
      case 'premium':
        return (
          <div className={baseClasses}>
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Premium Features Locked
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Base Account to unlock premium features and advanced functionality.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
              Connect Base Account
            </button>
          </div>
        );
      
      default:
        return (
          <div className={baseClasses}>
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Feature Locked
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Base Account to access this feature.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
              Connect Base Account
            </button>
          </div>
        );
    }
  };

  return <div className={className}>{getDefaultFallback()}</div>;
}