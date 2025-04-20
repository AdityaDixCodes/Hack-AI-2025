export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }
  
  export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    documentName?: string;
    createdAt: number;
    updatedAt: number;
  }
  
  export interface UserProfile {
    name?: string;
    avatar?: string;
    financialInterests?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  }