import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChatBot } from '../../context/ChatBotContext';

export const FloatingChatBot: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { messages, loading, sendMessage, persona, setPersona } = useChatBot();
  
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const screenHeight = Dimensions.get('window').height;
  const chatHeight = screenHeight * 0.8;

  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [expanded, expandAnim]);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleSendMessage = async (content: string, type: any, file?: any) => {
    await sendMessage(content, type, file);
    
    // Scroll to bottom after sending
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSendMessage(suggestion, 'text');
  };

  const togglePersona = () => {
    setPersona(persona === 'default' ? 'krishna' : 'default');
  };

  const chatContainerHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, chatHeight],
  });

  const opacity = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!expanded) {
    // Floating button only
    return (
      <TouchableOpacity
        style={[
          styles.floatingButton,
          {
            bottom: Platform.OS === 'ios' ? insets.bottom + 80 : 80,
            right: 20,
          },
        ]}
        onPress={toggleExpand}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#8D6E63', '#6D4C41']}
          style={styles.floatingGradient}
        >
          <MaterialCommunityIcons name="chat" size={28} color="#EFEBE9" />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Expanded chat interface
  return (
    <Animated.View
      style={[
        styles.chatContainer,
        {
          height: chatContainerHeight,
          opacity,
          bottom: 0,
        },
      ]}
    >
      <View style={styles.chatGradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#8D6E63', '#6D4C41']}
                style={styles.avatar}
              >
                <MaterialCommunityIcons
                  name={persona === 'krishna' ? 'om' : 'chat'}
                  size={20}
                  color="#EFEBE9"
                />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.headerTitle}>
                {persona === 'krishna' ? 'श्री कृष्ण' : 'Svaram AI'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {persona === 'krishna'
                  ? 'Divine Guide'
                  : 'Sanskrit Learning Assistant'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* Persona Toggle */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={togglePersona}
            >
              <MaterialCommunityIcons
                name={persona === 'krishna' ? 'account-circle' : 'om'}
                size={20}
                color="#A1887F"
              />
            </TouchableOpacity>

            {/* Minimize Button */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={toggleExpand}
            >
              <MaterialCommunityIcons
                name="chevron-down"
                size={24}
                color="#A1887F"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name={persona === 'krishna' ? 'om' : 'chat-outline'}
                size={64}
                color="#8D6E63"
              />
              <Text style={styles.emptyTitle}>
                {persona === 'krishna'
                  ? 'नमस्ते (Namaste)'
                  : 'Welcome to Svaram AI'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {persona === 'krishna'
                  ? 'Ask me about Bhagavad Gita, dharma, or life guidance'
                  : 'Ask me about Sanskrit, chandas, shlokas, or pronunciation'}
              </Text>
            </View>
          ) : (
            messages.map((message: any) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSuggestionPress={handleSuggestionPress}
              />
            ))
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBubble}>
                <View style={styles.loadingDot} />
                <View style={[styles.loadingDot, { marginLeft: 8 }]} />
                <View style={[styles.loadingDot, { marginLeft: 8 }]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    zIndex: 999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A2E1C',
  },
  chatContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 998,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#8D6E63',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  chatGradient: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D7CCC8',
    backgroundColor: '#EFEBE9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8D6E63',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4E342E',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6D4C41',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4E342E',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6D4C41',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  loadingBubble: {
    flexDirection: 'row',
    backgroundColor: '#EFEBE9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7CCC8',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8D6E63',
  },
});
