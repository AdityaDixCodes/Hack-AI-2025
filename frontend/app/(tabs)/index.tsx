import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Animated, 
  TouchableOpacity,
  Platform,
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
  ChevronRight 
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const { createSession } = useChatStore();
  const { profile } = useUserStore();
  const [file, setFile] = useState<any>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
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
  }, []);
  
  const handleFileSelect = (selectedFile: any) => {
    setFile(selectedFile);
  };
  
  const handleAnalyze = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (file) {
      const sessionId = createSession(file.name);
      router.push(`/chat/${sessionId}`);
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
          
          <Button
            title="Analyze Report"
            disabled={!file}
            onPress={handleAnalyze}
            style={styles.analyzeButton}
            rightIcon={<ArrowRight size={18} color={file ? colors.white : colors.gray[400]} />}
          />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.featuresContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.sectionTitle}>What PiFi can do for you</Text>
          
          <View style={styles.featuresGrid}>
            <Card style={styles.featureCard}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '30' }]}>
                <FileText size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Simplify Reports</Text>
              <Text style={styles.featureDescription}>
                Transform complex financial jargon into clear explanations
              </Text>
            </Card>
            
            <Card style={styles.featureCard}>
              <View style={[styles.iconContainer, { backgroundColor: colors.secondaryLight + '30' }]}>
                <PieChart size={24} color={colors.secondary} />
              </View>
              <Text style={styles.featureTitle}>Visual Insights</Text>
              <Text style={styles.featureDescription}>
                Get visual breakdowns of financial data and metrics
              </Text>
            </Card>
            
            <Card style={styles.featureCard}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '30' }]}>
                <TrendingUp size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Trend Analysis</Text>
              <Text style={styles.featureDescription}>
                Track financial trends and get predictive insights
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
            <ChevronRight size={20} color={colors.gray[400]} />
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
            <ChevronRight size={20} color={colors.gray[400]} />
          </TouchableOpacity>
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
  },
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
  quickActionsContainer: {
    paddingHorizontal: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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