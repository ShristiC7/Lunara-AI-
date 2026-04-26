import { api } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatService = {
  sendMessage: async (prompt: string, history: ChatMessage[]) => {
    const res = await api.post('/chat/message', { prompt, history });
    return res.data.data;
  },
};
