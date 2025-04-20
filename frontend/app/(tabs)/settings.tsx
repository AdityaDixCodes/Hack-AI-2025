import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useChatStore } from '@/store/chat-store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  HelpCircle, 
  Info, 
  ChevronRight,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const { profile, theme, updateProfile, setTheme, setOnboarded } = useUserStore();
  const { sessions, clearMessages } = useChatStore();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(theme === 'dark');
  
  const handleToggleDarkMode = (value: boolean) => {
    setDarkMode(value);
    setTheme(value ? 'dark' : 'light');
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };
  
  const handleToggleNotifications = (value: boolean) => {
    setNotifications(value);
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };
  
  const handleClearAllChats = () => {
    if (sessions.length === 0) {
      return;
    }
    
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to clear all chats? This action cannot be undone.')) {
        // Clear all chats
        sessions.forEach(session => {
          clearMessages();
        });
      }
    } else {
      Alert.alert(
        'Clear All Chats',
        'Are you sure you want to clear all chats? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear All', 
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              // Clear all chats
              sessions.forEach(session => {
                clearMessages();
              });
            }
          },
        ]
      );
    }
  };

  const handleReset = () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to restart the onboarding process? This will reset all your data.')) {
        resetAllData();
      }
    } else {
      Alert.alert(
        'Reset Profile',
        'Are you sure you want to restart the onboarding process? This will reset all your data.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reset', 
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              resetAllData();
            }
          },
        ]
      );
    }
  };

  const resetAllData = () => {
    // Reset user profile
    updateProfile({
      experienceLevel: 'beginner',
      financialInterests: [],
      name: undefined
    });

    // Clear all chat sessions
    sessions.forEach(() => {
      clearMessages();
    });

    // Reset onboarding flag
    setOnboarded(false);

    // Reset theme to system
    setTheme('system');
  };

  // Get the experience level with a fallback
  const experienceLevel = profile.experienceLevel || 'beginner';
  const formattedExperienceLevel = experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <User size={32} color={colors.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile.name || 'PiFi User'}
            </Text>
            <Text style={styles.profileLevel}>
              {formattedExperienceLevel} Level
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleReset}>
            <Text style={styles.editButtonText}>Reset Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Moon size={20} color={colors.text} />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Bell size={20} color={colors.text} />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <Card style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingButton}>
              <View style={styles.settingLabelContainer}>
                <Shield size={20} color={colors.text} />
                <Text style={styles.settingLabel}>Privacy & Security</Text>
              </View>
              <ChevronRight size={20} color={colors.gray[400]} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.settingButton}
              onPress={handleClearAllChats}
            >
              <View style={styles.settingLabelContainer}>
                <Trash2 size={20} color={colors.error} />
                <Text style={[styles.settingLabel, { color: colors.error }]}>
                  Clear All Chats
                </Text>
              </View>
              <ChevronRight size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <Card style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingButton}>
              <View style={styles.settingLabelContainer}>
                <HelpCircle size={20} color={colors.text} />
                <Text style={styles.settingLabel}>Help Center</Text>
              </View>
              <ChevronRight size={20} color={colors.gray[400]} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingButton}>
              <View style={styles.settingLabelContainer}>
                <Info size={20} color={colors.text} />
                <Text style={styles.settingLabel}>About PiFi</Text>
              </View>
              <ChevronRight size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>PiFi v1.0.0</Text>
        </View>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  profileLevel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
  },
  editButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingsCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: colors.gray[500],
  },
});