// Enhanced Data for Chandas Mobile App - Direct port from Web App

export interface EnhancedShloka {
  id: string;
  sanskrit: string;
  devanagari: string;
  transliteration: string;
  translation: string;
  meaning: string;
  source: string;
  author: string;
  context: string;
  chandas: {
    name: string;
    nameDevanagari: string;
    type: string;
    syllablePattern: string;
    beatPattern: string;
    matra: number;
    gana: string[];
    characteristics: string[];
  };
  prosody: {
    totalSyllables: number;
    lines: number;
    syllablesPerLine: number[];
    meterStructure: string;
    rhymeScheme: string;
    caesura?: number[];
  };
  audio: {
    recitationUrl: string;
    karaokeUrl: string;
    instrumentalUrl: string;
    tempo: number;
    scale: string;
    raga?: string;
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  spiritual: {
    deity?: string;
    philosophy: string;
    tradition: string;
    significance: string;
  };
  etymology: {
    keyWords: {
      word: string;
      meaning: string;
      origin: string;
    }[];
  };
}

export const ENHANCED_SHLOKAS: EnhancedShloka[] = [
  {
    id: 'bhagavad-gita-1',
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    devanagari: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    transliteration: 'karmaṇy-evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo \'stv akarmaṇi',
    translation: 'You have a right to perform your prescribed duty, but not to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.',
    meaning: 'This profound verse teaches the principle of selfless action (Nishkama Karma), emphasizing performing duty without attachment to results.',
    source: 'Bhagavad Gita',
    author: 'Lord Krishna',
    context: 'Chapter 2, Verse 47 - Teachings on the eternal soul and duty',
    chandas: {
      name: 'Anushtubh',
      nameDevanagari: 'अनुष्टुभ्',
      type: 'Sama',
      syllablePattern: '8-8-8-8',
      beatPattern: 'U-U-U-U-',
      matra: 32,
      gana: ['यगण', 'मगण', 'तगण', 'जगण'],
      characteristics: ['Regular rhythm', 'Easy to memorize', 'Epic meter']
    },
    prosody: {
      totalSyllables: 32,
      lines: 2,
      syllablesPerLine: [16, 16],
      meterStructure: 'Anushtubh pada',
      rhymeScheme: 'ABAB',
      caesura: [8, 8]
    },
    audio: {
      recitationUrl: '/audio/bhagavad-gita-2-47.mp3',
      karaokeUrl: '/audio/bhagavad-gita-2-47-karaoke.mp3',
      instrumentalUrl: '/audio/bhagavad-gita-2-47-instrumental.mp3',
      tempo: 120,
      scale: 'Sa Re Ga Ma',
      raga: 'Yaman'
    },
    difficulty: 'intermediate',
    tags: ['philosophy', 'dharma', 'action', 'detachment', 'karma-yoga'],
    spiritual: {
      deity: 'Krishna',
      philosophy: 'Karma Yoga - Path of Selfless Action',
      tradition: 'Vedantic',
      significance: 'Foundational teaching on performing duty without attachment to results'
    },
    etymology: {
      keyWords: [
        {
          word: 'कर्मण्',
          meaning: 'Action, work, duty',
          origin: 'From root कृ (kṛ) - to do'
        },
        {
          word: 'अधिकार',
          meaning: 'Right, authority, jurisdiction',
          origin: 'अधि + कृ - over + to do'
        },
        {
          word: 'फल',
          meaning: 'Fruit, result, consequence',
          origin: 'From root फल् (phal) - to burst forth'
        }
      ]
    }
  },
  {
    id: 'gayatri-mantra',
    sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं।\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    devanagari: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं।\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    transliteration: 'oṃ bhūr bhuvaḥ svaḥ tat savitur vareṇyaṃ\nbhargo devasya dhīmahi dhiyo yo naḥ pracodayāt',
    translation: 'Om, Earth, Atmosphere, Heaven. We meditate on the most adorable light of the divine Sun. May that illuminate our understanding.',
    meaning: 'The most sacred Vedic mantra invoking divine illumination and seeking guidance for righteous wisdom.',
    source: 'Rigveda',
    author: 'Sage Vishwamitra',
    context: 'Rigveda 3.62.10 - Supreme invocation to divine consciousness',
    chandas: {
      name: 'Gayatri',
      nameDevanagari: 'गायत्री',
      type: 'Sama',
      syllablePattern: '8-8-8',
      beatPattern: 'U-U-U-U-',
      matra: 24,
      gana: ['तगण', 'तगण', 'जगण'],
      characteristics: ['Most sacred meter', 'Perfect balance', 'Divine proportion']
    },
    prosody: {
      totalSyllables: 24,
      lines: 3,
      syllablesPerLine: [8, 8, 8],
      meterStructure: 'Tripada Gayatri',
      rhymeScheme: 'AAA',
      caesura: [4, 4, 4]
    },
    audio: {
      recitationUrl: '/audio/gayatri-mantra.mp3',
      karaokeUrl: '/audio/gayatri-mantra-karaoke.mp3',
      instrumentalUrl: '/audio/gayatri-mantra-instrumental.mp3',
      tempo: 108,
      scale: 'Sa Ri Ga Ma Pa Dha Ni',
      raga: 'Saraswati'
    },
    difficulty: 'beginner',
    tags: ['mantra', 'vedic', 'sacred', 'divine-light', 'wisdom'],
    spiritual: {
      deity: 'Savitar (Solar deity)',
      philosophy: 'Vedic spirituality and divine illumination',
      tradition: 'Vedic',
      significance: 'Most powerful mantra for spiritual awakening and divine guidance'
    },
    etymology: {
      keyWords: [
        {
          word: 'गायत्री',
          meaning: 'She who protects the singer',
          origin: 'From गा (gā) - to sing + त्रि (tri) - to protect'
        },
        {
          word: 'सवितुर्',
          meaning: 'Of the solar deity, divine illuminator',
          origin: 'From सू (sū) - to generate, create'
        },
        {
          word: 'वरेण्यम्',
          meaning: 'Most adorable, excellent, worthy of choice',
          origin: 'From वृ (vṛ) - to choose, select'
        }
      ]
    }
  }
];

export interface ChandasPattern {
  id: string;
  name: string;
  nameDevanagari: string;
  category: string;
  syllableCount: number;
  pattern: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  examples: string[];
  characteristics: string[];
  ganas: string[];
  musicalProperties: {
    tempo: string;
    mood: string;
    raga: string;
  };
}

export const ENHANCED_CHANDAS_PATTERNS: ChandasPattern[] = [
  {
    id: 'gayatri',
    name: 'Gayatri',
    nameDevanagari: 'गायत्री',
    category: 'Sama',
    syllableCount: 24,
    pattern: '8 + 8 + 8',
    description: 'The most sacred and widely used Vedic meter, perfect for mantras and spiritual verses.',
    difficulty: 'beginner',
    examples: [
      'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं',
      'भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्'
    ],
    characteristics: [
      'Sacred and auspicious',
      'Easy to memorize',
      'Perfect rhythmic balance',
      'Suitable for mantras'
    ],
    ganas: ['तगण', 'तगण', 'जगण'],
    musicalProperties: {
      tempo: 'Madhya (Medium)',
      mood: 'Peaceful & Sacred',
      raga: 'Saraswati, Bhairav'
    }
  },
  {
    id: 'anushtubh',
    name: 'Anushtubh',
    nameDevanagari: 'अनुष्टुभ्',
    category: 'Sama',
    syllableCount: 32,
    pattern: '8 + 8 + 8 + 8',
    description: 'The most common epic meter, used extensively in Mahabharata and Ramayana.',
    difficulty: 'intermediate',
    examples: [
      'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
      'मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि'
    ],
    characteristics: [
      'Narrative excellence',
      'Rhythmic flow',
      'Story-telling meter',
      'Balanced structure'
    ],
    ganas: ['यगण', 'मगण', 'तगण', 'जगण'],
    musicalProperties: {
      tempo: 'Druta (Fast)',
      mood: 'Narrative & Dynamic',
      raga: 'Yaman, Kafi'
    }
  }
];

export const ENHANCED_DAILY_QUOTES = [
  {
    id: 'morning-wisdom',
    sanskrit: 'उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत',
    transliteration: 'uttiṣṭhata jāgrata prāpya varān nibodhata',
    translation: 'Arise, awake, and stop not until the goal is reached',
    source: 'Katha Upanishad',
    timeOfDay: 'morning',
    mood: 'motivational'
  },
  {
    id: 'evening-peace',
    sanskrit: 'शान्तिः शान्तिः शान्तिः',
    transliteration: 'śāntiḥ śāntiḥ śāntiḥ',
    translation: 'Peace, peace, peace',
    source: 'Upanishads',
    timeOfDay: 'evening',
    mood: 'peaceful'
  }
];

export const ENHANCED_ACHIEVEMENTS = [
  {
    id: 'first-steps',
    name: 'Sanskrit Explorer',
    description: 'Complete your first shloka analysis',
    icon: '🚀',
    rarity: 'common'
  },
  {
    id: 'karaoke-master',
    name: 'Divine Singer',
    description: 'Perfect timing in karaoke mode',
    icon: '🎵',
    rarity: 'epic'
  },
  {
    id: 'scholar',
    name: 'Vedic Scholar',
    description: 'Master 10 different chandas patterns',
    icon: '📚',
    rarity: 'legendary'
  },
  {
    id: 'community-contributor',
    name: 'Sangha Member',
    description: 'Contribute to community knowledge',
    icon: '🤝',
    rarity: 'rare'
  }
];

export const SANSKRIT_GREETINGS = {
  morning: 'सुप्रभातम्',
  afternoon: 'शुभ दिन',
  evening: 'शुभ सायंकाल',
  night: 'शुभ रात्रि'
};

export const RAGA_MAPPINGS = {
  'Gayatri': ['Saraswati', 'Bhairav', 'Todi'],
  'Anushtubh': ['Yaman', 'Kafi', 'Bhimpalasi'],
  'Trishtubh': ['Durga', 'Bilaval', 'Khamaj'],
  'Jagati': ['Malkauns', 'Desi', 'Bageshri']
};