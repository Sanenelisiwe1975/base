"use client";

import { useMemo } from 'react';
import { MapIncident } from './IncidentMap';

interface AnalyticsDashboardProps {
  incidents: MapIncident[];
  className?: string;
}

interface AnalyticsData {
  totalIncidents: number;
  todayIncidents: number;
  weekIncidents: number;
  monthIncidents: number;
  severityBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  timeSeriesData: Array<{ date: string; count: number }>;
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  severityTrend: Array<{ severity: string; count: number; percentage: number }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
}

export function AnalyticsDashboard({ incidents, className = "" }: AnalyticsDashboardProps) {
  const analytics = useMemo((): AnalyticsData => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalIncidents = incidents.length;
    const todayIncidents = incidents.filter(i => 
      new Date(i.metadata.timestamp) >= today
    ).length;
    const weekIncidents = incidents.filter(i => 
      new Date(i.metadata.timestamp) >= weekAgo
    ).length;
    const monthIncidents = incidents.filter(i => 
      new Date(i.metadata.timestamp) >= monthAgo
    ).length;

    // Severity breakdown
    const severityBreakdown = incidents.reduce((acc, incident) => {
      const severity = incident.metadata.severity || 'unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Category breakdown
    const categoryBreakdown = incidents.reduce((acc, incident) => {
      const category = incident.metadata.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Time series data (last 30 days)
    const timeSeriesData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = incidents.filter(incident => {
        const incidentDate = new Date(incident.metadata.timestamp);
        return incidentDate.toISOString().split('T')[0] === dateStr;
      }).length;
      timeSeriesData.push({ date: dateStr, count });
    }

    // Top categories
    const topCategories = Object.entries(categoryBreakdown)
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / totalIncidents) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Severity trend
    const severityTrend = Object.entries(severityBreakdown)
      .map(([severity, count]) => ({
        severity,
        count,
        percentage: (count / totalIncidents) * 100
      }))
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
               (severityOrder[a.severity as keyof typeof severityOrder] || 0);
      });

    // Hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const count = incidents.filter(incident => {
        const incidentHour = new Date(incident.metadata.timestamp).getHours();
        return incidentHour === hour;
      }).length;
      return { hour, count };
    });

    return {
      totalIncidents,
      todayIncidents,
      weekIncidents,
      monthIncidents,
      severityBreakdown,
      categoryBreakdown,
      timeSeriesData,
      topCategories,
      severityTrend,
      hourlyDistribution
    };
  }, [incidents]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const maxTimeSeriesCount = Math.max(...analytics.timeSeriesData.map(d => d.count));
  const maxHourlyCount = Math.max(...analytics.hourlyDistribution.map(d => d.count));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalIncidents}</p>
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
              <p className="text-sm font-medium text-gray-500">Today</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.todayIncidents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Week</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.weekIncidents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.monthIncidents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Incidents Over Time (Last 30 Days)</h3>
          <div className="space-y-2">
            {analytics.timeSeriesData.slice(-7).map((data, index) => (
              <div key={data.date} className="flex items-center space-x-3">
                <div className="w-20 text-xs text-gray-500">
                  {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${maxTimeSeriesCount > 0 ? (data.count / maxTimeSeriesCount) * 100 : 0}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {data.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Severity Distribution</h3>
          <div className="space-y-3">
            {analytics.severityTrend.map((item) => (
              <div key={item.severity} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                    {item.severity.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">{item.count} incidents</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Incident Categories</h3>
          <div className="space-y-3">
            {analytics.topCategories.map((item, index) => (
              <div key={item.category} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{item.category}</span>
                    <span className="text-sm text-gray-500">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Incidents by Hour of Day</h3>
          <div className="flex items-end space-x-1 h-32">
            {analytics.hourlyDistribution.map((data) => (
              <div key={data.hour} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-600 rounded-t transition-all duration-300"
                  style={{ 
                    height: `${maxHourlyCount > 0 ? (data.count / maxHourlyCount) * 100 : 0}%`,
                    minHeight: data.count > 0 ? '4px' : '0px'
                  }}
                  title={`${data.hour}:00 - ${data.count} incidents`}
                />
                <span className="text-xs text-gray-500 mt-1">
                  {data.hour.toString().padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Hour of Day (24-hour format)
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Most Active Day</h4>
            <p className="text-lg font-semibold text-gray-900">
              {analytics.timeSeriesData.reduce((max, current) => 
                current.count > max.count ? current : max, 
                analytics.timeSeriesData[0] || { date: 'N/A', count: 0 }
              ).date !== 'N/A' 
                ? new Date(analytics.timeSeriesData.reduce((max, current) => 
                    current.count > max.count ? current : max, 
                    analytics.timeSeriesData[0]
                  ).date).toLocaleDateString()
                : 'N/A'
              }
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Peak Hour</h4>
            <p className="text-lg font-semibold text-gray-900">
              {analytics.hourlyDistribution.reduce((max, current) => 
                current.count > max.count ? current : max,
                analytics.hourlyDistribution[0] || { hour: 0, count: 0 }
              ).hour.toString().padStart(2, '0')}:00
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Average Daily Reports</h4>
            <p className="text-lg font-semibold text-gray-900">
              {analytics.timeSeriesData.length > 0 
                ? (analytics.totalIncidents / analytics.timeSeriesData.length).toFixed(1)
                : '0'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}