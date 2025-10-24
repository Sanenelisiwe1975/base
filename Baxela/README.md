# Baxela DApp

A Next.js (App Router) dApp for incident reporting, wallet connection, payments on Base, IPFS storage, and an analytics dashboard with premium access.

## Features
- Wallet connection via Coinbase Wallet and MetaMask
- USDC payments with `BasePay` to a configurable recipient address
- Sponsored transactions via Paymaster and Bundler
- IPFS uploads (Pinata) for incident data/media
- Incident reporting with map and location permissions
- Analytics dashboard with premium features gated by payment history
- Multi-language UI using a lightweight translation provider and `locales/`

## Tech Stack
- Next.js 13+ (App Router)
- React, TypeScript
- Wagmi and `@coinbase/wallet-sdk`
- OnchainKit (optional)
- Pinata IPFS SDK

## Project Structure
- `app/` — pages and routes (`analytics`, `incidents`, `dashboard`, `api`)
- `components/` — UI components (`WalletConnect`, `BasePay`, `AnalyticsDashboard`, etc.)
- `hooks/` — reusable hooks (`usePaymaster`, `useLocation`)
- `lib/` — blockchain, wagmi, IPFS, payments, paymaster utilities
- `locales/` — translations for multiple languages
- `contracts/` — Solidity contract(s)

## Setup
1. Node.js 18+ and npm installed
2. Install dependencies: `npm install`
3. Create `.env.local` with the environment variables below
4. Run dev server: `npm run dev` and open `http://localhost:3000`

## Environment Variables
Set these in `.env.local` (or `.env` for local only). Required vars depend on the features you use.

- `NEXT_PUBLIC_PROJECT_NAME` — Display name used across UI
- `NEXT_PUBLIC_BASE_PAY_RECIPIENT_ADDRESS` — USDC payment recipient (checksummed EOA or contract)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — WalletConnect Project ID (optional)
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` — OnchainKit key (optional)
- `NEXT_PUBLIC_PAYMASTER_URL` — Paymaster service endpoint
- `NEXT_PUBLIC_BUNDLER_URL` — Bundler service endpoint
- `CDP_CLIENT_API_KEY` — Optional client key if required by your infra
- `PINATA_API_KEY` — Pinata IPFS API key
- `PINATA_API_SECRET` — Pinata IPFS secret
- `JWT_SECRET` — Secret for any server-side auth tokens

Tip: do not commit secrets. Prefer `.env.local`.

## Base Elements (Blockchain)
- Chain: Base Sepolia (testnet) configured in `lib/wagmi.ts`
- Wallets: Coinbase Wallet and MetaMask connectors
- USDC payments: `components/BasePay.tsx` sends payments to `NEXT_PUBLIC_BASE_PAY_RECIPIENT_ADDRESS`
- Sponsored tx: `lib/paymaster.ts` and `hooks/usePaymaster.ts` integrate with Paymaster/Bundler

## IPFS
- Library: `lib/ipfs.ts` uses Pinata to upload content to IPFS
- Configure `PINATA_API_KEY` and `PINATA_API_SECRET`
- Used by incident reporting and any media storage features

## Analytics
- Page: `app/analytics/page.tsx`
- Dashboard UI: `components/AnalyticsDashboard.tsx`
- Premium access: `lib/payments.ts` and `app/api/analytics/premium/route.ts`
- How it works:
  - Payment events are recorded and checked for premium eligibility
  - The dashboard conditionally unlocks premium features when access is granted

## Incidents
- Reporting form: `components/IncidentReportForm.tsx`
- Map and geolocation: `components/IncidentMap.tsx`, `components/UserLocationMap.tsx`, `components/LocationPermission.tsx`
- Blockchain interactions: `lib/blockchain.ts`, `contracts/IncidentRegistry.sol`

## Translations
- Lightweight provider: `components/TranslationProvider.tsx`
- Language files under `locales/<lang>/common.json`
- RTL support for languages like Arabic

## Development Notes
- Avoid passing non-plain objects (like `Map`/`Set`) from Server Components to Client Components. We use plain objects in `lib/payments.ts` to prevent serialization warnings.
- WalletConnect is optional; Coinbase Wallet and MetaMask are supported out of the box.
- If you enable additional i18n libraries, ensure configs don’t introduce non-serializable objects.

## Scripts
- `npm run dev` — Start local dev server
- `npm run build` — Build for production
- `npm run start` — Start production build

## Troubleshooting
- Set object warning in dev: from SSR serialization. Ensure your server-to-client props are plain objects.
- Wallet connection errors: verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` and that popup blockers are disabled.
- Paymaster/Bundler: confirm endpoints and chain configuration match Base Sepolia.

## License
Proprietary. Do not distribute without permission.
