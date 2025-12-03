import { useFonts as useExpoFonts } from 'expo-font';
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import {
  DMSerifDisplay_400Regular,
} from '@expo-google-fonts/dm-serif-display';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_600SemiBold,
  NotoSansDevanagari_700Bold,
} from '@expo-google-fonts/noto-sans-devanagari';

/**
 * Custom hook to load all app fonts
 * 
 * 🔥 STUNNING Font choices for ShlokaYug:
 * - DM Serif Display: Beautiful, elegant serif for impactful headlines
 * - Outfit: Modern geometric sans-serif for clean UI
 * - Space Grotesk: Unique personality font for special elements
 * - Noto Sans Devanagari: Perfect Sanskrit text rendering
 */
export const useFonts = () => {
  const [fontsLoaded, fontError] = useExpoFonts({
    // Outfit - Primary UI Font (Modern & Geometric)
    'Outfit-Light': Outfit_300Light,
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-ExtraBold': Outfit_800ExtraBold,
    
    // DM Serif Display - Stunning Headlines (Creates WOW factor)
    'DMSerif-Regular': DMSerifDisplay_400Regular,
    
    // Space Grotesk - Unique & Modern (For special elements)
    'SpaceGrotesk-Regular': SpaceGrotesk_400Regular,
    'SpaceGrotesk-Medium': SpaceGrotesk_500Medium,
    'SpaceGrotesk-SemiBold': SpaceGrotesk_600SemiBold,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
    
    // Noto Sans Devanagari - For Sanskrit Text
    'NotoSansDevanagari-Regular': NotoSansDevanagari_400Regular,
    'NotoSansDevanagari-Medium': NotoSansDevanagari_500Medium,
    'NotoSansDevanagari-SemiBold': NotoSansDevanagari_600SemiBold,
    'NotoSansDevanagari-Bold': NotoSansDevanagari_700Bold,
  });

  return { fontsLoaded, fontError };
};

export default useFonts;
