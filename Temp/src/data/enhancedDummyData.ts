// Enhanced Dummy Data for Extraordinary Chandas Experience

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
    keyWords: Array<{
      word: string;
      meaning: string;
      root: string;
      grammaticalForm: string;
    }>;
  };
}

export const ENHANCED_SHLOKAS: EnhancedShloka[] = [
  {
    id: 'bhagavad-gita-2-47',
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    devanagari: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    transliteration: 'karmaṇy-evādhikāras-te mā phaleṣu kadācana | mā karma-phala-hetur-bhūr-mā te saṅgo \'stv-akarmaṇi ||',
    translation: 'You have the right to perform action, but never to the fruits of action. Do not be motivated by the fruits of action, nor should you be attached to inaction.',
    meaning: 'This profound verse teaches the philosophy of Nishkama Karma - performing duty without attachment to results. It emphasizes the importance of righteous action while remaining detached from outcomes.',
    source: 'Bhagavad Gita',
    author: 'Sage Vyasa',
    context: 'Chapter 2, Verse 47 - Krishna\'s teaching to Arjuna about duty and detachment during the Kurukshetra war.',
    chandas: {
      name: 'Anushtup',
      nameDevanagari: 'अनुष्टुप्',
      type: 'Sama Vrtta',
      syllablePattern: 'LGGG LGLG | LGGG LGLG',
      beatPattern: '12121212 | 12121212',
      matra: 32,
      gana: ['ta', 'bha', 'ja', 'ja'],
      characteristics: [
        '8 syllables per quarter (pada)',
        '32 syllables total',
        'Second and fourth quarters must end with L-G-L-G',
        'Most common meter in Sanskrit epic poetry'
      ]
    },
    prosody: {
      totalSyllables: 32,
      lines: 2,
      syllablesPerLine: [16, 16],
      meterStructure: '8+8 | 8+8',
      rhymeScheme: 'ABAB',
      caesura: [8, 24]
    },
    audio: {
      recitationUrl: '/audio/bhagavad-gita-2-47-recitation.mp3',
      karaokeUrl: '/audio/bhagavad-gita-2-47-karaoke.mp3',
      instrumentalUrl: '/audio/bhagavad-gita-2-47-instrumental.mp3',
      tempo: 72,
      scale: 'Raag Bhairav',
      raga: 'Bhairav'
    },
    difficulty: 'intermediate',
    tags: ['karma-yoga', 'philosophy', 'duty', 'detachment', 'classical'],
    spiritual: {
      deity: 'Krishna',
      philosophy: 'Karma Yoga',
      tradition: 'Vedanta',
      significance: 'Foundation of Nishkama Karma philosophy'
    },
    etymology: {
      keyWords: [
        {
          word: 'कर्मणि',
          meaning: 'in action',
          root: 'कृ (to do)',
          grammaticalForm: 'locative singular'
        },
        {
          word: 'अधिकार',
          meaning: 'right, authority',
          root: 'अधि + कृ',
          grammaticalForm: 'masculine nominative'
        },
        {
          word: 'फलेषु',
          meaning: 'in fruits/results',
          root: 'फल',
          grammaticalForm: 'locative plural'
        }
      ]
    }
  },
  {
    id: 'gayatri-mantra',
    sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    devanagari: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    transliteration: 'oṃ bhūr-bhuvaḥ svaḥ tat-savitur-vareṇyaṃ bhargo devasya dhīmahi dhiyo yo naḥ pracodayāt',
    translation: 'Om, we meditate on the divine light of the Sun God who is worthy of worship, who illuminates the three worlds. May He enlighten our intellect.',
    meaning: 'The most sacred of all Vedic mantras, invoking divine illumination and wisdom. It represents the essence of Vedic spiritual practice.',
    source: 'Rigveda',
    author: 'Sage Vishwamitra',
    context: 'Rigveda 3.62.10 - The most revered mantra in Hinduism, chanted during daily prayers and sacred ceremonies.',
    chandas: {
      name: 'Gayatri',
      nameDevanagari: 'गायत्री',
      type: 'Vedic Metre',
      syllablePattern: 'LGLLGLGG | LGLLGLGG | LGLLGLGG',
      beatPattern: '12112112 | 12112112 | 12112112',
      matra: 24,
      gana: ['ta', 'ra', 'ja'],
      characteristics: [
        '8 syllables per quarter',
        '24 syllables total in three lines',
        'Sacred Vedic meter',
        'Used for the most important mantras'
      ]
    },
    prosody: {
      totalSyllables: 24,
      lines: 3,
      syllablesPerLine: [8, 8, 8],
      meterStructure: '8+8+8',
      rhymeScheme: 'AAA'
    },
    audio: {
      recitationUrl: '/audio/gayatri-mantra-recitation.mp3',
      karaokeUrl: '/audio/gayatri-mantra-karaoke.mp3',
      instrumentalUrl: '/audio/gayatri-mantra-instrumental.mp3',
      tempo: 60,
      scale: 'Raag Saraswati',
      raga: 'Saraswati'
    },
    difficulty: 'advanced',
    tags: ['vedic', 'mantra', 'sacred', 'meditation', 'ancient'],
    spiritual: {
      deity: 'Savitri (Sun God)',
      philosophy: 'Vedic Worship',
      tradition: 'Vedic',
      significance: 'Most sacred mantra in Hinduism'
    },
    etymology: {
      keyWords: [
        {
          word: 'सवितुः',
          meaning: 'of the sun god',
          root: 'सू (to give life)',
          grammaticalForm: 'genitive singular'
        },
        {
          word: 'वरेण्यं',
          meaning: 'most excellent, worthy of worship',
          root: 'वृ (to choose)',
          grammaticalForm: 'accusative singular'
        },
        {
          word: 'धीमहि',
          meaning: 'we meditate',
          root: 'धी (to think)',
          grammaticalForm: 'first person plural middle'
        }
      ]
    }
  },
  {
    id: 'ishavasya-upanishad-1',
    sanskrit: 'ईशावास्यमिदं सर्वं यत्किञ्च जगत्यां जगत्। तेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥',
    devanagari: 'ईशावास्यमिदं सर्वं यत्किञ्च जगत्यां जगत्। तेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥',
    transliteration: 'īśāvāsyam-idaṃ sarvaṃ yat-kiñca jagatyāṃ jagat | tena tyaktena bhuñjīthā mā gṛdhaḥ kasya-svid-dhanam ||',
    translation: 'All this is pervaded by the Divine. Whatever moves in this world, enjoy it by renunciation. Do not covet, for whose is this wealth?',
    meaning: 'The opening verse of Ishavasya Upanishad teaches the fundamental truth of divine presence in everything and the path of renunciation.',
    source: 'Ishavasya Upanishad',
    author: 'Unknown Vedic Sage',
    context: 'The first and foundational verse of one of the most important Upanishads, encapsulating the essence of Vedantic philosophy.',
    chandas: {
      name: 'Anushtup',
      nameDevanagari: 'अनुष्टुप्',
      type: 'Sama Vrtta',
      syllablePattern: 'LGGG LGLG | LGGG LGLG',
      beatPattern: '12121212 | 12121212',
      matra: 32,
      gana: ['ta', 'bha', 'ja', 'ja'],
      characteristics: [
        '8 syllables per quarter',
        '32 syllables total',
        'Upanishadic style',
        'Philosophical content'
      ]
    },
    prosody: {
      totalSyllables: 32,
      lines: 2,
      syllablesPerLine: [16, 16],
      meterStructure: '8+8 | 8+8',
      rhymeScheme: 'ABAB'
    },
    audio: {
      recitationUrl: '/audio/ishavasya-1-recitation.mp3',
      karaokeUrl: '/audio/ishavasya-1-karaoke.mp3',
      instrumentalUrl: '/audio/ishavasya-1-instrumental.mp3',
      tempo: 65,
      scale: 'Raag Bhairav',
      raga: 'Bhairav'
    },
    difficulty: 'expert',
    tags: ['upanishad', 'vedanta', 'philosophy', 'renunciation', 'divine'],
    spiritual: {
      deity: 'Isha (Divine Lord)',
      philosophy: 'Advaita Vedanta',
      tradition: 'Upanishadic',
      significance: 'Foundation of non-dualistic philosophy'
    },
    etymology: {
      keyWords: [
        {
          word: 'ईशावास्यम्',
          meaning: 'pervaded by the Divine',
          root: 'ईश (lord) + वास् (to dwell)',
          grammaticalForm: 'instrumental singular'
        },
        {
          word: 'त्यक्तेन',
          meaning: 'by renunciation',
          root: 'त्यज् (to abandon)',
          grammaticalForm: 'instrumental singular'
        }
      ]
    }
  }
];

