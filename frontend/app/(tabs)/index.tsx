import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Animated, 
  TouchableOpacity,
  Platform,
  Dimensions,
  ImageBackground,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useChatStore } from '@/store/chat-store';
import { useUserStore } from '@/store/user-store';
import { 
  TrendingUp, 
  FileText, 
  PieChart, 
  ArrowRight, 
  ChevronRight,
  BookOpen
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useDocumentStore } from '@/store/document-store';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const API_BASE_URL = Platform.OS === 'ios' 
  ? 'http://127.0.0.1:8000'
  : 'http://10.0.2.2:8000';

// Background Gradient Component

export default function HomeScreen() {
  const { createSession } = useChatStore();
  const { profile } = useUserStore();
  const { setDocumentUploaded } = useDocumentStore();
  const [file, setFile] = useState<any>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
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

    // Create pulsing effect for buttons
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const handleFileSelect = (selectedFile: any) => {
    setFile(selectedFile);
  };
  
  const handleAnalyze = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (file) {
      try {
        // Upload the file
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Set document as uploaded
        setDocumentUploaded(true);
        
        // Create chat session and navigate
        const sessionId = createSession(file.name);
        router.push(`/chat/${sessionId}`);
      } catch (error) {
        console.error('Upload failed:', error);
        Alert.alert('Upload Failed', 'Failed to upload the document. Please try again.');
      }
    }
  };
  
  const handleStartNewChat = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const sessionId = createSession();
    router.push(`/chat/${sessionId}`);
  };

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
          <AnimatedLogo />
          
          <Animated.View 
            style={[
              styles.headerContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={styles.welcomeText}>
              Welcome{profile.name ? `, ${profile.name}` : ''}
            </Text>
            <Text style={styles.title}>Your AI Financial Coach</Text>
            <Text style={styles.subtitle}>
              Upload a financial report to get personalized insights and explanations
            </Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.uploadContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <FileUpload onFileSelect={handleFileSelect} />
            
            <Animated.View style={{ transform: [{ scale: file ? pulseAnim : 1 }] }}>
              <Button
                title="Analyze Report"
                disabled={!file}
                onPress={handleAnalyze}
                style={[styles.analyzeButton, { backgroundColor: file ? colors.primary : colors.cardBackground }]}
                rightIcon={<ArrowRight size={18} color={file ? colors.white : colors.gray[400]} />}
              />
            </Animated.View>
          </Animated.View>
          
          {/* Investment Section - Matching the style from the image */}
          <Animated.View 
            style={[
              styles.investmentsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          > 
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.featuresContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={styles.sectionTitle}>Discover the Power of FinSight</Text>
            
            <View style={styles.featuresGrid}>
              <Card style={styles.featureCard}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}>
                  <FileText size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Simplify Reports</Text>
                <Text style={styles.featureDescription}>
                  Transform complex financial jargon into clear explanations
                </Text>
              </Card>
              
              <Card 
                style={styles.featureCard}
                onPress={() => router.push('/insights')}
              >
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}>
                  <PieChart size={24} color={colors.secondary} />
                </View>
                <Text style={styles.featureTitle}>Visual Insights</Text>
                <Text style={styles.featureDescription}>
                  Get visual breakdowns of financial data and metrics
                </Text>
              </Card>
              
              <Card style={styles.featureCard}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}>
                  <TrendingUp size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Trend Analysis</Text>
                <Text style={styles.featureDescription}>
                  Track financial trends and get predictive insights
                </Text>
              </Card>

              <Card 
                style={styles.featureCard}
                onPress={() => router.push('/quiz')}
              >
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}>
                  <BookOpen size={24} color={colors.secondary} />
                </View>
                <Text style={styles.featureTitle}>Mini Quiz</Text>
                <Text style={styles.featureDescription}>
                  Learn about financial concepts in the given pdf with a mini quiz!
                </Text>
              </Card>
            </View>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.quickActionsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleStartNewChat}
              activeOpacity={0.7}
            >
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>Start a new chat</Text>
                <Text style={styles.quickActionDescription}>
                  Ask financial questions without uploading a document
                </Text>
              </View>
              <ChevronRight size={20} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/chats')}
              activeOpacity={0.7}
            >
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>View previous chats</Text>
                <Text style={styles.quickActionDescription}>
                  Continue your previous financial conversations
                </Text>
              </View>
              <ChevronRight size={20} color={colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    paddingTop: 60,
    flex: 1,
    backgroundColor: 'transparent', // Changed from solid color to transparent
  },
  // Background effects styling
  backgroundEffects: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    transform: [{ rotate: '180deg' }],

  },
  purpleLightBottom: {
    position: 'absolute',
    bottom: -300,
    left: -100,
    width: width + 200,
    height: height * 0.6,
    
    transform: [{ rotate: '250deg' }],
  },
  blueLightTop: {
    position: 'absolute',
    top: -300,
    right: -100,
    width: width + 200,
    height: height * 0.6,
    transform: [{ rotate: '15deg' }],
  },
  glowingOrb: {
    position: 'absolute',
    width: 600,
    height: 600,
    bottom: -300,
    left: -150,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  uploadContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  analyzeButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  // Investment section styles - matching the image
  investmentsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  investmentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    lineHeight: 32,
  },
  investmentCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  investmentCard: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  companyName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  companyTicker: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  stockPrice: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 22,
  },
  returnRate: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  chartLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartGradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    opacity: 0.3,
  },
  showMoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'center',
  },
  showMoreText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  // Features section styles
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Quick actions section styles
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  quickActionContent: {
    flex: 1,
    marginRight: 16,
    
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});