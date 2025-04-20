import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { useChatStore } from '@/store/chat-store';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { EmptyState } from '@/components/EmptyState';
import { Message } from '@/types';
import { Bot } from 'lucide-react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    sessions, 
    currentSessionId, 
    setCurrentSession, 
    addMessage, 
    isLoading, 
    setLoading, 
    setError 
  } = useChatStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Set current session
    if (id) {
      setCurrentSession(id);
    }
    
    // Start animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [id]);
  
  useEffect(() => {
    // Update messages when current session changes
    const currentSession = sessions.find(s => s.id === id);
    if (currentSession) {
      setMessages(currentSession.messages);
      
      // Set header title
      if (Platform.OS !== 'web') {
        // This would be implemented if we had access to navigation
      }
    }
  }, [sessions, id]);
  
  const handleSendMessage = async (content: string) => {
    // Add user message
    addMessage({
      role: 'user',
      content,
    });
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      setLoading(true);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponses = [
          "Based on the financial report you've shared, I notice that the company's revenue has grown by 12.4% year-over-year, which is a positive indicator of business expansion.",
          "Looking at the balance sheet, I can see that the company has a healthy cash reserve of $2.4M, which provides good liquidity for operations and potential investments.",
          "The profit margin of 18.2% is above industry average, suggesting efficient cost management and strong pricing power in the market.",
          "I've analyzed the debt-to-equity ratio in your report, which stands at 0.8. This is generally considered a healthy level, indicating the company isn't overleveraged.",
          "The report shows quarterly earnings growth of 8.3%, which demonstrates consistent performance and could be attractive to potential investors.",
        ];
        
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        
        addMessage({
          role: 'assistant',
          content: randomResponse,
        });
        
        setLoading(false);
        
        // Scroll to bottom after response
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get a response. Please try again.');
      setLoading(false);
    }
  };
  
  const renderEmptyState = () => (
    <EmptyState
      title="Start a conversation"
      description="Ask questions about financial reports, concepts, or get explanations for complex financial terms."
      icon={<Bot size={48} color={colors.primary} />}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerTitle: sessions.find(s => s.id === id)?.title || "Financial Analysis",
        }} 
      />
      
      <Animated.View style={[styles.chatContainer, { opacity: fadeAnim }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ChatMessage 
              message={item} 
              isLoading={isLoading && index === messages.length - 1 && item.role === 'user'} 
            />
          )}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={renderEmptyState}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />
        
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
        
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={isLoading}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
});