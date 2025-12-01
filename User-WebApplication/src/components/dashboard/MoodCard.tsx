/**
 * MoodCard Component - Mood filter button
 */

import React from 'react';

interface MoodCardProps {
  id: string;
  label: string;
  emoji: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

const MoodCard: React.FC<MoodCardProps> = ({ label, emoji, color, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg ${color} border-2 transition-all ${
        isSelected ? 'border-[#8B0000] shadow-md' : 'border-[#D4C5A9] hover:border-[#8B0000]/50'
      }`}
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <p className="font-semibold text-[#2C2416]">{label}</p>
    </button>
  );
};

export default MoodCard;
