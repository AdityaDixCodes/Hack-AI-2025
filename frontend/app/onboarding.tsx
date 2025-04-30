import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { useUserStore } from '@/store/user-store';
import { 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  TrendingUp, 
  PieChart,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'New to finance and investing' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some knowledge of financial concepts' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced with financial analysis' },
];

const FINANCIAL_INTERESTS = [
  { id: 'investing', label: 'Investing', icon: TrendingUp },
  { id: 'budgeting', label: 'Budgeting', icon: PieChart },
  { id: 'financial_literacy', label: 'Financial Literacy', icon: BookOpen },
  { id: 'retirement', label: 'Retirement Planning', icon: TrendingUp },
  { id: 'taxes', label: 'Taxes', icon: PieChart },
  { id: 'debt', label: 'Debt Management', icon: BookOpen },
];

export default function OnboardingScreen() {
  const { updateProfile, setOnboarded } = useUserStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<string>('beginner');
  const [interests, setInterests] = useState<string[]>([]);
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ x: width * (currentStep + 1), animated: true });
    } else {
      completeOnboarding();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ x: width * (currentStep - 1), animated: true });
    }
  };
  
  const toggleInterest = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    if (interests.includes(id)) {
      setInterests(interests.filter(item => item !== id));
    } else {
      setInterests([...interests, id]);
    }
  };
  
  const completeOnboarding = () => {
    updateProfile({
      name: name.trim() || undefined,
      experienceLevel: experienceLevel as any,
      financialInterests: interests,
    });
    
    setOnboarded(true);
    router.replace('/');
  };
  
  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {[0, 1, 2, 3].map(step => (
          <View 
            key={step} 
            style={[
              styles.stepDot,
              currentStep === step && styles.activeDot
            ]} 
          />
        ))}
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('@/assets/images/image.png')} 
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        
        <View style={styles.header}>
          <AnimatedLogo />
          <Text style={styles.title}>Welcome to PiFi</Text>
          <Text style={styles.subtitle}>Your AI Financial Coach</Text>
        </View>
        
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          style={styles.scrollView}
        >
          {/* Step 1: Welcome */}
          <View style={styles.step}>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Let's get to know you</Text>
              <Text style={styles.stepDescription}>
                PiFi will personalize your experience based on your financial knowledge and interests.
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>What should we call you?</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name (optional)"
                  placeholderTextColor={colors.gray[400]}
                />
              </View>
            </View>
          </View>
          
          {/* Step 2: Experience Level */}
          <View style={styles.step}>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Your financial experience</Text>
              <Text style={styles.stepDescription}>
                This helps us tailor explanations to your level of understanding.
              </Text>
              
              <View style={styles.optionsContainer}>
                {EXPERIENCE_LEVELS.map(level => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.experienceOption,
                      experienceLevel === level.id && styles.selectedExperience
                    ]}
                    onPress={() => {
                      setExperienceLevel(level.id);
                      if (Platform.OS !== 'web') {
                        Haptics.selectionAsync();
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.experienceHeader}>
                      <Text style={[
                        styles.experienceLabel,
                        experienceLevel === level.id && styles.selectedExperienceLabel
                      ]}>
                        {level.label}
                      </Text>
                      
                      {experienceLevel === level.id && (
                        <View style={styles.checkCircle}>
                          <Check size={16} color={colors.white} />
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.experienceDescription}>
                      {level.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          {/* Step 3: Interests */}
          <View style={styles.step}>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Financial interests</Text>
              <Text style={styles.stepDescription}>
                Select topics you're interested in learning more about.
              </Text>
              
              <View style={styles.interestsGrid}>
                {FINANCIAL_INTERESTS.map(interest => {
                  const Icon = interest.icon;
                  const isSelected = interests.includes(interest.id);
                  
                  return (
                    <TouchableOpacity
                      key={interest.id}
                      style={[
                        styles.interestOption,
                        isSelected && styles.selectedInterest
                      ]}
                      onPress={() => toggleInterest(interest.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.interestIconContainer,
                        isSelected && styles.selectedInterestIconContainer
                      ]}>
                        <Icon 
                          size={24} 
                          color={isSelected ? colors.white : colors.primary} 
                        />
                      </View>
                      <Text style={[
                        styles.interestLabel,
                        isSelected && styles.selectedInterestLabel
                      ]}>
                        {interest.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
          
          {/* Step 4: Final */}
          <View style={styles.step}>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>You're all set!</Text>
              <Text style={styles.stepDescription}>
                PiFi is ready to help you understand financial reports and concepts with personalized explanations.
              </Text>
              
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <FileText size={24} color={colors.primary} />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Upload Reports</Text>
                    <Text style={styles.featureDescription}>
                      Get simplified explanations of complex financial documents
                    </Text>
                  </View>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <MessageSquare size={24} color={colors.primary} />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Ask Questions</Text>
                    <Text style={styles.featureDescription}>
                      Get clear answers about any financial concept
                    </Text>
                  </View>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <PieChart size={24} color={colors.primary} />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Visual Insights</Text>
                    <Text style={styles.featureDescription}>
                      See your financial data visualized for better understanding
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
        
        {renderStepIndicator()}
        
        <View style={styles.footer}>
          {currentStep > 0 && (
            <Button
              title="Back"
              variant="outline"
              onPress={handleBack}
              leftIcon={<ChevronLeft size={18} color={colors.primary} />}
              style={styles.backButton}
            />
          )}
          
          <Button
            title={currentStep === 3 ? "Get Started" : "Next"}
            onPress={handleNext}
            rightIcon={currentStep < 3 ? <ChevronRight size={18} color={colors.white} /> : undefined}
            style={styles.nextButton}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// Import these at the top of the file
import { FileText, MessageSquare } from 'lucide-react-native';

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  step: {
    width,
    paddingHorizontal: 24,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  experienceOption: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedExperience: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  experienceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  selectedExperienceLabel: {
    color: colors.primary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  interestOption: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  selectedInterest: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  interestIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  selectedInterestIconContainer: {
    backgroundColor: colors.primary,
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  selectedInterestLabel: {
    color: colors.primary,
  },
  featuresContainer: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[600],
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  backButton: {
    flex: 1,
    marginRight: 12,
  },
  nextButton: {
    flex: 1,
  },
});