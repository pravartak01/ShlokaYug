// Shloka Data for Karaoke Practice - Web Version
// All audio files should be placed in ShlokaAudios folder

export interface ShlokaWord {
  id: string;
  text: string;
  transliteration: string;
  startTime: number; // in milliseconds
  endTime: number;
}

export interface ShlokaLine {
  id: string;
  text: string;
  transliteration: string;
  translation: string;
  startTime: number;
  endTime: number;
  words: ShlokaWord[];
}

export interface ShlokaData {
  id: string;
  title: string;
  subtitle: string;
  source: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // in seconds
  audioFile: string | null;
  thumbnailColor: string;
  description: string;
  meaning: string;
  lines: ShlokaLine[];
  tags: string[];
  practiceCount: number;
  rating: number;
}

// Audio Base URL
const AUDIO_BASE_URL = 'https://raw.githubusercontent.com/pravartak01/ShlokaYug/main/ShlokaAudios/';

// Map shloka IDs to audio file names
export const SHLOKA_AUDIO_MAP: Record<string, string> = {
  'gayatri-mantra': 'gayaytri mantra.mp3',
  'mahamrityunjaya-mantra': 'mahamrityunjay_mantra.mp3',
  'shanti-mantra': 'shanti mantra.mp3',
  'vakratunda-shloka': 'vakratunda.mp3',
  'asato-ma-mantra': 'astoma.mp3',
  'saraswati-vandana': 'Saraswati vandana.mp3',
  'om-namah-shivaya': 'om namah shivaya.mp3',
  'guru-brahma': 'Guru bramha.mp3',
  'hare-krishna-mantra': 'hare krishna.mp3',
  'hanuman-chalisa-opening': 'hanuman chalisa.mp3',
  'lakshmi-mantra': 'Mahalaxmi .mp3',
  'durga-mantra': 'durga mantra.mp3',
  'vishnu-mantra': 'vishnu mantra.mp3',
  'ya-devi-mantra': 'Ya devi.mp3',
  'surya-mantra': 'gayaytri mantra.mp3',
  'aum-mantra': 'Aum mantra.mp3',
};

// Get audio URL for a shloka
export const getAudioUrl = (shlokaId: string): string | null => {
  const fileName = SHLOKA_AUDIO_MAP[shlokaId];
  if (!fileName) return null;
  return AUDIO_BASE_URL + encodeURIComponent(fileName);
};

// Check if audio is available for a shloka
export const hasAudio = (shlokaId: string): boolean => {
  return shlokaId in SHLOKA_AUDIO_MAP;
};

// Gayatri Mantra
export const GAYATRI_MANTRA: ShlokaData = {
  id: "gayatri-mantra",
  title: "Gayatri Mantra",
  subtitle: "गायत्री मंत्र",
  source: "Rigveda 3.62.10",
  category: "Vedic Mantras",
  difficulty: "beginner",
  duration: 45,
  audioFile: null,
  thumbnailColor: "#FF6B35",
  description: "The Gayatri Mantra is a highly revered mantra from the Vedas, dedicated to Savitr, the Sun deity.",
  meaning: "We meditate on the glory of the Creator who has created the Universe, who is worthy of worship, who is the embodiment of Knowledge and Light, who is the remover of all ignorance. May He enlighten our intellect.",
  lines: [
    {
      id: "line-1",
      text: "ॐ भूर्भुवः स्वः",
      transliteration: "Om Bhur Bhuvah Svah",
      translation: "Om, Earth, Atmosphere, Heaven",
      startTime: 0,
      endTime: 5850,
      words: [
        { id: "w1", text: "ॐ", transliteration: "Om", startTime: 0, endTime: 585 },
        { id: "w2", text: "भूर्", transliteration: "Bhur", startTime: 585, endTime: 1150 },
        { id: "w3", text: "भुवः", transliteration: "Bhuvah", startTime: 1150, endTime: 2900 },
        { id: "w4", text: "स्वः", transliteration: "Svah", startTime: 2900, endTime: 5850 }
      ]
    },
    {
      id: "line-2",
      text: "तत्सवितुर्वरेण्यं",
      transliteration: "Tat Savitur Varenyam",
      translation: "That Creator, most adorable",
      startTime: 5850,
      endTime: 10330,
      words: [
        { id: "w5", text: "तत्", transliteration: "Tat", startTime: 5850, endTime: 6800 },
        { id: "w6", text: "सवितुर्", transliteration: "Savitur", startTime: 6800, endTime: 8200 },
        { id: "w7", text: "वरेण्यं", transliteration: "Varenyam", startTime: 8200, endTime: 10330 }
      ]
    },
    {
      id: "line-3",
      text: "भर्गो देवस्य धीमहि",
      transliteration: "Bhargo Devasya Dhimahi",
      translation: "The divine light, we meditate upon",
      startTime: 10330,
      endTime: 15500,
      words: [
        { id: "w8", text: "भर्गो", transliteration: "Bhargo", startTime: 10330, endTime: 11500 },
        { id: "w9", text: "देवस्य", transliteration: "Devasya", startTime: 11500, endTime: 13200 },
        { id: "w10", text: "धीमहि", transliteration: "Dhimahi", startTime: 13200, endTime: 15500 }
      ]
    },
    {
      id: "line-4",
      text: "धियो यो नः प्रचोदयात्",
      transliteration: "Dhiyo Yo Nah Prachodayat",
      translation: "May He inspire our intellect",
      startTime: 15500,
      endTime: 20700,
      words: [
        { id: "w11", text: "धियो", transliteration: "Dhiyo", startTime: 15500, endTime: 16600 },
        { id: "w12", text: "यो", transliteration: "Yo", startTime: 16600, endTime: 17300 },
        { id: "w13", text: "नः", transliteration: "Nah", startTime: 17300, endTime: 18000 },
        { id: "w14", text: "प्रचोदयात्", transliteration: "Prachodayat", startTime: 18000, endTime: 20700 }
      ]
    }
  ],
  tags: ["Vedic", "Meditation", "Sun", "Wisdom"],
  practiceCount: 15420,
  rating: 4.9
};

