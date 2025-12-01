// Tagline Generator Service
// Generates Sanskrit taglines for companies using Gemini AI

import Constants from 'expo-constants';

// Get API key
const getApiKey = (): string => {
  // Try expo-constants first
  const expoConfig = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
  if (expoConfig) return expoConfig;
  
  // Try process.env
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GOOGLE_AI_API_KEY) {
    return process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
  }
  
  // Fallback key from .env
  return process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || '';
};

const GEMINI_API_KEY = getApiKey();
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
  | 'inspirational'
  | 'powerful'
  | 'spiritual'
  | 'modern'
  | 'traditional'
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

// Tone descriptions for the AI
const toneDescriptions: Record<TaglineTone, string> = {
  inspirational: 'uplifting, motivating, and encouraging',
  powerful: 'strong, impactful, and commanding',
  spiritual: 'deep, philosophical, and transcendent',
  modern: 'contemporary, fresh, and progressive',
  traditional: 'classic, timeless, and rooted in heritage',
  innovative: 'creative, forward-thinking, and revolutionary',
};

// Industry-specific Sanskrit terminology hints
const industryHints: Record<string, string[]> = {
  technology: ['विज्ञान (science)', 'तन्त्रज्ञान (technology)', 'नवीनता (innovation)', 'भविष्य (future)'],
  education: ['विद्या (knowledge)', 'ज्ञान (wisdom)', 'शिक्षा (education)', 'गुरु (teacher)'],
  healthcare: ['आरोग्य (health)', 'चिकित्सा (healing)', 'जीवन (life)', 'सेवा (service)'],
  finance: ['धन (wealth)', 'समृद्धि (prosperity)', 'विश्वास (trust)', 'सुरक्षा (security)'],
  retail: ['सेवा (service)', 'गुणवत्ता (quality)', 'संतुष्टि (satisfaction)', 'विविधता (variety)'],
  food: ['स्वाद (taste)', 'पोषण (nutrition)', 'शुद्धता (purity)', 'आनन्द (joy)'],
  travel: ['यात्रा (journey)', 'अन्वेषण (exploration)', 'साहस (adventure)', 'आनन्द (bliss)'],
  default: ['उत्कृष्टता (excellence)', 'सफलता (success)', 'प्रगति (progress)', 'धर्म (duty)'],
};

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

// Main tagline generation function
export const generateTaglines = async (
  companyInfo: CompanyInfo,
  count: number = 5
): Promise<TaglineResult> => {
  try {
    const industryTerms = industryHints[companyInfo.industry.toLowerCase()] || industryHints.default;
    const toneDescription = toneDescriptions[companyInfo.tone];

    const prompt = `You are an expert Sanskrit scholar and branding specialist. Generate ${count} unique, creative Sanskrit taglines for a company.

COMPANY INFORMATION:
- Company Name: ${companyInfo.companyName}
- Industry: ${companyInfo.industry}
- Vision: ${companyInfo.vision}
- Mission: ${companyInfo.mission}
- Core Values: ${companyInfo.coreValues}
- Target Audience: ${companyInfo.targetAudience}
- Unique Selling Point: ${companyInfo.uniqueSellingPoint}
- Desired Tone: ${toneDescription}

RELEVANT SANSKRIT TERMS FOR THIS INDUSTRY:
${industryTerms.join(', ')}

REQUIREMENTS:
1. Each tagline should be a SHORT, MEMORABLE Sanskrit phrase (3-7 words maximum)
2. It should capture the essence of the company's vision and values
3. It should be easy to pronounce and remember
4. It should have deep meaning that resonates with the brand
5. Provide accurate transliteration using standard IAST notation
6. Explain why this tagline is relevant to this specific company

RESPONSE FORMAT (JSON):
{
  "taglines": [
    {
      "sanskrit": "Sanskrit text in Devanagari script",
      "transliteration": "Romanized transliteration with proper diacritics",
      "meaning": "Direct English translation",
      "explanation": "Deeper explanation of the phrase's significance",
      "relevance": "Why this specific tagline fits this company"
    }
  ]
}

Generate exactly ${count} unique taglines. Respond ONLY with valid JSON, no additional text.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      // Return fallback taglines on API error
      return {
        taglines: fallbackTaglines.slice(0, count).map(t => ({ ...t, id: generateId() })),
        companyName: companyInfo.companyName,
        generatedAt: new Date(),
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not parse AI response, using fallbacks');
      return {
        taglines: fallbackTaglines.slice(0, count).map(t => ({ ...t, id: generateId() })),
        companyName: companyInfo.companyName,
        generatedAt: new Date(),
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const taglines: GeneratedTagline[] = parsed.taglines.map((t: Record<string, string>) => ({
      id: generateId(),
      sanskrit: t.sanskrit || '',
      transliteration: t.transliteration || '',
      meaning: t.meaning || '',
      explanation: t.explanation || '',
      relevance: t.relevance || '',
    }));

    return {
      taglines,
      companyName: companyInfo.companyName,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error generating taglines:', error);
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

// Get tone options
export const getToneOptions = (): { value: TaglineTone; label: string; icon: string }[] => [
  { value: 'inspirational', label: 'Inspirational', icon: '✨' },
  { value: 'powerful', label: 'Powerful', icon: '⚡' },
  { value: 'spiritual', label: 'Spiritual', icon: '🕉️' },
  { value: 'modern', label: 'Modern', icon: '🚀' },
  { value: 'traditional', label: 'Traditional', icon: '📜' },
  { value: 'innovative', label: 'Innovative', icon: '💡' },
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
