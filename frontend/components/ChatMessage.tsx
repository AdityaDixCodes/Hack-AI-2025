import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Message } from '@/types';
import { colors } from '@/constants/colors';
import { Bot, User } from 'lucide-react-native';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message,
  isLoading = false
}) => {
  const isUser = message.role === 'user';
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer
    ]}>
      <View style={styles.avatarContainer}>
        {isUser ? (
          <View style={[styles.avatar, styles.userAvatar]}>
            <User size={16} color={colors.white} />
          </View>
        ) : (
          <View style={[styles.avatar, styles.assistantAvatar]}>
            <Bot size={16} color={colors.white} />
          </View>
        )}
      </View>
      
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.assistantMessageText
        ]}>
          {message.content}
        </Text>
        
        {isLoading && (
          <ActivityIndicator 
            size="small" 
            color={colors.primary} 
            style={styles.loadingIndicator} 
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    backgroundColor: colors.primary,
  },
  assistantAvatar: {
    backgroundColor: colors.secondary,
  },
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 4,
  },
  userMessageContainer: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  assistantMessageContainer: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.white,
  },
  assistantMessageText: {
    color: colors.text,
  },
  loadingIndicator: {
    marginTop: 8,
  },
});