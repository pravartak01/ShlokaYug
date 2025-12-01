// Time-Based Shlokas Data
// Shlokas organized by time of day for daily chanting practice

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeShloka {
  id: string;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  deity?: string;
  benefits: string;
  duration: string; // Recommended chanting time
}

export interface TimeSlot {
  id: TimeOfDay;
  label: string;
  icon: string;
  timeRange: string;
  color: string;
  gradientColors: [string, string];
  description: string;
  notificationTime: { hour: number; minute: number };
  shlokas: TimeShloka[];
}

export const timeSlots: TimeSlot[] = [
  {
    id: 'morning',
    label: 'Brahma Muhurta',
    icon: '🌅',
    timeRange: '4:00 AM - 6:00 AM',
    color: '#f97316',
    gradientColors: ['#fb923c', '#f97316'],
    description: 'Sacred morning hours for spiritual practice',
    notificationTime: { hour: 5, minute: 0 },
    shlokas: [
      {
        id: 'morning-1',
        sanskrit: 'कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती।\nकरमूले तु गोविन्दः प्रभाते करदर्शनम्॥',
        transliteration: 'Karāgre vasate Lakṣmīḥ karamadhye Sarasvatī\nKaramūle tu Govindaḥ prabhāte karadarśanam',
        meaning: 'At the tip of the fingers resides Lakshmi, in the middle Saraswati, and at the base Govinda. One should look at the palms upon waking.',
        deity: 'Lakshmi, Saraswati, Govinda',
        benefits: 'Brings prosperity, wisdom, and divine blessings to start the day',
        duration: '3 minutes',
      },
      {
        id: 'morning-2',
        sanskrit: 'गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।\nगुरुः साक्षात् परं ब्रह्म तस्मै श्री गुरवे नमः॥',
        transliteration: 'Gurur Brahmā Gurur Viṣṇuḥ Gurur Devo Maheśvaraḥ\nGuruḥ sākṣāt paraṃ Brahma tasmai śrī Gurave namaḥ',
        meaning: 'The Guru is Brahma, Vishnu, and Maheshwara. The Guru is the Supreme Brahman. Salutations to that Guru.',
        deity: 'Guru',
        benefits: 'Invokes blessings of the teacher and divine knowledge',
        duration: '2 minutes',
      },
      {
        id: 'morning-3',
        sanskrit: 'असतो मा सद्गमय। तमसो मा ज्योतिर्गमय।\nमृत्योर्मा अमृतं गमय॥',
        transliteration: 'Asato mā sadgamaya, Tamaso mā jyotirgamaya\nMṛtyormā amṛtaṃ gamaya',
        meaning: 'Lead me from untruth to truth, from darkness to light, from death to immortality.',
        deity: 'Universal',
        benefits: 'Awakens spiritual consciousness and inner light',
        duration: '5 minutes',
      },
      {
        id: 'morning-4',
        sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं।\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
        transliteration: 'Oṃ bhūr bhuvaḥ svaḥ tat savitur vareṇyaṃ\nBhargo devasya dhīmahi dhiyo yo naḥ pracodayāt',
        meaning: 'We meditate on the glory of the Creator who has created the Universe. May He enlighten our minds.',
        deity: 'Savitri (Sun God)',
        benefits: 'Enhances intellect, removes negativity, brings clarity',
        duration: '10 minutes',
      },
    ],
  },
  {
    id: 'afternoon',
    label: 'Madhyahna',
    icon: '☀️',
    timeRange: '12:00 PM - 2:00 PM',
    color: '#eab308',
    gradientColors: ['#fde047', '#eab308'],
    description: 'Midday prayers for energy and focus',
    notificationTime: { hour: 12, minute: 30 },
    shlokas: [
      {
        id: 'afternoon-1',
        sanskrit: 'अन्नपूर्णे सदापूर्णे शङ्करप्राणवल्लभे।\nज्ञानवैराग्यसिद्ध्यर्थं भिक्षां देहि च पार्वति॥',
        transliteration: 'Annapūrṇe sadāpūrṇe Śaṅkaraprāṇavallabhe\nJñānavairāgyasiddhyarthaṃ bhikṣāṃ dehi ca Pārvatī',
        meaning: 'O Annapurna, always full, beloved of Shankara, grant us the alms of knowledge and detachment, O Parvati.',
        deity: 'Annapurna',
        benefits: 'Blesses food with divine energy, promotes gratitude',
        duration: '2 minutes',
      },
      {
        id: 'afternoon-2',
        sanskrit: 'ब्रह्मार्पणं ब्रह्म हविर्ब्रह्माग्नौ ब्रह्मणा हुतम्।\nब्रह्मैव तेन गन्तव्यं ब्रह्मकर्मसमाधिना॥',
        transliteration: 'Brahmārpaṇaṃ Brahma havirbrahmāgnau Brahmaṇā hutam\nBrahmaiva tena gantavyaṃ brahmakarmasamādhinā',
        meaning: 'The offering is Brahman, the oblation is Brahman, offered by Brahman into the fire of Brahman. Brahman is to be attained by one who sees Brahman in all actions.',
        deity: 'Brahman',
        benefits: 'Transforms eating into a sacred act, promotes mindful eating',
        duration: '3 minutes',
      },
      {
        id: 'afternoon-3',
        sanskrit: 'त्वमेव माता च पिता त्वमेव।\nत्वमेव बन्धुश्च सखा त्वमेव।\nत्वमेव विद्या द्रविणं त्वमेव।\nत्वमेव सर्वं मम देव देव॥',
        transliteration: 'Tvameva mātā ca pitā tvameva\nTvameva bandhuśca sakhā tvameva\nTvameva vidyā draviṇaṃ tvameva\nTvameva sarvaṃ mama deva deva',
        meaning: 'You alone are my mother and father. You alone are my relative and friend. You alone are knowledge and wealth. You are everything to me, O Lord.',
        deity: 'Universal',
        benefits: 'Deepens surrender and connection with the divine',
        duration: '5 minutes',
      },
    ],
  },
  {
    id: 'evening',
    label: 'Sandhya',
    icon: '🌆',
    timeRange: '5:00 PM - 7:00 PM',
    color: '#8b5cf6',
    gradientColors: ['#a78bfa', '#8b5cf6'],
    description: 'Twilight prayers for peace and reflection',
    notificationTime: { hour: 18, minute: 0 },
    shlokas: [
      {
        id: 'evening-1',
        sanskrit: 'शुभं करोति कल्याणमारोग्यं धनसम्पदाम्।\nशत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तु ते॥',
        transliteration: 'Śubhaṃ karoti kalyāṇamārogyaṃ dhanasampādām\nŚatrubuddhivināśāya dīpajyotirnamostu te',
        meaning: 'Salutations to the light of the lamp that brings auspiciousness, health, and prosperity, and destroys inimical feelings.',
        deity: 'Agni (Fire)',
        benefits: 'Removes negativity, brings positive energy to the home',
        duration: '2 minutes',
      },
      {
        id: 'evening-2',
        sanskrit: 'ॐ जय जगदीश हरे स्वामी जय जगदीश हरे।\nभक्त जनों के संकट दास जनों के संकट।\nक्षण में दूर करे॥',
        transliteration: 'Oṃ jaya Jagadīśa Hare svāmī jaya Jagadīśa Hare\nBhakta janon ke saṅkaṭa dāsa janon ke saṅkaṭa\nKṣaṇa meṃ dūra kare',
        meaning: 'Victory to the Lord of the Universe. He removes the troubles of devotees and servants in an instant.',
        deity: 'Vishnu',
        benefits: 'Brings peace and removes obstacles',
        duration: '5 minutes',
      },
      {
        id: 'evening-3',
        sanskrit: 'या देवी सर्वभूतेषु शान्तिरूपेण संस्थिता।\nनमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः॥',
        transliteration: 'Yā devī sarvabhūteṣu śāntirūpeṇa saṃsthitā\nNamastasyai namastasyai namastasyai namo namaḥ',
        meaning: 'To that Goddess who resides in all beings as peace, salutations to Her, salutations to Her, salutations to Her.',
        deity: 'Devi',
        benefits: 'Invokes inner peace and divine feminine energy',
        duration: '3 minutes',
      },
    ],
  },
  {
    id: 'night',
    label: 'Ratri',
    icon: '🌙',
    timeRange: '9:00 PM - 11:00 PM',
    color: '#3b82f6',
    gradientColors: ['#60a5fa', '#3b82f6'],
    description: 'Night prayers for restful sleep and protection',
    notificationTime: { hour: 21, minute: 0 },
    shlokas: [
      {
        id: 'night-1',
        sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
        transliteration: 'Karmaṇyevādhikāraste mā phaleṣu kadācana\nMā karmaphalaheturbhūrmā te saṅgostvakarmaṇi',
        meaning: 'You have the right to perform your duty, but never to its fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction.',
        deity: 'Krishna',
        benefits: 'Reflection on the day\'s actions, promotes detachment',
        duration: '5 minutes',
      },
      {
        id: 'night-2',
        sanskrit: 'ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।\nसर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥',
        transliteration: 'Oṃ sarve bhavantu sukhinaḥ sarve santu nirāmayāḥ\nSarve bhadrāṇi paśyantu mā kaścidduḥkhabhāgbhavet',
        meaning: 'May all be happy, may all be free from illness. May all see goodness, may no one suffer.',
        deity: 'Universal',
        benefits: 'Promotes compassion and peaceful sleep',
        duration: '3 minutes',
      },
      {
        id: 'night-3',
        sanskrit: 'ॐ शान्तिः शान्तिः शान्तिः',
        transliteration: 'Oṃ śāntiḥ śāntiḥ śāntiḥ',
        meaning: 'Om Peace, Peace, Peace',
        deity: 'Universal',
        benefits: 'Calms the mind for restful sleep',
        duration: '2 minutes',
      },
      {
        id: 'night-4',
        sanskrit: 'कायेन वाचा मनसेन्द्रियैर्वा बुद्ध्यात्मना वा प्रकृतेः स्वभावात्।\nकरोमि यद्यत्सकलं परस्मै नारायणायेति समर्पयामि॥',
        transliteration: 'Kāyena vācā manasendriyairvā buddhyātmanā vā prakṛteḥ svabhāvāt\nKaromi yadyatsakalaṃ parasmai Nārāyaṇāyeti samarpayāmi',
        meaning: 'Whatever I do with body, speech, mind, or senses, by intellect, nature, or habit, I offer all to the Supreme Narayana.',
        deity: 'Narayana',
        benefits: 'Surrenders the day\'s activities to the divine',
        duration: '3 minutes',
      },
    ],
  },
];

// Helper function to get current time slot
export const getCurrentTimeSlot = (): TimeSlot | null => {
  const hour = new Date().getHours();
  
  if (hour >= 4 && hour < 8) return timeSlots.find(t => t.id === 'morning') || null;
  if (hour >= 11 && hour < 14) return timeSlots.find(t => t.id === 'afternoon') || null;
  if (hour >= 17 && hour < 20) return timeSlots.find(t => t.id === 'evening') || null;
  if (hour >= 21 || hour < 4) return timeSlots.find(t => t.id === 'night') || null;
  
  return null;
};

// Get time slot by ID
export const getTimeSlotById = (id: TimeOfDay): TimeSlot | undefined => {
  return timeSlots.find(t => t.id === id);
};
