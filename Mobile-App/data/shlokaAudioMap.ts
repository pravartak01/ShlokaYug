// Audio file mapping for Karaoke Shlokas
// Maps shloka IDs to their corresponding audio files in the ShlokaAudios folder

export interface AudioMapping {
  shlokaId: string;
  audioFileName: string;
  displayName: string;
}

// Base URL for audio files (GitHub raw URL)
// NOTE: The ShlokaAudios folder must be committed and pushed to GitHub for this to work!
// Run: git add ShlokaAudios/ && git commit -m "Add audio files" && git push
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
  'surya-mantra': 'gayaytri mantra.mp3', // Using gayatri as related
  'aum-mantra': 'Aum mantra.mp3',
};

// Get audio file name for a shloka
export const getAudioForShloka = (shlokaId: string): string | null => {
  return SHLOKA_AUDIO_MAP[shlokaId] || null;
};

// Get full audio URL for a shloka (for streaming)
export const getAudioUrl = (shlokaId: string): string | null => {
  const fileName = SHLOKA_AUDIO_MAP[shlokaId];
  if (!fileName) return null;
  // URL encode the filename for proper URL handling
  return AUDIO_BASE_URL + encodeURIComponent(fileName);
};

// Get audio URL from filename directly (for healing shlokas)
export const getAudioUrlFromFilename = (audioFile: string): string => {
  // Remove any path prefix like ../../ShlokaAudios/
  const fileName = audioFile.replace(/^.*[\/\\]/, '');
  // URL encode the filename for proper URL handling
  return AUDIO_BASE_URL + encodeURIComponent(fileName);
};

// Check if audio is available for a shloka
export const hasAudio = (shlokaId: string): boolean => {
  return shlokaId in SHLOKA_AUDIO_MAP;
};

// All available audio files for reference
export const AVAILABLE_AUDIO_FILES = [
  'Annapurna shloka.mp3',
  'astoma.mp3',
  'Aum mantra.mp3',
  'dhanvantri mantra.mp3',
  'durga mantra.mp3',
  'ganesh mantra.mp3',
  'gayaytri mantra.mp3',
  'Guru bramha.mp3',
  'hanuman chalisa.mp3',
  'hare krishna.mp3',
  'karache charan.mp3',
  'loka samastha.mp3',
  'Mahalaxmi .mp3',
  'mahamrityunjay mantra.mp3',
  'medha suktam.mp3',
  'Narsimha Shanti path.mp3',
  'nirvana shaktam.mp3',
  'om namah shivaya.mp3',
  'om namo narayanay.mp3',
  'Saraswati vandana.mp3',
  'shanti mantra.mp3',
  'vakratunda.mp3',
  'vishnu mantra.mp3',
  'vishnu shanti mantra.mp3',
  'vishnu shloka.mp3',
  'Ya devi.mp3',
];