export const ENHANCED_CHANDAS_DATABASE = [
  {
    id: 'anushtup',
    name: 'Anushtup',
    nameDevanagari: 'अनुष्टुप्',
    category: 'Sama Vrtta',
    syllableCount: 32,
    structure: '8+8+8+8',
    pattern: 'LGGG LGLG | LGGG LGLG | LGGG LGLG | LGGG LGLG',
    ganaPattern: ['ta', 'bha', 'ja', 'ja'],
    description: 'The most popular meter in Sanskrit literature, especially epics',
    characteristics: [
      'Four quarters of 8 syllables each',
      'Total 32 syllables',
      'Flexible first 4 syllables, fixed last 4 as L-G-L-G',
      'Most common in Mahabharata and Ramayana'
    ],
    examples: ['Bhagavad Gita verses', 'Most Puranic verses'],
    difficulty: 'intermediate',
    popularity: 10,
    musicalProperties: {
      tempo: 'Moderate',
      mood: 'Narrative',
      rhythm: 'Balanced',
      suitableFor: ['storytelling', 'philosophical discourse']
    },
    historicalUsage: {
      period: 'Epic period onwards',
      majorWorks: ['Mahabharata', 'Ramayana', 'Puranas'],
      poets: ['Vyasa', 'Valmiki']
    }
  },
  {
    id: 'gayatri',
    name: 'Gayatri',
    nameDevanagari: 'गायत्री',
    category: 'Vedic Metre',
    syllableCount: 24,
    structure: '8+8+8',
    pattern: 'LGLLGLGG | LGLLGLGG | LGLLGLGG',
    ganaPattern: ['ta', 'ra', 'ja'],
    description: 'Sacred Vedic meter, used for the most important mantras',
    characteristics: [
      'Three quarters of 8 syllables each',
      'Total 24 syllables',
      'Sacred and ritualistic',
      'Used for important mantras'
    ],
    examples: ['Gayatri Mantra', 'Various Vedic hymns'],
    difficulty: 'advanced',
    popularity: 9,
    musicalProperties: {
      tempo: 'Slow to Moderate',
      mood: 'Sacred',
      rhythm: 'Meditative',
      suitableFor: ['mantras', 'hymns', 'prayers']
    },
    historicalUsage: {
      period: 'Vedic period',
      majorWorks: ['Rigveda', 'Samaveda'],
      poets: ['Vedic Rishis']
    }
  },
  {
    id: 'mandakranta',
    name: 'Mandakranta',
    nameDevanagari: 'मन्दाक्रान्ता',
    category: 'Sama Vrtta',
    syllableCount: 68,
    structure: '17+17+17+17',
    pattern: 'GGGGLGLLGGLGLLGG | GGGGLGLLGGLGLLGG | GGGGLGLLGGLGLLGG | GGGGLGLLGGLGLLGG',
    ganaPattern: ['ma', 'bha', 'na', 'ta', 'ta', 'ga'],
    description: 'Majestic and slow-moving meter, perfect for serious and dignified themes',
    characteristics: [
      'Four quarters of 17 syllables each',
      'Total 68 syllables',
      'Stately and dignified',
      'Perfect for heroic and serious themes'
    ],
    examples: ['Meghaduta by Kalidasa', 'Various mahakavyas'],
    difficulty: 'expert',
    popularity: 8,
    musicalProperties: {
      tempo: 'Slow',
      mood: 'Majestic',
      rhythm: 'Grand',
      suitableFor: ['epic poetry', 'nature descriptions', 'heroic themes']
    },
    historicalUsage: {
      period: 'Classical period',
      majorWorks: ['Meghaduta', 'Raghuvamsha'],
      poets: ['Kalidasa', 'Bharavi']
    }
  }
];

