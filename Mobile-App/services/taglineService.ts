// Tagline Generator Service
// Generates Sanskrit taglines for companies using SvaramAI Backend

import axios from 'axios';

// API Configuration - Matches SvaramAI backend
const LOCAL_IP = '10.245.97.46'; // Update this to match your machine's IP
const getDevIP = () => LOCAL_IP;

// SvaramAI Backend URL (Port 8000)
const API_BASE_URL = __DEV__
  ? `http://${getDevIP()}:8000`  // Development - SvaramAI runs on port 8000
  : 'https://ai.shlokayug.com'; // Production

// Company information interface
export interface CompanyInfo {
  companyName: string;
  industry: string;
  vision: string;
  mission: string;
  coreValues: string;
  targetAudience: string;
  uniqueSellingPoint: string;
  tone: TaglineTone;
}

export type TaglineTone = 
  | 'professional'
  | 'inspiring'
  | 'traditional'
  | 'modern'
  | 'spiritual'
  | 'innovative';

export interface GeneratedTagline {
  id: string;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  explanation: string;
  relevance: string;
}

export interface TaglineResult {
  taglines: GeneratedTagline[];
  companyName: string;
  generatedAt: Date;
}

// Fallback taglines when API is unavailable
const fallbackTaglines: GeneratedTagline[] = [
  {
    id: 'fallback-1',
    sanskrit: 'कर्मण्येवाधिकारस्ते',
    transliteration: 'Karmaṇyevādhikāraste',
    meaning: 'You have the right to work only',
    explanation: 'From the Bhagavad Gita, emphasizing dedication to action without attachment to results.',
    relevance: 'Perfect for companies that value hard work, dedication, and process over just outcomes.',
  },
  {
    id: 'fallback-2',
    sanskrit: 'सत्यमेव जयते',
    transliteration: 'Satyameva Jayate',
    meaning: 'Truth alone triumphs',
    explanation: 'From Mundaka Upanishad, the national motto of India.',
    relevance: 'Ideal for companies built on transparency, honesty, and ethical practices.',
  },
  {
    id: 'fallback-3',
    sanskrit: 'विद्या ददाति विनयम्',
    transliteration: 'Vidyā Dadāti Vinayam',
    meaning: 'Knowledge gives humility',
    explanation: 'A classical Sanskrit saying about the virtue of learning.',
    relevance: 'Great for educational institutions or companies that value continuous learning.',
  },
  {
    id: 'fallback-4',
    sanskrit: 'योगः कर्मसु कौशलम्',
    transliteration: 'Yogaḥ Karmasu Kauśalam',
    meaning: 'Excellence in action is yoga',
    explanation: 'From the Bhagavad Gita, defining yoga as perfection in work.',
    relevance: 'Perfect for companies striving for excellence and mastery in their craft.',
  },
  {
    id: 'fallback-5',
    sanskrit: 'उद्यमेन हि सिध्यन्ति कार्याणि',
    transliteration: 'Udyamena Hi Sidhyanti Kāryāṇi',
    meaning: 'Tasks are accomplished through effort',
    explanation: 'A classical Sanskrit proverb emphasizing the importance of hard work.',
    relevance: 'Ideal for startups and companies that celebrate entrepreneurial spirit.',
  },
  {
    id: 'fallback-6',
    sanskrit: 'नवीनता सृजति भविष्यम्',
    transliteration: 'Navīnatā Sṛjati Bhaviṣyam',
    meaning: 'Innovation creates the future',
    explanation: 'A modern Sanskrit phrase combining ancient wisdom with forward-thinking vision.',
    relevance: 'Perfect for technology companies and innovative enterprises.',
  },
  {
    id: 'fallback-7',
    sanskrit: 'सेवा परमो धर्मः',
    transliteration: 'Sevā Paramo Dharmaḥ',
    meaning: 'Service is the highest duty',
    explanation: 'Emphasizes the noble virtue of serving others as the highest form of dharma.',
    relevance: 'Ideal for service-oriented businesses and healthcare companies.',
  },
  {
    id: 'fallback-8',
    sanskrit: 'संगठनं शक्तिः',
    transliteration: 'Saṅgaṭhanaṁ Śaktiḥ',
    meaning: 'Unity is strength',
    explanation: 'A powerful phrase about the strength that comes from working together.',
    relevance: 'Great for team-oriented organizations and collaborative enterprises.',
  },
];

