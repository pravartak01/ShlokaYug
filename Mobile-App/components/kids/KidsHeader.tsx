import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

interface KidsHeaderProps {
  onBackPress: () => void;
}

export const KidsHeader: React.FC<KidsHeaderProps> = ({ onBackPress }) => {
  return (
    <LinearGradient
      colors={['#fbbf24', '#f59e0b', '#f97316']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative circles */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={3000}
        style={[styles.decorCircle, styles.decorCircle1]}
      />
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={4000}
        style={[styles.decorCircle, styles.decorCircle2]}
      />

      <View style={styles.content}>
        {/* Back Button */}
        <Animatable.View animation="fadeInLeft" duration={800}>
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back-circle" size={32} color="#ffffff" />
            
          </TouchableOpacity>
        </Animatable.View>

        {/* Center Title */}
        <Animatable.View
          animation="fadeInDown"
          duration={800}
          delay={200}
          style={styles.titleContainer}
        >
          <View style={styles.titleContent}>
            <Text style={styles.title}>Kids Learning Zone</Text>
            <Text style={styles.subtitle}>Fun Sanskrit Adventures</Text>
          </View>
        </Animatable.View>

        {/* Right Icon */}
        <Animatable.View
          animation="fadeInRight"
          duration={800}
          delay={400}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={28} color="#ffffff" />
          </View>
        </Animatable.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  decorCircle1: {
    width: 120,
    height: 120,
    top: -40,
    right: -30,
  },
  decorCircle2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: -20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  titleContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fffbeb',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
  },
});
