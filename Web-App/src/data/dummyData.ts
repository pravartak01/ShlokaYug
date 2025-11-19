// Dummy data for Chandas and related functionality

import type { 
  Chandas, 
  Shloka, 
  Achievement, 
  GameQuestion, 
  Script,
  AnalysisResult 
} from '../types/chandas';

// Major Chandas patterns
export const CHANDAS_DATABASE: Chandas[] = [
  {
    id: 'anushtubh',
    name: 'Anushtubh',
    nameDevanagari: 'अनुष्टुभ्',
    description: 'The most common meter in Sanskrit literature, especially in epics like Mahabharata and Ramayana.',
    pattern: 'x x x x | x x x x', // 8 syllables per pada
    syllableCount: 32,
    popularity: 10,
    difficulty: 'beginner',
    examples: [
      'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
      'धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः'
    ],
    usedIn: ['Bhagavad Gita', 'Mahabharata', 'Ramayana', 'Puranas'],
    rules: [
      'Each pada has 8 syllables',
      '5th syllable is always laghu',
      '6th syllable can be laghu or guru',
      'Last two syllables follow guru-laghu pattern'
    ],
    variations: ['Pathya Anushtubh', 'Vipula Anushtubh']
  },
  {
    id: 'trishtubh',
    name: 'Trishtubh',
    nameDevanagari: 'त्रिष्टुभ्',
    description: 'A majestic meter often used for hymns and praise, common in Vedic literature.',
    pattern: 'x x G x | G x G x | x G x', // 11 syllables per pada
    syllableCount: 44,
    popularity: 8,
    difficulty: 'intermediate',
    examples: [
      'अग्निमीळे पुरोहितं यज्ञस्य देवमृत्विजम्',
      'होतारं रत्नधातमम्'
    ],
    usedIn: ['Rigveda', 'Upanishads', 'Classical Kavya'],
    rules: [
      'Each pada has 11 syllables',
      '4th and 8th syllables have specific patterns',
      'Often ends with guru-laghu'
    ],
    variations: ['Pathya Trishtubh', 'Vipula Trishtubh']
  },
  {
    id: 'jagati',
    name: 'Jagati',
    nameDevanagari: 'जगती',
    description: 'A flowing meter with 12 syllables per pada, used for descriptive and narrative poetry.',
    pattern: 'x x x x | G x G x | x x G x', // 12 syllables per pada
    syllableCount: 48,
    popularity: 6,
    difficulty: 'intermediate',
    examples: [
      'यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः',
      'तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम'
    ],
    usedIn: ['Vedic Hymns', 'Epic Poetry', 'Classical Literature'],
    rules: [
      'Each pada has 12 syllables',
      'Regular caesura after 4th syllable',
      'Flexible rhythm in first half'
    ],
    variations: ['Pathya Jagati', 'Vipula Jagati']
  },
  {
    id: 'gayatri',
    name: 'Gayatri',
    nameDevanagari: 'गायत्री',
    description: 'Sacred meter of the famous Gayatri Mantra, with 8 syllables per pada.',
    pattern: 'x x x x | x x x x', // 8 syllables per pada
    syllableCount: 24,
    popularity: 9,
    difficulty: 'beginner',
    examples: [
      'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यम्',
      'भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्'
    ],
    usedIn: ['Vedic Mantras', 'Daily Prayers', 'Sacred Texts'],
    rules: [
      'Each pada has 8 syllables',
      'Three padas total',
      'Sacred rhythm for meditation'
    ],
    variations: ['Standard Gayatri', 'Extended Gayatri']
  },
  {
    id: 'brihati',
    name: 'Brihati',
    nameDevanagari: 'बृहती',
    description: 'An expansive meter with 8+12 syllable pattern, used for grand descriptions.',
    pattern: 'x x x x | x x x x || x x x x | G x G x | x x G x',
    syllableCount: 36,
    popularity: 5,
    difficulty: 'advanced',
    examples: [
      'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्',
      'आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः'
    ],
    usedIn: ['Classical Kavya', 'Philosophical Texts'],
    rules: [
      'First pada: 8 syllables',
      'Second pada: 12 syllables',
      'Specific caesura patterns'
    ],
    variations: ['Pathya Brihati', 'Vipula Brihati']
  },
  {
    id: 'pankti',
    name: 'Pankti',
    nameDevanagari: 'पङ्क्ति',
    description: 'A meter with 10 syllables per pada, creating a balanced rhythmic flow.',
    pattern: 'x x x x | G x x x | G x', // 10 syllables per pada
    syllableCount: 40,
    popularity: 4,
    difficulty: 'intermediate',
    examples: [
      'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत',
      'अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्'
    ],
    usedIn: ['Vedic Literature', 'Classical Poetry'],
    rules: [
      'Each pada has 10 syllables',
      'Regular caesura after 4th syllable',
      'Ending pattern is fixed'
    ],
    variations: ['Standard Pankti']
  },
  {
    id: 'ushnik',
    name: 'Ushnik',
    nameDevanagari: 'उष्णिक्',
    description: 'A shorter meter with 7 syllables per pada, creating crisp rhythmic patterns.',
    pattern: 'x x x | G x G x', // 7 syllables per pada
    syllableCount: 28,
    popularity: 3,
    difficulty: 'advanced',
    examples: [
      'अग्ने नय सुपथा राये अस्मान्',
      'विश्वानि देव वयुनानि विद्वान्'
    ],
    usedIn: ['Vedic Hymns', 'Ritual Chants'],
    rules: [
      'Each pada has 7 syllables',
      'Fixed pattern in latter half',
      'Used for invocations'
    ],
    variations: ['Standard Ushnik']
  }
];