export const RAGA_MAPPINGS = {
  'Bhairav': {
    mood: 'Serious, devotional',
    time: 'Early morning',
    emotions: ['reverence', 'devotion', 'peace'],
    characteristics: 'Grave and serious, suitable for prayer'
  },
  'Saraswati': {
    mood: 'Learning, wisdom',
    time: 'Morning',
    emotions: ['knowledge', 'clarity', 'inspiration'],
    characteristics: 'Promotes learning and intellectual pursuits'
  },
  'Yaman': {
    mood: 'Romantic, longing',
    time: 'Evening',
    emotions: ['love', 'yearning', 'beauty'],
    characteristics: 'Sweet and melodious, creates romantic atmosphere'
  }
};

export const ENHANCED_DAILY_QUOTES = [
  {
    id: '1',
    sanskrit: 'योगः कर्मसु कौशलम्',
    transliteration: 'yogaḥ karmasu kauśalam',
    translation: 'Yoga is skill in action',
    source: 'Bhagavad Gita 2.50',
    context: 'Definition of yoga as mastery over one\'s actions',
    mood: 'inspirational'
  },
  {
    id: '2',
    sanskrit: 'अहिंसा परमो धर्मः',
    transliteration: 'ahiṃsā paramo dharmaḥ',
    translation: 'Non-violence is the highest virtue',
    source: 'Mahabharata',
    context: 'The fundamental principle of righteous living',
    mood: 'ethical'
  },
  {
    id: '3',
    sanskrit: 'सत्यमेव जयते',
    transliteration: 'satyameva jayate',
    translation: 'Truth alone triumphs',
    source: 'Mundaka Upanishad',
    context: 'India\'s national motto, emphasizing the power of truth',
    mood: 'triumphant'
  }
];

