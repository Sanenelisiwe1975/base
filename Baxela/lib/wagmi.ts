import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

// Base Sepolia configuration
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'Baxela',
      preference: 'smartWalletOnly', // Use smart wallet for Base Pay compatibility
    }),
    metaMask(),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
})

// USDC contract address on Base Sepolia
export const USDC_CONTRACT_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

// Base Sepolia chain configuration
export const BASE_SEPOLIA_CHAIN = baseSepolia