// Generate unique ID
const generateId = (): string => {
  return `tagline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Main tagline generation function using SvaramAI backend
export const generateTaglines = async (
  companyInfo: CompanyInfo,
  count: number = 5
): Promise<TaglineResult> => {
  try {
    console.log('Calling SvaramAI tagline API...');
    
    // Convert core values string to array
    const valuesArray = companyInfo.coreValues
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/tagline/generate`,
      {
        company_name: companyInfo.companyName,
        industry: companyInfo.industry,
        vision: companyInfo.vision,
        values: valuesArray,
        tone: companyInfo.tone,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30s timeout
      }
    );

    console.log('SvaramAI tagline response:', response.data);
    
    const data = response.data;
    
    // Primary tagline
    const primaryTagline: GeneratedTagline = {
      id: generateId(),
      sanskrit: data.tagline || '',
      transliteration: '',
      meaning: data.english_translation || '',
      explanation: data.meaning || '',
      relevance: `Primary tagline for ${companyInfo.companyName}`,
    };

    // Variants
    const variantTaglines: GeneratedTagline[] = (data.variants || []).map((variant: any) => ({
      id: generateId(),
      sanskrit: variant.tagline || '',
      transliteration: '',
      meaning: variant.translation || '',
      explanation: variant.context || '',
      relevance: variant.context || '',
    }));

    return {
      taglines: [primaryTagline, ...variantTaglines],
      companyName: companyInfo.companyName,
      generatedAt: new Date(),
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorDetail = error.response?.data?.detail || error.message;
      console.error('SvaramAI tagline API error:', error.response?.status, errorDetail);
    } else {
      console.error('Error generating taglines:', error);
    }
    
    // Return fallback taglines on error
    return {
      taglines: fallbackTaglines.slice(0, count).map(t => ({ ...t, id: generateId() })),
      companyName: companyInfo.companyName,
      generatedAt: new Date(),
    };
  }
};

// Get industry options
export const getIndustryOptions = (): string[] => [
  'Technology',
  'Education',
  'Healthcare',
  'Finance',
  'Retail',
  'Food & Beverage',
  'Travel & Hospitality',
  'Manufacturing',
  'Real Estate',
  'Media & Entertainment',
  'Non-Profit',
  'Consulting',
  'E-Commerce',
  'Automotive',
  'Other',
];

// Get tone options with Ionicons instead of emojis
export const getToneOptions = (): { value: TaglineTone; label: string; icon: string }[] => [
  { value: 'professional', label: 'Professional', icon: 'briefcase-outline' },
  { value: 'inspiring', label: 'Inspiring', icon: 'sparkles-outline' },
  { value: 'traditional', label: 'Traditional', icon: 'book-outline' },
  { value: 'modern', label: 'Modern', icon: 'rocket-outline' },
  { value: 'spiritual', label: 'Spiritual', icon: 'flower-outline' },
  { value: 'innovative', label: 'Innovative', icon: 'bulb-outline' },
];

// Validate company info
export const validateCompanyInfo = (info: Partial<CompanyInfo>): string[] => {
  const errors: string[] = [];
  
  if (!info.companyName?.trim()) {
    errors.push('Company name is required');
  }
  if (!info.industry?.trim()) {
    errors.push('Industry is required');
  }
  if (!info.vision?.trim()) {
    errors.push('Vision statement is required');
  }
  if (!info.mission?.trim()) {
    errors.push('Mission statement is required');
  }
  
  return errors;
};
