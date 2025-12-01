// AI Composer Service - Generates Sanskrit Shlokas using Gemini AI
import Constants from 'expo-constants';

// Get API key from Expo Constants (which reads from .env with EXPO_PUBLIC_ prefix)
const getApiKey = (): string => {
  // Try expo-constants first
  const expoConfig = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
  if (expoConfig) return expoConfig;
  
  // Try process.env (works in some Expo setups)
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GOOGLE_AI_API_KEY) {
    return process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
  }
  
  // Fallback key from .env
  return 'AIzaSyA39FByvcJs5HeN7kHf4JycdshBMZsgL1A';
};

const GEMINI_API_KEY = getApiKey();
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface ShlokaGenerationRequest {
  theme: string;
  mood?: 'devotional' | 'peaceful' | 'inspiring' | 'philosophical' | 'celebratory';
  deity?: string;
  style?: 'vedic' | 'classical' | 'simple';
  language?: 'sanskrit' | 'hindi' | 'both';
  additionalContext?: string;
}

export interface GeneratedShloka {
  id: string;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  wordByWord: {
    sanskrit: string;
    transliteration: string;
    meaning: string;
  }[];
  meter: string;
  theme: string;
  source: string;
  timestamp: Date;
}

export interface GenerationError {
  code: string;
  message: string;
}

// Generate a unique shloka based on user input
export const generateShloka = async (
  request: ShlokaGenerationRequest
): Promise<{ success: true; shloka: GeneratedShloka } | { success: false; error: GenerationError }> => {
  const prompt = buildPrompt(request);

  try {
    if (!GEMINI_API_KEY) {
      console.log('No API key found, using fallback');
      return { success: true, shloka: generateFallbackShloka(request) };
    }

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
      
      // Return fallback on API error
      return { success: true, shloka: generateFallbackShloka(request) };
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      console.error('No response from Gemini');
      return { success: true, shloka: generateFallbackShloka(request) };
    }

    // Parse the JSON response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse JSON from response');
      return { success: true, shloka: generateFallbackShloka(request) };
    }

    const geminiResult = JSON.parse(jsonMatch[0]);
    
    const generatedShloka: GeneratedShloka = {
      id: `shloka-${Date.now()}`,
      sanskrit: geminiResult.sanskrit || 'ॐ शान्तिः शान्तिः शान्तिः',
      transliteration: geminiResult.transliteration || 'Om Shantih Shantih Shantih',
      meaning: geminiResult.meaning || 'Om, Peace, Peace, Peace',
      wordByWord: geminiResult.wordByWord || [],
      meter: geminiResult.meter || 'Anushtup',
      theme: request.theme,
      source: 'AI Generated - ShlokaYug',
      timestamp: new Date(),
    };

    return { success: true, shloka: generatedShloka };
  } catch (error) {
    console.error('Error generating shloka:', error);
    // Return fallback instead of error for better UX
    return { success: true, shloka: generateFallbackShloka(request) };
  }
};

