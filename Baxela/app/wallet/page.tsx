"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { PaymasterTransaction } from "@/components/PaymasterTransaction";
import Link from "next/link";

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                Baxela
              </Link>
            </div>
            <nav className="flex space-x-2">
              <Link href="/report" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50">
                Report
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50">
                Dashboard
              </Link>
              <Link href="/wallet" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-purple-700">
                Wallet
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 sm:mb-6">
              Base Smart Wallet
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Experience the future of Web3 with Base Smart Wallets. Secure, gasless, and seamless transactions powered by Coinbase infrastructure.
            </p>
          </div>
        </div>
      </div>

      {/* Base Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Base Account Button */}
          <div className="group">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:border-blue-200 group-hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Base Account</h3>
              <p className="text-sm text-gray-600 mb-4">Secure passkey authentication without seed phrases</p>
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Connect Account
              </button>
            </div>
          </div>

          {/* BasePay Button */}
          <div className="group">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-200 group-hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">BasePay</h3>
              <p className="text-sm text-gray-600 mb-4">Gasless transactions with sponsored fees</p>
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Enable BasePay
              </button>
            </div>
          </div>

          {/* Base Bridge Button */}
          <div className="group">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-200 group-hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Base Bridge</h3>
              <p className="text-sm text-gray-600 mb-4">Bridge assets to Base network seamlessly</p>
              <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Bridge Assets
              </button>
            </div>
          </div>

          {/* Base Swap Button */}
          <div className="group">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-indigo-100 hover:border-indigo-200 group-hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:from-indigo-600 group-hover:to-indigo-700 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Base Swap</h3>
              <p className="text-sm text-gray-600 mb-4">Swap tokens on Base with low fees</p>
              <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Start Swapping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Wallet Connection Section */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-blue-100">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Wallet Connection
              </h2>
              <WalletConnect />
            </div>

            {/* Information Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-blue-900">
                  About Base Smart Wallets
                </h3>
              </div>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p><strong>No seed phrases:</strong> Secure passkey authentication</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p><strong>Smart contract wallets:</strong> Advanced features and programmability</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p><strong>Cross-app portability:</strong> Use the same wallet across different apps</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p><strong>Coinbase infrastructure:</strong> Built on trusted, secure infrastructure</p>
                </div>
              </div>
            </div>

            {/* Paymaster Information */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-900">
                  About Base Paymaster
                </h3>
              </div>
              <div className="space-y-3 text-sm text-green-800">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p><strong>Gas sponsorship:</strong> Transactions are sponsored by the paymaster</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p><strong>No ETH needed:</strong> Users don't need ETH for gas fees</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p><strong>Seamless UX:</strong> One-click transactions without gas concerns</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p><strong>Base network:</strong> Optimized for Base L2 transactions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Sponsored Transactions
            </h2>
            <PaymasterTransaction />
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 sm:mt-12 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Technical Implementation
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Technologies Used
              </h4>
              <ul className="text-sm text-indigo-800 space-y-2">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  OnchainKit for Base Smart Wallets
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Base Paymaster for gas sponsorship
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Permissionless.js for smart accounts
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Viem for Ethereum interactions
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Base Account SDK for authentication
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h4 className="font-bold text-purple-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Key Features
              </h4>
              <ul className="text-sm text-purple-800 space-y-2">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Smart contract wallets with account abstraction
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Gasless transactions for users
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Passkey authentication (no passwords)
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Cross-app wallet portability
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Base L2 optimization
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-600 to-blue-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent">
              Setup Instructions
            </h3>
          </div>
          <div className="prose prose-sm text-gray-700 max-w-none">
            <p className="mb-4 sm:mb-6 text-base sm:text-lg text-gray-600">To use this implementation in your own project:</p>
            <div className="space-y-4">
              <div className="flex items-start bg-white/50 rounded-xl p-4 border border-gray-200">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0 font-bold text-sm">1</div>
                <div>
                  <p className="font-medium text-gray-900">Get a CDP API key</p>
                  <p className="text-gray-600 text-sm">Visit <a href="https://www.coinbase.com/developer-platform" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Coinbase Developer Platform</a> to obtain your API credentials</p>
                </div>
              </div>
              <div className="flex items-start bg-white/50 rounded-xl p-4 border border-gray-200">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0 font-bold text-sm">2</div>
                <div>
                  <p className="font-medium text-gray-900">Configure Base network</p>
                  <p className="text-gray-600 text-sm">Set up your paymaster and bundler URLs for Base network</p>
                </div>
              </div>
              <div className="flex items-start bg-white/50 rounded-xl p-4 border border-gray-200">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0 font-bold text-sm">3</div>
                <div>
                  <p className="font-medium text-gray-900">Environment variables</p>
                  <p className="text-gray-600 text-sm">Configure your environment variables in <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">.env.local</code></p>
                </div>
              </div>
              <div className="flex items-start bg-white/50 rounded-xl p-4 border border-gray-200">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0 font-bold text-sm">4</div>
                <div>
                  <p className="font-medium text-gray-900">Install dependencies</p>
                  <p className="text-gray-600 text-sm">Install OnchainKit and configure Base Account SDK</p>
                </div>
              </div>
              <div className="flex items-start bg-white/50 rounded-xl p-4 border border-gray-200">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0 font-bold text-sm">5</div>
                <div>
                  <p className="font-medium text-gray-900">Deploy and test</p>
                  <p className="text-gray-600 text-sm">Deploy and test your Base Smart Wallet integration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}