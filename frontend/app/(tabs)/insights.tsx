// frontend/app/(tabs)/insights.tsx
import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios'
import { colors } from '@/constants/colors'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { BookOpen } from 'lucide-react-native'
import { router } from 'expo-router'
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryLine,
  VictoryPie,
  VictoryAxis,
} from 'victory-native';

interface Metric {
  label: string
  value: string
}

interface TimeSeriesData {
  revenue: { x: string; y: number }[];
  profit: { x: string; y: number }[];
}

interface SegmentData {
  x: string;
  y: number;
}

interface FinancialData {
  metrics: Metric[];
  timeSeriesData: TimeSeriesData;
  segmentData: SegmentData[];
}

const API_BASE_URL = Platform.OS === 'ios' 
  ? 'http://127.0.0.1:8000'
  : 'http://10.0.2.2:8000'; // For Android emulator

export default function InsightsScreen() {
  const [indexed, setIndexed] = useState<boolean | null>(null)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  // fade/slide in
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [])

  // 1) check status on mount
  useEffect(() => {
    axios
      .get<{ indexed: boolean }>('http://127.0.0.1:8000/status')
      .then(res => {
        console.log('STATUS:', res.data)
        setIndexed(res.data.indexed)
      })
      .catch(err => {
        console.error('status error', err)
        setIndexed(false)
      })
  }, [])

  // 2) when indexed flips to true, fetch metrics
  useEffect(() => {
    if (indexed) fetchMetrics()
  }, [indexed])

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsResponse, timeSeriesResponse, segmentResponse] = await Promise.all([
        axios.get<Metric[]>(`${API_BASE_URL}/metrics`),
        axios.get<TimeSeriesData>(`${API_BASE_URL}/timeseries`),
        axios.get<SegmentData[]>(`${API_BASE_URL}/segments`),
      ]);

      console.log('Metrics:', metricsResponse.data);
      console.log('TimeSeries:', timeSeriesResponse.data);
      console.log('Segments:', segmentResponse.data);

      setFinancialData({
        metrics: metricsResponse.data,
        timeSeriesData: timeSeriesResponse.data,
        segmentData: segmentResponse.data,
      });
    } catch (err) {
      console.error('Data fetch error:', err);
      if (axios.isAxiosError(err)) {
        setError(`Failed to fetch data: ${err.response?.data?.detail || err.message}`);
      } else {
        setError('Could not extract data from your report.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goUpload = () => {
    router.push('/upload') // or wherever your upload screen lives
  }

  // still waiting on status
  if (indexed === null) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    )
  }

  // no PDF indexed yet
  if (!indexed) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          title="No report uploaded"
          description="Upload a financial PDF to see your insights here."
          icon={<BookOpen size={48} color={colors.primary} />}
          actionLabel="Upload Report"
          onAction={goUpload}
        />
      </SafeAreaView>
    )
  }

  // PDF is indexed, show metrics
  const renderCharts = () => {
    if (!financialData) return null;

    return (
      <>
        {/* Revenue Trend */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Revenue Trend</Text>
          <VictoryChart theme={VictoryTheme.material} height={250}>
            <VictoryLine
              style={{
                data: { stroke: colors.primary },
                parent: { border: "1px solid #ccc"}
              }}
              data={financialData.timeSeriesData.revenue}
            />
          </VictoryChart>
        </View>

        {/* Profit vs Revenue */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Profit vs Revenue</Text>
          <VictoryChart theme={VictoryTheme.material} height={250}>
            <VictoryAxis />
            <VictoryAxis dependentAxis />
            <VictoryBar
              data={financialData.timeSeriesData.revenue}
              style={{ data: { fill: colors.primary } }}
            />
            <VictoryLine
              data={financialData.timeSeriesData.profit}
              style={{ data: { stroke: colors.success } }}
            />
          </VictoryChart>
        </View>

        {/* Business Segment Distribution */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Business Segments</Text>
          <VictoryPie
            data={financialData.segmentData}
            colorScale={["tomato", "orange", "gold", "cyan", "navy"]}
            height={250}
            style={{ labels: { fill: colors.text, fontSize: 12 } }}
          />
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.headerContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.subtitle}>
            Insights from your latest financial report
          </Text>
        </Animated.View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Analyzing report...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.insightsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.sectionTitle}>Key Metrics</Text>

            {metrics.length === 0 ? (
              <Text style={styles.noDataText}>No metrics found in this report.</Text>
            ) : (
              <View style={styles.metricsContainer}>
                {metrics.map((m, i) => (
                  <Card key={i} style={styles.metricCard}>
                    <Text style={styles.metricValue}>{m.value}</Text>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                  </Card>
                ))}
              </View>
            )}

            {renderCharts()}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  headerContainer: { padding: 20 },
  subtitle: { fontSize: 16, color: colors.textSecondary },
  insightsContainer: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: { color: colors.error, textAlign: 'center' },
  noDataText: { color: colors.textSecondary, textAlign: 'center' },
  chartContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
})