export const ENHANCED_ACHIEVEMENTS = [
  {
    id: 'first-analysis',
    title: 'First Steps',
    description: 'Completed your first chandas analysis',
    icon: '🎯',
    rarity: 'common',
    xp: 50
  },
  {
    id: 'meter-master',
    title: 'Meter Master',
    description: 'Identified 25 different chandas correctly',
    icon: '👑',
    rarity: 'epic',
    xp: 1000
  },
  {
    id: 'vedic-scholar',
    title: 'Vedic Scholar',
    description: 'Mastered all Vedic meters',
    icon: '🕉️',
    rarity: 'legendary',
    xp: 5000
  },
  {
    id: 'karaoke-star',
    title: 'Karaoke Star',
    description: 'Sang 10 shlokas perfectly in karaoke mode',
    icon: '🎤',
    rarity: 'rare',
    xp: 500
  },
  {
    id: 'community-contributor',
    title: 'Community Builder',
    description: 'Helped 50 fellow learners',
    icon: '🤝',
    rarity: 'rare',
    xp: 750
  }
];

export const LEARNING_PATHS_ENHANCED = [
  {
    id: 'vedic-fundamentals',
    title: 'Vedic Fundamentals',
    description: 'Master the ancient meters of the Vedas',
    difficulty: 'beginner',
    estimatedTime: '4-6 weeks',
    modules: [
      {
        id: 'introduction',
        title: 'Introduction to Vedic Prosody',
        lessons: [
          'What is Chandas Shastra?',
          'Historical Development',
          'Classification of Meters',
          'Basic Terminology'
        ]
      },
      {
        id: 'gayatri-deep-dive',
        title: 'Gayatri Meter Deep Dive',
        lessons: [
          'Structure and Pattern',
          'Sacred Significance',
          'Recitation Techniques',
          'Variations and Usage'
        ]
      }
    ],
    prerequisites: [],
    rewards: ['Vedic Scholar Badge', '1000 XP', 'Exclusive Content']
  },
  {
    id: 'epic-mastery',
    title: 'Epic Poetry Mastery',
    description: 'Explore the meters of great epics',
    difficulty: 'intermediate',
    estimatedTime: '6-8 weeks',
    modules: [
      {
        id: 'anushtup-mastery',
        title: 'Anushtup Mastery',
        lessons: [
          'Epic Usage Patterns',
          'Variations in Different Works',
          'Emotional Expression',
          'Narrative Techniques'
        ]
      }
    ],
    prerequisites: ['vedic-fundamentals'],
    rewards: ['Epic Master Badge', '2000 XP', 'Advanced Analyzer']
  }
];