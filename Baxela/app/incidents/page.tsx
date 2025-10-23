"use client";

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/components/TranslationProvider';
import { IncidentReportForm, IncidentReport } from '@/components/IncidentReportForm';
import { IncidentMap, MapIncident } from '@/components/IncidentMap';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { WalletConnect } from '@/components/WalletConnect';

import { FeatureAccess, useFeatureAccess, useBaseAccount } from '@/components/FeatureAccess';
import LanguageSelector, { useLanguageDetection } from '@/components/LanguageSelector';
import { uploadIncidentReport, listPinnedContent, getIPFSUrl } from '@/lib/ipfs';
import { createComprehensiveMetadata, metadataService } from '@/lib/metadata';
import { useLocation } from '@/hooks/useLocation';

export default function IncidentsPage() {
  const { address, isConnected } = useBaseAccount();
  const { location, requestLocation, isLoading: locationLoading } = useLocation();
  const { t } = useTranslation();
  const { hasAccess } = useFeatureAccess();
  useLanguageDetection();
  
  // State management
  const [incidents, setIncidents] = useState<MapIncident[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<MapIncident | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'analytics'>('map');
  const [showForm, setShowForm] = useState(false);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load existing incidents from IPFS
  const loadIncidents = useCallback(async () => {
    try {
      setLoadingIncidents(true);
      setError(null);
      
      // Get pinned content from IPFS
      const pinnedContent = await listPinnedContent();
      
      // Filter for incident reports (JSON files)
      const incidentFiles = pinnedContent.filter(item => 
        item.metadata?.name?.includes('incident-') && 
        item.metadata?.name?.endsWith('.json')
      );

      const loadedIncidents: MapIncident[] = [];

      // Load each incident
      for (const item of incidentFiles.slice(0, 50)) { // Limit to 50 for performance
        try {
          const response = await fetch(getIPFSUrl(item.ipfs_pin_hash));
          const metadata = await response.json();
          
          if (metadata.location?.latitude && metadata.location?.longitude) {
            loadedIncidents.push({
              id: metadata.incident?.id || item.ipfs_pin_hash,
              hash: item.ipfs_pin_hash,
              metadata,
              position: [metadata.location.latitude, metadata.location.longitude]
            });
          }
        } catch (error) {
          console.warn(`Failed to load incident ${item.ipfs_pin_hash}:`, error);
        }
      }

      setIncidents(loadedIncidents);
    } catch (error) {
      console.error('Failed to load incidents:', error);
      setError('Failed to load existing incidents. Please refresh the page.');
    } finally {
      setLoadingIncidents(false);
    }
  }, []);

  // Load incidents on component mount
  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  // Handle incident report submission
  const handleSubmitReport = async (report: IncidentReport) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsSubmitting(true);
    
    try {
      // Upload to IPFS
      const result = await uploadIncidentReport(report);
      
      // Create comprehensive metadata
      const comprehensiveMetadata = createComprehensiveMetadata(report, result.fileHashes);
      
      // Add the new incident to the map
      const newIncident: MapIncident = {
        id: comprehensiveMetadata.incident.id,
        hash: result.reportHash,
        metadata: result.metadata,
        position: [report.location.latitude, report.location.longitude]
      };
      
      setIncidents(prev => [newIncident, ...prev]);
      setShowForm(false);
      
      // Show success message
      alert(t('incident.submitSuccess'));
      
    } catch (error) {
      console.error('Failed to submit incident report:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle incident selection from map
  const handleIncidentClick = (incident: MapIncident) => {
    setSelectedIncident(incident);
  };

  // Close incident details
  const closeIncidentDetails = () => {
    setSelectedIncident(null);
  };

  // Request location if not available
  useEffect(() => {
    if (isConnected && !location && !locationLoading) {
      requestLocation();
    }
  }, [isConnected, location, locationLoading, requestLocation]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
              <span className="text-sm text-gray-500">{t('app.subtitle')}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              {isConnected && (
                <FeatureAccess feature="reporting">
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>{t('incident.reportButton')}</span>
                  </button>
                </FeatureAccess>
              )}
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          // Wallet connection prompt
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('wallet.connectTitle')}</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('wallet.connectDescription')}
            </p>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <WalletConnect />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{t('common.error')}</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-lg mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'map'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {t('navigation.mapView')}
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'analytics'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {t('navigation.analytics')}
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'map' && (
              <>
                {/* Incident Report Form */}
                {showForm && (
                  <FeatureAccess feature="reporting">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{t('incident.formTitle')}</h2>
                        <button
                          onClick={() => setShowForm(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <IncidentReportForm onSubmit={handleSubmitReport} />
                    </div>
                  </FeatureAccess>
                )}

                {/* Live Map */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('map.title')}</h2>
                        <p className="text-gray-600 mt-1">
                          {loadingIncidents 
                            ? t('map.loading')
                            : t('map.showingIncidents', { count: incidents.length })
                          }
                        </p>
                      </div>
                      <button
                        onClick={loadIncidents}
                        disabled={loadingIncidents}
                        className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                      >
                        <svg className={`h-4 w-4 ${loadingIncidents ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{t('common.refresh')}</span>
                      </button>
                    </div>
                  </div>
                  
                  <IncidentMap
                    incidents={incidents}
                    userLocation={location || undefined}
                    onIncidentClick={handleIncidentClick}
                    height="600px"
                  />
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <FeatureAccess feature="analytics">
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      {t('analytics.title')}
                    </h2>
                    {loadingIncidents ? (
                      <div className="h-96 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <AnalyticsDashboard incidents={incidents} />
                    )}
                  </div>
                </div>
              </FeatureAccess>
            )}

            {/* Statistics */}
            <FeatureAccess feature="analytics">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Reports</p>
                    <p className="text-2xl font-semibold text-gray-900">{incidents.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Critical Incidents</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {incidents.filter(i => i.metadata.severity === 'critical').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Today's Reports</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {incidents.filter(i => {
                        const today = new Date().toDateString();
                        const incidentDate = new Date(i.metadata.timestamp).toDateString();
                        return today === incidentDate;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Your Reports</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {incidents.filter(i => i.metadata.reporterAddress === address).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </FeatureAccess>
          </div>
        )}
      </main>

      {/* Incident Details Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedIncident.metadata.name}</h3>
                <button
                  onClick={closeIncidentDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedIncident.metadata.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    selectedIncident.metadata.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    selectedIncident.metadata.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedIncident.metadata.severity.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {selectedIncident.metadata.category}
                  </span>
                </div>
                
                <p className="text-gray-700">{selectedIncident.metadata.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Reported:</span>
                    <p>{new Date(selectedIncident.metadata.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Reporter:</span>
                    <p className="font-mono text-xs">
                      {selectedIncident.metadata.reporterAddress.substring(0, 6)}...
                      {selectedIncident.metadata.reporterAddress.substring(-4)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Location:</span>
                    <p>{selectedIncident.metadata.location.latitude.toFixed(6)}, {selectedIncident.metadata.location.longitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Attachments:</span>
                    <p>{selectedIncident.metadata.fileHashes?.length || 0} file(s)</p>
                  </div>
                </div>
                
                {selectedIncident.metadata.fileHashes && selectedIncident.metadata.fileHashes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Attachments:</h4>
                    <div className="space-y-2">
                      {selectedIncident.metadata.fileHashes.map((hash, index) => (
                        <a
                          key={index}
                          href={getIPFSUrl(hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-sm text-blue-600 hover:text-blue-800">
                            📎 View Attachment {index + 1}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}