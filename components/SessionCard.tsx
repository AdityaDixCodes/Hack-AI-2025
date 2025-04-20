import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { FileText, Clock, Trash2 } from 'lucide-react-native';
import { ChatSession } from '@/types';

interface SessionCardProps {
  session: ChatSession;
  onPress: () => void;
  onDelete: () => void;
  isActive?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onPress,
  onDelete,
  isActive = false,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && styles.activeContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <FileText size={20} color={isActive ? colors.primary : colors.gray[500]} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text 
          style={[styles.title, isActive && styles.activeTitle]} 
          numberOfLines={1}
        >
          {session.title}
        </Text>
        
        <View style={styles.metaContainer}>
          <Clock size={12} color={colors.gray[500]} />
          <Text style={styles.date}>{formatDate(session.updatedAt)}</Text>
          <Text style={styles.messageCount}>
            {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Trash2 size={16} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeContainer: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '15',
  },
  iconContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  activeTitle: {
    color: colors.primary,
    fontWeight: '600',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 4,
    marginRight: 8,
  },
  messageCount: {
    fontSize: 12,
    color: colors.gray[500],
  },
  deleteButton: {
    padding: 4,
  },
});