import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  DollarSign, 
  Percent, 
  ArrowRight,
  BookOpen,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useChatStore } from '@/store/chat-store';

export default function InsightsScreen() {
  const { sessions, createSession } = useChatStore();
  const hasSessions = sessions.length > 0;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const handleStartLearning = () => {
    const sessionId = createSession();
    router.push(`/chat/${sessionId}`);
  };
  
  if (!hasSessions) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          title="No insights yet"
          description="Upload financial reports or start conversations to generate insights."
          icon={<BookOpen size={48} color={colors.primary} />}
          actionLabel="Start Learning"
          onAction={handleStartLearning}
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
        <Animated.View 
          style={[
            styles.headerContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.subtitle}>
            Personalized insights based on your financial conversations
          </Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.insightsContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          
          <View style={styles.metricsContainer}>
            <Card style={styles.metricCard}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '30' }]}>
                <TrendingUp size={20} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>+12.4%</Text>
              <Text style={styles.metricLabel}>Revenue Growth</Text>
            </Card>
            
            <Card style={styles.metricCard}>
              <View style={[styles.iconContainer, { backgroundColor: colors.secondaryLight + '30' }]}>
                <Percent size={20} color={colors.secondary} />
              </View>
              <Text style={styles.metricValue}>18.2%</Text>
              <Text style={styles.metricLabel}>Profit Margin</Text>
            </Card>
            
            <Card style={styles.metricCard}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '30' }]}>
                <DollarSign size={20} color={colors.primary} />
              </View>
              <Text style={styles.metricValue}>$2.4M</Text>
              <Text style={styles.metricLabel}>Cash Flow</Text>
            </Card>
          </View>
        </Animated.View>
        
        <Animated.View 
          style={[
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
              <TouchableOpacity>
                <Text style={styles.viewMoreText}>View Details</Text>
              </TouchableOpacity>
            </View>
            
            <Card style={styles.chartCard}>
              <View style={styles.chartPlaceholder}>
                <PieChart size={120} color={colors.primary} />
                <Text style={styles.chartPlaceholderText}>
                  Interactive charts will appear here based on your financial data
                </Text>
              </View>
              
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                  <Text style={styles.legendText}>Product A (45%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors.secondary }]} />
                  <Text style={styles.legendText}>Product B (30%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors.gray[400] }]} />
                  <Text style={styles.legendText}>Other (25%)</Text>
                </View>
              </View>
            </Card>
          </View>
        </Animated.View>
        
        <Animated.View 
          style={[
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Quarterly Performance</Text>
              <TouchableOpacity>
                <Text style={styles.viewMoreText}>View Details</Text>
              </TouchableOpacity>
            </View>
            
            <Card style={styles.chartCard}>
              <View style={styles.chartPlaceholder}>
                <BarChart3 size={120} color={colors.primary} />
                <Text style={styles.chartPlaceholderText}>
                  Performance trends will be visualized here
                </Text>
              </View>
            </Card>
          </View>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.recommendationsContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.sectionTitle}>Recommendations</Text>
          
          <Card style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>
              Diversify Revenue Streams
            </Text>
            <Text style={styles.recommendationDescription}>
              Based on your financial data, consider exploring new product lines to reduce dependency on Product A.
            </Text>
            <TouchableOpacity style={styles.learnMoreButton}>
              <Text style={styles.learnMoreText}>Learn more</Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </Card>
          
          <Card style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>
              Optimize Operating Expenses
            </Text>
            <Text style={styles.recommendationDescription}>
              Your operating expenses have increased by 8% compared to last year. Consider reviewing major cost centers.
            </Text>
            <TouchableOpacity style={styles.learnMoreButton}>
              <Text style={styles.learnMoreText}>Learn more</Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  insightsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '31%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewMoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  chartCard: {
    padding: 16,
  },
  chartPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginBottom: 16,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  legendContainer: {
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: colors.text,
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
  },
  recommendationCard: {
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
});