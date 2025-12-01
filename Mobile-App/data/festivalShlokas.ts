// Festival-Based Shlokas Data
// Shlokas organized by Hindu calendar festivals

export interface FestivalShloka {
  id: string;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  benefits: string;
}

export interface Festival {
  id: string;
  name: string;
  deity: string;
  icon: string;
  color: string;
  gradientColors: [string, string];
  month: string; // Hindu month
  description: string;
  significance: string;
  shlokas: FestivalShloka[];
}

export interface FestivalCategory {
  id: string;
  name: string;
  icon: string;
  festivals: Festival[];
}

export const festivalCategories: FestivalCategory[] = [
  {
    id: 'major-festivals',
    name: 'Major Festivals',
    icon: '🎊',
    festivals: [
      {
        id: 'diwali',
        name: 'Diwali',
        deity: 'Lakshmi & Ganesha',
        icon: '🪔',
        color: '#f59e0b',
        gradientColors: ['#fbbf24', '#f59e0b'],
        month: 'Kartik',
        description: 'Festival of Lights',
        significance: 'Celebrates the victory of light over darkness and good over evil',
        shlokas: [
          {
            id: 'diwali-1',
            sanskrit: 'ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद।\nॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः॥',
            transliteration: 'Oṃ śrīṃ hrīṃ śrīṃ kamale kamalālaye prasīda prasīda\nOṃ śrīṃ hrīṃ śrīṃ Mahālakṣmyai namaḥ',
            meaning: 'Om, O Lakshmi who dwells in the lotus, be pleased. Salutations to Mahalakshmi.',
            benefits: 'Invokes prosperity and abundance',
          },
          {
            id: 'diwali-2',
            sanskrit: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
            transliteration: 'Vakratuṇḍa mahākāya sūryakoṭi samaprabha\nNirvighnaṃ kuru me deva sarvakāryeṣu sarvadā',
            meaning: 'O Lord with curved trunk and mighty body, radiant as a million suns, remove all obstacles from my endeavors always.',
            benefits: 'Removes obstacles and brings success',
          },
          {
            id: 'diwali-3',
            sanskrit: 'शुभं करोति कल्याणमारोग्यं धनसम्पदाम्।\nशत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तु ते॥',
            transliteration: 'Śubhaṃ karoti kalyāṇamārogyaṃ dhanasampādām\nŚatrubuddhivināśāya dīpajyotirnamostu te',
            meaning: 'Salutations to the light that brings auspiciousness, health, prosperity and destroys enmity.',
            benefits: 'Illuminates life with positivity',
          },
        ],
      },
      {
        id: 'holi',
        name: 'Holi',
        deity: 'Krishna & Radha',
        icon: '🎨',
        color: '#ec4899',
        gradientColors: ['#f472b6', '#ec4899'],
        month: 'Phalgun',
        description: 'Festival of Colors',
        significance: 'Celebrates the divine love of Radha-Krishna and victory of good over evil',
        shlokas: [
          {
            id: 'holi-1',
            sanskrit: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे।\nहरे राम हरे राम राम राम हरे हरे॥',
            transliteration: 'Hare Kṛṣṇa Hare Kṛṣṇa Kṛṣṇa Kṛṣṇa Hare Hare\nHare Rāma Hare Rāma Rāma Rāma Hare Hare',
            meaning: 'O Lord Krishna, O Lord Rama, please engage me in Your service.',
            benefits: 'Purifies the heart and invokes divine love',
          },
          {
            id: 'holi-2',
            sanskrit: 'राधे राधे राधे राधे राधे गोविन्द।\nगोविन्द गोविन्द गोविन्द राधे॥',
            transliteration: 'Rādhe Rādhe Rādhe Rādhe Rādhe Govinda\nGovinda Govinda Govinda Rādhe',
            meaning: 'O Radha, O Govinda (Krishna)!',
            benefits: 'Celebrates divine love and joy',
          },
        ],
      },
      {
        id: 'navratri',
        name: 'Navratri',
        deity: 'Durga Devi',
        icon: '🔱',
        color: '#dc2626',
        gradientColors: ['#ef4444', '#dc2626'],
        month: 'Ashwin',
        description: 'Nine Nights of Devi',
        significance: 'Celebrates the divine feminine and victory over demons',
        shlokas: [
          {
            id: 'navratri-1',
            sanskrit: 'या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता।\nनमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः॥',
            transliteration: 'Yā devī sarvabhūteṣu śaktirūpeṇa saṃsthitā\nNamastasyai namastasyai namastasyai namo namaḥ',
            meaning: 'To that Goddess who resides in all beings as power, salutations to Her again and again.',
            benefits: 'Invokes divine feminine power',
          },
          {
            id: 'navratri-2',
            sanskrit: 'सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके।\nशरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥',
            transliteration: 'Sarvamaṅgalamāṅgalye śive sarvārthasādhike\nŚaraṇye tryambake gauri Nārāyaṇi namostu te',
            meaning: 'O auspicious one, O Shiva, accomplisher of all goals, O refuge, O three-eyed Gauri, salutations to you, Narayani.',
            benefits: 'Brings all-round auspiciousness',
          },
          {
            id: 'navratri-3',
            sanskrit: 'जयन्ती मङ्गला काली भद्रकाली कपालिनी।\nदुर्गा क्षमा शिवा धात्री स्वाहा स्वधा नमोऽस्तु ते॥',
            transliteration: 'Jayantī maṅgalā Kālī Bhadrakālī Kapālinī\nDurgā kṣamā śivā dhātrī svāhā svadhā namostu te',
            meaning: 'Salutations to Jayanti, Mangala, Kali, Bhadrakali, Kapalini, Durga, Kshama, Shiva, Dhatri, Svaha, and Svadha.',
            benefits: 'Invokes the nine forms of Durga',
          },
        ],
      },
      {
        id: 'ganesh-chaturthi',
        name: 'Ganesh Chaturthi',
        deity: 'Ganesha',
        icon: '🕉️',
        color: '#f97316',
        gradientColors: ['#fb923c', '#f97316'],
        month: 'Bhadrapada',
        description: 'Birth of Lord Ganesha',
        significance: 'Celebrates the birth of the remover of obstacles',
        shlokas: [
          {
            id: 'ganesh-1',
            sanskrit: 'ॐ गं गणपतये नमः',
            transliteration: 'Oṃ gaṃ Gaṇapataye namaḥ',
            meaning: 'Om, salutations to Lord Ganapati.',
            benefits: 'Removes obstacles and brings success',
          },
          {
            id: 'ganesh-2',
            sanskrit: 'गजाननं भूतगणादिसेवितं कपित्थजम्बूफलचारुभक्षणम्।\nउमासुतं शोकविनाशकारकं नमामि विघ्नेश्वरपादपङ्कजम्॥',
            transliteration: 'Gajānanaṃ bhūtagaṇādisevitaṃ kapitthajambūphalacārubhakṣaṇam\nUmāsutaṃ śokavināśakārakaṃ namāmi Vighneśvarapādapaṅkajam',
            meaning: 'I bow to the lotus feet of Vighneswara, elephant-faced, served by beings, eating wood-apple and jamun, son of Uma, destroyer of sorrow.',
            benefits: 'Complete devotion to Ganesha',
          },
          {
            id: 'ganesh-3',
            sanskrit: 'अगजाननपद्मार्कं गजाननमहर्निशम्।\nअनेकदन्तं भक्तानामेकदन्तमुपास्महे॥',
            transliteration: 'Agajānanapadmārkaṃ gajānanamaharniśam\nAnekadantaṃ bhaktānāmekadantamupāsmahe',
            meaning: 'We worship the one-tusked Lord who is like a sun to the lotus face of Parvati, elephant-faced day and night, many-tusked for devotees.',
            benefits: 'Brings wisdom and removes darkness',
          },
        ],
      },
    ],
  },
  {
    id: 'deity-festivals',
    name: 'Deity Celebrations',
    icon: '🙏',
    festivals: [
      {
        id: 'janmashtami',
        name: 'Janmashtami',
        deity: 'Krishna',
        icon: '🪈',
        color: '#3b82f6',
        gradientColors: ['#60a5fa', '#3b82f6'],
        month: 'Shravan',
        description: 'Birth of Lord Krishna',
        significance: 'Celebrates the birth of Lord Krishna',
        shlokas: [
          {
            id: 'janmashtami-1',
            sanskrit: 'वसुदेवसुतं देवं कंसचाणूरमर्दनम्।\nदेवकीपरमानन्दं कृष्णं वन्दे जगद्गुरुम्॥',
            transliteration: 'Vasudevasutaṃ devaṃ kaṃsacāṇūramardanam\nDevakīparamānandaṃ Kṛṣṇaṃ vande jagadgurum',
            meaning: 'I bow to Krishna, son of Vasudeva, destroyer of Kamsa and Chanura, supreme bliss of Devaki, teacher of the world.',
            benefits: 'Invokes Krishna\'s blessings',
          },
          {
            id: 'janmashtami-2',
            sanskrit: 'कृष्णाय वासुदेवाय देवकीनन्दनाय च।\nनन्दगोपकुमाराय गोविन्दाय नमो नमः॥',
            transliteration: 'Kṛṣṇāya Vāsudevāya Devakīnandanāya ca\nNandagopakumārāya Govindāya namo namaḥ',
            meaning: 'Salutations to Krishna, son of Vasudeva, joy of Devaki, son of Nanda, and Govinda.',
            benefits: 'Complete surrender to Krishna',
          },
        ],
      },
      {
        id: 'mahashivratri',
        name: 'Mahashivratri',
        deity: 'Shiva',
        icon: '🔱',
        color: '#8b5cf6',
        gradientColors: ['#a78bfa', '#8b5cf6'],
        month: 'Phalgun',
        description: 'Great Night of Shiva',
        significance: 'The most auspicious night for Shiva worship',
        shlokas: [
          {
            id: 'shivratri-1',
            sanskrit: 'ॐ नमः शिवाय',
            transliteration: 'Oṃ namaḥ Śivāya',
            meaning: 'Om, salutations to Lord Shiva.',
            benefits: 'Most powerful mantra for Shiva',
          },
          {
            id: 'shivratri-2',
            sanskrit: 'कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्।\nसदा वसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥',
            transliteration: 'Karpūragauraṃ karuṇāvatāraṃ saṃsārasāraṃ bhujagendrahāram\nSadā vasantaṃ hṛdayāravinde bhavaṃ bhavānīsahitaṃ namāmi',
            meaning: 'I bow to Shiva who is white as camphor, incarnation of compassion, essence of the world, wearing the serpent king, ever dwelling in the heart-lotus, along with Bhavani.',
            benefits: 'Deep devotion and purification',
          },
          {
            id: 'shivratri-3',
            sanskrit: 'नागेन्द्रहाराय त्रिलोचनाय भस्माङ्गरागाय महेश्वराय।\nनित्याय शुद्धाय दिगम्बराय तस्मै नकाराय नमः शिवाय॥',
            transliteration: 'Nāgendrahārāya trilocanāya bhasmāṅgarāgāya Maheśvarāya\nNityāya śuddhāya digambarāya tasmai nakārāya namaḥ Śivāya',
            meaning: 'Salutations to Shiva who wears the serpent king, three-eyed, smeared with ash, the great lord, eternal, pure, sky-clad.',
            benefits: 'Invokes Shiva\'s grace and protection',
          },
        ],
      },
      {
        id: 'hanuman-jayanti',
        name: 'Hanuman Jayanti',
        deity: 'Hanuman',
        icon: '🐒',
        color: '#ea580c',
        gradientColors: ['#f97316', '#ea580c'],
        month: 'Chaitra',
        description: 'Birth of Lord Hanuman',
        significance: 'Celebrates the birth of the mighty devotee of Rama',
        shlokas: [
          {
            id: 'hanuman-1',
            sanskrit: 'मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्।\nवातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥',
            transliteration: 'Manojapaṃ mārutatulyavegaṃ jitendriyaṃ buddhimatāṃ variṣṭham\nVātātmajaṃ vānarayūthamukhyaṃ śrīRāmadūtaṃ śaraṇaṃ prapadye',
            meaning: 'I take refuge in Hanuman, swift as mind and wind, master of senses, chief among the wise, son of wind, leader of monkeys, messenger of Rama.',
            benefits: 'Invokes strength, courage and devotion',
          },
          {
            id: 'hanuman-2',
            sanskrit: 'बुद्धिर्बलं यशो धैर्यं निर्भयत्वमरोगता।\nअजाड्यं वाक्पटुत्वं च हनूमत्स्मरणाद्भवेत्॥',
            transliteration: 'Buddhirbalaṃ yaśo dhairyaṃ nirbhayatvam arogatā\nAjāḍyaṃ vākpaṭutvaṃ ca Hanūmatsmaraṇādbhavet',
            meaning: 'By remembering Hanuman, one gains intelligence, strength, fame, courage, fearlessness, health, alertness, and eloquence.',
            benefits: 'Grants eight types of blessings',
          },
        ],
      },
      {
        id: 'ram-navami',
        name: 'Ram Navami',
        deity: 'Rama',
        icon: '🏹',
        color: '#059669',
        gradientColors: ['#10b981', '#059669'],
        month: 'Chaitra',
        description: 'Birth of Lord Rama',
        significance: 'Celebrates the birth of Maryada Purushottam Rama',
        shlokas: [
          {
            id: 'ram-1',
            sanskrit: 'श्रीरामचन्द्रः श्रितपारिजातः समस्तकल्याणगुणाभिरामः।\nसीतामुखाम्भोरुहचञ्चरीको निरन्तरं मङ्गलमातनोतु॥',
            transliteration: 'ŚrīRāmacandraḥ śritapārijātaḥ samastakalyāṇaguṇābhirāmaḥ\nSītāmukhāmbhoruhacancarīko nirantaraṃ maṅgalamātanotu',
            meaning: 'May Shri Ramachandra, the wish-fulfilling tree, endowed with all auspicious qualities, like a bee on the lotus face of Sita, always bestow blessings.',
            benefits: 'Brings all-round auspiciousness',
          },
          {
            id: 'ram-2',
            sanskrit: 'रामाय रामभद्राय रामचन्द्राय वेधसे।\nरघुनाथाय नाथाय सीतायाः पतये नमः॥',
            transliteration: 'Rāmāya Rāmabhadrāya Rāmacandrāya vedhase\nRaghunāthāya nāthāya Sītāyāḥ pataye namaḥ',
            meaning: 'Salutations to Rama, auspicious Rama, moon-like Rama, the creator, lord of Raghus, lord of Sita.',
            benefits: 'Complete devotion to Rama',
          },
        ],
      },
    ],
  },
  {
    id: 'seasonal-festivals',
    name: 'Seasonal Celebrations',
    icon: '🌸',
    festivals: [
      {
        id: 'makar-sankranti',
        name: 'Makar Sankranti',
        deity: 'Surya (Sun)',
        icon: '☀️',
        color: '#eab308',
        gradientColors: ['#fde047', '#eab308'],
        month: 'Pausha',
        description: 'Sun\'s Northward Journey',
        significance: 'Marks the sun\'s transition to Capricorn',
        shlokas: [
          {
            id: 'sankranti-1',
            sanskrit: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
            transliteration: 'Oṃ hrāṃ hrīṃ hrauṃ saḥ Sūryāya namaḥ',
            meaning: 'Om, salutations to the Sun God.',
            benefits: 'Invokes solar energy and vitality',
          },
          {
            id: 'sankranti-2',
            sanskrit: 'आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम्।\nजयावहं जपेन्नित्यमक्षयं परमं शिवम्॥',
            transliteration: 'Ādityahṛdayaṃ puṇyaṃ sarvaśatruvināśanam\nJayāvahaṃ japennityamakṣayaṃ paramaṃ śivam',
            meaning: 'The heart of the sun, sacred, destroyer of all enemies, giver of victory, when chanted daily, brings imperishable supreme auspiciousness.',
            benefits: 'Victory over all obstacles',
          },
        ],
      },
      {
        id: 'basant-panchami',
        name: 'Basant Panchami',
        deity: 'Saraswati',
        icon: '📚',
        color: '#fbbf24',
        gradientColors: ['#fde047', '#fbbf24'],
        month: 'Magh',
        description: 'Festival of Spring & Learning',
        significance: 'Celebrates Goddess Saraswati and the arrival of spring',
        shlokas: [
          {
            id: 'basant-1',
            sanskrit: 'या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता।\nया वीणावरदण्डमण्डितकरा या श्वेतपद्मासना।\nया ब्रह्माच्युतशङ्करप्रभृतिभिर्देवैः सदा पूजिता।\nसा मां पातु सरस्वती भगवती निःशेषजाड्यापहा॥',
            transliteration: 'Yā kundendutuṣārahāradhavalā yā śubhravastrāvṛtā\nYā vīṇāvaradaṇḍamaṇḍitakarā yā śvetapadmāsanā\nYā brahmācyutaśaṅkaraprabhṛtibhirdevaiḥ sadā pūjitā\nSā māṃ pātu Sarasvatī bhagavatī niḥśeṣajāḍyāpahā',
            meaning: 'May Goddess Saraswati, white as jasmine and moon, clothed in white, holding veena, seated on white lotus, worshipped by Brahma, Vishnu, and Shiva, remover of ignorance, protect me.',
            benefits: 'Grants knowledge and wisdom',
          },
          {
            id: 'basant-2',
            sanskrit: 'ॐ ऐं सरस्वत्यै नमः',
            transliteration: 'Oṃ aiṃ Sarasvatyai namaḥ',
            meaning: 'Om, salutations to Goddess Saraswati.',
            benefits: 'Enhances learning and creativity',
          },
        ],
      },
      {
        id: 'guru-purnima',
        name: 'Guru Purnima',
        deity: 'Guru/Vyasa',
        icon: '🙏',
        color: '#7c3aed',
        gradientColors: ['#a78bfa', '#7c3aed'],
        month: 'Ashadha',
        description: 'Day of the Teacher',
        significance: 'Honors the Guru and sage Vyasa',
        shlokas: [
          {
            id: 'guru-1',
            sanskrit: 'गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।\nगुरुः साक्षात् परं ब्रह्म तस्मै श्री गुरवे नमः॥',
            transliteration: 'Gurur Brahmā Gurur Viṣṇuḥ Gurur Devo Maheśvaraḥ\nGuruḥ sākṣāt paraṃ Brahma tasmai śrī Gurave namaḥ',
            meaning: 'The Guru is Brahma, Vishnu, and Maheshwara. The Guru is the Supreme Brahman. Salutations to that Guru.',
            benefits: 'Invokes the grace of the teacher',
          },
          {
            id: 'guru-2',
            sanskrit: 'अखण्डमण्डलाकारं व्याप्तं येन चराचरम्।\nतत्पदं दर्शितं येन तस्मै श्रीगुरवे नमः॥',
            transliteration: 'Akhaṇḍamaṇḍalākāraṃ vyāptaṃ yena carācaram\nTatpadaṃ darśitaṃ yena tasmai śrīgurave namaḥ',
            meaning: 'Salutations to the Guru who revealed that state which pervades all moving and unmoving things in its unbroken form.',
            benefits: 'Awakens spiritual understanding',
          },
        ],
      },
    ],
  },
];

// Get all festivals flat list
export const getAllFestivals = (): Festival[] => {
  return festivalCategories.flatMap(category => category.festivals);
};

// Get festival by ID
export const getFestivalById = (id: string): Festival | undefined => {
  return getAllFestivals().find(f => f.id === id);
};

// Get upcoming festivals (for current month simulation)
export const getUpcomingFestivals = (): Festival[] => {
  // In a real app, you'd calculate this based on Hindu calendar
  // For now, return a sample selection
  return getAllFestivals().slice(0, 4);
};

// Search festivals
export const searchFestivals = (query: string): Festival[] => {
  const lowerQuery = query.toLowerCase();
  return getAllFestivals().filter(
    f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.deity.toLowerCase().includes(lowerQuery) ||
      f.description.toLowerCase().includes(lowerQuery)
  );
};