// Mahamrityunjaya Mantra
export const MAHAMRITYUNJAYA_MANTRA: ShlokaData = {
  id: 'mahamrityunjaya-mantra',
  title: 'Mahamrityunjaya Mantra',
  subtitle: 'महामृत्युंजय मंत्र',
  source: 'Rigveda 7.59.12',
  category: 'Vedic Mantras',
  difficulty: 'intermediate',
  duration: 50,
  audioFile: null,
  thumbnailColor: '#6B5CE7',
  description: 'The Mahamrityunjaya Mantra is a verse of the Rigveda addressed to Tryambaka "the three-eyed one", an epithet of Rudra.',
  meaning: 'We worship the three-eyed One who is fragrant and who nourishes all beings. May He liberate us from death for the sake of immortality, just as the cucumber is severed from its bondage to the vine.',
  lines: [
    {
      id: 'line-1',
      text: 'ॐ त्र्यम्बकं यजामहे',
      transliteration: 'Om Tryambakam Yajamahe',
      translation: 'Om, We worship the three-eyed One',
      startTime: 0,
      endTime: 10000,
      words: [
        { id: 'w1', text: 'ॐ', transliteration: 'Om', startTime: 0, endTime: 2500 },
        { id: 'w2', text: 'त्र्यम्बकं', transliteration: 'Tryambakam', startTime: 2500, endTime: 6000 },
        { id: 'w3', text: 'यजामहे', transliteration: 'Yajamahe', startTime: 6000, endTime: 10000 },
      ],
    },
    {
      id: 'line-2',
      text: 'सुगन्धिं पुष्टिवर्धनम्',
      transliteration: 'Sugandhim Pushtivardhanam',
      translation: 'Who is fragrant and nourishes all',
      startTime: 10000,
      endTime: 18000,
      words: [
        { id: 'w4', text: 'सुगन्धिं', transliteration: 'Sugandhim', startTime: 10000, endTime: 14000 },
        { id: 'w5', text: 'पुष्टिवर्धनम्', transliteration: 'Pushtivardhanam', startTime: 14000, endTime: 18000 },
      ],
    },
    {
      id: 'line-3',
      text: 'उर्वारुकमिव बन्धनात्',
      transliteration: 'Urvarukamiva Bandhanat',
      translation: 'Like a cucumber from its bondage',
      startTime: 18000,
      endTime: 26000,
      words: [
        { id: 'w6', text: 'उर्वारुकमिव', transliteration: 'Urvarukamiva', startTime: 18000, endTime: 22000 },
        { id: 'w7', text: 'बन्धनात्', transliteration: 'Bandhanat', startTime: 22000, endTime: 26000 },
      ],
    },
    {
      id: 'line-4',
      text: 'मृत्योर्मुक्षीय मामृतात्',
      transliteration: 'Mrityor Mukshiya Maamritat',
      translation: 'Liberate us from death for immortality',
      startTime: 26000,
      endTime: 34000,
      words: [
        { id: 'w8', text: 'मृत्योर्', transliteration: 'Mrityor', startTime: 26000, endTime: 28500 },
        { id: 'w9', text: 'मुक्षीय', transliteration: 'Mukshiya', startTime: 28500, endTime: 31000 },
        { id: 'w10', text: 'मामृतात्', transliteration: 'Maamritat', startTime: 31000, endTime: 34000 },
      ],
    },
  ],
  tags: ['Vedic', 'Healing', 'Protection', 'Shiva'],
  practiceCount: 12350,
  rating: 4.8,
};

