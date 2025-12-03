/**
 * VideoPlayer Component
 * Video playback with controls and progress tracking
 */

import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface VideoPlayerProps {
  lecture: any;
  onComplete?: () => void;
}

export default function VideoPlayer({ lecture, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get the actual video URL from lecture content
  const videoUrl = lecture?.content?.videoUrl || lecture?.videoUrl || null;
  
  console.log('VideoPlayer - Lecture data:', JSON.stringify(lecture, null, 2));
  console.log('VideoPlayer - Video URL:', videoUrl);

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    if (!playbackStatus.isLoaded) return;
    
    setStatus(playbackStatus);
    
    // Check if video completed
    if (playbackStatus.didJustFinish && onComplete) {
      onComplete();
    }
  };

  const togglePlayPause = () => {
    if (status.isPlaying) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = async (value: number) => {
    await videoRef.current?.setPositionAsync(value);
  };

  return (
    <View className="bg-black">
      {/* Video */}
      {videoUrl ? (
        <>
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            useNativeControls={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            style={{ 
              width: Dimensions.get('window').width,
              height: isFullscreen ? Dimensions.get('window').height : 240,
            }}
          />

          {/* Custom Controls - Only show when video is available */}
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <View className="mb-2">
              <Slider
                style={{ width: '100%', height: 20 }}
                minimumValue={0}
                maximumValue={status.durationMillis || 1}
                value={status.positionMillis || 0}
                onSlidingComplete={handleSeek}
                minimumTrackTintColor="#f97316"
                maximumTrackTintColor="#ffffff40"
                thumbTintColor="#f97316"
              />
            </View>

            {/* Time and Controls */}
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-sm">
                {formatTime(status.positionMillis || 0)} / {formatTime(status.durationMillis || 0)}
              </Text>

              <View className="flex-row items-center space-x-4">
                {/* Rewind 10s */}
                <TouchableOpacity
                  onPress={() => {
                    const newPosition = Math.max(0, (status.positionMillis || 0) - 10000);
                    handleSeek(newPosition);
                  }}
                >
                  <Ionicons name="play-back" size={24} color="white" />
                </TouchableOpacity>

                {/* Play/Pause */}
                <TouchableOpacity
                  onPress={togglePlayPause}
                  className="bg-orange-500 rounded-full p-3"
                >
                  <Ionicons
                    name={status.isPlaying ? 'pause' : 'play'}
                    size={28}
                    color="white"
                  />
                </TouchableOpacity>

                {/* Forward 10s */}
                <TouchableOpacity
                  onPress={() => {
                    const newPosition = Math.min(
                      status.durationMillis || 0,
                      (status.positionMillis || 0) + 10000
                    );
                    handleSeek(newPosition);
                  }}
                >
                  <Ionicons name="play-forward" size={24} color="white" />
                </TouchableOpacity>

                {/* Fullscreen Toggle */}
                <TouchableOpacity onPress={() => setIsFullscreen(!isFullscreen)}>
                  <Ionicons
                    name={isFullscreen ? 'contract' : 'expand'}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={{ 
          width: Dimensions.get('window').width,
          height: 240,
          backgroundColor: '#1f2937',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Ionicons name="videocam-off" size={48} color="#9ca3af" />
          <Text style={{ color: '#9ca3af', marginTop: 12, fontSize: 14 }}>Video not available</Text>
          <Text style={{ color: '#6b7280', marginTop: 4, fontSize: 12 }}>The instructor hasn't uploaded a video yet</Text>
        </View>
      )}
    </View>
  );
}
