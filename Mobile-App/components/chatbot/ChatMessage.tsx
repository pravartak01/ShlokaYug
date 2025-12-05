import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Message } from '../../types/chatbot';

interface ChatMessageProps {
  message: Message;
  onSuggestionPress?: (suggestion: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSuggestionPress,
}) => {
  const isUser = message.role === 'user';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <LinearGradient
            colors={['#8D6E63', '#6D4C41']}
            style={styles.avatarGradient}
          >
            <MaterialCommunityIcons name="chat" size={20} color="#EFEBE9" />
          </LinearGradient>
        </View>
      )}

      <View style={[styles.messageWrapper, isUser && styles.userMessageWrapper]}>
        <LinearGradient
          colors={
            isUser
              ? ['#5D4037', '#4E342E']
              : ['#EFEBE9', '#EFEBE9']
          }
          style={styles.bubble}
        >
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {message.content}
          </Text>

          {!isUser && message.confidence && (
            <View style={styles.metadataRow}>
              <View style={styles.confidenceBadge}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={12}
                  color="#4CAF50"
                />
                <Text style={styles.confidenceText}>
                  {Math.round(message.confidence * 100)}% confident
                </Text>
              </View>
            </View>
          )}

          {!isUser && message.sources && message.sources.length > 0 && (
            <View style={styles.sourcesContainer}>
              <Text style={styles.sourcesLabel}>Sources:</Text>
              {message.sources.map((source: string, index: number) => (
                <Text key={index} style={styles.sourceText}>
                  • {source}
                </Text>
              ))}
            </View>
          )}

          <Text style={styles.timestamp}>{formattedTime}</Text>
        </LinearGradient>

        {/* Suggestions */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsLabel}>Suggested questions:</Text>
            {message.suggestions.map((suggestion: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => onSuggestionPress?.(suggestion)}
              >
                <LinearGradient
                  colors={['rgba(141, 110, 99, 0.3)', 'rgba(109, 76, 65, 0.3)']}
                  style={styles.suggestionGradient}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={16}
                    color="#8D6E63"
                  />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    marginRight: 8,
    marginTop: 4,
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A2E1C',
  },
  messageWrapper: {
    maxWidth: '75%',
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7CCC8',
  },
  messageText: {
    fontSize: 14,
    color: '#4E342E',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#EFEBE9',
  },
  timestamp: {
    fontSize: 10,
    color: '#8D6E63',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  sourcesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  sourcesLabel: {
    fontSize: 11,
    color: '#6D4C41',
    fontWeight: '600',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 11,
    color: '#8D6E63',
    marginLeft: 4,
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsLabel: {
    fontSize: 12,
    color: '#6D4C41',
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionButton: {
    marginBottom: 8,
  },
  suggestionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7CCC8',
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    color: '#6D4C41',
    marginRight: 8,
  },
});
