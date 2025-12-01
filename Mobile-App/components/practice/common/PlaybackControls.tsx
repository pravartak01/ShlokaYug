import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PlaybackControlsProps {
  // State
  isPlaying?: boolean;
  isPaused?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  
  // Progress
  currentTime?: number; // in seconds
  totalDuration?: number; // in seconds
  
  // Speed control
  playbackSpeed?: number;
  availableSpeeds?: number[];
  onSpeedChange?: (speed: number) => void;
  
  // Actions
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onRewind?: () => void;
  onForward?: () => void;
  onSeek?: (time: number) => void;
  onRepeat?: () => void;
  
  // Options
  showRewind?: boolean;
  showForward?: boolean;
  showSpeed?: boolean;
  showRepeat?: boolean;
  showStop?: boolean;
  showProgress?: boolean;
  isRepeating?: boolean;
  
  // Seek intervals
  rewindInterval?: number; // in seconds
  forwardInterval?: number; // in seconds
  
  // Size & Style
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact' | 'full';
  primaryColor?: string;
  secondaryColor?: string;
  
  // Style
  style?: object;
}

const SIZES = {
  small: { main: 44, secondary: 32, icon: 20, secondaryIcon: 16 },
  medium: { main: 56, secondary: 40, icon: 28, secondaryIcon: 20 },
  large: { main: 72, secondary: 48, icon: 36, secondaryIcon: 24 },
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying = false,
  isPaused = false,
  isLoading = false,
  isDisabled = false,
  currentTime = 0,
  totalDuration = 0,
  playbackSpeed = 1,
  availableSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2],
  onSpeedChange,
  onPlay,
  onPause,
  onStop,
  onRewind,
  onForward,
  onSeek,
  onRepeat,
  showRewind = true,
  showForward = true,
  showSpeed = true,
  showRepeat = false,
  showStop = false,
  showProgress = true,
  isRepeating = false,
  rewindInterval = 10,
  forwardInterval = 10,
  size = 'medium',
  variant = 'default',
  primaryColor = '#FF6B35',
  secondaryColor = '#888',
  style = {},
}) => {
  const sizeConfig = SIZES[size];
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const handleSpeedCycle = () => {
    const currentIndex = availableSpeeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % availableSpeeds.length;
    onSpeedChange?.(availableSpeeds[nextIndex]);
  };

  const handleProgressTap = (event: any) => {
    if (!onSeek || !totalDuration) return;
    const { locationX } = event.nativeEvent;
    const { width } = event.target.measure?.() || { width: 300 };
    const seekTime = (locationX / width) * totalDuration;
    onSeek(Math.max(0, Math.min(totalDuration, seekTime)));
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <TouchableOpacity
          style={[styles.compactButton, { width: sizeConfig.main, height: sizeConfig.main }]}
          onPress={handlePlayPause}
          disabled={isDisabled || isLoading}
        >
          <MaterialCommunityIcons
            name={isLoading ? 'loading' : isPlaying ? 'pause' : 'play'}
            size={sizeConfig.icon}
            color={primaryColor}
          />
        </TouchableOpacity>
        
        {showProgress && (
          <View style={styles.compactProgress}>
            <View style={styles.compactProgressBar}>
              <View style={[styles.compactProgressFill, { width: `${progress}%`, backgroundColor: primaryColor }]} />
            </View>
            <Text style={styles.compactTime}>{formatTime(currentTime)}</Text>
          </View>
        )}
      </View>
    );
  }

  // Full variant with all controls
  if (variant === 'full') {
    return (
      <View style={[styles.fullContainer, style]}>
        {/* Progress bar */}
        {showProgress && (
          <View style={styles.progressSection}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <TouchableOpacity
              style={styles.progressBarContainer}
              onPress={handleProgressTap}
              activeOpacity={0.8}
            >
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${progress}%`, backgroundColor: primaryColor }
                  ]} 
                />
                <View 
                  style={[
                    styles.progressKnob,
                    { left: `${progress}%`, backgroundColor: primaryColor }
                  ]}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
          </View>
        )}

        {/* Control buttons */}
        <View style={styles.controlsRow}>
          {/* Left controls */}
          <View style={styles.sideControls}>
            {showRepeat && (
              <TouchableOpacity
                style={styles.sideButton}
                onPress={onRepeat}
              >
                <MaterialCommunityIcons
                  name={isRepeating ? 'repeat' : 'repeat-off'}
                  size={sizeConfig.secondaryIcon}
                  color={isRepeating ? primaryColor : secondaryColor}
                />
              </TouchableOpacity>
            )}
            {showSpeed && (
              <TouchableOpacity
                style={styles.speedButton}
                onPress={handleSpeedCycle}
              >
                <Text style={[styles.speedText, { color: playbackSpeed !== 1 ? primaryColor : secondaryColor }]}>
                  {playbackSpeed}x
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Center controls */}
          <View style={styles.centerControls}>
            {showRewind && (
              <TouchableOpacity
                style={[styles.secondaryButton, { width: sizeConfig.secondary, height: sizeConfig.secondary }]}
                onPress={onRewind}
                disabled={isDisabled}
              >
                <MaterialCommunityIcons
                  name="rewind-10"
                  size={sizeConfig.secondaryIcon}
                  color={secondaryColor}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.mainButton,
                {
                  width: sizeConfig.main,
                  height: sizeConfig.main,
                  backgroundColor: primaryColor,
                },
              ]}
              onPress={handlePlayPause}
              disabled={isDisabled || isLoading}
            >
              <MaterialCommunityIcons
                name={isLoading ? 'loading' : isPlaying ? 'pause' : 'play'}
                size={sizeConfig.icon}
                color="#fff"
              />
            </TouchableOpacity>

            {showForward && (
              <TouchableOpacity
                style={[styles.secondaryButton, { width: sizeConfig.secondary, height: sizeConfig.secondary }]}
                onPress={onForward}
                disabled={isDisabled}
              >
                <MaterialCommunityIcons
                  name="fast-forward-10"
                  size={sizeConfig.secondaryIcon}
                  color={secondaryColor}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Right controls */}
          <View style={styles.sideControls}>
            {showStop && (
              <TouchableOpacity
                style={styles.sideButton}
                onPress={onStop}
              >
                <MaterialCommunityIcons
                  name="stop"
                  size={sizeConfig.secondaryIcon}
                  color={secondaryColor}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Default variant
  return (
    <View style={[styles.defaultContainer, style]}>
      <View style={styles.defaultControls}>
        {showRewind && (
          <TouchableOpacity
            style={[styles.secondaryButton, { width: sizeConfig.secondary, height: sizeConfig.secondary }]}
            onPress={onRewind}
            disabled={isDisabled}
          >
            <MaterialCommunityIcons
              name="rewind-10"
              size={sizeConfig.secondaryIcon}
              color={secondaryColor}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.mainButton,
            {
              width: sizeConfig.main,
              height: sizeConfig.main,
              backgroundColor: isDisabled ? '#ccc' : primaryColor,
            },
          ]}
          onPress={handlePlayPause}
          disabled={isDisabled || isLoading}
        >
          <MaterialCommunityIcons
            name={isLoading ? 'loading' : isPlaying ? 'pause' : 'play'}
            size={sizeConfig.icon}
            color="#fff"
          />
        </TouchableOpacity>

        {showForward && (
          <TouchableOpacity
            style={[styles.secondaryButton, { width: sizeConfig.secondary, height: sizeConfig.secondary }]}
            onPress={onForward}
            disabled={isDisabled}
          >
            <MaterialCommunityIcons
              name="fast-forward-10"
              size={sizeConfig.secondaryIcon}
              color={secondaryColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {showProgress && (
        <View style={styles.defaultProgress}>
          <Text style={[styles.timeText, { fontSize: 11 }]}>{formatTime(currentTime)}</Text>
          <View style={styles.defaultProgressBar}>
            <View 
              style={[
                styles.defaultProgressFill, 
                { width: `${progress}%`, backgroundColor: primaryColor }
              ]} 
            />
          </View>
          <Text style={[styles.timeText, { fontSize: 11 }]}>{formatTime(totalDuration)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
  },
  compactProgress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  compactTime: {
    fontSize: 12,
    color: '#888',
    minWidth: 40,
  },

  // Full styles
  fullContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  progressBarContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressKnob: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
    minWidth: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 60,
  },
  sideButton: {
    padding: 8,
  },
  speedButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  secondaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
  },
  mainButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Default styles
  defaultContainer: {
    alignItems: 'center',
    gap: 12,
  },
  defaultControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  defaultProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 8,
  },
  defaultProgressBar: {
    flex: 1,
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  defaultProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default PlaybackControls;
