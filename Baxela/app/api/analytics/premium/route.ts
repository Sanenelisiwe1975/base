import { NextRequest, NextResponse } from 'next/server';
import { checkPremiumAccess, recordPayment } from '@/lib/payments';

// Premium analytics data structure
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

// Mock analytics data generator
function generateAnalyticsData(): AnalyticsData {
  return {
    overview: {
      totalIncidents: 1247,
      totalReports: 3891,
      averageSeverity: 2.3,
      mostCommonCategory: 'Traffic Accidents',
      trendsLastMonth: 12.5 // percentage increase
    },
    regional: {
      'North District': {
        incidentCount: 342,
        severityBreakdown: {
          'Low': 156,
          'Medium': 123,
          'High': 45,
          'Critical': 18
        },
        categoryBreakdown: {
          'Traffic': 145,
          'Crime': 89,
          'Fire': 34,
          'Medical': 74
        },
        timeSeriesData: [
          { date: '2024-01-01', count: 23 },
          { date: '2024-01-02', count: 31 },
          { date: '2024-01-03', count: 18 },
          { date: '2024-01-04', count: 27 },
          { date: '2024-01-05', count: 35 }
        ]
      },
      'South District': {
        incidentCount: 298,
        severityBreakdown: {
          'Low': 134,
          'Medium': 98,
          'High': 52,
          'Critical': 14
        },
        categoryBreakdown: {
          'Traffic': 112,
          'Crime': 67,
          'Fire': 28,
          'Medical': 91
        },
        timeSeriesData: [
          { date: '2024-01-01', count: 19 },
          { date: '2024-01-02', count: 25 },
          { date: '2024-01-03', count: 22 },
          { date: '2024-01-04', count: 31 },
          { date: '2024-01-05', count: 28 }
        ]
      },
      'East District': {
        incidentCount: 387,
        severityBreakdown: {
          'Low': 178,
          'Medium': 134,
          'High': 58,
          'Critical': 17
        },
        categoryBreakdown: {
          'Traffic': 167,
          'Crime': 98,
          'Fire': 41,
          'Medical': 81
        },
        timeSeriesData: [
          { date: '2024-01-01', count: 28 },
          { date: '2024-01-02', count: 34 },
          { date: '2024-01-03', count: 26 },
          { date: '2024-01-04', count: 39 },
          { date: '2024-01-05', count: 42 }
        ]
      },
      'West District': {
        incidentCount: 220,
        severityBreakdown: {
          'Low': 98,
          'Medium': 76,
          'High': 34,
          'Critical': 12
        },
        categoryBreakdown: {
          'Traffic': 89,
          'Crime': 54,
          'Fire': 23,
          'Medical': 54
        },
        timeSeriesData: [
          { date: '2024-01-01', count: 15 },
          { date: '2024-01-02', count: 21 },
          { date: '2024-01-03', count: 18 },
          { date: '2024-01-04', count: 24 },
          { date: '2024-01-05', count: 19 }
        ]
      }
    },
    insights: {
      hotspots: [
        {
          location: 'Downtown Intersection',
          coordinates: [40.7128, -74.0060],
          incidentCount: 89,
          riskLevel: 'critical'
        },
        {
          location: 'Highway 101 Mile Marker 45',
          coordinates: [40.7589, -73.9851],
          incidentCount: 67,
          riskLevel: 'high'
        },
        {
          location: 'Central Park Area',
          coordinates: [40.7831, -73.9712],
          incidentCount: 34,
          riskLevel: 'medium'
        }
      ],
      patterns: [
        {
          pattern: 'Rush Hour Traffic Incidents',
          description: 'Traffic incidents spike 340% during 7-9 AM and 5-7 PM',
          confidence: 0.94
        },
        {
          pattern: 'Weekend Crime Correlation',
          description: 'Crime incidents increase 67% on Friday and Saturday nights',
          confidence: 0.87
        },
        {
          pattern: 'Weather-Related Accidents',
          description: 'Accident rates increase 156% during rainy conditions',
          confidence: 0.91
        }
      ],
      recommendations: [
        {
          title: 'Increase Traffic Patrol During Rush Hours',
          description: 'Deploy additional traffic officers at high-incident intersections during peak hours',
          priority: 'high'
        },
        {
          title: 'Install Weather Warning Systems',
          description: 'Implement dynamic road signs that warn drivers of hazardous weather conditions',
          priority: 'medium'
        },
        {
          title: 'Enhanced Weekend Security',
          description: 'Increase police presence in entertainment districts on weekends',
          priority: 'high'
        }
      ]
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if user has premium access
    const premiumAccess = checkPremiumAccess(address);

    if (!premiumAccess.hasAccess) {
      return NextResponse.json(
        { 
          error: 'Premium access required',
          message: 'Pay $5 USDC to unlock premium analytics',
          premiumRequired: true
        },
        { status: 403 }
      );
    }

    // Generate and return premium analytics data
    const analyticsData = generateAnalyticsData();

    return NextResponse.json({
      success: true,
      data: analyticsData,
      premiumAccess: {
        expiresAt: premiumAccess.expiresAt,
        daysRemaining: premiumAccess.daysRemaining
      }
    });

  } catch (error) {
    console.error('Error fetching premium analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, transactionId } = body;

    if (!address || !transactionId) {
      return NextResponse.json(
        { error: 'Address and transaction ID are required' },
        { status: 400 }
      );
    }

    // Record the payment
    const payment = recordPayment(address, transactionId);

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      payment: {
        expiresAt: payment.expiresAt,
        daysRemaining: Math.ceil((payment.expiresAt - Date.now()) / (24 * 60 * 60 * 1000))
      }
    });

  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}