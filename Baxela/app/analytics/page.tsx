"use client";

import { useState, useEffect } from 'react';
import { useBaseAccount } from '@/components/FeatureAccess';
import { WalletConnect } from '@/components/WalletConnect';
import BasePay from '@/components/BasePay';
import toast from 'react-hot-toast';

interface AnalyticsData {
  overview: {
    totalIncidents: number;
    totalReports: number;
    averageSeverity: number;
    mostCommonCategory: string;
    trendsLastMonth: number;
  };
  regional: {
    [region: string]: {
      incidentCount: number;
      severityBreakdown: { [severity: string]: number };
      categoryBreakdown: { [category: string]: number };
      timeSeriesData: Array<{ date: string; count: number }>;
    };
  };
  insights: {
    hotspots: Array<{
      location: string;
      coordinates: [number, number];
      incidentCount: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    }>;
    patterns: Array<{
      pattern: string;
      description: string;
      confidence: number;
    }>;
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  };
}

interface PremiumAccess {
  expiresAt?: number;
  daysRemaining?: number;
}

export default function AnalyticsPage() {
  const { isConnected, address } = useBaseAccount();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [premiumAccess, setPremiumAccess] = useState<PremiumAccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Check premium access when connected
  useEffect(() => {
    if (isConnected && address) {
      checkPremiumAccess();
    }
  }, [isConnected, address]);

  const checkPremiumAccess = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/premium?address=${address}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
        setPremiumAccess(data.premiumAccess);
        setHasAccess(true);
      } else {
        const error = await response.json();
        if (error.premiumRequired) {
          setHasAccess(false);
        }
      }
    } catch (error) {
      console.error('Error checking premium access:', error);
      toast.error('Failed to check premium access');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setPaymentLoading(true);
    
    try {
      // Record the payment
      const response = await fetch('/api/analytics/premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          transactionId
        })
      });

      if (response.ok) {
        toast.success('Payment successful! Premium access unlocked for 30 days');
        await checkPremiumAccess(); // Refresh access status
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentError = (error: Error) => {
    console.error('Base Pay error:', error);
    toast.error('Payment failed. Please try again.');
    setPaymentLoading(false);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-50 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Corporate Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Analytics Intelligence Platform</h1>
              <p className="mt-3 text-lg text-slate-600">Enterprise-grade incident analytics and insights</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-8 py-12 text-center">
              <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Secure Access Required</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Connect your Base Account to access comprehensive analytics and business intelligence insights.
              </p>
              <div className="inline-block">
                <WalletConnect />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Analytics Intelligence Platform</h1>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-900"></div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Analytics</h2>
            <p className="text-slate-600">Preparing your business intelligence dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Corporate Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Analytics Intelligence Platform</h1>
              <p className="mt-3 text-lg text-slate-600">Enterprise-grade incident analytics and insights</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Premium Access Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-16">
            <div className="relative">
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-800/90 z-10 flex items-center justify-center">
                <div className="text-center text-white px-8">
                  <div className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Premium Analytics Suite</h2>
                  <p className="text-xl text-slate-200 mb-8 max-w-lg mx-auto">
                    Unlock comprehensive business intelligence and advanced analytics for $5 USDC
                  </p>
                  <div className="inline-block">
                    <BasePay
                      amount="5"
                      currency="USDC"
                      description="Unlock premium analytics for 30 days"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      disabled={paymentLoading}
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="p-8 filter blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Total Incidents</h3>
                    <p className="text-3xl font-bold text-blue-900">1,247</p>
                    <p className="text-sm text-blue-600 mt-1">+12% from last month</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                    <h3 className="text-sm font-semibold text-emerald-700 mb-2 uppercase tracking-wide">Total Reports</h3>
                    <p className="text-3xl font-bold text-emerald-900">3,891</p>
                    <p className="text-sm text-emerald-600 mt-1">+8% from last month</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                    <h3 className="text-sm font-semibold text-amber-700 mb-2 uppercase tracking-wide">Avg Severity</h3>
                    <p className="text-3xl font-bold text-amber-900">2.3</p>
                    <p className="text-sm text-amber-600 mt-1">-5% from last month</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-sm font-semibold text-purple-700 mb-2 uppercase tracking-wide">Trend</h3>
                    <p className="text-3xl font-bold text-purple-900">+12.5%</p>
                    <p className="text-sm text-purple-600 mt-1">Monthly growth</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Regional Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">North District</span>
                        <span className="font-bold text-slate-900">342</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">East District</span>
                        <span className="font-bold text-slate-900">387</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">South District</span>
                        <span className="font-bold text-slate-900">298</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Risk Assessment</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Downtown Intersection</span>
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">Critical</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Highway 101</span>
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 border border-orange-200">High</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Central Park</span>
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200">Medium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Enterprise Features</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive analytics suite designed for enterprise decision-making and strategic planning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Regional Analytics</h3>
              <p className="text-slate-600">Comprehensive breakdowns by geographic regions and districts</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Risk Hotspots</h3>
              <p className="text-slate-600">Advanced identification of high-risk locations and emerging patterns</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Trend Analysis</h3>
              <p className="text-slate-600">Time-series data analysis with predictive modeling capabilities</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Insights</h3>
              <p className="text-slate-600">Machine learning-powered recommendations and strategic insights</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Corporate Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Analytics Intelligence Platform</h1>
              <p className="mt-2 text-lg text-slate-600">Enterprise-grade incident analytics and insights</p>
            </div>
            {premiumAccess && (
              <div className="text-right">
                <div className="inline-flex items-center px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Premium Active</p>
                    <p className="text-xs text-emerald-600">{premiumAccess.daysRemaining} days remaining</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {analyticsData && (
          <>
            {/* Executive Summary Cards */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Executive Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Incidents</h3>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{analyticsData.overview.totalIncidents.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">Total recorded incidents</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Total Reports</h3>
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{analyticsData.overview.totalReports.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">Community reports filed</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Avg Severity</h3>
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{analyticsData.overview.averageSeverity}</p>
                  <p className="text-sm text-slate-600">Average severity rating</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Top Category</h3>
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mb-1">{analyticsData.overview.mostCommonCategory}</p>
                  <p className="text-sm text-slate-600">Most frequent category</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide">Monthly Trend</h3>
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">+{analyticsData.overview.trendsLastMonth}%</p>
                  <p className="text-sm text-slate-600">Month-over-month change</p>
                </div>
              </div>
            </div>

            {/* Regional Analytics */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Regional Performance Analysis</h2>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {Object.entries(analyticsData.regional).map(([region, data]) => (
                    <div key={region} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900">{region}</h3>
                        <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-sm text-slate-600 mb-1">Total Incidents</p>
                        <p className="text-3xl font-bold text-slate-900">{data.incidentCount}</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-3">Severity Distribution</p>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(data.severityBreakdown).map(([severity, count]) => (
                              <div key={severity} className="bg-white rounded-lg p-3 border border-slate-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600 capitalize">{severity}</span>
                                  <span className="font-bold text-slate-900">{count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-3">Category Breakdown</p>
                          <div className="space-y-2">
                            {Object.entries(data.categoryBreakdown).slice(0, 3).map(([category, count]) => (
                              <div key={category} className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">{category}</span>
                                <span className="font-semibold text-slate-900">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Risk Assessment & Hotspots</h2>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyticsData.insights.hotspots.map((hotspot, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{hotspot.location}</h3>
                          <p className="text-sm text-slate-600">
                            {hotspot.coordinates[0].toFixed(4)}, {hotspot.coordinates[1].toFixed(4)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskLevelColor(hotspot.riskLevel)}`}>
                          {hotspot.riskLevel.charAt(0).toUpperCase() + hotspot.riskLevel.slice(1)}
                        </span>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-2xl font-bold text-slate-900 mb-1">{hotspot.incidentCount}</p>
                        <p className="text-sm text-slate-600">Total incidents recorded</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Intelligence Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Patterns */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">AI-Detected Patterns</h2>
                </div>
                
                <div className="space-y-6">
                  {analyticsData.insights.patterns.map((pattern, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-6 border-l-4 border-blue-500">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{pattern.pattern}</h3>
                      <p className="text-slate-700 mb-3">{pattern.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Confidence Level</span>
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-slate-200 rounded-full mr-3">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${pattern.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">
                            {(pattern.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Recommendations */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Strategic Recommendations</h2>
                </div>
                
                <div className="space-y-6">
                  {analyticsData.insights.recommendations.map((rec, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-slate-900 flex-1">{rec.title}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ml-4 ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                        </span>
                      </div>
                      <p className="text-slate-700">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}