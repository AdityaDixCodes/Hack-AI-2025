import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types';

interface UserState {
  profile: UserProfile;
  isOnboarded: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  updateProfile: (profile: Partial<UserProfile>) => void;
  setOnboarded: (value: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {
        experienceLevel: 'beginner',
        financialInterests: [],
      },
      isOnboarded: false,
      theme: 'system',
      
      updateProfile: (profile) => {
        set((state) => ({
          profile: { ...state.profile, ...profile },
        }));
      },
      
      setOnboarded: (value) => {
        set({ isOnboarded: value });
      },
      
      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: 'pifi-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);