// Shanti Mantra
export const SHANTI_MANTRA: ShlokaData = {
  id: 'shanti-mantra',
  title: 'Shanti Mantra',
  subtitle: 'शान्ति मंत्र',
  source: 'Brihadaranyaka Upanishad',
  category: 'Upanishadic',
  difficulty: 'beginner',
  duration: 35,
  audioFile: null,
  thumbnailColor: '#00BFA5',
  description: 'The Shanti Mantra is a prayer for peace recited at the beginning and end of religious rituals and discourses.',
  meaning: 'Om, May all be happy. May all be free from illness. May all see what is auspicious. May no one suffer. Om Peace, Peace, Peace.',
  lines: [
    {
      id: 'line-1',
      text: 'ॐ सर्वे भवन्तु सुखिनः',
      transliteration: 'Om Sarve Bhavantu Sukhinah',
      translation: 'Om, May all be happy',
      startTime: 0,
      endTime: 8000,
      words: [
        { id: 'w1', text: 'ॐ', transliteration: 'Om', startTime: 0, endTime: 2000 },
        { id: 'w2', text: 'सर्वे', transliteration: 'Sarve', startTime: 2000, endTime: 4000 },
        { id: 'w3', text: 'भवन्तु', transliteration: 'Bhavantu', startTime: 4000, endTime: 6000 },
        { id: 'w4', text: 'सुखिनः', transliteration: 'Sukhinah', startTime: 6000, endTime: 8000 },
      ],
    },
    {
      id: 'line-2',
      text: 'सर्वे सन्तु निरामयाः',
      transliteration: 'Sarve Santu Niramayah',
      translation: 'May all be free from illness',
      startTime: 8000,
      endTime: 14000,
      words: [
        { id: 'w5', text: 'सर्वे', transliteration: 'Sarve', startTime: 8000, endTime: 9500 },
        { id: 'w6', text: 'सन्तु', transliteration: 'Santu', startTime: 9500, endTime: 11000 },
        { id: 'w7', text: 'निरामयाः', transliteration: 'Niramayah', startTime: 11000, endTime: 14000 },
      ],
    },
    {
      id: 'line-3',
      text: 'सर्वे भद्राणि पश्यन्तु',
      transliteration: 'Sarve Bhadrani Pashyantu',
      translation: 'May all see what is auspicious',
      startTime: 14000,
      endTime: 20000,
      words: [
        { id: 'w8', text: 'सर्वे', transliteration: 'Sarve', startTime: 14000, endTime: 15500 },
        { id: 'w9', text: 'भद्राणि', transliteration: 'Bhadrani', startTime: 15500, endTime: 17500 },
        { id: 'w10', text: 'पश्यन्तु', transliteration: 'Pashyantu', startTime: 17500, endTime: 20000 },
      ],
    },
    {
      id: 'line-4',
      text: 'मा कश्चिद्दुःखभाग्भवेत्',
      transliteration: 'Ma Kashchid Duhkha Bhag Bhavet',
      translation: 'May no one suffer',
      startTime: 20000,
      endTime: 26000,
      words: [
        { id: 'w11', text: 'मा', transliteration: 'Ma', startTime: 20000, endTime: 21000 },
        { id: 'w12', text: 'कश्चिद्', transliteration: 'Kashchid', startTime: 21000, endTime: 23000 },
        { id: 'w13', text: 'दुःखभाग्भवेत्', transliteration: 'Duhkha Bhag Bhavet', startTime: 23000, endTime: 26000 },
      ],
    },
    {
      id: 'line-5',
      text: 'ॐ शान्तिः शान्तिः शान्तिः',
      transliteration: 'Om Shantih Shantih Shantih',
      translation: 'Om Peace, Peace, Peace',
      startTime: 26000,
      endTime: 35000,
      words: [
        { id: 'w14', text: 'ॐ', transliteration: 'Om', startTime: 26000, endTime: 28000 },
        { id: 'w15', text: 'शान्तिः', transliteration: 'Shantih', startTime: 28000, endTime: 30000 },
        { id: 'w16', text: 'शान्तिः', transliteration: 'Shantih', startTime: 30000, endTime: 32500 },
        { id: 'w17', text: 'शान्तिः', transliteration: 'Shantih', startTime: 32500, endTime: 35000 },
      ],
    },
  ],
  tags: ['Peace', 'Upanishadic', 'Blessing', 'Universal'],
  practiceCount: 9870,
  rating: 4.7,
};

