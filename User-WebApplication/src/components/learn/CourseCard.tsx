/**
 * CourseCard Component
 * Reusable card component for displaying course information
 */

import React from 'react';
import type { Course } from '../../services/courseService';

interface CourseCardProps {
  course: Course;
  onPress?: (course: Course) => void;
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onPress, onClick }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatPrice = () => {
    const price = course.pricing?.oneTime?.amount || 0;
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const difficulty = course.metadata?.difficulty || 'beginner';
  const rating = course.stats?.ratings?.average || 0;
  const reviews = course.stats?.ratings?.count || 0;
  const enrollments = course.stats?.enrollment?.total || 0;
  const totalLessons = course.structure?.totalLessons || 0;
  const totalLectures = course.structure?.totalLectures || 0;
  const thumbnail = course.metadata?.thumbnail || course.thumbnail;
  const isFree = (course.pricing?.oneTime?.amount || 0) === 0;

  return (
    <div
      onClick={() => {
        if (onClick) onClick();
        else if (onPress) onPress(course);
      }}
      className="bg-white rounded-xl shadow-sm border border-[#D4C5A9] overflow-hidden cursor-pointer hover:shadow-md transition-all group"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-[#F9F5ED]">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#E8DCC4] to-[#D4C5A9] flex items-center justify-center">
            <svg className="w-16 h-16 text-[#8B0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}

        {/* Enrolled Badge */}
        {course.isEnrolled && (
          <div className="absolute top-3 left-3 bg-green-500 px-3 py-1 rounded-full shadow-md">
            <span className="text-white text-xs font-semibold">Enrolled</span>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
          <span className="text-[#8B0000] text-sm font-bold">{formatPrice()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-[#2C2416] text-lg font-bold mb-2 line-clamp-2 group-hover:text-[#8B0000] transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center mb-3 text-[#6B5D4F]">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span className="text-sm truncate">{course.instructor.name}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[#2C2416] text-sm font-semibold mr-1">{rating.toFixed(1)}</span>
            <span className="text-[#6B5D4F] text-xs">({reviews})</span>
          </div>

          <div className="flex items-center text-[#6B5D4F]">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-sm">{enrollments}+ enrolled</span>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(difficulty)}`}>
            {difficulty.toUpperCase()}
          </span>

          <div className="flex items-center text-[#6B5D4F]">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-sm">{totalLectures} lectures</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
