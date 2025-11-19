import { SANSKRIT_GREETINGS, ENHANCED_SHLOKAS } from '../../data/enhancedData';

export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 20) return 'evening';
  return 'night';
};

export const getSanskritGreeting = (timeOfDay: string) => {
  return SANSKRIT_GREETINGS[timeOfDay as keyof typeof SANSKRIT_GREETINGS] || 'नमस्ते';
};

// Hindu Calendar Tithi names
const TITHI_NAMES = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा/अमावस्या'
];

// Simplified Tithi calculation (approximation)
// Real implementation would use proper Panchang library
export const getHinduDate = () => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  
  // Simplified lunar phase approximation
  // In production, use a proper Panchang API or library
  const lunarDay = Math.floor((dayOfMonth % 30) / 2);
  const tithiIndex = Math.min(lunarDay, 14);
  
  const paksha = dayOfMonth <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
  const tithi = TITHI_NAMES[tithiIndex];
  
  // Month names
  const monthNames = [
    'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद',
    'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'
  ];
  
  // Approximate Hindu month (offset by ~1.5 months from Gregorian)
  const hinduMonthIndex = (now.getMonth() + 10) % 12;
  const month = monthNames[hinduMonthIndex];
  
  return {
    tithi,
    paksha,
    month,
    formatted: `${tithi}, ${paksha}`,
    fullDate: `${tithi}, ${paksha}, ${month}`
  };
};

// Get a daily rotating Sanskrit quote
export const getDailySanskritQuote = () => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  
  // Select quote based on day of year for daily rotation
  const quoteIndex = dayOfYear % ENHANCED_SHLOKAS.length;
  const shloka = ENHANCED_SHLOKAS[quoteIndex];
  
  return {
    sanskrit: shloka.devanagari.split('\n')[0], // First line only
    translation: shloka.translation.substring(0, 100) + '...', // Short version
    source: shloka.source
  };
};

// Format date in a readable way
export const getFormattedDate = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return now.toLocaleDateString('en-IN', options);
};