// Vakratunda Mahakaya - Ganesh Shloka
export const VAKRATUNDA_SHLOKA: ShlokaData = {
  id: 'vakratunda-shloka',
  title: 'Vakratunda Mahakaya',
  subtitle: 'वक्रतुण्ड महाकाय',
  source: 'Mudgala Purana',
  category: 'Devotional',
  difficulty: 'beginner',
  duration: 30,
  audioFile: null,
  thumbnailColor: '#FF9800',
  description: 'A popular shloka dedicated to Lord Ganesha, often recited before starting any new venture or worship.',
  meaning: 'O Lord with curved trunk, large body, whose brilliance equals that of a crore suns, please make all my work free of obstacles, always.',
  lines: [
    {
      id: 'line-1',
      text: 'वक्रतुण्ड महाकाय',
      transliteration: 'Vakratunda Mahakaya',
      translation: 'O curved trunk, large bodied one',
      startTime: 0,
      endTime: 7000,
      words: [
        { id: 'w1', text: 'वक्रतुण्ड', transliteration: 'Vakratunda', startTime: 0, endTime: 3500 },
        { id: 'w2', text: 'महाकाय', transliteration: 'Mahakaya', startTime: 3500, endTime: 7000 },
      ],
    },
    {
      id: 'line-2',
      text: 'सूर्यकोटि समप्रभ',
      transliteration: 'Suryakoti Samaprabha',
      translation: 'With brilliance of a crore suns',
      startTime: 7000,
      endTime: 14000,
      words: [
        { id: 'w3', text: 'सूर्यकोटि', transliteration: 'Suryakoti', startTime: 7000, endTime: 10500 },
        { id: 'w4', text: 'समप्रभ', transliteration: 'Samaprabha', startTime: 10500, endTime: 14000 },
      ],
    },
    {
      id: 'line-3',
      text: 'निर्विघ्नं कुरु मे देव',
      transliteration: 'Nirvighnam Kuru Me Deva',
      translation: 'Make my work obstacle-free, O Lord',
      startTime: 14000,
      endTime: 22000,
      words: [
        { id: 'w5', text: 'निर्विघ्नं', transliteration: 'Nirvighnam', startTime: 14000, endTime: 17000 },
        { id: 'w6', text: 'कुरु', transliteration: 'Kuru', startTime: 17000, endTime: 19000 },
        { id: 'w7', text: 'मे', transliteration: 'Me', startTime: 19000, endTime: 20000 },
        { id: 'w8', text: 'देव', transliteration: 'Deva', startTime: 20000, endTime: 22000 },
      ],
    },
    {
      id: 'line-4',
      text: 'सर्वकार्येषु सर्वदा',
      transliteration: 'Sarva Karyeshu Sarvada',
      translation: 'In all tasks, always',
      startTime: 22000,
      endTime: 30000,
      words: [
        { id: 'w9', text: 'सर्वकार्येषु', transliteration: 'Sarva Karyeshu', startTime: 22000, endTime: 26000 },
        { id: 'w10', text: 'सर्वदा', transliteration: 'Sarvada', startTime: 26000, endTime: 30000 },
      ],
    },
  ],
  tags: ['Ganesha', 'Devotional', 'Auspicious', 'Beginning'],
  practiceCount: 18540,
  rating: 4.9,
};

