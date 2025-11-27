/**
 * Course Learning Screen
 * Complete LMS interface for enrolled courses with video player, progress tracking, notes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import VideoPlayer from '../../../components/learn/VideoPlayer';
import CurriculumList from '../../../components/learn/CurriculumList';
import LectureContent from '../../../components/learn/LectureContent';
import ProgressBar from '../../../components/learn/ProgressBar';
import NotesSection from '../../../components/learn/NotesSection';
import courseService from '../../../services/courseService';
import { useAuth } from '../../../context/AuthContext';

export default function CourseLearnScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    loadCourseContent();
    loadProgress();
  }, [id]);

  const loadCourseContent = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(id as string);
      const courseData = response.data?.course || response.course;
      setCourse(courseData);
      
      // Auto-select first lecture
      if (courseData.structure?.units?.[0]?.lessons?.[0]?.lectures?.[0]) {
        setSelectedLecture({
          unitIndex: 0,
          lessonIndex: 0,
          lectureIndex: 0,
          lecture: courseData.structure.units[0].lessons[0].lectures[0],
        });
      }
    } catch (error) {
      console.error('Error loading course:', error);
      Alert.alert('Error', 'Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await courseService.getCourseProgress(id as string);
      setProgress(response.data);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleLectureComplete = async () => {
    if (!selectedLecture) return;
    
    try {
      // Call API to mark lecture complete
      await courseService.markLectureComplete(
        id as string,
        selectedLecture.lecture.lectureId
      );
      
      // Reload progress
      await loadProgress();
      
      // Move to next lecture
      const nextLecture = getNextLecture();
      if (nextLecture) {
        setSelectedLecture(nextLecture);
        Alert.alert('Success', 'Lecture marked as complete! Moving to next lecture.');
      } else {
        // Course completed - show certificate
        Alert.alert(
          'Congratulations! 🎉',
          'You have completed this course!',
          [
            { text: 'View Certificate', onPress: () => handleViewCertificate() },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('Error marking lecture complete:', error);
      Alert.alert('Error', 'Failed to mark lecture as complete');
    }
  };

  const getNextLecture = () => {
    if (!course || !selectedLecture) return null;
    
    const { unitIndex, lessonIndex, lectureIndex } = selectedLecture;
    const unit = course.structure.units[unitIndex];
    const lesson = unit.lessons[lessonIndex];
    
    // Check next lecture in current lesson
    if (lectureIndex + 1 < lesson.lectures.length) {
      return {
        unitIndex,
        lessonIndex,
        lectureIndex: lectureIndex + 1,
        lecture: lesson.lectures[lectureIndex + 1],
      };
    }
    
    // Check next lesson in current unit
    if (lessonIndex + 1 < unit.lessons.length) {
      return {
        unitIndex,
        lessonIndex: lessonIndex + 1,
        lectureIndex: 0,
        lecture: unit.lessons[lessonIndex + 1].lectures[0],
      };
    }
    
    // Check next unit
    if (unitIndex + 1 < course.structure.units.length) {
      return {
        unitIndex: unitIndex + 1,
        lessonIndex: 0,
        lectureIndex: 0,
        lecture: course.structure.units[unitIndex + 1].lessons[0].lectures[0],
      };
    }
    
    return null; // Course completed
  };

  const handleViewCertificate = () => {
    router.push(`/certificates/${id}` as any);
  };

  const handleForceComplete = async () => {
    try {
      await courseService.forceCompleteCourse(id as string);
      await loadProgress();
      Alert.alert('Success', 'Course marked as 100% complete! You can now view your certificate.');
    } catch (error) {
      console.error('Force complete error:', error);
      Alert.alert('Error', 'Failed to complete course');
    }
  };

  const handleSelectLecture = (unitIndex: number, lessonIndex: number, lectureIndex: number) => {
    const lecture = course.structure.units[unitIndex].lessons[lessonIndex].lectures[lectureIndex];
    setSelectedLecture({ unitIndex, lessonIndex, lectureIndex, lecture });
    setShowCurriculum(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-white mt-4">Loading course...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-white">Course not found</Text>
      </SafeAreaView>
    );
  }

  const progressPercentage = progress?.completionPercentage || 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-gray-800 px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-white text-base font-semibold flex-1 ml-3" numberOfLines={1}>
          {course.title}
        </Text>

        <View className="flex-row items-center space-x-2">
          {/* Development: Force Complete Button */}
          <TouchableOpacity
            onPress={handleForceComplete}
            className="p-2 bg-green-600 rounded"
          >
            <Ionicons name="checkmark-done" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowNotes(!showNotes)}
            className="p-2"
          >
            <Ionicons name="document-text-outline" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setShowCurriculum(!showCurriculum)}
            className="p-2"
          >
            <Ionicons name="list-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <ProgressBar progress={progressPercentage} />

      {/* Main Content */}
      <View className="flex-1">
        {showCurriculum ? (
          <CurriculumList
            course={course}
            selectedLecture={selectedLecture}
            onSelectLecture={handleSelectLecture}
            progress={progress}
          />
        ) : showNotes ? (
          <NotesSection
            courseId={course._id}
            lectureId={selectedLecture?.lecture?.lectureId}
          />
        ) : (
          <ScrollView className="flex-1">
            {/* Video Player */}
            {selectedLecture && (
              <VideoPlayer
                lecture={selectedLecture.lecture}
                onComplete={handleLectureComplete}
              />
            )}

            {/* Lecture Content */}
            {selectedLecture && (
              <LectureContent
                lecture={selectedLecture.lecture}
                courseId={course._id}
              />
            )}

            {/* Navigation Buttons */}
            <View className="flex-row justify-between p-4">
              <TouchableOpacity
                className="bg-gray-700 px-6 py-3 rounded-lg"
                onPress={() => {
                  // Go to previous lecture
                }}
              >
                <Text className="text-white font-semibold">Previous</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-orange-500 px-6 py-3 rounded-lg"
                onPress={handleLectureComplete}
              >
                <Text className="text-white font-semibold">Mark Complete & Next</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
