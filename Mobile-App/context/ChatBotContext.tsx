import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Message, Persona, InputType } from '../types/chatbot';
import {
  sendChatMessage,
  saveMessageToHistory,
  getMessageHistory,
  formatConversationHistory,
} from '../services/chatService';

interface ChatBotContextType {
  messages: Message[];
  loading: boolean;
  persona: Persona;
  setPersona: (persona: Persona) => void;
  sendMessage: (content: string, inputType: InputType, file?: any) => Promise<void>;
  clearHistory: () => void;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

interface ChatBotProviderProps {
  children: ReactNode;
}

export const ChatBotProvider: React.FC<ChatBotProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<Persona>('default');

  // Load message history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getMessageHistory();
      if (history && history.length > 0) {
        setMessages(history);
      }
    } catch (error) {
      console.error('Failed to load message history:', error);
      // Continue with empty messages if history fails to load
    }
  };

  const sendMessage = async (
    content: string,
    inputType: InputType,
    file?: any
  ) => {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      inputType,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Prepare conversation history
      const conversationHistory = formatConversationHistory(messages);

      // Send to AI
      const response = await sendChatMessage({
        input_type: inputType,
        persona,
        message: inputType === 'text' ? content : undefined,
        audio: inputType === 'voice' ? file : undefined,
        image: inputType === 'image' ? file : undefined,
        conversation_history: conversationHistory,
      });

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        inputType: 'text',
        confidence: response.confidence,
        sources: response.sources,
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Save both messages to backend history
      try {
        await saveMessageToHistory(userMessage);
        await saveMessageToHistory(botMessage);
      } catch (historyError) {
        console.error('Failed to save message history:', historyError);
        // Don't fail the whole operation if history save fails
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'I apologize, but I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        inputType: 'text',
      };

      setMessages((prev) => [...prev, errorMessage]);
      
      Alert.alert(
        'Error',
        'Failed to send message. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    setMessages([]);
    // Clear local storage
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.removeItem('chatbot_messages');
    } catch (error) {
      console.error('Failed to clear local history:', error);
    }
  };

  const value: ChatBotContextType = {
    messages,
    loading,
    persona,
    setPersona,
    sendMessage,
    clearHistory,
  };

  return (
    <ChatBotContext.Provider value={value}>
      {children}
    </ChatBotContext.Provider>
  );
};

export const useChatBot = (): ChatBotContextType => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
};