// Build the prompt for Gemini
const buildPrompt = (request: ShlokaGenerationRequest): string => {
  const moodDescriptions: Record<string, string> = {
    devotional: 'deeply devotional and reverent, expressing love for the divine',
    peaceful: 'calm, serene, and meditative, bringing inner peace',
    inspiring: 'uplifting and motivational, encouraging positive action',
    philosophical: 'thought-provoking, exploring deep truths about existence',
    celebratory: 'joyful and festive, celebrating life and blessings',
  };

  const styleDescriptions: Record<string, string> = {
    vedic: 'in the classical Vedic style with traditional meter and vocabulary',
    classical: 'in the style of classical Sanskrit poets like Kalidasa',
    simple: 'using simple, accessible Sanskrit that is easy to pronounce',
  };

  return `
You are an expert Sanskrit poet and scholar. Generate an original Sanskrit shloka (verse) based on the following requirements:

THEME: ${request.theme}
MOOD: ${moodDescriptions[request.mood || 'peaceful']}
${request.deity ? `DEITY/FOCUS: ${request.deity}` : ''}
STYLE: ${styleDescriptions[request.style || 'classical']}
${request.additionalContext ? `ADDITIONAL CONTEXT: ${request.additionalContext}` : ''}

Generate a beautiful, meaningful shloka that:
1. Follows proper Sanskrit grammar and meter (preferably Anushtup or Shloka meter)
2. Contains 2-4 lines (typically 2 lines with 16 syllables each for Anushtup)
3. Is poetic, profound, and suitable for chanting
4. Includes proper sandhi (word joining) rules

Return ONLY a valid JSON object in this exact format:
{
  "sanskrit": "<the shloka in Devanagari script>",
  "transliteration": "<IAST or simplified transliteration>",
  "meaning": "<full English translation/meaning>",
  "wordByWord": [
    {"sanskrit": "<word1 in Devanagari>", "transliteration": "<word1 transliterated>", "meaning": "<word1 meaning>"},
    {"sanskrit": "<word2 in Devanagari>", "transliteration": "<word2 transliterated>", "meaning": "<word2 meaning>"}
  ],
  "meter": "<name of the chandas/meter used>"
}

IMPORTANT: Return ONLY the JSON object, no markdown, no explanation, no code blocks.
`;
};