// Om Namah Shivaya
export const OM_NAMAH_SHIVAYA: ShlokaData = {
  id: 'om-namah-shivaya',
  title: 'Om Namah Shivaya',
  subtitle: 'ॐ नमः शिवाय',
  source: 'Shri Rudram (Yajurveda)',
  category: 'Devotional',
  difficulty: 'beginner',
  duration: 25,
  audioFile: null,
  thumbnailColor: '#607D8B',
  description: 'The Panchakshari Mantra, one of the most powerful mantras dedicated to Lord Shiva.',
  meaning: 'I bow to Lord Shiva, the auspicious one, the supreme consciousness.',
  lines: [
    {
      id: 'line-1',
      text: 'ॐ नमः शिवाय',
      transliteration: 'Om Namah Shivaya',
      translation: 'I bow to Lord Shiva',
      startTime: 0,
      endTime: 8000,
      words: [
        { id: 'w1', text: 'ॐ', transliteration: 'Om', startTime: 0, endTime: 2500 },
        { id: 'w2', text: 'नमः', transliteration: 'Namah', startTime: 2500, endTime: 5000 },
        { id: 'w3', text: 'शिवाय', transliteration: 'Shivaya', startTime: 5000, endTime: 8000 },
      ],
    },
    {
      id: 'line-2',
      text: 'शिवाय नमः ॐ',
      transliteration: 'Shivaya Namah Om',
      translation: 'To Shiva I bow, Om',
      startTime: 8000,
      endTime: 16000,
      words: [
        { id: 'w4', text: 'शिवाय', transliteration: 'Shivaya', startTime: 8000, endTime: 11000 },
        { id: 'w5', text: 'नमः', transliteration: 'Namah', startTime: 11000, endTime: 13500 },
        { id: 'w6', text: 'ॐ', transliteration: 'Om', startTime: 13500, endTime: 16000 },
      ],
    },
    {
      id: 'line-3',
      text: 'हर हर महादेव',
      transliteration: 'Hara Hara Mahadeva',
      translation: 'Hail the Great God',
      startTime: 16000,
      endTime: 25000,
      words: [
        { id: 'w7', text: 'हर', transliteration: 'Hara', startTime: 16000, endTime: 18500 },
        { id: 'w8', text: 'हर', transliteration: 'Hara', startTime: 18500, endTime: 21000 },
        { id: 'w9', text: 'महादेव', transliteration: 'Mahadeva', startTime: 21000, endTime: 25000 },
      ],
    },
  ],
  tags: ['Shiva', 'Devotional', 'Panchakshari', 'Meditation'],
  practiceCount: 22150,
  rating: 4.9,
};

