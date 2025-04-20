import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { Stack, useLocalSearchParams } from 'expo-router';

import { colors } from '@/constants/colors';
import { useChatStore } from '@/store/chat-store';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { EmptyState } from '@/components/EmptyState';
import { FileUpload } from '@/components/FileUpload';   // ← your new component
import { Message } from '@/types';
import { Bot } from 'lucide-react-native';

const BACKEND_URL = 'http://127.0.0.1:8000'; // ← adjust

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    sessions,
    setCurrentSession,
    addMessage,
    isLoading,
    setLoading,
    setError,
  } = useChatStore();

  const [indexed, setIndexed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // keep track of the picked file
  const [pickedFile, setPickedFile] = useState<null | {
    uri: string;
    name: string;
    type: string;
  }>(null);

  // 1) on mount, set session & check status
  useEffect(() => {
    if (id) setCurrentSession(id);
    axios.get(`${BACKEND_URL}/status`)
      .then(r => setIndexed(r.data.indexed))
      .catch(() => setError('Cannot reach backend.'));
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [id]);

  // 2) sync messages
  useEffect(() => {
    const sess = sessions.find(s => s.id === id);
    if (sess) {
      setMessages(sess.messages);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [sessions, id]);

  // 3) whenever a file is selected, upload it
  useEffect(() => {
    (async () => {
      if (!pickedFile) return;
      try {
        const fd = new FormData();
        fd.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.type,
        } as any);
        await axios.post(
          `${BACKEND_URL}/upload`,
          fd,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setIndexed(true);
      } catch (err) {
        console.error(err);
        setError('Upload failed. Try again.');
      }
    })();
  }, [pickedFile]);

  // 4) send a chat message
  const handleSendMessage = async (content: string) => {
    addMessage({ role: 'user', content });
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${BACKEND_URL}/ask`,
        { question: content },
        { headers: { 'Content-Type': 'application/json' } }
      );
      addMessage({ role: 'assistant', content: data.answer });
    } catch (err) {
      console.error(err);
      setError('Failed to get response.');
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // If not indexed, show the FileUpload UI
  if (!indexed) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.uploadContainer}>
          <Bot size={64} color={colors.primary} />
          <EmptyState
            title="Upload Annual Report"
            description="Select a PDF to power your AI Q&A."
          />
          <FileUpload
            acceptedTypes={['application/pdf']}
            maxSize={20 * 1024 * 1024}
            onFileSelect={file => {
              if (file) {
                setPickedFile({
                  uri: file.uri,
                  name: file.name,
                  type: file.mimeType || 'application/pdf',
                });
              } else {
                setPickedFile(null);
              }
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Once indexed, render the chat interface
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerTitle: sessions.find(s => s.id === id)?.title || 'PiFi Chat',
        }}
      />
      <Animated.View style={[styles.chatContainer, { opacity: fadeAnim }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item, index }) => (
            <ChatMessage
              message={item}
              isLoading={isLoading && index === messages.length - 1 && item.role === 'assistant'}
            />
          )}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={() => (
            <EmptyState
              title="Ask a Question"
              description="Start typing below to query your report."
            />
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  chatContainer: { flex: 1 },
  messagesList: { flexGrow: 1, paddingVertical: 12 },
  loadingContainer: { padding: 12, alignItems: 'center' },
});