// Fallback shlokas for when API fails
const generateFallbackShloka = (request: ShlokaGenerationRequest): GeneratedShloka => {
  const fallbackShlokas: Record<string, GeneratedShloka> = {
    peace: {
      id: `shloka-${Date.now()}`,
      sanskrit: 'ॐ सर्वे भवन्तु सुखिनः\nसर्वे सन्तु निरामयाः।\nसर्वे भद्राणि पश्यन्तु\nमा कश्चिद्दुःखभाग्भवेत्॥',
      transliteration: 'Om Sarve Bhavantu Sukhinah\nSarve Santu Niramayah\nSarve Bhadrani Pashyantu\nMa Kashchid Duhkha Bhag Bhavet',
      meaning: 'May all be happy, may all be free from illness. May all see what is auspicious, may no one suffer.',
      wordByWord: [
        { sanskrit: 'सर्वे', transliteration: 'Sarve', meaning: 'All' },
        { sanskrit: 'भवन्तु', transliteration: 'Bhavantu', meaning: 'May become' },
        { sanskrit: 'सुखिनः', transliteration: 'Sukhinah', meaning: 'Happy' },
        { sanskrit: 'निरामयाः', transliteration: 'Niramayah', meaning: 'Free from disease' },
      ],
      meter: 'Anushtup',
      theme: 'Peace',
      source: 'ShlokaYug - Traditional',
      timestamp: new Date(),
    },
    wisdom: {
      id: `shloka-${Date.now()}`,
      sanskrit: 'असतो मा सद्गमय\nतमसो मा ज्योतिर्गमय।\nमृत्योर्मा अमृतं गमय\nॐ शान्तिः शान्तिः शान्तिः॥',
      transliteration: 'Asato Ma Sadgamaya\nTamaso Ma Jyotirgamaya\nMrityorma Amritam Gamaya\nOm Shantih Shantih Shantih',
      meaning: 'Lead me from untruth to truth, from darkness to light, from death to immortality. Om peace, peace, peace.',
      wordByWord: [
        { sanskrit: 'असतः', transliteration: 'Asatah', meaning: 'From untruth' },
        { sanskrit: 'सत्', transliteration: 'Sat', meaning: 'To truth' },
        { sanskrit: 'गमय', transliteration: 'Gamaya', meaning: 'Lead me' },
        { sanskrit: 'तमसः', transliteration: 'Tamasah', meaning: 'From darkness' },
      ],
      meter: 'Anushtup',
      theme: 'Wisdom',
      source: 'ShlokaYug - Brihadaranyaka Upanishad',
      timestamp: new Date(),
    },
    devotion: {
      id: `shloka-${Date.now()}`,
      sanskrit: 'त्वमेव माता च पिता त्वमेव\nत्वमेव बन्धुश्च सखा त्वमेव।\nत्वमेव विद्या द्रविणं त्वमेव\nत्वमेव सर्वं मम देव देव॥',
      transliteration: 'Tvameva Mata Cha Pita Tvameva\nTvameva Bandhushcha Sakha Tvameva\nTvameva Vidya Dravinam Tvameva\nTvameva Sarvam Mama Deva Deva',
      meaning: 'You are my mother and father, you are my friend and companion. You are my knowledge and wealth, you are my everything, O Lord of Lords.',
      wordByWord: [
        { sanskrit: 'त्वम्', transliteration: 'Tvam', meaning: 'You' },
        { sanskrit: 'एव', transliteration: 'Eva', meaning: 'Indeed/Only' },
        { sanskrit: 'माता', transliteration: 'Mata', meaning: 'Mother' },
        { sanskrit: 'पिता', transliteration: 'Pita', meaning: 'Father' },
      ],
      meter: 'Shloka',
      theme: 'Devotion',
      source: 'ShlokaYug - Traditional Prayer',
      timestamp: new Date(),
    },
    success: {
      id: `shloka-${Date.now()}`,
      sanskrit: 'कर्मण्येवाधिकारस्ते\nमा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा\nते सङ्गोऽस्त्वकर्मणि॥',
      transliteration: 'Karmanyevadhikaraste\nMa Phaleshu Kadachana\nMa Karmaphalaheturbhurma\nTe Sangostvakarman',
      meaning: 'You have the right to action alone, never to its fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction.',
      wordByWord: [
        { sanskrit: 'कर्मणि', transliteration: 'Karmani', meaning: 'In action' },
        { sanskrit: 'अधिकारः', transliteration: 'Adhikarah', meaning: 'Right' },
        { sanskrit: 'ते', transliteration: 'Te', meaning: 'Your' },
        { sanskrit: 'फलेषु', transliteration: 'Phaleshu', meaning: 'In fruits' },
      ],
      meter: 'Anushtup',
      theme: 'Success',
      source: 'ShlokaYug - Bhagavad Gita 2.47',
      timestamp: new Date(),
    },
    strength: {
      id: `shloka-${Date.now()}`,
      sanskrit: 'उद्यमेन हि सिध्यन्ति\nकार्याणि न मनोरथैः।\nन हि सुप्तस्य सिंहस्य\nप्रविशन्ति मुखे मृगाः॥',
      transliteration: 'Udyamena Hi Sidhyanti\nKaryani Na Manorathaih\nNa Hi Suptasya Simhasya\nPravishanti Mukhe Mrigah',
      meaning: 'Tasks are accomplished by effort, not by wishful thinking. Prey does not enter the mouth of a sleeping lion.',
      wordByWord: [
        { sanskrit: 'उद्यमेन', transliteration: 'Udyamena', meaning: 'By effort' },
        { sanskrit: 'सिध्यन्ति', transliteration: 'Sidhyanti', meaning: 'Are accomplished' },
        { sanskrit: 'कार्याणि', transliteration: 'Karyani', meaning: 'Tasks' },
        { sanskrit: 'मनोरथैः', transliteration: 'Manorathaih', meaning: 'By wishes' },
      ],
      meter: 'Anushtup',
      theme: 'Strength',
      source: 'ShlokaYug - Hitopadesha',
      timestamp: new Date(),
    },
  };

  // Try to match theme or mood
  const theme = request.theme.toLowerCase();
  const mood = request.mood || 'peaceful';
  
  if (theme.includes('peace') || theme.includes('calm') || mood === 'peaceful') {
    return fallbackShlokas.peace;
  }
  if (theme.includes('wisdom') || theme.includes('knowledge') || mood === 'philosophical') {
    return fallbackShlokas.wisdom;
  }
  if (theme.includes('devotion') || theme.includes('god') || theme.includes('divine') || mood === 'devotional') {
    return fallbackShlokas.devotion;
  }
  if (theme.includes('success') || theme.includes('work') || mood === 'inspiring') {
    return fallbackShlokas.success;
  }
  if (theme.includes('strength') || theme.includes('courage') || theme.includes('power')) {
    return fallbackShlokas.strength;
  }

  // Default to peace shloka
  return fallbackShlokas.peace;
};

export default {
  generateShloka,
};
