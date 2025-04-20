// frontend/app/(tabs)/insights.tsx
import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios'
import { colors } from '@/constants/colors'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { BookOpen, TrendingUp, DollarSign, PieChart as PieChartIcon, AlertCircle } from 'lucide-react-native'
import { router } from 'expo-router'
import { PieChart } from 'react-native-chart-kit'

// Types for our API responses
interface KeyMetrics {
  revenue: string;
  revenue_growth: string;
  profit: string;
  profit_growth: string;
  roe: string;
  eps: string;
}

interface FinancialMetrics {
  total_assets: string;
  total_equity: string;
  current_assets: string;
  revenue_operations: string;
  net_profit: string;
  basic_eps: string;
}

interface RevenueSegment {
  segment: string;
  percentage: number;
  revenue: string;
}

interface InsightsData {
  keyMetrics: KeyMetrics | null;
  financialMetrics: FinancialMetrics | null;
  revenueBreakdown: RevenueSegment[];
}

// Chart colors for better visibility
const chartColors = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Amber
  '#9C27B0', // Purple
  '#F44336', // Red
  '#FF9800', // Orange
  '#00BCD4', // Cyan
  '#795548', // Brown
];

const API_BASE_URL = Platform.OS === 'ios' 
  ? 'http://127.0.0.1:8000'
  : 'http://10.0.2.2:8000';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const [indexed, setIndexed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InsightsData>({
    keyMetrics: null,
    financialMetrics: null,
    revenueBreakdown: []
  });

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (mounted) {
        await checkStatus();
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const checkStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status`);
      console.log('Status check response:', response.data);
      setIndexed(response.data.indexed);
      if (response.data.indexed) {
        console.log('PDF is indexed, fetching insights...');
        fetchInsightsData();
      } else {
        console.log('No PDF indexed yet');
        setError('Please upload a PDF report first');
      }
    } catch (err) {
      console.error('Status check failed:', err);
      setError('Failed to check PDF status');
      setIndexed(false);
    }
  };

  const fetchInsightsData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Starting to fetch insights data...');
      
      // Fetch all metrics in parallel
      const [metricsRes, financialRes, breakdownRes] = await Promise.all([
        axios.get<KeyMetrics>(`${API_BASE_URL}/key-metrics`).catch(err => {
          console.error('Failed to fetch key metrics:', err);
          return { data: null };
        }),
        axios.get<FinancialMetrics>(`${API_BASE_URL}/financial-metrics`).catch(err => {
          console.error('Failed to fetch financial metrics:', err);
          return { data: null };
        }),
        axios.get<RevenueSegment[]>(`${API_BASE_URL}/revenue-breakdown`).catch(err => {
          console.error('Failed to fetch revenue breakdown:', err);
          return { data: [] };
        })
      ]);

      console.log('Key metrics response:', metricsRes.data);
      console.log('Financial metrics:', financialRes.data);
      console.log('Revenue breakdown:', breakdownRes.data);

      // Check if we got any data
      if (!metricsRes.data && !financialRes.data && (!breakdownRes.data || breakdownRes.data.length === 0)) {
        throw new Error('No data could be extracted from the PDF');
      }

      setData({
        keyMetrics: metricsRes.data,
        financialMetrics: financialRes.data,
        revenueBreakdown: breakdownRes.data || []
      });
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights from the report');
    } finally {
      setLoading(false);
    }
  };

  const renderKeyMetrics = () => {
    if (!data.keyMetrics) return null;

    const metrics = [
      {
        label: 'Revenue',
        value: data.keyMetrics.revenue,
        subValue: `${data.keyMetrics.revenue_growth} growth`,
        icon: <DollarSign size={24} color={colors.primary} />
      },
      {
        label: 'Profit',
        value: data.keyMetrics.profit,
        subValue: `${data.keyMetrics.profit_growth} growth`,
        icon: <TrendingUp size={24} color={colors.success} />
      },
      {
        label: 'ROE',
        value: data.keyMetrics.roe,
        icon: <PieChartIcon size={24} color={colors.warning} />
      },
      {
        label: 'EPS',
        value: data.keyMetrics.eps,
        icon: <TrendingUp size={24} color={colors.info} />
      }
    ];

    return (
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <Card key={index} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              {metric.icon}
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
            <Text style={styles.metricValue}>{metric.value || 'N/A'}</Text>
            {metric.subValue && (
              <Text style={styles.metricSubValue}>{metric.subValue}</Text>
            )}
          </Card>
        ))}
      </View>
    );
  };

  const renderFinancialMetrics = () => {
    if (!data.financialMetrics) return null;

    const metrics = [
      {
        label: 'Total Assets',
        value: data.financialMetrics.total_assets,
        icon: <DollarSign size={24} color={colors.primary} />
      },
      {
        label: 'Total Equity',
        value: data.financialMetrics.total_equity,
        icon: <DollarSign size={24} color={colors.success} />
      },
      {
        label: 'Current Assets',
        value: data.financialMetrics.current_assets,
        icon: <DollarSign size={24} color={colors.info} />
      },
      {
        label: 'Revenue (Ops)',
        value: data.financialMetrics.revenue_operations,
        icon: <TrendingUp size={24} color={colors.warning} />
      }
    ];

    return (
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <Card key={index} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              {metric.icon}
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
            <Text style={styles.metricValue}>{metric.value || 'N/A'}</Text>
          </Card>
        ))}
      </View>
    );
  };

  const renderRevenueBreakdown = () => {
    if (!data.revenueBreakdown?.length) return null;

    const chartData = data.revenueBreakdown.map((segment, index) => ({
      name: segment.segment,
      population: segment.percentage,
      color: chartColors[index % chartColors.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
    }));

    return (
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Revenue Breakdown</Text>
        <PieChart
          data={chartData}
          width={screenWidth - 64} // Responsive width
          height={220}
          chartConfig={{
            backgroundColor: colors.cardBackground,
            backgroundGradientFrom: colors.cardBackground,
            backgroundGradientTo: colors.cardBackground,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          hasLegend={false} // We'll render our own legend for better control
        />
        <View style={styles.legendContainer}>
          {data.revenueBreakdown.map((segment, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: chartColors[index % chartColors.length] }
                ]} 
              />
              <Text style={styles.legendText}>
                {segment.segment} ({segment.percentage}%)
              </Text>
              <Text style={styles.legendValue}>{segment.revenue}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  if (indexed === null || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {indexed === null ? 'Checking status...' : 'Loading insights...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!indexed) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="No Report Available"
          description="Upload a financial report to see insights and analysis."
          icon={<BookOpen size={48} color={colors.primary} />}
          actionLabel="Upload Report"
          onAction={() => router.push('/')}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Error Loading Insights"
          description={error}
          icon={<AlertCircle size={48} color={colors.error} />}
          actionLabel="Retry"
          onAction={fetchInsightsData}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Financial Insights</Text>
        
        {data.keyMetrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
            {renderKeyMetrics()}
          </View>
        )}

        {data.financialMetrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Balance Sheet Highlights</Text>
            {renderFinancialMetrics()}
          </View>
        )}

        {data.revenueBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Segments</Text>
            {renderRevenueBreakdown()}
          </View>
        )}

        {(!data.keyMetrics && !data.financialMetrics && !data.revenueBreakdown.length) && (
          <EmptyState
            title="No Data Available"
            description="Could not extract insights from the uploaded report."
            icon={<AlertCircle size={48} color={colors.warning} />}
            actionLabel="Retry"
            onAction={fetchInsightsData}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  metricCard: {
    width: '47%',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  chartCard: {
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  legendContainer: {
    marginTop: 24,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  metricSubValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
