/**
 * ChatBot Types
 * Type definitions for the AI chatbot
 */

export type InputType = 'text' | 'voice' | 'image';
export type Persona = 'default' | 'krishna';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  inputType?: InputType;
  confidence?: number;
  sources?: string[];
  suggestions?: string[];
}

export interface ConversationHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  input_type: InputType;
  persona?: Persona;
  message?: string;
  conversation_history?: string; // JSON string
  audio?: any; // File
  image?: any; // File
}

export interface ChatResponse {
  confidence: number;
  input_detected: string;
  response: string;
  sources?: string[];
  suggestions?: string[];
}

export interface MessageHistoryRequest {
  message_history: string;
  message_type: 'user' | 'bot';
  timestamp: string;
  metadata?: {
    input_type?: InputType;
    persona?: Persona;
    confidence?: number;
    sources?: string[];
    suggestions?: string[];
  };
}
