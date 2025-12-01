/**
 * CourseProgress Component - Course learning progress card
 */

import React from 'react';

interface CourseProgressProps {
  title: string;
  progress: number;
  onContinue?: () => void;
}

const CourseProgress: React.FC<CourseProgressProps> = ({ title, progress, onContinue }) => {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-[#D4C5A9] hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-lg bg-[#F9F5ED] border border-[#D4C5A9] flex items-center justify-center text-2xl">
          📖
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[#2C2416] text-base">{title}</h3>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-2 bg-[#E8DCC4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8B0000] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-bold text-[#8B0000]">{progress}%</span>
          </div>
        </div>
        <button
          onClick={onContinue}
          className="px-5 py-2 bg-[#8B0000] text-white rounded-lg font-semibold hover:bg-[#6B0000] transition-colors text-sm"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default CourseProgress;
