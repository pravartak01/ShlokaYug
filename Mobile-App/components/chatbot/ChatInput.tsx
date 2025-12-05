import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { InputType } from '../../types/chatbot';

interface ChatInputProps {
  onSendMessage: (content: string, type: InputType, file?: any) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleSendText = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setRecording(null);
      setIsRecording(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      if (uri) {
        // Create file object for upload
        const filename = uri.split('/').pop() || 'recording.m4a';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `audio/${match[1]}` : 'audio/m4a';

        const audioFile = {
          uri,
          type,
          name: filename,
        };

        onSendMessage('Voice message', 'voice', audioFile);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library access');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        const imageFile = {
          uri: imageUri,
          type,
          name: filename,
        };

        onSendMessage('Image message', 'image', imageFile);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EFEBE9', '#EFEBE9']}
        style={styles.gradient}
      >
        {/* Input Methods */}
        <View style={styles.inputRow}>
          {/* Image Picker */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={pickImage}
            disabled={disabled}
          >
            <MaterialCommunityIcons name="image" size={24} color="#8D6E63" />
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder="Ask about Sanskrit, chandas, shlokas..."
            placeholderTextColor="#A1887F"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            editable={!disabled}
            onSubmitEditing={handleSendText}
          />

          {/* Voice/Send Button */}
          {message.trim() ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSendText}
              disabled={disabled}
            >
              <LinearGradient
                colors={['#8D6E63', '#6D4C41']}
                style={styles.sendButton}
              >
                <MaterialCommunityIcons name="send" size={20} color="#EFEBE9" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={disabled}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <LinearGradient
                  colors={
                    isRecording
                      ? ['#F44336', '#D32F2F']
                      : ['#8D6E63', '#6D4C41']
                  }
                  style={styles.voiceButton}
                >
                  <MaterialCommunityIcons
                    name={isRecording ? 'stop' : 'microphone'}
                    size={20}
                    color="#EFEBE9"
                  />
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#D7CCC8',
    backgroundColor: '#EFEBE9',
  },
  gradient: {
    padding: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#4E342E',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#D7CCC8',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
