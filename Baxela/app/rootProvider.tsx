"use client";

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import TranslationProvider from '@/components/TranslationProvider';
import { BaseAccountProvider } from '@/components/FeatureAccess';
import { config } from '@/lib/wagmi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface RootProviderProps {
  children: ReactNode;
}

export default function RootProvider({ children }: RootProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TranslationProvider>
          <BaseAccountProvider>
            {children}
          </BaseAccountProvider>
        </TranslationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
