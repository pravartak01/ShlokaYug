import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ScoreDisplayProps {
  // Score data
  score: number; // 0-100
  label?: string;
  
  // Display type
  type?: 'circular' | 'horizontal' | 'vertical' | 'compact';
  
  // Size
  size?: 'small' | 'medium' | 'large';
  
  // Customization
  showPercentage?: boolean;
  showGrade?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  animationDuration?: number;
  
  // Colors
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  useGradient?: boolean;
  
  // Breakdown
  breakdown?: ScoreBreakdown[];
  showBreakdown?: boolean;
  
  // Style
  style?: object;
}

interface ScoreBreakdown {
  label: string;
  score: number;
  icon?: string;
  color?: string;
}

const SIZES = {
  small: { circle: 80, stroke: 6, fontSize: 20, labelSize: 10 },
  medium: { circle: 120, stroke: 8, fontSize: 32, labelSize: 12 },
  large: { circle: 160, stroke: 10, fontSize: 44, labelSize: 14 },
};

const getGradeFromScore = (score: number): { grade: string; color: string } => {
  if (score >= 90) return { grade: 'A+', color: '#4CAF50' };
  if (score >= 80) return { grade: 'A', color: '#8BC34A' };
  if (score >= 70) return { grade: 'B+', color: '#CDDC39' };
  if (score >= 60) return { grade: 'B', color: '#FFEB3B' };
  if (score >= 50) return { grade: 'C', color: '#FFC107' };
  if (score >= 40) return { grade: 'D', color: '#FF9800' };
  return { grade: 'F', color: '#F44336' };
};

const getColorFromScore = (score: number): string => {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FF9800';
  if (score >= 40) return '#FFC107';
  return '#F44336';
};

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  label = 'Score',
  type = 'circular',
  size = 'medium',
  showPercentage = true,
  showGrade = true,
  showIcon = true,
  animated = true,
  animationDuration = 1500,
  primaryColor,
  secondaryColor,
  backgroundColor = '#F5F5F5',
  textColor = '#333',
  useGradient = true,
  breakdown = [],
  showBreakdown = false,
  style = {},
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const sizeConfig = SIZES[size];
  const { grade, color: gradeColor } = getGradeFromScore(score);
  const scoreColor = primaryColor || getColorFromScore(score);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: score,
        duration: animationDuration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(score);
    }
  }, [score, animated, animationDuration]);

  const displayScore = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  // Circular Progress Component
  const CircularScore = () => {
    const circumference = 2 * Math.PI * ((sizeConfig.circle - sizeConfig.stroke) / 2);
    const strokeDashoffset = animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: [circumference, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.circularContainer, { width: sizeConfig.circle, height: sizeConfig.circle }]}>
        {/* Background Circle */}
        <View style={[styles.circleBackground, { 
          width: sizeConfig.circle, 
          height: sizeConfig.circle,
          borderRadius: sizeConfig.circle / 2,
          borderWidth: sizeConfig.stroke,
          borderColor: backgroundColor,
        }]} />
        
        {/* Progress Circle - SVG would be ideal but using View for simplicity */}
        <Animated.View
          style={[
            styles.circleProgress,
            {
              width: sizeConfig.circle,
              height: sizeConfig.circle,
              borderRadius: sizeConfig.circle / 2,
              borderWidth: sizeConfig.stroke,
              borderColor: scoreColor,
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: [
                { rotate: '-45deg' },
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Center Content */}
        <View style={styles.circleCenter}>
          <Animated.Text
            style={[
              styles.scoreText,
              {
                fontSize: sizeConfig.fontSize,
                color: textColor,
              },
            ]}
          >
            {Math.round(score)}
          </Animated.Text>
          {showPercentage && (
            <Text style={[styles.percentageText, { color: textColor + '80' }]}>%</Text>
          )}
          {showGrade && (
            <Text style={[styles.gradeText, { color: gradeColor, fontSize: sizeConfig.labelSize + 2 }]}>
              {grade}
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Horizontal Progress Bar
  const HorizontalScore = () => (
    <View style={styles.horizontalContainer}>
      <View style={styles.horizontalHeader}>
        <Text style={[styles.horizontalLabel, { color: textColor }]}>{label}</Text>
        <Text style={[styles.horizontalScore, { color: scoreColor }]}>
          {Math.round(score)}%
        </Text>
      </View>
      <View style={[styles.horizontalBarBg, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.horizontalBarFill,
            {
              backgroundColor: scoreColor,
              width: animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );

  // Compact Score
  const CompactScore = () => (
    <View style={[styles.compactContainer, { backgroundColor: scoreColor + '20' }]}>
      {showIcon && (
        <MaterialCommunityIcons
          name={score >= 70 ? 'star' : score >= 40 ? 'star-half-full' : 'star-outline'}
          size={20}
          color={scoreColor}
        />
      )}
      <Text style={[styles.compactScore, { color: scoreColor }]}>
        {Math.round(score)}%
      </Text>
      {showGrade && (
        <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
          <Text style={styles.gradeBadgeText}>{grade}</Text>
        </View>
      )}
    </View>
  );

  // Breakdown List
  const BreakdownList = () => (
    <View style={styles.breakdownContainer}>
      {breakdown.map((item, index) => (
        <View key={index} style={styles.breakdownItem}>
          {item.icon && (
            <MaterialCommunityIcons
              name={item.icon as any}
              size={16}
              color={item.color || getColorFromScore(item.score)}
            />
          )}
          <Text style={styles.breakdownLabel}>{item.label}</Text>
          <View style={styles.breakdownBarContainer}>
            <View
              style={[
                styles.breakdownBar,
                {
                  width: `${item.score}%`,
                  backgroundColor: item.color || getColorFromScore(item.score),
                },
              ]}
            />
          </View>
          <Text style={[styles.breakdownScore, { color: item.color || getColorFromScore(item.score) }]}>
            {Math.round(item.score)}%
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {type === 'circular' && <CircularScore />}
      {type === 'horizontal' && <HorizontalScore />}
      {type === 'compact' && <CompactScore />}
      
      {label && type === 'circular' && (
        <Text style={[styles.label, { color: textColor, fontSize: sizeConfig.labelSize }]}>
          {label}
        </Text>
      )}

      {showBreakdown && breakdown.length > 0 && <BreakdownList />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBackground: {
    position: 'absolute',
  },
  circleProgress: {
    position: 'absolute',
  },
  circleCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 14,
    marginLeft: 2,
  },
  gradeText: {
    fontWeight: 'bold',
    marginTop: 2,
  },
  label: {
    marginTop: 8,
    fontWeight: '500',
  },
  horizontalContainer: {
    width: '100%',
  },
  horizontalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  horizontalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  horizontalScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  horizontalBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  horizontalBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  compactScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  gradeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  breakdownContainer: {
    width: '100%',
    marginTop: 16,
    gap: 10,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#666',
    width: 80,
  },
  breakdownBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownScore: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
});

export default ScoreDisplay;
