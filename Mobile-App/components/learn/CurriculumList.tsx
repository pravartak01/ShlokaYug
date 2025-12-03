/**
 * CurriculumList Component
 * Displays course structure with units, lessons, and lectures
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CurriculumListProps {
  course: any;
  selectedLecture: any;
  onSelectLecture: (unitIndex: number, lessonIndex: number, lectureIndex: number) => void;
  progress: any;
}

export default function CurriculumList({
  course,
  selectedLecture,
  onSelectLecture,
  progress,
}: CurriculumListProps) {
  const [expandedUnits, setExpandedUnits] = useState<number[]>([0]);
  const [expandedLessons, setExpandedLessons] = useState<string[]>(['0-0']);

  const toggleUnit = (index: number) => {
    setExpandedUnits((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleLesson = (unitIndex: number, lessonIndex: number) => {
    const key = `${unitIndex}-${lessonIndex}`;
    setExpandedLessons((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isLectureCompleted = (lectureId: string) => {
    return progress?.completedLectures?.includes(lectureId) || false;
  };

  const isCurrentLecture = (unitIndex: number, lessonIndex: number, lectureIndex: number) => {
    return (
      selectedLecture?.unitIndex === unitIndex &&
      selectedLecture?.lessonIndex === lessonIndex &&
      selectedLecture?.lectureIndex === lectureIndex
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-800">
      <View className="p-4">
        <Text className="text-white text-xl font-bold mb-4">Course Content</Text>

        {course.structure?.units?.map((unit: any, unitIndex: number) => (
          <View key={unitIndex} className="mb-4">
            {/* Unit Header */}
            <TouchableOpacity
              onPress={() => toggleUnit(unitIndex)}
              className="bg-gray-700 rounded-lg p-4 flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-white font-bold text-base">
                  Unit {unitIndex + 1}: {unit.title || 'Untitled Unit'}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {unit.lessons?.length || 0} lessons
                </Text>
              </View>
              <Ionicons
                name={expandedUnits.includes(unitIndex) ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#9ca3af"
              />
            </TouchableOpacity>

            {/* Lessons */}
            {expandedUnits.includes(unitIndex) && (
              <View className="ml-4 mt-2">
                {unit.lessons?.map((lesson: any, lessonIndex: number) => (
                  <View key={lessonIndex} className="mb-3">
                    {/* Lesson Header */}
                    <TouchableOpacity
                      onPress={() => toggleLesson(unitIndex, lessonIndex)}
                      className="bg-gray-600 rounded-lg p-3 flex-row items-center justify-between"
                    >
                      <View className="flex-1">
                        <Text className="text-white font-semibold">
                          Lesson {lessonIndex + 1}: {lesson.title || 'Untitled Lesson'}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                          {lesson.lectures?.length || 0} lectures
                        </Text>
                      </View>
                      <Ionicons
                        name={
                          expandedLessons.includes(`${unitIndex}-${lessonIndex}`)
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        size={20}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>

                    {/* Lectures */}
                    {expandedLessons.includes(`${unitIndex}-${lessonIndex}`) && (
                      <View className="ml-4 mt-2">
                        {lesson.lectures?.map((lecture: any, lectureIndex: number) => {
                          const completed = isLectureCompleted(lecture.lectureId);
                          const current = isCurrentLecture(unitIndex, lessonIndex, lectureIndex);

                          return (
                            <TouchableOpacity
                              key={lectureIndex}
                              onPress={() => onSelectLecture(unitIndex, lessonIndex, lectureIndex)}
                              className={`p-3 rounded-lg mb-2 flex-row items-center ${!current && 'bg-gray-700'}`}
                              style={current ? { backgroundColor: '#DD7A1F' } : undefined}
                            >
                              {/* Completion Icon */}
                              <View className="mr-3">
                                {completed ? (
                                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                ) : current ? (
                                  <Ionicons name="play-circle" size={24} color="white" />
                                ) : (
                                  <Ionicons
                                    name="play-circle-outline"
                                    size={24}
                                    color="#9ca3af"
                                  />
                                )}
                              </View>

                              {/* Lecture Info */}
                              <View className="flex-1">
                                <Text className={`font-medium ${current ? 'text-white' : 'text-gray-200'}`}>
                                  {lecture.title || `Lecture ${lectureIndex + 1}`}
                                </Text>
                                <View className="flex-row items-center mt-1">
                                  <Ionicons name="time-outline" size={12} color="#9ca3af" />
                                  <Text className="text-gray-400 text-xs ml-1">
                                    {lecture.duration || '10'} min
                                  </Text>
                                  {lecture.type && (
                                    <>
                                      <Text className="text-gray-400 mx-2">•</Text>
                                      <Text className="text-gray-400 text-xs capitalize">
                                        {lecture.type}
                                      </Text>
                                    </>
                                  )}
                                </View>
                              </View>

                              {/* Lock Icon for upcoming lectures */}
                              {!completed && !current && (
                                <Ionicons name="lock-closed" size={16} color="#9ca3af" />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
