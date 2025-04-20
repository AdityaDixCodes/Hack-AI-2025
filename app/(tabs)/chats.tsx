import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Animated, 
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { useChatStore } from '@/store/chat-store';
import { SessionCard } from '@/components/SessionCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { MessageSquarePlus, WheatIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChatsScreen() {
  const { sessions, currentSessionId, createSession, deleteSession, setCurrentSession } = useChatStore();
  
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
  
  const handleCreateSession = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const sessionId = createSession();
    router.push(`/chat/${sessionId}`);
  };
  
  const handleSelectSession = (sessionId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    setCurrentSession(sessionId);
    router.push(`/chat/${sessionId}`);
  };
  
  const handleDeleteSession = (sessionId: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this chat?')) {
        deleteSession(sessionId);
      }
    } else {
      Alert.alert(
        'Delete Chat',
        'Are you sure you want to delete this chat? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              deleteSession(sessionId);
            }
          },
        ]
      );
    }
  };
  
  const renderEmptyState = () => (
    <EmptyState
      title="No chats yet"
      description="Start a new chat to ask questions about financial reports or concepts."
      actionLabel="Start New Chat"
      onAction={handleCreateSession}
    />
  );

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('@/assets/images/image.png')} 
        style={styles.backgroundImage}
      >
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <Animated.View 
            style={[
              styles.headerContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
           
              <Text style={[styles.subtitle, { color: 'white' }]}>
              Explore past conversations
              </Text>
              <Text style={[styles.subtitleSmall, { color: 'gray' }]}>
              Pick up where you left off with your AI financial assistant
              </Text>
            <Button
              title="New Chat"
              onPress={handleCreateSession}
              leftIcon={<MessageSquarePlus size={18} color={colors.white} />}
              style={styles.newChatButton}
            />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.listContainer,
              { opacity: fadeAnim }
            ]}
          >
            <FlatList
              data={sessions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SessionCard
                  session={item}
                  isActive={item.id === currentSessionId}
                  onPress={() => handleSelectSession(item.id)}
                  onDelete={() => handleDeleteSession(item.id)}
                />
              )}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,

},
  gradientContainer: {
    marginTop: 40,
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 60,
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

  newChatButton: {
    alignSelf: 'flex-start',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
});