// Sample Shlokas
export const SAMPLE_SHLOKAS: Shloka[] = [
  {
    id: 'gita-2-47',
    text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    devanagari: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    romanization: "karmaṇy-evādhikāras-te mā phaleṣu kadācana | mā karma-phala-hetur-bhūr-mā te saṅgo 'stv-akarmaṇi ||",
    translation: "You have the right to perform actions, but never to the fruits of action. Let not the fruits of action be your motive, nor let your attachment be to inaction.",
    padas: [
      {
        id: 'pada-1',
        text: 'कर्मण्येवाधिकारस्ते',
        syllables: [],
        pattern: 'LGGLGGGL',
        translation: 'You have the right to action only',
        romanization: 'karmaṇy-evādhikāras-te'
      },
      {
        id: 'pada-2', 
        text: 'मा फलेषु कदाचन',
        syllables: [],
        pattern: 'LGLGGLGL',
        translation: 'never to the fruits',
        romanization: 'mā phaleṣu kadācana'
      },
      {
        id: 'pada-3',
        text: 'मा कर्मफलहेतुर्भूर्',
        syllables: [],
        pattern: 'LGGGLGGGL',
        translation: 'Let not the fruits of action be your motive',
        romanization: 'mā karma-phala-hetur-bhūr'
      },
      {
        id: 'pada-4',
        text: 'मा ते सङ्गोऽस्त्वकर्मणि',
        syllables: [],
        pattern: 'LLGLGGLGL',
        translation: 'nor let your attachment be to inaction',
        romanization: "mā te saṅgo 'stv-akarmaṇi"
      }
    ],
    chandas: CHANDAS_DATABASE[0], // Anushtubh
    source: 'Bhagavad Gita 2.47',
    context: 'Krishna advises Arjuna on the principle of Nishkama Karma (desireless action)',
    difficulty: 'beginner',
    tags: ['karma', 'dharma', 'philosophy', 'action'],
    meaning: {
      literal: 'Right to action, not to fruits; no attachment to results or inaction',
      contextual: 'Fundamental principle of Karma Yoga - performing duty without attachment to results',
      spiritual: 'The essence of selfless service and surrender to divine will'
    }
  },
  {
    id: 'gayatri-mantra',
    text: 'ॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यम् भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥',
    devanagari: 'ॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यम् भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥',
    romanization: 'oṃ bhūr bhuvaḥ svaḥ | tat savitur vareṇyam bhargo devasya dhīmahi | dhiyo yo naḥ pracodayāt ||',
    translation: 'Om! Earth, Sky, Heaven. We meditate on the adorable glory of the radiant sun. May he inspire our intelligence.',
    padas: [
      {
        id: 'pada-1',
        text: 'तत्सवितुर्वरेण्यम्',
        syllables: [],
        pattern: 'GGGLGLGG',
        translation: 'That adorable (glory) of Savitar',
        romanization: 'tat savitur vareṇyam'
      },
      {
        id: 'pada-2',
        text: 'भर्गो देवस्य धीमहि',
        syllables: [],
        pattern: 'GGLGLGGL',
        translation: 'the divine light, we meditate',
        romanization: 'bhargo devasya dhīmahi'
      },
      {
        id: 'pada-3',
        text: 'धियो यो नः प्रचोदयात्',
        syllables: [],
        pattern: 'GLLLGGGL',
        translation: 'may he enlighten our intellect',
        romanization: 'dhiyo yo naḥ pracodayāt'
      }
    ],
    chandas: CHANDAS_DATABASE[3], // Gayatri
    source: 'Rig Veda 3.62.10',
    context: 'The most sacred mantra in Hinduism, chanted during daily prayers',
    difficulty: 'beginner',
    tags: ['mantra', 'prayer', 'sacred', 'vedic'],
    meaning: {
      literal: 'Invocation to the sun god for illumination of mind',
      contextual: 'Universal prayer for spiritual enlightenment and divine guidance',
      spiritual: 'Represents the journey from darkness to light, ignorance to knowledge'
    }
  }
];

