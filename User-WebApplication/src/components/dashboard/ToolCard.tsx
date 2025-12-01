/**
 * ToolCard Component - AI Tool feature card
 */

import React from 'react';

interface ToolCardProps {
  name: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ name, desc, icon, color, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-5 rounded-lg ${color} border border-[#D4C5A9] hover:border-[#8B0000] transition-all shadow-sm hover:shadow-md text-left`}
    >
      <div className="text-2xl mb-3 text-[#8B0000]">{typeof icon === 'string' ? icon : icon}</div>
      <p className="font-bold mb-1 text-[#2C2416]">{name}</p>
      <p className="text-xs text-[#6B5D4F]">{desc}</p>
    </button>
  );
};

export default ToolCard;
