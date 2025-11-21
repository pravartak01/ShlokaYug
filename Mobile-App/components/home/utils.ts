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

// Panchang API Types
export interface PanchangData {
  day: string;
  tithi: string;
  yog: string;
  nakshatra: string;
  karan: string;
  sunrise: string;
  sunset: string;
}

// Fetch real-time Panchang data from Astrology API
export const fetchPanchangData = async (): Promise<PanchangData | null> => {
  try {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Approximate location (you can make this configurable)
    const lat = 28.6139; // Delhi
    const lon = 77.2090;
    const tz = 5.5; // IST

    // You need to replace these with your actual API credentials
    // Get them from https://astrologyapi.com/
    const userId = '647638'; // Replace with your user ID
    const apiKey = 'fd87d1f7df94332f699d408c27447536c47cef3e'; // Replace with your API key
    
    const credentials = btoa(`${userId}:${apiKey}`);
    
    const response = await fetch('https://json.astrologyapi.com/v1/basic_panchang', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        day,
        month,
        year,
        hour,
        min: minute,
        lat,
        lon,
        tzone: tz,
      }),
    });

    if (!response.ok) {
      console.error('Failed to fetch Panchang data:', response.status);
      return null;
    }

    const data: PanchangData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Panchang data:', error);
    return null;
  }
};

// Fallback function for offline or error cases
export const getHinduDate = () => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  
  const TITHI_NAMES = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
    'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
    'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा/अमावस्या'
  ];
  
  const lunarDay = Math.floor((dayOfMonth % 30) / 2);
  const tithiIndex = Math.min(lunarDay, 14);
  
  const paksha = dayOfMonth <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
  const tithi = TITHI_NAMES[tithiIndex];
  
  const monthNames = [
    'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद',
    'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'
  ];
  
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