// Achievements system
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-analysis',
    name: 'First Steps',
    description: 'Complete your first Chandas analysis',
    icon: '🎯',
    unlockedAt: new Date(),
    rarity: 'common'
  },
  {
    id: 'anushtubh-master',
    name: 'Anushtubh Master',
    description: 'Correctly identify 10 Anushtubh shlokas',
    icon: '📜',
    unlockedAt: new Date(),
    rarity: 'rare'
  },
  {
    id: 'perfect-rhythm',
    name: 'Perfect Rhythm',
    description: 'Complete a karaoke session with 100% timing accuracy',
    icon: '🎵',
    unlockedAt: new Date(),
    rarity: 'epic'
  },
  {
    id: 'composer',
    name: 'Verse Composer',
    description: 'Create your first original verse in any chandas',
    icon: '✍️',
    unlockedAt: new Date(),
    rarity: 'rare'
  },
  {
    id: 'community-contributor',
    name: 'Community Contributor',
    description: 'Contribute 5 verified shlokas to the community database',
    icon: '🤝',
    unlockedAt: new Date(),
    rarity: 'epic'
  },
  {
    id: 'polyglot',
    name: 'Script Master',
    description: 'Practice with texts in 3 different scripts',
    icon: '🌍',
    unlockedAt: new Date(),
    rarity: 'legendary'
  }
];

// Game questions
export const GAME_QUESTIONS: GameQuestion[] = [
  {
    id: 'q1',
    type: 'identify-chandas',
    question: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। - Which chandas is this?',
    options: ['Anushtubh', 'Trishtubh', 'Gayatri', 'Jagati'],
    correctAnswer: 'Anushtubh',
    explanation: 'This famous shloka from Bhagavad Gita follows the Anushtubh meter with 8 syllables per pada.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 'q2',
    type: 'rhythm-match',
    question: 'Which pattern represents the rhythm L-G-G-L?',
    options: ['Short-Long-Long-Short', 'Long-Short-Short-Long', 'Short-Short-Long-Long', 'Long-Long-Short-Short'],
    correctAnswer: 'Short-Long-Long-Short',
    explanation: 'L represents Laghu (short syllable) and G represents Guru (long syllable).',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 'q3',
    type: 'complete-shloka',
    question: 'Complete: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यम्..."',
    options: [
      'भर्गो देवस्य धीमहि',
      'कर्मण्येवाधिकारस्ते',
      'यदा यदा हि धर्मस्य',
      'सर्वधर्मान्परित्यज्य'
    ],
    correctAnswer: 'भर्गो देवस्य धीमहि',
    explanation: 'This is the continuation of the famous Gayatri Mantra.',
    difficulty: 'easy',
    points: 10
  }
];

