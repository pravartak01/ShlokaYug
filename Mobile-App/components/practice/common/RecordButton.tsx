import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

interface RecordButtonProps {
  // State
  isRecording?: boolean;
  isDisabled?: boolean;
  isPaused?: boolean;
  isProcessing?: boolean;
  
  // Size
  size?: 'small' | 'medium' | 'large';
  
  // Customization
  primaryColor?: string;
  secondaryColor?: string;
  recordingColor?: string;
  disabledColor?: string;
  showLabel?: boolean;
  label?: string;
  recordingLabel?: string;
  
  // Animation
  animated?: boolean;
  showPulse?: boolean;
  showRing?: boolean;
  
  // Callbacks
  onPress?: () => void;
  onLongPress?: () => void;
  
  // Style
  style?: object;
}

const SIZES = {
  small: { button: 56, icon: 24, ring: 66, pulse: 76 },
  medium: { button: 72, icon: 32, ring: 86, pulse: 100 },
  large: { button: 88, icon: 40, ring: 104, pulse: 120 },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording = false,
  isDisabled = false,
  isPaused = false,
  isProcessing = false,
  size = 'medium',
  primaryColor = '#FF6B35',
  secondaryColor = '#FFB89A',
  recordingColor = '#FF4444',
  disabledColor = '#CCCCCC',
  showLabel = true,
  label = 'Tap to Record',
  recordingLabel = 'Recording...',
  animated = true,
  showPulse = true,
  showRing = true,
  onPress,
  onLongPress,
  style = {},
}) => {
  const sizeConfig = SIZES[size];
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getButtonColor = () => {
    if (isDisabled) return disabledColor;
    if (isRecording) return recordingColor;
    return primaryColor;
  };

  const getLabel = () => {
    if (isProcessing) return 'Processing...';
    if (isPaused) return 'Paused';
    if (isRecording) return recordingLabel;
    return label;
  };

  const getIcon = (): string => {
    if (isProcessing) return 'loading';
    if (isPaused) return 'pause';
    if (isRecording) return 'stop';
    return 'microphone';
  };

  return (
    <View style={[styles.container, style]}>
      {/* Pulse Animation */}
      {showPulse && isRecording && !isPaused && (
        <Animated.View
          style={[
            styles.pulse,
            {
              width: sizeConfig.pulse,
              height: sizeConfig.pulse,
              borderRadius: sizeConfig.pulse / 2,
              backgroundColor: recordingColor,
            },
          ]}
        />
      )}

      {/* Outer Ring */}
      {showRing && (
        <View
          style={[
            styles.ring,
            {
              width: sizeConfig.ring,
              height: sizeConfig.ring,
              borderRadius: sizeConfig.ring / 2,
              borderColor: isRecording ? recordingColor : primaryColor,
              opacity: isDisabled ? 0.3 : 0.3,
            },
          ]}
        />
      )}

      {/* Main Button */}
      <AnimatedTouchable
        style={[
          styles.button,
          animatedButtonStyle,
          {
            width: sizeConfig.button,
            height: sizeConfig.button,
            borderRadius: isRecording ? 12 : sizeConfig.button / 2,
            backgroundColor: getButtonColor(),
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled || isProcessing}
        activeOpacity={0.8}
      >
        {isProcessing ? (
          <MaterialCommunityIcons
            name="loading"
            size={sizeConfig.icon}
            color="#fff"
          />
        ) : (
          <MaterialCommunityIcons
            name={getIcon() as any}
            size={sizeConfig.icon}
            color="#fff"
          />
        )}
      </AnimatedTouchable>

      {/* Label */}
      {showLabel && (
        <Text style={[
          styles.label,
          { 
            color: isRecording ? recordingColor : '#666',
            marginTop: sizeConfig.button / 4,
          }
        ]}>
          {getLabel()}
        </Text>
      )}

      {/* Recording indicator dot */}
      {isRecording && !isPaused && (
        <View style={styles.recordingIndicator}>
          <View style={[styles.recordingDot, { backgroundColor: recordingColor }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    opacity: 0.3,
  },
  ring: {
    position: 'absolute',
    borderWidth: 3,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default RecordButton;
