/**
 * PanchangCard Component - Hindu Panchang display
 */

import React from 'react';

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface PanchangData {
  tithi: string;
  nakshatra: string;
  sunrise: string;
  sunset: string;
}

interface PanchangCardProps {
  data: PanchangData;
}

const PanchangCard: React.FC<PanchangCardProps> = ({ data }) => {
  const panchangItems = [
    { label: 'Tithi', value: data.tithi, icon: '🌙' },
    { label: 'Nakshatra', value: data.nakshatra, icon: '⭐' },
    { label: 'Sunrise', value: data.sunrise, icon: '🌅' },
    { label: 'Sunset', value: data.sunset, icon: '🌇' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#D4C5A9]">
      <h3 className="text-lg font-bold text-[#2C2416] mb-4 flex items-center gap-2">
        <CalendarIcon />
        Hindu Panchang
      </h3>
      <div className="space-y-2">
        {panchangItems.map((item) => (
          <div key={item.label} className="flex justify-between items-center p-3 rounded-lg bg-[#F9F5ED]">
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <span className="text-[#6B5D4F] font-semibold text-sm">{item.label}</span>
            </div>
            <span className="font-bold text-[#8B0000] text-sm">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanchangCard;
