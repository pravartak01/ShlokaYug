// Shloka Data for Karaoke Practice
// All audio files should be placed in assets/audio/shlokas/ folder

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
  audioFile: any; // require() for local audio
  thumbnailColor: string;
  description: string;
  meaning: string;
  lines: ShlokaLine[];
  tags: string[];
  practiceCount: number;
  rating: number;
}

// Gayatri Mantra - Most popular Vedic mantra
export const GAYATRI_MANTRA: ShlokaData = {
  
  "id": "gayatri-mantra",
  "title": "Gayatri Mantra",
  "subtitle": "गायत्री मंत्र",
  "source": "Rigveda 3.62.10",
  "category": "Vedic Mantras",
  "difficulty": "beginner",
  "duration": 45,
  "audioFile": null,
  "thumbnailColor": "#FF6B35",
  "description": "The Gayatri Mantra is a highly revered mantra from the Vedas, dedicated to Savitr, the Sun deity.",
  "meaning": "We meditate on the glory of the Creator who has created the Universe, who is worthy of worship, who is the embodiment of Knowledge and Light, who is the remover of all ignorance. May He enlighten our intellect.",
  "lines": [
    {
      "id": "line-1",
      "text": "ॐ भूर्भुवः स्वः",
      "transliteration": "Om Bhur Bhuvah Svah",
      "translation": "Om, Earth, Atmosphere, Heaven",
      "startTime": 0,
      "endTime": 5850,
      "words": [
        { "id": "w1", "text": "ॐ", "transliteration": "Om", "startTime": 0, "endTime": 585 },
        { "id": "w2", "text": "भूर्", "transliteration": "Bhur", "startTime": 585, "endTime": 1150 },
        { "id": "w3", "text": "भुवः", "transliteration": "Bhuvah", "startTime": 1150, "endTime": 2900 },
        { "id": "w4", "text": "स्वः", "transliteration": "Svah", "startTime": 2900, "endTime": 5850 }
      ]
    },
    {
      "id": "line-2",
      "text": "तत्सवितुर्वरेण्यं",
      "transliteration": "Tat Savitur Varenyam",
      "translation": "That Creator, most adorable",
      "startTime": 5850,
      "endTime": 10330,
      "words": [
        { "id": "w5", "text": "तत्", "transliteration": "Tat", "startTime": 5850, "endTime": 6800 },
        { "id": "w6", "text": "सवितुर्", "transliteration": "Savitur", "startTime": 6800, "endTime": 8200 },
        { "id": "w7", "text": "वरेण्यं", "transliteration": "Varenyam", "startTime": 8200, "endTime": 10330 }
      ]
    },
    {
      "id": "line-3",
      "text": "भर्गो देवस्य धीमहि",
      "transliteration": "Bhargo Devasya Dhimahi",
      "translation": "The divine light, we meditate upon",
      "startTime": 10330,
      "endTime": 15500,
      "words": [
        { "id": "w8", "text": "भर्गो", "transliteration": "Bhargo", "startTime": 10330, "endTime": 11500 },
        { "id": "w9", "text": "देवस्य", "transliteration": "Devasya", "startTime": 11500, "endTime": 13200 },
        { "id": "w10", "text": "धीमहि", "transliteration": "Dhimahi", "startTime": 13200, "endTime": 15500 }
      ]
    },
    {
      "id": "line-4",
      "text": "धियो यो नः प्रचोदयात्",
      "transliteration": "Dhiyo Yo Nah Prachodayat",
      "translation": "May He inspire our intellect",
      "startTime": 15500,
      "endTime": 20700,
      "words": [
        { "id": "w11", "text": "धियो", "transliteration": "Dhiyo", "startTime": 15500, "endTime": 16600 },
        { "id": "w12", "text": "यो", "transliteration": "Yo", "startTime": 16600, "endTime": 17300 },
        { "id": "w13", "text": "नः", "transliteration": "Nah", "startTime": 17300, "endTime": 18000 },
        { "id": "w14", "text": "प्रचोदयात्", "transliteration": "Prachodayat", "startTime": 18000, "endTime": 20700 }
      ]
    }
  ],
  "tags": ["Vedic", "Meditation", "Sun", "Wisdom"],
  "practiceCount": 15420,
  "rating": 4.9


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
  // audioFile: require('../../assets/audio/shlokas/mahamrityunjaya-mantra.mp3'),
  audioFile: null, // TODO: Add audio file
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
  // audioFile: require('../../assets/audio/shlokas/shanti-mantra.mp3'),
  audioFile: null, // TODO: Add audio file
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
  // audioFile: require('../../assets/audio/shlokas/vakratunda-shloka.mp3'),
  audioFile: null, // TODO: Add audio file
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

// Asato Ma Sadgamaya
export const ASATO_MA_MANTRA: ShlokaData = {
  id: 'asato-ma-mantra',
  title: 'Asato Ma Sadgamaya',
  subtitle: 'असतो मा सद्गमय',
  source: 'Brihadaranyaka Upanishad 1.3.28',
  category: 'Upanishadic',
  difficulty: 'beginner',
  duration: 40,
  // audioFile: require('../../assets/audio/shlokas/asato-ma-mantra.mp3'),
  audioFile: null, // TODO: Add audio file
  thumbnailColor: '#9C27B0',
  description: 'This ancient prayer from the Upanishads asks for guidance from untruth to truth, from darkness to light, and from death to immortality.',
  meaning: 'Lead me from the unreal to the real, from darkness to light, from death to immortality. Om Peace, Peace, Peace.',
  lines: [
    {
      id: 'line-1',
      text: 'ॐ असतो मा सद्गमय',
      transliteration: 'Om Asato Ma Sadgamaya',
      translation: 'Om, Lead me from unreal to real',
      startTime: 0,
      endTime: 10000,
      words: [
        { id: 'w1', text: 'ॐ', transliteration: 'Om', startTime: 0, endTime: 2000 },
        { id: 'w2', text: 'असतो', transliteration: 'Asato', startTime: 2000, endTime: 4500 },
        { id: 'w3', text: 'मा', transliteration: 'Ma', startTime: 4500, endTime: 6000 },
        { id: 'w4', text: 'सद्गमय', transliteration: 'Sadgamaya', startTime: 6000, endTime: 10000 },
      ],
    },
    {
      id: 'line-2',
      text: 'तमसो मा ज्योतिर्गमय',
      transliteration: 'Tamaso Ma Jyotirgamaya',
      translation: 'Lead me from darkness to light',
      startTime: 10000,
      endTime: 20000,
      words: [
        { id: 'w5', text: 'तमसो', transliteration: 'Tamaso', startTime: 10000, endTime: 13000 },
        { id: 'w6', text: 'मा', transliteration: 'Ma', startTime: 13000, endTime: 14500 },
        { id: 'w7', text: 'ज्योतिर्गमय', transliteration: 'Jyotirgamaya', startTime: 14500, endTime: 20000 },
      ],
    },
    {
      id: 'line-3',
      text: 'मृत्योर्मा अमृतं गमय',
      transliteration: 'Mrityorma Amritam Gamaya',
      translation: 'Lead me from death to immortality',
      startTime: 20000,
      endTime: 30000,
      words: [
        { id: 'w8', text: 'मृत्योर्मा', transliteration: 'Mrityorma', startTime: 20000, endTime: 24000 },
        { id: 'w9', text: 'अमृतं', transliteration: 'Amritam', startTime: 24000, endTime: 27000 },
        { id: 'w10', text: 'गमय', transliteration: 'Gamaya', startTime: 27000, endTime: 30000 },
      ],
    },
    {
      id: 'line-4',
      text: 'ॐ शान्तिः शान्तिः शान्तिः',
      transliteration: 'Om Shantih Shantih Shantih',
      translation: 'Om Peace, Peace, Peace',
      startTime: 30000,
      endTime: 40000,
      words: [
        { id: 'w11', text: 'ॐ', transliteration: 'Om', startTime: 30000, endTime: 32000 },
        { id: 'w12', text: 'शान्तिः', transliteration: 'Shantih', startTime: 32000, endTime: 35000 },
        { id: 'w13', text: 'शान्तिः', transliteration: 'Shantih', startTime: 35000, endTime: 37500 },
        { id: 'w14', text: 'शान्तिः', transliteration: 'Shantih', startTime: 37500, endTime: 40000 },
      ],
    },
  ],
  tags: ['Upanishadic', 'Truth', 'Light', 'Immortality'],
  practiceCount: 11230,
  rating: 4.8,
};

// Saraswati Vandana
export const SARASWATI_VANDANA: ShlokaData = {
  id: 'saraswati-vandana',
  title: 'Saraswati Vandana',
  subtitle: 'सरस्वती वंदना',
  source: 'Traditional',
  category: 'Devotional',
  difficulty: 'intermediate',
  duration: 35,
  // audioFile: require('../../assets/audio/shlokas/saraswati-vandana.mp3'),
  audioFile: null, // TODO: Add audio file
  thumbnailColor: '#2196F3',
  description: 'A prayer to Goddess Saraswati, the deity of knowledge, music, and arts.',
  meaning: 'O Goddess Saraswati, who is fair as the jasmine moon, who is adorned with pure white garments, whose hands are adorned with the divine veena, who is seated on a white lotus, who is always worshipped by Brahma, Vishnu, Shiva and other Gods, protect me. O Goddess, remove my mental dullness.',
  lines: [
    {
      id: 'line-1',
      text: 'या कुन्देन्दुतुषारहारधवला',
      transliteration: 'Ya Kundendu Tushara Hara Dhavala',
      translation: 'She who is white as jasmine and moon',
      startTime: 0,
      endTime: 8000,
      words: [
        { id: 'w1', text: 'या', transliteration: 'Ya', startTime: 0, endTime: 1500 },
        { id: 'w2', text: 'कुन्देन्दु', transliteration: 'Kundendu', startTime: 1500, endTime: 4000 },
        { id: 'w3', text: 'तुषारहारधवला', transliteration: 'Tushara Hara Dhavala', startTime: 4000, endTime: 8000 },
      ],
    },
    {
      id: 'line-2',
      text: 'या शुभ्रवस्त्रावृता',
      transliteration: 'Ya Shubhra Vastra Avrita',
      translation: 'Who is dressed in pure white',
      startTime: 8000,
      endTime: 14000,
      words: [
        { id: 'w4', text: 'या', transliteration: 'Ya', startTime: 8000, endTime: 9000 },
        { id: 'w5', text: 'शुभ्रवस्त्रावृता', transliteration: 'Shubhra Vastra Avrita', startTime: 9000, endTime: 14000 },
      ],
    },
    {
      id: 'line-3',
      text: 'या वीणावरदण्डमण्डितकरा',
      transliteration: 'Ya Veena Vara Danda Mandita Kara',
      translation: 'Whose hands hold the divine veena',
      startTime: 14000,
      endTime: 22000,
      words: [
        { id: 'w6', text: 'या', transliteration: 'Ya', startTime: 14000, endTime: 15000 },
        { id: 'w7', text: 'वीणावरदण्ड', transliteration: 'Veena Vara Danda', startTime: 15000, endTime: 18500 },
        { id: 'w8', text: 'मण्डितकरा', transliteration: 'Mandita Kara', startTime: 18500, endTime: 22000 },
      ],
    },
    {
      id: 'line-4',
      text: 'या श्वेतपद्मासना',
      transliteration: 'Ya Shveta Padma Asana',
      translation: 'Who is seated on white lotus',
      startTime: 22000,
      endTime: 28000,
      words: [
        { id: 'w9', text: 'या', transliteration: 'Ya', startTime: 22000, endTime: 23000 },
        { id: 'w10', text: 'श्वेतपद्मासना', transliteration: 'Shveta Padma Asana', startTime: 23000, endTime: 28000 },
      ],
    },
    {
      id: 'line-5',
      text: 'सा मां पातु सरस्वती',
      transliteration: 'Sa Mam Patu Saraswati',
      translation: 'May Saraswati protect me',
      startTime: 28000,
      endTime: 35000,
      words: [
        { id: 'w11', text: 'सा', transliteration: 'Sa', startTime: 28000, endTime: 29500 },
        { id: 'w12', text: 'मां', transliteration: 'Mam', startTime: 29500, endTime: 31000 },
        { id: 'w13', text: 'पातु', transliteration: 'Patu', startTime: 31000, endTime: 32500 },
        { id: 'w14', text: 'सरस्वती', transliteration: 'Saraswati', startTime: 32500, endTime: 35000 },
      ],
    },
  ],
  tags: ['Saraswati', 'Knowledge', 'Arts', 'Devotional'],
  practiceCount: 8920,
  rating: 4.7,
};

// 7. Om Namah Shivaya - Panchakshari Mantra
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

// 8. Guru Brahma - Guru Shloka
export const GURU_BRAHMA: ShlokaData = {
  id: 'guru-brahma',
  title: 'Guru Brahma',
  subtitle: 'गुरु ब्रह्मा गुरु विष्णु',
  source: 'Guru Gita',
  category: 'Devotional',
  difficulty: 'beginner',
  duration: 35,
  audioFile: null,
  thumbnailColor: '#795548',
  description: 'A shloka in praise of the Guru, equating the teacher with the holy trinity.',
  meaning: 'Guru is Brahma, Guru is Vishnu, Guru is Shiva. Guru is the Supreme Brahman. Salutations to that Guru.',
  lines: [
    {
      id: 'line-1',
      text: 'गुरुर्ब्रह्मा गुरुर्विष्णुः',
      transliteration: 'Gurur Brahma Gurur Vishnu',
      translation: 'Guru is Brahma, Guru is Vishnu',
      startTime: 0,
      endTime: 9000,
      words: [
        { id: 'w1', text: 'गुरुर्ब्रह्मा', transliteration: 'Gurur Brahma', startTime: 0, endTime: 4500 },
        { id: 'w2', text: 'गुरुर्विष्णुः', transliteration: 'Gurur Vishnu', startTime: 4500, endTime: 9000 },
      ],
    },
    {
      id: 'line-2',
      text: 'गुरुर्देवो महेश्वरः',
      transliteration: 'Gurur Devo Maheshwarah',
      translation: 'Guru is the God Maheshwara (Shiva)',
      startTime: 9000,
      endTime: 18000,
      words: [
        { id: 'w3', text: 'गुरुर्देवो', transliteration: 'Gurur Devo', startTime: 9000, endTime: 13500 },
        { id: 'w4', text: 'महेश्वरः', transliteration: 'Maheshwarah', startTime: 13500, endTime: 18000 },
      ],
    },
    {
      id: 'line-3',
      text: 'गुरुः साक्षात् परं ब्रह्म',
      transliteration: 'Guruh Sakshat Param Brahma',
      translation: 'Guru is the Supreme Brahman itself',
      startTime: 18000,
      endTime: 27000,
      words: [
        { id: 'w5', text: 'गुरुः', transliteration: 'Guruh', startTime: 18000, endTime: 20500 },
        { id: 'w6', text: 'साक्षात्', transliteration: 'Sakshat', startTime: 20500, endTime: 23000 },
        { id: 'w7', text: 'परं', transliteration: 'Param', startTime: 23000, endTime: 25000 },
        { id: 'w8', text: 'ब्रह्म', transliteration: 'Brahma', startTime: 25000, endTime: 27000 },
      ],
    },
    {
      id: 'line-4',
      text: 'तस्मै श्री गुरवे नमः',
      transliteration: 'Tasmai Shri Gurave Namah',
      translation: 'Salutations to that Guru',
      startTime: 27000,
      endTime: 35000,
      words: [
        { id: 'w9', text: 'तस्मै', transliteration: 'Tasmai', startTime: 27000, endTime: 29000 },
        { id: 'w10', text: 'श्री', transliteration: 'Shri', startTime: 29000, endTime: 30500 },
        { id: 'w11', text: 'गुरवे', transliteration: 'Gurave', startTime: 30500, endTime: 32500 },
        { id: 'w12', text: 'नमः', transliteration: 'Namah', startTime: 32500, endTime: 35000 },
      ],
    },
  ],
  tags: ['Guru', 'Devotional', 'Teacher', 'Reverence'],
  practiceCount: 14320,
  rating: 4.8,
};

// 9. Hare Krishna Mahamantra
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

// 10. Hanuman Chalisa Opening
export const HANUMAN_CHALISA_OPENING: ShlokaData = {
  id: 'hanuman-chalisa-opening',
  title: 'Hanuman Chalisa (Opening)',
  subtitle: 'श्रीगुरु चरन सरोज रज',
  source: 'Hanuman Chalisa - Tulsidas',
  category: 'Devotional',
  difficulty: 'intermediate',
  duration: 45,
  audioFile: null,
  thumbnailColor: '#FF5722',
  description: 'The opening verses of Hanuman Chalisa, a devotional hymn dedicated to Lord Hanuman.',
  meaning: 'With the dust of Guru\'s lotus feet, I clean the mirror of my mind and then narrate the pure fame of Shri Ram, which bestows the four fruits of life.',
  lines: [
    {
      id: 'line-1',
      text: 'श्रीगुरु चरन सरोज रज',
      transliteration: 'Shri Guru Charan Saroj Raj',
      translation: 'With the dust of Guru\'s lotus feet',
      startTime: 0,
      endTime: 8000,
      words: [
        { id: 'w1', text: 'श्रीगुरु', transliteration: 'Shri Guru', startTime: 0, endTime: 2500 },
        { id: 'w2', text: 'चरन', transliteration: 'Charan', startTime: 2500, endTime: 4500 },
        { id: 'w3', text: 'सरोज', transliteration: 'Saroj', startTime: 4500, endTime: 6500 },
        { id: 'w4', text: 'रज', transliteration: 'Raj', startTime: 6500, endTime: 8000 },
      ],
    },
    {
      id: 'line-2',
      text: 'निज मनु मुकुरु सुधारि',
      transliteration: 'Nij Manu Mukuru Sudhari',
      translation: 'I clean the mirror of my mind',
      startTime: 8000,
      endTime: 15000,
      words: [
        { id: 'w5', text: 'निज', transliteration: 'Nij', startTime: 8000, endTime: 9500 },
        { id: 'w6', text: 'मनु', transliteration: 'Manu', startTime: 9500, endTime: 11000 },
        { id: 'w7', text: 'मुकुरु', transliteration: 'Mukuru', startTime: 11000, endTime: 13000 },
        { id: 'w8', text: 'सुधारि', transliteration: 'Sudhari', startTime: 13000, endTime: 15000 },
      ],
    },
    {
      id: 'line-3',
      text: 'बरनउँ रघुबर बिमल जसु',
      transliteration: 'Baranau Raghubar Bimal Jasu',
      translation: 'I describe the pure glory of Shri Ram',
      startTime: 15000,
      endTime: 23000,
      words: [
        { id: 'w9', text: 'बरनउँ', transliteration: 'Baranau', startTime: 15000, endTime: 17500 },
        { id: 'w10', text: 'रघुबर', transliteration: 'Raghubar', startTime: 17500, endTime: 20000 },
        { id: 'w11', text: 'बिमल', transliteration: 'Bimal', startTime: 20000, endTime: 21500 },
        { id: 'w12', text: 'जसु', transliteration: 'Jasu', startTime: 21500, endTime: 23000 },
      ],
    },
    {
      id: 'line-4',
      text: 'जो दायकु फल चारि',
      transliteration: 'Jo Dayaku Phal Chari',
      translation: 'Which bestows the four fruits of life',
      startTime: 23000,
      endTime: 30000,
      words: [
        { id: 'w13', text: 'जो', transliteration: 'Jo', startTime: 23000, endTime: 24500 },
        { id: 'w14', text: 'दायकु', transliteration: 'Dayaku', startTime: 24500, endTime: 26500 },
        { id: 'w15', text: 'फल', transliteration: 'Phal', startTime: 26500, endTime: 28000 },
        { id: 'w16', text: 'चारि', transliteration: 'Chari', startTime: 28000, endTime: 30000 },
      ],
    },
    {
      id: 'line-5',
      text: 'जय हनुमान ज्ञान गुन सागर',
      transliteration: 'Jai Hanuman Gyan Gun Sagar',
      translation: 'Victory to Hanuman, ocean of wisdom and virtues',
      startTime: 30000,
      endTime: 38000,
      words: [
        { id: 'w17', text: 'जय', transliteration: 'Jai', startTime: 30000, endTime: 31500 },
        { id: 'w18', text: 'हनुमान', transliteration: 'Hanuman', startTime: 31500, endTime: 34000 },
        { id: 'w19', text: 'ज्ञान', transliteration: 'Gyan', startTime: 34000, endTime: 35500 },
        { id: 'w20', text: 'गुन', transliteration: 'Gun', startTime: 35500, endTime: 36500 },
        { id: 'w21', text: 'सागर', transliteration: 'Sagar', startTime: 36500, endTime: 38000 },
      ],
    },
    {
      id: 'line-6',
      text: 'जय कपीस तिहुँ लोक उजागर',
      transliteration: 'Jai Kapees Tihu Lok Ujagar',
      translation: 'Victory to the Monkey Lord, illuminator of three worlds',
      startTime: 38000,
      endTime: 45000,
      words: [
        { id: 'w22', text: 'जय', transliteration: 'Jai', startTime: 38000, endTime: 39000 },
        { id: 'w23', text: 'कपीस', transliteration: 'Kapees', startTime: 39000, endTime: 41000 },
        { id: 'w24', text: 'तिहुँ', transliteration: 'Tihu', startTime: 41000, endTime: 42000 },
        { id: 'w25', text: 'लोक', transliteration: 'Lok', startTime: 42000, endTime: 43500 },
        { id: 'w26', text: 'उजागर', transliteration: 'Ujagar', startTime: 43500, endTime: 45000 },
      ],
    },
  ],
  tags: ['Hanuman', 'Devotional', 'Tulsidas', 'Strength'],
  practiceCount: 31450,
  rating: 4.9,
};

// 11. Lakshmi Mantra
export const LAKSHMI_MANTRA: ShlokaData = {
  id: 'lakshmi-mantra',
  title: 'Lakshmi Mantra',
  subtitle: 'ॐ श्रीं महालक्ष्म्यै नमः',
  source: 'Lakshmi Tantra',
  category: 'Devotional',
  difficulty: 'beginner',
  duration: 30,
  audioFile: null,
  thumbnailColor: '#FFD700',
  description: 'A powerful mantra dedicated to Goddess Lakshmi for wealth, prosperity, and abundance.',
  meaning: 'Om, I bow to the great Goddess Lakshmi who bestows wealth and prosperity.',
  lines: [
    {
      id: 'line-1',
      text: 'ॐ श्रीं महालक्ष्म्यै नमः',
      transliteration: 'Om Shreem Mahalakshmyai Namah',
      translation: 'Om, I bow to Goddess Mahalakshmi',
      startTime: 0,
      endTime: 10000,
      words: [
        { id: 'w1', text: 'ॐ', transliteration: 'Om', startTime: 0, endTime: 2000 },
        { id: 'w2', text: 'श्रीं', transliteration: 'Shreem', startTime: 2000, endTime: 4000 },
        { id: 'w3', text: 'महालक्ष्म्यै', transliteration: 'Mahalakshmyai', startTime: 4000, endTime: 7500 },
        { id: 'w4', text: 'नमः', transliteration: 'Namah', startTime: 7500, endTime: 10000 },
      ],
    },
    {
      id: 'line-2',
      text: 'ॐ ह्रीं श्रीं लक्ष्मीभ्यो नमः',
      transliteration: 'Om Hreem Shreem Lakshmibhyo Namah',
      translation: 'Om, salutations to all forms of Lakshmi',
      startTime: 10000,
      endTime: 20000,
      words: [
        { id: 'w5', text: 'ॐ', transliteration: 'Om', startTime: 10000, endTime: 11500 },
        { id: 'w6', text: 'ह्रीं', transliteration: 'Hreem', startTime: 11500, endTime: 13500 },
        { id: 'w7', text: 'श्रीं', transliteration: 'Shreem', startTime: 13500, endTime: 15500 },
        { id: 'w8', text: 'लक्ष्मीभ्यो', transliteration: 'Lakshmibhyo', startTime: 15500, endTime: 18000 },
        { id: 'w9', text: 'नमः', transliteration: 'Namah', startTime: 18000, endTime: 20000 },
      ],
    },
    {
      id: 'line-3',
      text: 'महालक्ष्मी च विद्महे',
      transliteration: 'Mahalakshmi Cha Vidmahe',
      translation: 'We know the great Lakshmi',
      startTime: 20000,
      endTime: 30000,
      words: [
        { id: 'w10', text: 'महालक्ष्मी', transliteration: 'Mahalakshmi', startTime: 20000, endTime: 24000 },
        { id: 'w11', text: 'च', transliteration: 'Cha', startTime: 24000, endTime: 25500 },
        { id: 'w12', text: 'विद्महे', transliteration: 'Vidmahe', startTime: 25500, endTime: 30000 },
      ],
    },
  ],
  tags: ['Lakshmi', 'Wealth', 'Prosperity', 'Devotional'],
  practiceCount: 19870,
  rating: 4.8,
};

// 12. Durga Mantra
export const DURGA_MANTRA: ShlokaData = {
  id: 'durga-mantra',
  title: 'Durga Mantra',
  subtitle: 'सर्वमङ्गलमाङ्गल्ये',
  source: 'Durga Saptashati',
  category: 'Devotional',
  difficulty: 'intermediate',
  duration: 40,
  audioFile: null,
  thumbnailColor: '#C62828',
  description: 'A powerful shloka invoking Goddess Durga, the divine mother who destroys evil and protects devotees.',
  meaning: 'O auspicious one, who bestows auspiciousness, O one who fulfills all desires, O one who provides refuge, O three-eyed Goddess Gauri, salutations to you.',
  lines: [
    {
      id: 'line-1',
      text: 'सर्वमङ्गलमाङ्गल्ये',
      transliteration: 'Sarva Mangala Mangalye',
      translation: 'O auspicious one who bestows auspiciousness',
      startTime: 0,
      endTime: 8000,
      words: [
        { id: 'w1', text: 'सर्वमङ्गल', transliteration: 'Sarva Mangala', startTime: 0, endTime: 4000 },
        { id: 'w2', text: 'माङ्गल्ये', transliteration: 'Mangalye', startTime: 4000, endTime: 8000 },
      ],
    },
    {
      id: 'line-2',
      text: 'शिवे सर्वार्थसाधिके',
      transliteration: 'Shive Sarvartha Sadhike',
      translation: 'O Shiva who fulfills all desires',
      startTime: 8000,
      endTime: 16000,
      words: [
        { id: 'w3', text: 'शिवे', transliteration: 'Shive', startTime: 8000, endTime: 10500 },
        { id: 'w4', text: 'सर्वार्थ', transliteration: 'Sarvartha', startTime: 10500, endTime: 13000 },
        { id: 'w5', text: 'साधिके', transliteration: 'Sadhike', startTime: 13000, endTime: 16000 },
      ],
    },
    {
      id: 'line-3',
      text: 'शरण्ये त्र्यम्बके गौरि',
      transliteration: 'Sharanye Tryambake Gauri',
      translation: 'O refuge, three-eyed Gauri',
      startTime: 16000,
      endTime: 26000,
      words: [
        { id: 'w6', text: 'शरण्ये', transliteration: 'Sharanye', startTime: 16000, endTime: 19000 },
        { id: 'w7', text: 'त्र्यम्बके', transliteration: 'Tryambake', startTime: 19000, endTime: 22500 },
        { id: 'w8', text: 'गौरि', transliteration: 'Gauri', startTime: 22500, endTime: 26000 },
      ],
    },
    {
      id: 'line-4',
      text: 'नारायणि नमोऽस्तु ते',
      transliteration: 'Narayani Namostu Te',
      translation: 'O Narayani, salutations to you',
      startTime: 26000,
      endTime: 35000,
      words: [
        { id: 'w9', text: 'नारायणि', transliteration: 'Narayani', startTime: 26000, endTime: 30000 },
        { id: 'w10', text: 'नमोऽस्तु', transliteration: 'Namostu', startTime: 30000, endTime: 33000 },
        { id: 'w11', text: 'ते', transliteration: 'Te', startTime: 33000, endTime: 35000 },
      ],
    },
  ],
  tags: ['Durga', 'Shakti', 'Protection', 'Devotional'],
  practiceCount: 16540,
  rating: 4.8,
};

// 13. Vishnu Mantra
export const VISHNU_MANTRA: ShlokaData = {
  id: 'vishnu-mantra',
  title: 'Vishnu Mantra',
  subtitle: 'शान्ताकारं भुजगशयनं',
  source: 'Vishnu Sahasranama',
  category: 'Devotional',
  difficulty: 'intermediate',
  duration: 45,
  audioFile: null,
  thumbnailColor: '#1565C0',
  description: 'A beautiful dhyana shloka describing Lord Vishnu in his cosmic form.',
  meaning: 'He who has a peaceful form, who rests on a serpent, who has a lotus in his navel, who is the lord of gods, who supports the universe, who is like the sky, who has the color of clouds, who has beautiful limbs.',
  lines: [
    {
      id: 'line-1',
      text: 'शान्ताकारं भुजगशयनं',
      transliteration: 'Shantakaram Bhujagashayanam',
      translation: 'He who has a peaceful form, resting on serpent',
      startTime: 0,
      endTime: 10000,
      words: [
        { id: 'w1', text: 'शान्ताकारं', transliteration: 'Shantakaram', startTime: 0, endTime: 5000 },
        { id: 'w2', text: 'भुजगशयनं', transliteration: 'Bhujagashayanam', startTime: 5000, endTime: 10000 },
      ],
    },
    {
      id: 'line-2',
      text: 'पद्मनाभं सुरेशं',
      transliteration: 'Padmanabham Suresham',
      translation: 'With lotus navel, lord of gods',
      startTime: 10000,
      endTime: 18000,
      words: [
        { id: 'w3', text: 'पद्मनाभं', transliteration: 'Padmanabham', startTime: 10000, endTime: 14000 },
        { id: 'w4', text: 'सुरेशं', transliteration: 'Suresham', startTime: 14000, endTime: 18000 },
      ],
    },
    {
      id: 'line-3',
      text: 'विश्वाधारं गगनसदृशं',
      transliteration: 'Vishvadharam Gaganasadrisham',
      translation: 'Support of universe, like the sky',
      startTime: 18000,
      endTime: 28000,
      words: [
        { id: 'w5', text: 'विश्वाधारं', transliteration: 'Vishvadharam', startTime: 18000, endTime: 23000 },
        { id: 'w6', text: 'गगनसदृशं', transliteration: 'Gaganasadrisham', startTime: 23000, endTime: 28000 },
      ],
    },
    {
      id: 'line-4',
      text: 'मेघवर्णं शुभाङ्गं',
      transliteration: 'Meghavarnam Shubhangam',
      translation: 'Cloud-colored, with beautiful limbs',
      startTime: 28000,
      endTime: 36000,
      words: [
        { id: 'w7', text: 'मेघवर्णं', transliteration: 'Meghavarnam', startTime: 28000, endTime: 32000 },
        { id: 'w8', text: 'शुभाङ्गं', transliteration: 'Shubhangam', startTime: 32000, endTime: 36000 },
      ],
    },
    {
      id: 'line-5',
      text: 'विष्णुं वन्दे सर्वलोकैकनाथं',
      transliteration: 'Vishnum Vande Sarvalokaikanatham',
      translation: 'I worship Vishnu, the one lord of all worlds',
      startTime: 36000,
      endTime: 45000,
      words: [
        { id: 'w9', text: 'विष्णुं', transliteration: 'Vishnum', startTime: 36000, endTime: 38500 },
        { id: 'w10', text: 'वन्दे', transliteration: 'Vande', startTime: 38500, endTime: 40500 },
        { id: 'w11', text: 'सर्वलोकैकनाथं', transliteration: 'Sarvalokaikanatham', startTime: 40500, endTime: 45000 },
      ],
    },
  ],
  tags: ['Vishnu', 'Devotional', 'Dhyana', 'Preserver'],
  practiceCount: 13280,
  rating: 4.7,
};

// 14. Devi Prayer - Ya Devi Sarva Bhuteshu
export const YA_DEVI_MANTRA: ShlokaData = {
  id: 'ya-devi-mantra',
  title: 'Ya Devi Sarva Bhuteshu',
  subtitle: 'या देवी सर्वभूतेषु',
  source: 'Durga Saptashati',
  category: 'Devotional',
  difficulty: 'beginner',
  duration: 35,
  audioFile: null,
  thumbnailColor: '#AD1457',
  description: 'A beautiful hymn from Durga Saptashati, invoking the Goddess who resides in all beings.',
  meaning: 'To that Goddess who resides in all beings in the form of consciousness, salutations to her, salutations to her, salutations to her repeatedly.',
  lines: [
    {
      id: 'line-1',
      text: 'या देवी सर्वभूतेषु',
      transliteration: 'Ya Devi Sarva Bhuteshu',
      translation: 'To that Goddess in all beings',
      startTime: 0,
      endTime: 8000,
      words: [
        { id: 'w1', text: 'या', transliteration: 'Ya', startTime: 0, endTime: 1500 },
        { id: 'w2', text: 'देवी', transliteration: 'Devi', startTime: 1500, endTime: 3500 },
        { id: 'w3', text: 'सर्वभूतेषु', transliteration: 'Sarva Bhuteshu', startTime: 3500, endTime: 8000 },
      ],
    },
    {
      id: 'line-2',
      text: 'चेतनेत्यभिधीयते',
      transliteration: 'Chetanetyabhidhiyate',
      translation: 'Who is called consciousness',
      startTime: 8000,
      endTime: 15000,
      words: [
        { id: 'w4', text: 'चेतनेत्य', transliteration: 'Chetanetya', startTime: 8000, endTime: 11500 },
        { id: 'w5', text: 'अभिधीयते', transliteration: 'Abhidhiyate', startTime: 11500, endTime: 15000 },
      ],
    },
    {
      id: 'line-3',
      text: 'नमस्तस्यै नमस्तस्यै',
      transliteration: 'Namastasyai Namastasyai',
      translation: 'Salutations to her, salutations to her',
      startTime: 15000,
      endTime: 25000,
      words: [
        { id: 'w6', text: 'नमस्तस्यै', transliteration: 'Namastasyai', startTime: 15000, endTime: 20000 },
        { id: 'w7', text: 'नमस्तस्यै', transliteration: 'Namastasyai', startTime: 20000, endTime: 25000 },
      ],
    },
    {
      id: 'line-4',
      text: 'नमस्तस्यै नमो नमः',
      transliteration: 'Namastasyai Namo Namah',
      translation: 'Salutations to her, again and again',
      startTime: 25000,
      endTime: 35000,
      words: [
        { id: 'w8', text: 'नमस्तस्यै', transliteration: 'Namastasyai', startTime: 25000, endTime: 29000 },
        { id: 'w9', text: 'नमो', transliteration: 'Namo', startTime: 29000, endTime: 32000 },
        { id: 'w10', text: 'नमः', transliteration: 'Namah', startTime: 32000, endTime: 35000 },
      ],
    },
  ],
  tags: ['Devi', 'Shakti', 'Consciousness', 'Universal'],
  practiceCount: 17890,
  rating: 4.8,
};

// 15. Surya Mantra
export const SURYA_MANTRA: ShlokaData = {
  id: 'surya-mantra',
  title: 'Surya Namaskar Mantra',
  subtitle: 'ॐ मित्राय नमः',
  source: 'Surya Upasana',
  category: 'Vedic Mantras',
  difficulty: 'intermediate',
  duration: 50,
  audioFile: null,
  thumbnailColor: '#FF8F00',
  description: 'The twelve mantras chanted during Surya Namaskar, each dedicated to a different aspect of the Sun God.',
  meaning: 'Salutations to the friend of all, the radiant one, the cause of activity, the illuminator, the one who moves in the sky, the nourisher.',
  lines: [
    {
      id: 'line-1',
      text: 'ॐ मित्राय नमः',
      transliteration: 'Om Mitraya Namah',
      translation: 'Salutations to the friend of all',
      startTime: 0,
      endTime: 8000,
      words: [
        { id: 'w1', text: 'ॐ', transliteration: 'Om', startTime: 0, endTime: 2000 },
        { id: 'w2', text: 'मित्राय', transliteration: 'Mitraya', startTime: 2000, endTime: 5000 },
        { id: 'w3', text: 'नमः', transliteration: 'Namah', startTime: 5000, endTime: 8000 },
      ],
    },
    {
      id: 'line-2',
      text: 'ॐ रवये नमः',
      transliteration: 'Om Ravaye Namah',
      translation: 'Salutations to the radiant one',
      startTime: 8000,
      endTime: 16000,
      words: [
        { id: 'w4', text: 'ॐ', transliteration: 'Om', startTime: 8000, endTime: 10000 },
        { id: 'w5', text: 'रवये', transliteration: 'Ravaye', startTime: 10000, endTime: 13000 },
        { id: 'w6', text: 'नमः', transliteration: 'Namah', startTime: 13000, endTime: 16000 },
      ],
    },
    {
      id: 'line-3',
      text: 'ॐ सूर्याय नमः',
      transliteration: 'Om Suryaya Namah',
      translation: 'Salutations to the one who induces activity',
      startTime: 16000,
      endTime: 24000,
      words: [
        { id: 'w7', text: 'ॐ', transliteration: 'Om', startTime: 16000, endTime: 18000 },
        { id: 'w8', text: 'सूर्याय', transliteration: 'Suryaya', startTime: 18000, endTime: 21000 },
        { id: 'w9', text: 'नमः', transliteration: 'Namah', startTime: 21000, endTime: 24000 },
      ],
    },
    {
      id: 'line-4',
      text: 'ॐ भानवे नमः',
      transliteration: 'Om Bhanave Namah',
      translation: 'Salutations to the one who illuminates',
      startTime: 24000,
      endTime: 32000,
      words: [
        { id: 'w10', text: 'ॐ', transliteration: 'Om', startTime: 24000, endTime: 26000 },
        { id: 'w11', text: 'भानवे', transliteration: 'Bhanave', startTime: 26000, endTime: 29000 },
        { id: 'w12', text: 'नमः', transliteration: 'Namah', startTime: 29000, endTime: 32000 },
      ],
    },
    {
      id: 'line-5',
      text: 'ॐ खगाय नमः',
      transliteration: 'Om Khagaya Namah',
      translation: 'Salutations to the one who moves in the sky',
      startTime: 32000,
      endTime: 40000,
      words: [
        { id: 'w13', text: 'ॐ', transliteration: 'Om', startTime: 32000, endTime: 34000 },
        { id: 'w14', text: 'खगाय', transliteration: 'Khagaya', startTime: 34000, endTime: 37000 },
        { id: 'w15', text: 'नमः', transliteration: 'Namah', startTime: 37000, endTime: 40000 },
      ],
    },
    {
      id: 'line-6',
      text: 'ॐ पूष्णे नमः',
      transliteration: 'Om Pushne Namah',
      translation: 'Salutations to the nourisher',
      startTime: 40000,
      endTime: 50000,
      words: [
        { id: 'w16', text: 'ॐ', transliteration: 'Om', startTime: 40000, endTime: 42000 },
        { id: 'w17', text: 'पूष्णे', transliteration: 'Pushne', startTime: 42000, endTime: 46000 },
        { id: 'w18', text: 'नमः', transliteration: 'Namah', startTime: 46000, endTime: 50000 },
      ],
    },
  ],
  tags: ['Surya', 'Sun', 'Yoga', 'Health'],
  practiceCount: 21340,
  rating: 4.8,
};

// 16. Aum Mantra - Pranava
export const AUM_MANTRA: ShlokaData = {
  id: 'aum-mantra',
  title: 'Pranava Mantra (Aum)',
  subtitle: 'ॐ',
  source: 'Mandukya Upanishad',
  category: 'Vedic Mantras',
  difficulty: 'beginner',
  duration: 30,
  audioFile: null,
  thumbnailColor: '#311B92',
  description: 'The sacred syllable Aum (Om) is the primordial sound, representing the essence of the ultimate reality.',
  meaning: 'Om is the sound of the universe. It represents creation, preservation, and transformation. It is the past, present, and future unified.',
  lines: [
    {
      id: 'line-1',
      text: 'ॐ',
      transliteration: 'Aum',
      translation: 'The primordial sound',
      startTime: 0,
      endTime: 10000,
      words: [
        { id: 'w1', text: 'ॐ', transliteration: 'Aum', startTime: 0, endTime: 10000 },
      ],
    },
    {
      id: 'line-2',
      text: 'ॐ ॐ ॐ',
      transliteration: 'Aum Aum Aum',
      translation: 'Three-fold Om chanting',
      startTime: 10000,
      endTime: 30000,
      words: [
        { id: 'w2', text: 'ॐ', transliteration: 'Aum', startTime: 10000, endTime: 17000 },
        { id: 'w3', text: 'ॐ', transliteration: 'Aum', startTime: 17000, endTime: 24000 },
        { id: 'w4', text: 'ॐ', transliteration: 'Aum', startTime: 24000, endTime: 30000 },
      ],
    },
  ],
  tags: ['Om', 'Meditation', 'Universal', 'Sacred'],
  practiceCount: 28760,
  rating: 4.9,
};

// All Shlokas Collection
export const ALL_SHLOKAS: ShlokaData[] = [
  GAYATRI_MANTRA,
  MAHAMRITYUNJAYA_MANTRA,
  SHANTI_MANTRA,
  VAKRATUNDA_SHLOKA,
  ASATO_MA_MANTRA,
  SARASWATI_VANDANA,
  OM_NAMAH_SHIVAYA,
  GURU_BRAHMA,
  HARE_KRISHNA_MANTRA,
  HANUMAN_CHALISA_OPENING,
  LAKSHMI_MANTRA,
  DURGA_MANTRA,
  VISHNU_MANTRA,
  YA_DEVI_MANTRA,
  SURYA_MANTRA,
  AUM_MANTRA,
];

// Categories
export const SHLOKA_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'view-grid', count: ALL_SHLOKAS.length },
  { id: 'vedic', name: 'Vedic Mantras', icon: 'book-open-variant', count: 4 },
  { id: 'upanishadic', name: 'Upanishadic', icon: 'lightbulb-on', count: 2 },
  { id: 'devotional', name: 'Devotional', icon: 'hands-pray', count: 10 },
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

// Get shlokas by difficulty
export const getShlokasByDifficulty = (difficulty: string): ShlokaData[] => {
  if (difficulty === 'all') return ALL_SHLOKAS;
  return ALL_SHLOKAS.filter((shloka) => shloka.difficulty === difficulty);
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

// Featured Shlokas (for home carousel)
export const FEATURED_SHLOKAS = [
  GAYATRI_MANTRA,
  MAHAMRITYUNJAYA_MANTRA,
  VAKRATUNDA_SHLOKA,
  HANUMAN_CHALISA_OPENING,
  HARE_KRISHNA_MANTRA,
];

// Recently Added (mock)
export const RECENT_SHLOKAS = [SARASWATI_VANDANA, ASATO_MA_MANTRA];

// Popular Shlokas (sorted by practice count)
export const POPULAR_SHLOKAS = [...ALL_SHLOKAS].sort((a, b) => b.practiceCount - a.practiceCount);
