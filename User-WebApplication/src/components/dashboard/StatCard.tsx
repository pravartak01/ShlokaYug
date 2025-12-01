/**
 * StatCard Component - Reusable stats display card
 */

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, change, color }) => {
  return (
    <div
      className={`rounded-xl ${color} border border-[#D4C5A9] p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase text-[#6B5D4F]">{label}</p>
        <span className="text-[#8B0000]">{typeof icon === 'string' ? icon : icon}</span>
      </div>
      <p className="text-2xl font-bold text-[#2C2416] mb-1">{value}</p>
      <p className="text-xs text-[#8B0000] font-semibold">{change}</p>
    </div>
  );
};

export default StatCard;
