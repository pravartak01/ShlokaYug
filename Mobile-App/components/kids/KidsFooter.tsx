import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

export const KidsFooter: React.FC = () => {
  return (
    <Animatable.View
      animation="fadeInUp"
      duration={800}
      delay={600}
      style={styles.container}
    >
      <LinearGradient
        colors={['#fef3c7', '#fde68a']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Shloka</Text>
            <Text style={styles.logoAccent}>Yug</Text>
          </View>

          <Text style={styles.tagline}>Made for Little Learners</Text>
          <Text style={styles.subTagline}>Learning Sanskrit is Fun!</Text>
        </View>

        {/* Bottom wave decoration */}
        <View style={styles.wave} />
      </LinearGradient>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 20,
  },
  gradient: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fbbf24',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    zIndex: 5,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#78350f',
    letterSpacing: 0.5,
  },
  logoAccent: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f59e0b',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subTagline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#fbbf24',
    opacity: 0.3,
  },
});
