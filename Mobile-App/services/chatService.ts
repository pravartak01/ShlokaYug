/**
 * ChatBot Service
 * Handles AI chatbot API calls and message history
 */

import api, { AI_BACKEND_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChatRequest,
  ChatResponse,
  ConversationHistoryItem,
  Message,
} from '../types/chatbot';

/**
 * Send message to AI chatbot
 */
export const sendChatMessage = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  try {
    const formData = new FormData();
    
    // Add input type and persona
    formData.append('input_type', request.input_type);
    formData.append('persona', request.persona || 'default');
    
    // Add content based on input type
    if (request.input_type === 'text' && request.message) {
      formData.append('message', request.message);
    } else if (request.input_type === 'voice' && request.audio) {
      formData.append('audio', request.audio as any);
    } else if (request.input_type === 'image' && request.image) {
      formData.append('image', request.image as any);
    }
    
    // Add conversation history if provided
    if (request.conversation_history) {
      formData.append('conversation_history', request.conversation_history);
    }
    
    // Get auth token
    const token = await AsyncStorage.getItem('authToken');
    
    console.log('💬 Chat Request:', {
      url: `${AI_BACKEND_URL}/chat`,
      inputType: request.input_type,
      persona: request.persona,
      hasHistory: !!request.conversation_history,
    });
    
    // Make API request
    const response = await fetch(`${AI_BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    
    console.log('✅ Chat Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Chat Error:', errorData);
      throw new Error(errorData.message || `Chat request failed with status ${response.status}`);
    }
    
    const data: ChatResponse = await response.json();
    return data;
    
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
};

/**
 * Save message to history (Backend API)
 * Note: Requires authentication. Falls back gracefully if user not logged in.
 */
export const saveMessageToHistory = async (
  message: Message
): Promise<void> => {
  try {
    const historyRequest = {
      message_history: message.content,
      message_type: message.role === 'user' ? 'user_input' : 'bot_response',
      // Don't send timestamp - backend generates it
    };
    await api.post('/messages/history', historyRequest);
  } catch {
    // Silently fail if user not authenticated or validation fails
    // This allows chatbot to work for non-authenticated users
    console.log('Message not saved to history (user may not be logged in)');
    // Don't throw - history save failures shouldn't break chat flow
  }
};

/**
 * Get conversation history from backend and convert to Message format
 * Note: Requires authentication. Returns empty array if user not logged in.
 */
export const getMessageHistory = async (
  limit: number = 50
): Promise<Message[]> => {
  try {
    const response = await api.get('/messages/history', {
      params: { limit },
    });
    
    if (response.data.success && response.data.history) {
      return response.data.history.map((item: any, index: number) => ({
        id: item.id || `history-${index}`,
        role: item.message_type === 'user_input' ? 'user' : 'assistant',
        content: item.message_history,
        timestamp: new Date(item.timestamp || item.conversation_metadata?.timestamp),
        inputType: 'text',
      } as Message));
    }
    
    return [];
  } catch {
    // Return empty array if not authenticated or request fails
    // This allows chatbot to work for non-authenticated users
    return [];
  }
};

/**
 * Convert messages to conversation history format for API
 */
export const formatConversationHistory = (
  messages: Message[]
): string => {
  const historyItems: ConversationHistoryItem[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp.toISOString(),
  }));
  return JSON.stringify(historyItems);
};

/**
 * Get local chat history from AsyncStorage (fallback/cache)
 */
export const getLocalChatHistory = async (): Promise<ConversationHistoryItem[]> => {
  try {
    const history = await AsyncStorage.getItem('@chatbot:history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading local chat history:', error);
    return [];
  }
};

/**
 * Save chat history to local storage
 */
export const saveLocalChatHistory = async (
  messages: ConversationHistoryItem[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem('@chatbot:history', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving local chat history:', error);
  }
};

/**
 * Clear chat history
 */
export const clearChatHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@chatbot:history');
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
};