// Supported scripts
export const SUPPORTED_SCRIPTS: Script[] = [
  {
    id: 'devanagari',
    name: 'Devanagari',
    nativeName: 'देवनागरी',
    code: 'deva',
    isSupported: true
  },
  {
    id: 'iast',
    name: 'IAST',
    nativeName: 'IAST',
    code: 'latn',
    isSupported: true
  },
  {
    id: 'tamil',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    code: 'taml',
    isSupported: true
  },
  {
    id: 'telugu',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    code: 'telu',
    isSupported: true
  },
  {
    id: 'kannada',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    code: 'knda',
    isSupported: true
  },
  {
    id: 'bengali',
    name: 'Bengali',
    nativeName: 'বাংলা',
    code: 'beng',
    isSupported: true
  }
];

// Sample analysis result
export const SAMPLE_ANALYSIS: AnalysisResult = {
  id: 'analysis-1',
  inputText: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
  detectedChandas: CHANDAS_DATABASE[0],
  confidence: 0.95,
  syllableBreakdown: [
    { id: 's1', text: 'कर्', type: 'guru', duration: 600, position: 1 },
    { id: 's2', text: 'मण्ये', type: 'guru', duration: 600, position: 2 },
    { id: 's3', text: 'वा', type: 'laghu', duration: 300, position: 3 },
    { id: 's4', text: 'धि', type: 'laghu', duration: 300, position: 4 },
    { id: 's5', text: 'का', type: 'guru', duration: 600, position: 5 },
    { id: 's6', text: 'रस्', type: 'guru', duration: 600, position: 6 },
    { id: 's7', text: 'ते', type: 'laghu', duration: 300, position: 7 }
  ],
  suggestions: [
    'This shloka follows perfect Anushtubh meter',
    'Consider the natural pause after "ते" for proper recitation'
  ],
  corrections: [],
  timestamp: new Date()
};

// Daily Sanskrit quotes
export const DAILY_QUOTES = [
  {
    sanskrit: 'सत्यमेव जयते',
    transliteration: 'satyameva jayate',
    meaning: 'Truth alone triumphs',
    source: 'Mundaka Upanishad'
  },
  {
    sanskrit: 'वसुधैव कुटुम्बकम्',
    transliteration: 'vasudhaiva kutumbakam',
    meaning: 'The world is one family',
    source: 'Maha Upanishad'
  },
  {
    sanskrit: 'अहिंसा परमो धर्मः',
    transliteration: 'ahimsa paramo dharmaḥ',
    meaning: 'Non-violence is the highest virtue',
    source: 'Mahabharata'
  }
];

// Traditional greetings based on time
export const SANSKRIT_GREETINGS = {
  morning: {
    sanskrit: 'सुप्रभातम्',
    transliteration: 'suprabhātam',
    meaning: 'Good morning'
  },
  afternoon: {
    sanskrit: 'शुभ दिन',
    transliteration: 'śubha dina',
    meaning: 'Good day'
  },
  evening: {
    sanskrit: 'शुभ सायंकाल',
    transliteration: 'śubha sāyaṅkāla',
    meaning: 'Good evening'
  },
  night: {
    sanskrit: 'शुभ रात्रि',
    transliteration: 'śubha rātri',
    meaning: 'Good night'
  }
};