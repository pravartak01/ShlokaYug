import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ShlokaLine } from '../../../data/shlokas';

interface LyricsDisplayProps {
  lines: ShlokaLine[];
  currentLineIndex: number;
  currentWordIndex: number;
  showTransliteration: boolean;
  showTranslation: boolean;
  wordPulseAnim: Animated.Value;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lines,
  currentLineIndex,
  currentWordIndex,
  showTransliteration,
  showTranslation,
  wordPulseAnim,
}) => {
  const renderLine = (line: ShlokaLine, lineIndex: number) => {
    const isActive = lineIndex === currentLineIndex;
    const isPast = lineIndex < currentLineIndex;
    const isFuture = lineIndex > currentLineIndex;

    return (
      <View key={lineIndex} style={styles.lineContainer}>
        {/* Sanskrit Text */}
        <View style={styles.sanskritContainer}>
          {line.words.map((wordObj, wordIndex) => {
            const isCurrentWord = isActive && wordIndex === currentWordIndex;
            const isWordPast = isActive && wordIndex < currentWordIndex;
            const isWordFuture = isActive && wordIndex > currentWordIndex;

            return (
              <Animated.Text
                key={wordObj.id || wordIndex}
                style={[
                  styles.sanskritWord,
                  isPast && styles.pastWord,
                  isCurrentWord && styles.currentWord,
                  isFuture && styles.futureWord,
                  isCurrentWord && {
                    transform: [{ scale: wordPulseAnim }],
                  },
                ]}
              >
                {wordObj.text}{' '}
              </Animated.Text>
            );
          })}
        </View>

        {/* Transliteration */}
        {showTransliteration && line.transliteration && (
          <Text
            style={[
              styles.transliteration,
              isActive && styles.activeTransliteration,
            ]}
          >
            {line.transliteration}
          </Text>
        )}

        {/* Translation */}
        {showTranslation && line.translation && (
          <Text
            style={[styles.translation, isActive && styles.activeTranslation]}
          >
            {line.translation}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {lines.map((line, index) => renderLine(line, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  lineContainer: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sanskritContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  sanskritWord: {
    fontSize: 24,
    fontWeight: '600',
    color: '#D7CCC8',
    lineHeight: 36,
    transition: 'all 0.3s ease',
  },
  pastWord: {
    color: '#8D6E63',
    opacity: 0.6,
  },
  currentWord: {
    color: '#EFEBE9',
    fontWeight: '700',
    textShadowColor: 'rgba(141, 110, 99, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  futureWord: {
    color: '#A1887F',
    opacity: 0.4,
  },
  transliteration: {
    fontSize: 16,
    color: '#BCAAA4',
    fontStyle: 'italic',
    marginBottom: 4,
    opacity: 0.7,
  },
  activeTransliteration: {
    color: '#D7CCC8',
    opacity: 1,
  },
  translation: {
    fontSize: 14,
    color: '#A1887F',
    lineHeight: 20,
    opacity: 0.6,
  },
  activeTranslation: {
    color: '#BCAAA4',
    opacity: 1,
  },
});
