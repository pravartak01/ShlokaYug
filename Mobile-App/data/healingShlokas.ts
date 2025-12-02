// Healing Shlokas Data - Organized by Mood/Category
// Audio files are stored in ShlokaAudios folder

export interface HealingShloka {
  id: string;
  name: string;
  nameHindi: string;
  shloka: string;
  meaning: string;
  source: string;
  benefit: string;
  audioFile: string;
  duration?: string;
}

export interface MoodCategory {
  id: string;
  name: string;
  nameHindi: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  shlokas: HealingShloka[];
}

export const moodCategories: MoodCategory[] = [
  {
    id: 'emotional-strength',
    name: 'Emotional Strength',
    nameHindi: 'भावनात्मक शक्ति',
    icon: 'shield-checkmark',
    color: '#ef4444',
    bgColor: '#fef2f2',
    description: 'Build inner resilience and overcome low mood',
    shlokas: [
      {
        id: 'mahamrityunjaya',
        name: 'Mahamrityunjaya Mantra',
        nameHindi: 'महामृत्युंजय मंत्र',
        shloka: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ।\nउर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात् ॥',
        meaning: 'We pray for inner strength and emotional protection. May fear and suffering be replaced with peace and stability.',
        source: 'Rigveda 7.59.12',
        benefit: 'Emotional resilience & grounding',
        audioFile: '../../ShlokaAudios/mahamrityunjay_mantra.mp3',
        duration: '5:30',
      },
      {
        id: 'hanuman',
        name: 'Hanuman Mantra',
        nameHindi: 'हनुमान मंत्र',
        shloka: 'ॐ नमो भगवते हनुमते नमः',
        meaning: 'We invoke courage and confidence within us. May it remove fear and mental weakness.',
        source: 'Hanuman Tantra',
        benefit: 'Overcoming fear & low mood',
        audioFile: 'hanuman chalisa.mp3',
        duration: '12:00',
      },
      {
        id: 'shanti-mantra',
        name: 'Shanti Mantra',
        nameHindi: 'शांति मंत्र',
        shloka: 'ॐ सर्वे भवन्तु सुखिनः\nसर्वे सन्तु निरामयाः |\nसर्वे भद्रान्नि पश्यन्तु\nमाँ कश्चिद्-दुःख-भाग-भवेत् |\nॐ शांतिः शांतिः शांतिः ||',
        meaning: 'May everyone be happy and peaceful. May the world be free from suffering and stress.',
        source: 'Traditional Hindu Prayer',
        benefit: 'Emotional calming',
        audioFile: 'shanti mantra.mp3',
        duration: '4:15',
      },
    ],
  },
  {
    id: 'health-wellbeing',
    name: 'Health & Well-being',
    nameHindi: 'स्वास्थ्य और कल्याण',
    icon: 'fitness',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    description: 'Holistic support for body and mind wellness',
    shlokas: [
      {
        id: 'dhanvantari',
        name: 'Dhanvantari Mantra',
        nameHindi: 'धन्वंतरि मंत्र',
        shloka: 'ओम नमो भगवते महासुदर्शनाय वासुदेवाय धन्वंतराये:\nअमृतकलश हस्ताय सर्व भयविनाशाय सर्व रोग निवारणाय\nत्रिलोकपथाय त्रिलोकनाथाय श्री महाविष्णुस्वरूप\nश्री धन्वंतरि स्वरूप श्री श्री श्री औषधचक्र नारायणाय नम:',
        meaning: 'We pray for wellness and good health of the body and mind. May positivity and vitality fill our lives.',
        source: 'Dhanvantari Tantra / Vishnu Purana',
        benefit: 'Positive health awareness',
        audioFile: 'dhanvantri mantra.mp3',
        duration: '6:00',
      },
      {
        id: 'gayatri',
        name: 'Gayatri Mantra',
        nameHindi: 'गायत्री मंत्र',
        shloka: 'ॐ भूर्भुवः स्वः\nतत्सवितुर्वरेण्यं\nभर्गो देवस्य धीमहि।\nधियो यो नः प्रचोदयात्॥',
        meaning: 'We meditate on the divine light of God. May it guide our intellect and thoughts.',
        source: 'Rigveda 3.62.10',
        benefit: 'Mind and body harmony',
        audioFile: 'gayaytri mantra.mp3',
        duration: '5:45',
      },
      {
        id: 'annapurna',
        name: 'Annapurna Shloka',
        nameHindi: 'अन्नपूर्णा श्लोक',
        shloka: 'ॐ अन्नपूर्णे सदापूर्णे शङ्करप्राणवल्लभे ।\nज्ञानवैराग्यसिद्ध्यर्थं भिक्षां देहि च पार्वति॥',
        meaning: 'We pray for nourishment and inner satisfaction. May we never feel empty in body, mind, or heart.',
        source: 'Annapurna Stotra (Adi Shankaracharya)',
        benefit: 'Emotional nourishment',
        audioFile: 'Annapurna shloka.mp3',
        duration: '3:30',
      },
      {
        id: 'om-chanting',
        name: 'Om Chanting',
        nameHindi: 'ॐ जाप',
        shloka: 'ॐ',
        meaning: 'We focus on the sound of universal balance. May our mind become calm and still.',
        source: 'Mandukya Upanishad',
        benefit: 'Breath & nervous system calming',
        audioFile: 'Aum mantra.mp3',
        duration: '10:00',
      },
    ],
  },
  {
    id: 'relaxation',
    name: 'Relaxation & Peace',
    nameHindi: 'विश्राम और शांति',
    icon: 'leaf',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    description: 'Deep relaxation and mental peace',
    shlokas: [
      {
        id: 'vishnu-shanti',
        name: 'Vishnu Shanti Mantra',
        nameHindi: 'विष्णु शांति मंत्र',
        shloka: 'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं\nविश्वाधारं गगनसदृशं मेघवर्ण शुभाङ्गम् ।\nलक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यम्\nवन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥',
        meaning: 'We meditate on peaceful consciousness. May calmness and protection surround us.',
        source: 'Vishnu Sahasranama – Dhyana Shloka',
        benefit: 'Deep relaxation mode',
        audioFile: 'vishnu shanti mantra.mp3',
        duration: '4:30',
      },
      {
        id: 'asato-ma',
        name: 'Asato Ma Sadgamaya',
        nameHindi: 'असतो मा सद्गमय',
        shloka: 'ॐ असतो मा सद्गमय ।\nतमसो मा ज्योतिर्गमय ।\nमृत्योर्मा अमृतं गमय ।\nॐ शान्तिः शान्तिः शान्तिः ॥',
        meaning: 'Lead us from darkness to peace and clarity. Free our mind from fear and confusion.',
        source: 'Brihadaranyaka Upanishad 1.3.28',
        benefit: 'Mental soothing',
        audioFile: 'astoma.mp3',
        duration: '5:00',
      },
      {
        id: 'vishnu-mantra',
        name: 'Vishnu Mantra',
        nameHindi: 'विष्णु मंत्र',
        shloka: 'ॐ नमो भगवते वासुदेवाय',
        meaning: 'We surrender to the supreme consciousness for peace and protection.',
        source: 'Vishnu Purana',
        benefit: 'Inner peace & protection',
        audioFile: 'vishnu mantra.mp3',
        duration: '4:00',
      },
    ],
  },
  {
    id: 'study-focus',
    name: 'Study & Focus',
    nameHindi: 'अध्ययन और एकाग्रता',
    icon: 'school',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    description: 'Enhance concentration and mental clarity',
    shlokas: [
      {
        id: 'saraswati',
        name: 'Saraswati Mantra',
        nameHindi: 'सरस्वती मंत्र',
        shloka: 'या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता\nया वीणावरदण्डमण्डितकरा या श्वेतपद्मासना।\nया ब्रह्माच्युत शंकरप्रभृतिभिर्देवैः सदा वन्दिता\nसा मां पातु सरस्वती भगवती निःशेषजाड्यापहा ॥',
        meaning: 'We seek wisdom and peaceful intelligence. May learning and understanding grow within us.',
        source: 'Saraswati Stotra',
        benefit: 'Focus enhancement',
        audioFile: 'Saraswati vandana.mp3',
        duration: '4:45',
      },
      {
        id: 'ganesha',
        name: 'Ganesha Mantra',
        nameHindi: 'गणेश मंत्र',
        shloka: 'ॐ गं गणपतये नमः',
        meaning: 'May obstacles in thinking and learning disappear. May clarity and focus flow easily.',
        source: 'Ganapati Atharvashirsha Upanishad',
        benefit: 'Study flow & clarity',
        audioFile: 'ganesh mantra.mp3',
        duration: '3:30',
      },
      {
        id: 'vakratunda',
        name: 'Vakratunda Mahakaya',
        nameHindi: 'वक्रतुण्ड महाकाय',
        shloka: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥',
        meaning: 'O Lord with curved trunk, may all my tasks be completed without obstacles.',
        source: 'Ganesha Stotra',
        benefit: 'Remove mental blocks',
        audioFile: 'vakratunda.mp3',
        duration: '2:30',
      },
      {
        id: 'medha-suktam',
        name: 'Medha Suktam',
        nameHindi: 'मेधा सूक्तम्',
        shloka: 'ॐ यन्नो देवी सरस्वती\nवाजेभिर्वाजिनीवती ।\nधीनामवित्र्यवतु ॥',
        meaning: 'We pray for memory and understanding. May our mind become strong and sharp.',
        source: 'Rigveda, Medha Sukta',
        benefit: 'Memory & learning support',
        audioFile: 'medha suktam.mp3',
        duration: '6:00',
      },
    ],
  },
  {
    id: 'anger-control',
    name: 'Anger Control',
    nameHindi: 'क्रोध नियंत्रण',
    icon: 'water',
    color: '#f97316',
    bgColor: '#fff7ed',
    description: 'Calm inner storms and find emotional balance',
    shlokas: [
      {
        id: 'shiva-shanti',
        name: 'Shiv Shanti Mantra',
        nameHindi: 'शिव शांति मंत्र',
        shloka: 'ॐ नमः शिवाय',
        meaning: 'We calm our inner storms of anger and stress. May we become peaceful and balanced.',
        source: 'Yajurveda (Shatarudriya)',
        benefit: 'Anger reduction',
        audioFile: 'om namah shivaya.mp3',
        duration: '5:00',
      },
      {
        id: 'narasimha',
        name: 'Narasimha Shanta Patha',
        nameHindi: 'नरसिंह शांत पाठ',
        shloka: 'उग्रं वीरं महाविष्णुम् ज्वलन्तं सर्वतो मुखम् ।\nनृसिंहं भीषणं भद्रं मृत्युमृत्युं नमाम्यहम् ॥',
        meaning: 'May fear leave our heart. May strength and confidence rise within us.',
        source: 'Narasimha Tapaniya Upanishad',
        benefit: 'Emotional regulation',
        audioFile: 'Narsimha Shanti path.mp3',
        duration: '4:00',
      },
    ],
  },
  {
    id: 'sleep-night',
    name: 'Sleep & Night Calm',
    nameHindi: 'नींद और रात्रि शांति',
    icon: 'moon',
    color: '#6366f1',
    bgColor: '#eef2ff',
    description: 'Prepare for restful sleep and peaceful dreams',
    shlokas: [
      {
        id: 'vishnu-shloka',
        name: 'Vishnu Shloka',
        nameHindi: 'विष्णु श्लोक',
        shloka: 'कायेन वाचा मनसेन्द्रियैर्वा\nबुद्ध्यात्मना वा प्रकृतिस्वभावात्।\nकरोमि यद्यत्सकलं परस्मै\nनारायणायेति समर्पयामि॥',
        meaning: 'We release attachment and worry. May peace remain in our heart.',
        source: 'Vishnu Stotra',
        benefit: 'Sleep preparation',
        audioFile: 'vishnu shloka.mp3',
        duration: '3:30',
      },
      {
        id: 'nirvana-shatakam',
        name: 'Nirvana Shatakam',
        nameHindi: 'निर्वाण षटकम्',
        shloka: 'मनो बुद्ध्यहंकार चित्तानि नाहं\nन च श्रोत्र जिह्वे न च घ्राण नेत्रे ।\nन च व्योम भूमिर्न तेजो न वायुः\nचिदानन्द रूपः शिवोऽहम् शिवोऽहम् ॥',
        meaning: 'We release attachment and worry. May peace remain in our heart.',
        source: 'Nirvana Shatakam (Adi Shankaracharya)',
        benefit: 'Night peace meditation',
        audioFile: 'nirvana shaktam.mp3',
        duration: '8:00',
      },
    ],
  },
  {
    id: 'universal-wellness',
    name: 'Universal Wellness',
    nameHindi: 'सार्वभौमिक कल्याण',
    icon: 'globe',
    color: '#14b8a6',
    bgColor: '#f0fdfa',
    description: 'Spread positivity and universal harmony',
    shlokas: [
      {
        id: 'loka-samasta',
        name: 'Loka Samasta',
        nameHindi: 'लोकाः समस्ताः',
        shloka: 'लोकाः समस्ताः सुखिनो भवन्तु।\nसर्वे जनाः सुखिनो भवन्तु॥',
        meaning: 'May all beings live in happiness. May harmony fill the world.',
        source: 'Yoga Tradition Prayer',
        benefit: 'Emotional positivity',
        audioFile: 'loka samastha.mp3',
        duration: '3:00',
      },
      {
        id: 'karache-charan',
        name: 'Karache Charan',
        nameHindi: 'करचरण',
        shloka: 'करचरणकृतं वाक्कायजं कर्मजं वा\nश्रवणनयनजं वा मानसं वापराधम्।\nविहितमविहितं वा सर्वमेतत्क्षमस्व\nजय जय करुणाब्धे श्रीमहादेव शम्भो॥',
        meaning: 'We release guilt and emotional burdens. May forgiveness bring peace.',
        source: 'Shiva Aparadha Kshamapana Stotram (Adi Shankaracharya)',
        benefit: 'Emotional detox',
        audioFile: 'karache charan.mp3',
        duration: '4:30',
      },
      {
        id: 'om-namo-narayanaya',
        name: 'Om Namo Narayanaya',
        nameHindi: 'ॐ नमो नारायणाय',
        shloka: 'ॐ नमो नारायणाय',
        meaning: 'We surrender to the supreme for inner peace and devotion.',
        source: 'Narayanopanishad / Bhagavata Purana',
        benefit: 'Peace practice',
        audioFile: 'om namo narayanay.mp3',
        duration: '5:00',
      },
      {
        id: 'durga-mantra',
        name: 'Durga Mantra',
        nameHindi: 'दुर्गा मंत्र',
        shloka: 'ॐ दुं दुर्गायै नमः',
        meaning: 'We invoke divine feminine energy for protection and strength.',
        source: 'Durga Saptashati',
        benefit: 'Divine protection',
        audioFile: 'durga mantra.mp3',
        duration: '4:00',
      },
      {
        id: 'ya-devi',
        name: 'Ya Devi Sarvabhuteshu',
        nameHindi: 'या देवी सर्वभूतेषु',
        shloka: 'या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता।\nनमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः॥',
        meaning: 'We bow to the divine goddess present in all beings as energy.',
        source: 'Durga Saptashati',
        benefit: 'Inner strength & devotion',
        audioFile: 'Ya devi.mp3',
        duration: '5:30',
      },
      {
        id: 'mahalaxmi',
        name: 'Mahalaxmi Mantra',
        nameHindi: 'महालक्ष्मी मंत्र',
        shloka: 'ॐ श्रीं महालक्ष्म्यै नमः',
        meaning: 'We invoke abundance, prosperity and inner wealth.',
        source: 'Lakshmi Tantra',
        benefit: 'Abundance & prosperity',
        audioFile: 'Mahalaxmi .mp3',
        duration: '4:00',
      },
      {
        id: 'guru-brahma',
        name: 'Guru Brahma',
        nameHindi: 'गुरु ब्रह्मा',
        shloka: 'गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।\nगुरुः साक्षात् परं ब्रह्म तस्मै श्री गुरवे नमः॥',
        meaning: 'We honor the teacher who guides us to wisdom and truth.',
        source: 'Guru Gita',
        benefit: 'Gratitude & humility',
        audioFile: 'Guru bramha.mp3',
        duration: '3:00',
      },
      {
        id: 'hare-krishna',
        name: 'Hare Krishna Mahamantra',
        nameHindi: 'हरे कृष्ण महामंत्र',
        shloka: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे।\nहरे राम हरे राम राम राम हरे हरे॥',
        meaning: 'We chant the divine names for joy and spiritual upliftment.',
        source: 'Kali-Santarana Upanishad',
        benefit: 'Joy & devotion',
        audioFile: 'hare krishna.mp3',
        duration: '10:00',
      },
    ],
  },
];

// Get all shlokas as a flat array
export const getAllShlokas = (): HealingShloka[] => {
  return moodCategories.flatMap(category => category.shlokas);
};

// Get shlokas by category
export const getShlokasByCategory = (categoryId: string): HealingShloka[] => {
  const category = moodCategories.find(c => c.id === categoryId);
  return category?.shlokas || [];
};

// Get a random shloka
export const getRandomShloka = (): HealingShloka => {
  const allShlokas = getAllShlokas();
  return allShlokas[Math.floor(Math.random() * allShlokas.length)];
};

// Get category by ID
export const getCategoryById = (categoryId: string): MoodCategory | undefined => {
  return moodCategories.find(c => c.id === categoryId);
};
