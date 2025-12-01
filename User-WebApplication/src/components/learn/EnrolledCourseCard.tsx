/**
 * EnrolledCourseCard Component
 * Card for enrolled courses with progress tracking
 */

import React from 'react';
import type { Enrollment } from '../../services/courseService';

interface EnrolledCourseCardProps {
  enrollment: Enrollment;
  onClick: () => void;
}

const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({ enrollment, onClick }) => {
  // Backend returns courseId (populated) or course property
  const course = enrollment.course || enrollment.courseId;
  const { progress } = enrollment;

  console.log('🎓 Enrollment:', enrollment);
  console.log('🎓 Course:', course);

  // Guard clause if course is not populated
  if (!course || typeof course === 'string') {
    console.warn('⚠️ Course not populated or is string ID:', course);
    return null;
  }

  // Calculate total completed lectures across all sections
  const totalCompleted = progress?.sectionsProgress?.reduce(
    (sum, section) => sum + section.completedLectures.length,
    0
  ) || 0;

  // Get total lectures from course structure
  const totalLectures = course.structure?.totalLectures || 0;

  // Calculate progress percentage
  const progressPercentage = totalLectures > 0 
    ? Math.round((totalCompleted / totalLectures) * 100) 
    : 0;

  // Determine status
  const getStatus = () => {
    if (progressPercentage === 0) return { label: 'Not Started', color: '#6B5D4F' };
    if (progressPercentage === 100) return { label: 'Completed', color: '#10b981' };
    return { label: 'In Progress', color: '#f59e0b' };
  };

  const status = getStatus();

  return (
    <div
      onClick={onClick}
      className="bg-[#FFFEF7] border-2 border-[#D4C5A9] rounded-xl overflow-hidden hover:border-[#8B0000] hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FFE5B4] to-[#DDA15E] flex items-center justify-center">
            <svg className="w-16 h-16 text-white/50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-semibold"
          style={{ backgroundColor: status.color }}
        >
          {status.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <h3 className="text-[#2C2416] font-bold text-lg line-clamp-2 group-hover:text-[#8B0000] transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-[#6B5D4F] text-sm">By {course.instructor?.name || 'Unknown'}</p>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#6B5D4F]">Progress</span>
            <span className="text-[#2C2416] font-semibold">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-[#E8DCC4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8B0000] transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-[#D4C5A9]">
          <div className="flex items-center gap-4 text-sm text-[#6B5D4F]">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <span>{totalLectures} lectures</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{totalCompleted} completed</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button className="w-full bg-[#8B0000] text-white py-3 rounded-lg font-semibold hover:bg-[#6B0000] transition-colors">
          {progressPercentage === 0 ? 'Start Learning' : progressPercentage === 100 ? 'Review' : 'Continue Learning'}
        </button>
      </div>
    </div>
  );
};

export default EnrolledCourseCard;
