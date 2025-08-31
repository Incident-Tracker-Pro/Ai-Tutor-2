export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface APISettings {
  googleApiKey: string;
  zhipuApiKey: string;
  selectedModel: 'google' | 'zhipu';
}

export type ModelProvider = 'google' | 'zhipu';