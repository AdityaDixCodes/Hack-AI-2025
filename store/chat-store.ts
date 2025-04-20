import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, ChatSession } from '@/types';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createSession: (documentName?: string) => string;
  deleteSession: (id: string) => void;
  setCurrentSession: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  renameSession: (id: string, title: string) => void;
  getCurrentSession: () => ChatSession | null;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: false,
      error: null,

      createSession: (documentName) => {
        const id = Date.now().toString();
        const newSession: ChatSession = {
          id,
          title: documentName || `New Chat ${get().sessions.length + 1}`,
          messages: [],
          documentName,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: id,
        }));
        
        return id;
      },
      
      deleteSession: (id) => {
        set((state) => {
          const newSessions = state.sessions.filter(session => session.id !== id);
          let newCurrentId = state.currentSessionId;
          
          if (state.currentSessionId === id) {
            newCurrentId = newSessions.length > 0 ? newSessions[0].id : null;
          }
          
          return {
            sessions: newSessions,
            currentSessionId: newCurrentId,
          };
        });
      },
      
      setCurrentSession: (id) => {
        set({ currentSessionId: id });
      },
      
      addMessage: (message) => {
        set((state) => {
          const currentSession = state.sessions.find(s => s.id === state.currentSessionId);
          if (!currentSession) return state;
          
          const newMessage: Message = {
            ...message,
            id: Date.now().toString(),
            timestamp: Date.now(),
          };
          
          const updatedSession = {
            ...currentSession,
            messages: [...currentSession.messages, newMessage],
            updatedAt: Date.now(),
          };
          
          return {
            sessions: state.sessions.map(s => 
              s.id === state.currentSessionId ? updatedSession : s
            ),
          };
        });
      },
      
      clearMessages: () => {
        set((state) => {
          const currentSession = state.sessions.find(s => s.id === state.currentSessionId);
          if (!currentSession) return state;
          
          const updatedSession = {
            ...currentSession,
            messages: [],
            updatedAt: Date.now(),
          };
          
          return {
            sessions: state.sessions.map(s => 
              s.id === state.currentSessionId ? updatedSession : s
            ),
          };
        });
      },
      
      renameSession: (id, title) => {
        set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === id ? { ...session, title, updatedAt: Date.now() } : session
          ),
        }));
      },
      
      getCurrentSession: () => {
        const state = get();
        return state.sessions.find(s => s.id === state.currentSessionId) || null;
      },
      
      setLoading: (isLoading) => {
        set({ isLoading });
      },
      
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'pifi-chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);