// Hare Krishna Mahamantra
export const HARE_KRISHNA_MANTRA: ShlokaData = {
  id: 'hare-krishna-mantra',
  title: 'Hare Krishna Mahamantra',
  subtitle: 'हरे कृष्ण महामंत्र',
  source: 'Kali-Santarana Upanishad',
  category: 'Devotional',
  difficulty: 'beginner',
  duration: 40,
  audioFile: null,
  thumbnailColor: '#E91E63',
  description: 'The Hare Krishna Mahamantra is a 16-word Vaishnava mantra for achieving the highest state of consciousness.',
  meaning: 'O Lord Krishna, O Energy of the Lord, please engage me in Your devotional service.',
  lines: [
    {
      id: 'line-1',
      text: 'हरे कृष्ण हरे कृष्ण',
      transliteration: 'Hare Krishna Hare Krishna',
      translation: 'O Lord Krishna, O Lord Krishna',
      startTime: 0,
      endTime: 10000,
      words: [
        { id: 'w1', text: 'हरे', transliteration: 'Hare', startTime: 0, endTime: 2500 },
        { id: 'w2', text: 'कृष्ण', transliteration: 'Krishna', startTime: 2500, endTime: 5000 },
        { id: 'w3', text: 'हरे', transliteration: 'Hare', startTime: 5000, endTime: 7500 },
        { id: 'w4', text: 'कृष्ण', transliteration: 'Krishna', startTime: 7500, endTime: 10000 },
      ],
    },
    {
      id: 'line-2',
      text: 'कृष्ण कृष्ण हरे हरे',
      transliteration: 'Krishna Krishna Hare Hare',
      translation: 'Krishna Krishna, O Energy of Lord',
      startTime: 10000,
      endTime: 20000,
      words: [
        { id: 'w5', text: 'कृष्ण', transliteration: 'Krishna', startTime: 10000, endTime: 12500 },
        { id: 'w6', text: 'कृष्ण', transliteration: 'Krishna', startTime: 12500, endTime: 15000 },
        { id: 'w7', text: 'हरे', transliteration: 'Hare', startTime: 15000, endTime: 17500 },
        { id: 'w8', text: 'हरे', transliteration: 'Hare', startTime: 17500, endTime: 20000 },
      ],
    },
    {
      id: 'line-3',
      text: 'हरे राम हरे राम',
      transliteration: 'Hare Rama Hare Rama',
      translation: 'O Lord Rama, O Lord Rama',
      startTime: 20000,
      endTime: 30000,
      words: [
        { id: 'w9', text: 'हरे', transliteration: 'Hare', startTime: 20000, endTime: 22500 },
        { id: 'w10', text: 'राम', transliteration: 'Rama', startTime: 22500, endTime: 25000 },
        { id: 'w11', text: 'हरे', transliteration: 'Hare', startTime: 25000, endTime: 27500 },
        { id: 'w12', text: 'राम', transliteration: 'Rama', startTime: 27500, endTime: 30000 },
      ],
    },
    {
      id: 'line-4',
      text: 'राम राम हरे हरे',
      transliteration: 'Rama Rama Hare Hare',
      translation: 'Rama Rama, O Energy of Lord',
      startTime: 30000,
      endTime: 40000,
      words: [
        { id: 'w13', text: 'राम', transliteration: 'Rama', startTime: 30000, endTime: 32500 },
        { id: 'w14', text: 'राम', transliteration: 'Rama', startTime: 32500, endTime: 35000 },
        { id: 'w15', text: 'हरे', transliteration: 'Hare', startTime: 35000, endTime: 37500 },
        { id: 'w16', text: 'हरे', transliteration: 'Hare', startTime: 37500, endTime: 40000 },
      ],
    },
  ],
  tags: ['Krishna', 'Rama', 'Vaishnava', 'Bhakti'],
  practiceCount: 25680,
  rating: 4.9,
};

// All Shlokas Collection
export const ALL_SHLOKAS: ShlokaData[] = [
  GAYATRI_MANTRA,
  MAHAMRITYUNJAYA_MANTRA,
  SHANTI_MANTRA,
  VAKRATUNDA_SHLOKA,
  OM_NAMAH_SHIVAYA,
  HARE_KRISHNA_MANTRA,
];

// Categories
export const SHLOKA_CATEGORIES = [
  { id: 'all', name: 'All', icon: '📚', count: ALL_SHLOKAS.length },
  { id: 'vedic', name: 'Vedic Mantras', icon: '🕉️', count: 2 },
  { id: 'upanishadic', name: 'Upanishadic', icon: '💡', count: 1 },
  { id: 'devotional', name: 'Devotional', icon: '🙏', count: 3 },
];

// Difficulty Filters
export const DIFFICULTY_LEVELS = [
  { id: 'all', name: 'All Levels', color: '#888' },
  { id: 'beginner', name: 'Beginner', color: '#4CAF50' },
  { id: 'intermediate', name: 'Intermediate', color: '#FF9800' },
  { id: 'advanced', name: 'Advanced', color: '#F44336' },
  { id: 'expert', name: 'Expert', color: '#9C27B0' },
];

// Get shlokas by category
export const getShlokasByCategory = (category: string): ShlokaData[] => {
  if (category === 'all') return ALL_SHLOKAS;
  return ALL_SHLOKAS.filter(
    (shloka) => shloka.category.toLowerCase().includes(category.toLowerCase())
  );
};

// Search shlokas
export const searchShlokas = (query: string): ShlokaData[] => {
  const lowerQuery = query.toLowerCase();
  return ALL_SHLOKAS.filter(
    (shloka) =>
      shloka.title.toLowerCase().includes(lowerQuery) ||
      shloka.subtitle.includes(query) ||
      shloka.source.toLowerCase().includes(lowerQuery) ||
      shloka.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};

// Featured Shlokas
export const FEATURED_SHLOKAS = [
  GAYATRI_MANTRA,
  MAHAMRITYUNJAYA_MANTRA,
  VAKRATUNDA_SHLOKA,
];
