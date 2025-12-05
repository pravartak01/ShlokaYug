# AI ChatBot Implementation

## Overview
A global, multimodal AI chatbot integrated throughout the entire app with a floating interface. Supports text, voice, and image inputs with conversation history persistence.

## Features

### 🎨 Design
- **Floating Button**: Constant bottom-right floating icon on all screens
- **Expandable Interface**: Smooth spring animation to 70% screen height
- **Vintage Theme**: Brown gradients (#8D6E63, #6D4C41) matching app design
- **Persona Switcher**: Toggle between Default (Svaram AI) and Krishna personas

### 🎤 Multimodal Input
- **Text**: Standard text input with send button
- **Voice**: Audio recording with pulse animation and stop/send
- **Image**: Photo library picker with instant upload

### 💾 Message History
- **Backend Storage**: Saved to Express API (`/messages/history`)
- **Local Cache**: AsyncStorage fallback for offline
- **Auto-Load**: Fetches history on app startup
- **Conversation Context**: Full history sent with each AI request

### 🤖 AI Integration
- **Endpoint**: `AI_BACKEND_URL/chat` (port 8000)
- **Confidence**: Shows percentage for bot responses
- **Sources**: Lists reference materials used
- **Suggestions**: Clickable suggestion chips for follow-up questions

## File Structure

```
Mobile-App/
├── types/
│   └── chatbot.ts                 # TypeScript interfaces
├── services/
│   └── chatService.ts             # API integration & history
├── context/
│   └── ChatBotContext.tsx         # Global state management
├── components/
│   └── chatbot/
│       ├── ChatMessage.tsx        # Message bubble component
│       ├── ChatInput.tsx          # Multi-input component
│       └── FloatingChatBot.tsx    # Main chatbot UI
└── app/
    └── _layout.tsx                # Global integration
```

## Component Details

### ChatMessage.tsx
Displays individual messages with differentiated styling:
- **User**: Right-aligned, brown gradient, no avatar
- **Bot**: Left-aligned, light gradient, avatar icon
- **Features**: Confidence badge, sources list, suggestion chips
- **Props**: `message: Message`, `onSuggestionPress: (text) => void`

### ChatInput.tsx
Multi-modal input interface:
- **Text Mode**: TextInput with send button
- **Voice Mode**: Recording with pulse animation, stop button
- **Image Mode**: Photo library picker
- **Props**: `onSendMessage: (content, type, file?) => void`, `disabled?: boolean`

### FloatingChatBot.tsx
Main chatbot interface:
- **Collapsed**: Floating button (60x60) bottom-right
- **Expanded**: Full chat interface (70% screen height)
- **Header**: Avatar, persona name, toggle button, minimize button
- **Messages**: ScrollView with auto-scroll to bottom
- **Empty State**: Welcome message with icon
- **Loading**: Animated dots while waiting for response

### ChatBotContext.tsx
Global state provider:
- **State**: `messages`, `loading`, `persona`
- **Methods**: `sendMessage()`, `clearHistory()`, `setPersona()`
- **Auto-Load**: Fetches history on mount
- **Error Handling**: Graceful fallbacks for network errors

## API Reference

### Chat API (`/chat`)
```typescript
// Request (FormData)
{
  input_type: 'text' | 'voice' | 'image',
  persona: 'default' | 'krishna',
  message?: string,
  audio?: File,
  image?: File,
  conversation_history: JSON string
}

// Response
{
  response: string,
  confidence: number,
  input_detected: string,
  sources: string[],
  suggestions: string[]
}
```

### Message History API (`/messages/history`)
```typescript
// POST - Save message
{
  message_history: string,
  message_type: 'user' | 'bot',
  timestamp: ISO string
}

// GET - Fetch history
Query: { limit: number }
Response: {
  success: boolean,
  history: Array<{
    id: string,
    message_history: string,
    message_type: string,
    timestamp: string
  }>
}
```

## Usage

The chatbot is automatically available on all screens after integration in `app/_layout.tsx`:

```tsx
<ChatBotProvider>
  <RootLayoutNav />
  <FloatingChatBot />
</ChatBotProvider>
```

### Access from Components
```tsx
import { useChatBot } from '../context/ChatBotContext';

const MyComponent = () => {
  const { messages, sendMessage, persona, setPersona } = useChatBot();
  
  // Send a text message
  await sendMessage('What is chandas?', 'text');
  
  // Switch to Krishna persona
  setPersona('krishna');
};
```

## Personas

### Default (Svaram AI)
- **Icon**: Chat bubble
- **Title**: "Svaram AI"
- **Subtitle**: "Sanskrit Learning Assistant"
- **Focus**: Technical assistance with Sanskrit, chandas, pronunciation

### Krishna
- **Icon**: Om symbol
- **Title**: "श्री कृष्ण"
- **Subtitle**: "Divine Guide"
- **Focus**: Bhagavad Gita, dharma, spiritual guidance

## Styling

All components use the vintage theme:
- **Primary**: `#8D6E63` (brown)
- **Secondary**: `#6D4C41` (dark brown)
- **Text**: `#EFEBE9` (light beige)
- **Accent**: `#A1887F` (medium brown)
- **Border**: `#4A2E1C` (deep brown)

Gradients use `expo-linear-gradient` for depth and visual appeal.

## Implementation Highlights

### 1. Modular Architecture
Each component is self-contained and reusable:
- ChatMessage handles display logic
- ChatInput handles all input modes
- FloatingChatBot orchestrates the UI
- ChatBotContext manages global state

### 2. Animation
- Spring animation for expand/collapse (tension: 50, friction: 8)
- Pulse animation for recording button
- Smooth scroll to bottom on new messages

### 3. Error Handling
- Network errors show user-friendly messages
- History save failures don't break chat flow
- Graceful fallback to local storage

### 4. Performance
- Lazy message rendering with ScrollView
- Optimized re-renders with proper state management
- Debounced scroll-to-bottom

## Testing Checklist

- [ ] Floating button appears on all screens
- [ ] Expand/collapse animation is smooth
- [ ] Text input sends messages correctly
- [ ] Voice recording captures audio
- [ ] Image picker uploads photos
- [ ] Message history loads on startup
- [ ] Suggestions are clickable
- [ ] Persona switch updates avatar/title
- [ ] Confidence badge displays correctly
- [ ] Sources list renders properly
- [ ] Scroll to bottom on new messages
- [ ] Loading animation shows while waiting
- [ ] Error messages display for failed requests

## Future Enhancements

1. **Voice Output**: Text-to-speech for bot responses
2. **Typing Indicator**: Show when bot is "thinking"
3. **Message Reactions**: Like/dislike for feedback
4. **Search**: Find messages in history
5. **Export**: Download conversation as PDF/text
6. **Offline Mode**: Queue messages when offline
7. **Push Notifications**: Alert for async responses
8. **Multi-language**: Support for Sanskrit/Hindi responses
