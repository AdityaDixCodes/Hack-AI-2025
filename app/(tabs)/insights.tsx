import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Animated,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
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
import { LinearGradient } from 'expo-linear-gradient';

// Animation utilities
const createShimmerAnimation = (value) => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ])
  ).start();
};

export default function InsightsScreen() {
  const { sessions, createSession } = useChatStore();
  const hasSessions = sessions.length > 0;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  // State for card interactions
  const [activeCard, setActiveCard] = useState(null);
  
  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Start shimmer effect
    createShimmerAnimation(shimmerAnim);
  }, []);
  
  const handleStartLearning = () => {
    const sessionId = createSession();
    router.push(`/chat/${sessionId}`);
  };
  
  // Shimmer effect interpolation
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 300]
  });
  
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
    <ImageBackground 
        source={require('@/assets/images/image.png')} 
        style={styles.backgroundImage}
    >
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
          <Text style={[styles.subtitle, { color: 'white' }]}>
              Finance at a Glance
          </Text>
          <Text style={[styles.subtitleSmall, { color: 'gray' }]}>
              Quick insights to keep you on track
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
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPressIn={() => setActiveCard('revenue')}
              onPressOut={() => setActiveCard(null)}
            >
              <Animated.View style={[
                { transform: [{ scale: activeCard === 'revenue' ? 1.05 : 1 }] }
              ]}>
                <LinearGradient
                  colors={['#212121', '#1a237e', '#303f9f']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.metricGradientCard}
                >
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(66, 133, 244, 0.2)' }]}>
                    <TrendingUp size={20} color="#4285F4" />
                  </View>
                  <Text style={styles.metricValueEnhanced}>+12.4%</Text>
                  <Text style={styles.metricLabelEnhanced}>Revenue Growth</Text>
                  
                  {/* Shimmer effect */}
                  <Animated.View style={[
                    styles.shimmerEffect,
                    { transform: [{ translateX: shimmerTranslate }] }
                  ]} />
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.8} 
              onPressIn={() => setActiveCard('profit')}
              onPressOut={() => setActiveCard(null)}
            >
              <Animated.View style={[
                { transform: [{ scale: activeCard === 'profit' ? 1.05 : 1 }] }
              ]}>
                <LinearGradient
                  colors={['#212121', '#263238', '#37474F']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.metricGradientCard}
                >
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(103, 58, 183, 0.2)' }]}>
                    <Percent size={20} color="#673AB7" />
                  </View>
                  <Text style={styles.metricValueEnhanced}>18.2%</Text>
                  <Text style={styles.metricLabelEnhanced}>Profit Margin</Text>
                  
                  {/* Shimmer effect */}
                  <Animated.View style={[
                    styles.shimmerEffect,
                    { transform: [{ translateX: shimmerTranslate }] }
                  ]} />
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPressIn={() => setActiveCard('cashflow')}
              onPressOut={() => setActiveCard(null)}
            >
              <Animated.View style={[
                { transform: [{ scale: activeCard === 'cashflow' ? 1.05 : 1 }] }
              ]}>
                <LinearGradient
                  colors={['#212121', '#0D47A1', '#1976D2']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.metricGradientCard}
                >
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 188, 212, 0.2)' }]}>
                    <DollarSign size={20} color="#00BCD4" />
                  </View>
                  <Text style={styles.metricValueEnhanced}>$2.4M</Text>
                  <Text style={styles.metricLabelEnhanced}>Cash Flow</Text>
                  
                  {/* Shimmer effect */}
                  <Animated.View style={[
                    styles.shimmerEffect,
                    { transform: [{ translateX: shimmerTranslate }] }
                  ]} />
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
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
            
            <LinearGradient
              colors={['#212121', '#1A2026', '#151B21']}
              style={styles.enhancedChartCard}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <View style={styles.chartPlaceholderEnhanced}>
                <PieChart size={120} color="#4285F4" />
                <Text style={styles.chartPlaceholderTextEnhanced}>
                  Interactive charts will appear here based on your financial data
                </Text>
              </View>
              
              <View style={styles.legendContainerEnhanced}>
                <View style={styles.legendItemEnhanced}>
                  <LinearGradient
                    colors={['#4285F4', '#34A853']}
                    style={styles.legendColorEnhanced}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  />
                  <Text style={styles.legendTextEnhanced}>Product A (45%)</Text>
                </View>
                <View style={styles.legendItemEnhanced}>
                  <LinearGradient
                    colors={['#673AB7', '#3F51B5']}
                    style={styles.legendColorEnhanced}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  />
                  <Text style={styles.legendTextEnhanced}>Product B (30%)</Text>
                </View>
                <View style={styles.legendItemEnhanced}>
                  <LinearGradient
                    colors={['#9E9E9E', '#757575']}
                    style={styles.legendColorEnhanced}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  />
                  <Text style={styles.legendTextEnhanced}>Other (25%)</Text>
                </View>
              </View>
            </LinearGradient>
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
            
            <LinearGradient
              colors={['#212121', '#1A2026', '#151B21']}
              style={styles.enhancedChartCard}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <View style={styles.chartPlaceholderEnhanced}>
                <BarChart3 size={120} color="#4285F4" />
                <Text style={styles.chartPlaceholderTextEnhanced}>
                  Performance trends will be visualized here
                </Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.recommendationsContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.sectionTitle}>Recommendations</Text>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPressIn={() => setActiveCard('rec1')}
            onPressOut={() => setActiveCard(null)}
          >
            <Animated.View style={[
              { transform: [{ scale: activeCard === 'rec1' ? 1.02 : 1 }] }
            ]}>
              <LinearGradient
                colors={['#212121', '#1A2026', '#151B21']}
                style={styles.recommendationCardEnhanced}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Text style={styles.recommendationTitleEnhanced}>
                  Diversify Revenue Streams
                </Text>
                <Text style={styles.recommendationDescriptionEnhanced}>
                  Based on your financial data, consider exploring new product lines to reduce dependency on Product A.
                </Text>
                <View style={styles.learnMoreButtonEnhanced}>
                  <Text style={styles.learnMoreTextEnhanced}>Learn more</Text>
                  <ArrowRight size={16} color="#4285F4" />
                </View>
                
                {/* Shimmer effect */}
                <Animated.View style={[
                  styles.shimmerEffect,
                  { transform: [{ translateX: shimmerTranslate }] }
                ]} />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPressIn={() => setActiveCard('rec2')}
            onPressOut={() => setActiveCard(null)}
          >
            <Animated.View style={[
              { transform: [{ scale: activeCard === 'rec2' ? 1.02 : 1 }] }
            ]}>
              <LinearGradient
                colors={['#212121', '#1A2026', '#151B21']}
                style={styles.recommendationCardEnhanced}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Text style={styles.recommendationTitleEnhanced}>
                  Optimize Operating Expenses
                </Text>
                <Text style={styles.recommendationDescriptionEnhanced}>
                  Your operating expenses have increased by 8% compared to last year. Consider reviewing major cost centers.
                </Text>
                <View style={styles.learnMoreButtonEnhanced}>
                  <Text style={styles.learnMoreTextEnhanced}>Learn more</Text>
                  <ArrowRight size={16} color="#4285F4" />
                </View>
                
                {/* Shimmer effect */}
                <Animated.View style={[
                  styles.shimmerEffect,
                  { transform: [{ translateX: shimmerTranslate }] }
                ]} />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Keeping all your original styles
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
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
    marginTop: 80,
    fontSize: 29,
    color: 'white',
    bottom: 20,
    fontWeight: '500',
  },
  subtitleSmall: {
    marginTop: 10,
    color: 'gray',
    bottom: 20,
  },
  insightsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
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
  
  // New enhanced styles
  metricGradientCard: {
    width: width * 0.28,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  metricValueEnhanced: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metricLabelEnhanced: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  enhancedChartCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chartPlaceholderEnhanced: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,30,30,0.5)',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chartPlaceholderTextEnhanced: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  legendContainerEnhanced: {
    marginTop: 12,
    backgroundColor: 'rgba(30,30,30,0.5)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  legendItemEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColorEnhanced: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  legendTextEnhanced: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  recommendationCardEnhanced: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  recommendationTitleEnhanced: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  recommendationDescriptionEnhanced: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 16,
  },
  learnMoreButtonEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(66, 133, 244, 0.15)',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  learnMoreTextEnhanced: {
    fontSize: 13,
    color: '#4285F4',
    fontWeight: '500',
    marginRight: 6,
  },
});