# Multi-Language Implementation Guide 🌍

## Overview
The ShlokaYug mobile app now supports 5 languages:
- 🇬🇧 **English** (en)
- 🇮🇳 **Hindi** (hi) - हिन्दी
- 🕉️ **Sanskrit** (sa) - संस्कृतम्
- 🇮🇳 **Marathi** (mr) - मराठी
- 🇮🇳 **Telugu** (te) - తెలుగు

## How It Works

### 1. Library Used
We're using **i18next** with **react-i18next** for React Native, which provides:
- Language detection and persistence
- Easy translation key management
- React hooks for accessing translations
- Automatic re-rendering when language changes

### 2. File Structure
```
Mobile-App/
├── i18n.config.ts                    # i18n initialization & config
├── locales/                          # Translation files
│   ├── en.json                       # English translations
│   ├── hi.json                       # Hindi translations
│   ├── sa.json                       # Sanskrit translations
│   ├── mr.json                       # Marathi translations
│   └── te.json                       # Telugu translations
├── context/
│   └── LanguageContext.tsx           # Language state management
└── components/
    └── common/
        └── LanguageSelector.tsx      # Language selector modal UI
```

## User Experience

### Language Selection
1. User clicks the **language button** (🌐 icon) in the Header
2. A beautiful modal appears with all 5 language options
3. Each language shows both English name and native script
4. Current language is highlighted with a checkmark
5. Upon selection, the entire app interface switches instantly

### Persistence
- Selected language is saved to device storage (AsyncStorage)
- Language preference persists across app restarts
- First-time users get their device's default language if available

## For Developers: How to Add Translations

### Step 1: Add Translation Keys

Add your new text to all 5 language files in the `locales/` folder.

**Example - Adding a "welcome" message:**

`locales/en.json`:
```json
{
  "home": {
    "welcome": "Welcome to ShlokaYug",
    "subtitle": "Discover the wisdom of Sanskrit"
  }
}
```

`locales/hi.json`:
```json
{
  "home": {
    "welcome": "श्लोकयुग में आपका स्वागत है",
    "subtitle": "संस्कृत की बुद्धिमत्ता को जानें"
  }
}
```

`locales/sa.json`:
```json
{
  "home": {
    "welcome": "श्लोकयुगे स्वागतम्",
    "subtitle": "संस्कृतस्य ज्ञानं अन्वेषयतु"
  }
}
```

`locales/mr.json`:
```json
{
  "home": {
    "welcome": "श्लोकयुगमध्ये आपले स्वागत आहे",
    "subtitle": "संस्कृतचे ज्ञान शोधा"
  }
}
```

`locales/te.json`:
```json
{
  "home": {
    "welcome": "శ్లోకయుగ్‌కు స్వాగతం",
    "subtitle": "సంస్కృత జ్ఞానాన్ని కనుగొనండి"
  }
}
```

### Step 2: Use Translations in Components

**Import the translation hook:**
```tsx
import { useTranslation } from 'react-i18next';
```

**Use in your component:**
```tsx
export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('home.welcome')}</Text>
      <Text>{t('home.subtitle')}</Text>
    </View>
  );
}
```

### Step 3: With Variables (Interpolation)

**In translation file:**
```json
{
  "greeting": "Hello, {{name}}! You have {{count}} new messages."
}
```

**In component:**
```tsx
<Text>{t('greeting', { name: 'Arjun', count: 5 })}</Text>
// Output: "Hello, Arjun! You have 5 new messages."
```

### Step 4: Pluralization

**In translation file:**
```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}
```

**In component:**
```tsx
<Text>{t('items', { count: 1 })}</Text>  // "1 item"
<Text>{t('items', { count: 5 })}</Text>  // "5 items"
```

## Advanced Usage

### Access Current Language
```tsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  
  console.log(currentLanguage); // 'en', 'hi', 'sa', 'mr', or 'te'
  
  // Manually change language
  await changeLanguage('hi');
}
```

### Conditional Rendering Based on Language
```tsx
const { currentLanguage } = useLanguage();

return (
  <View>
    {currentLanguage === 'sa' && (
      <Text>Special content for Sanskrit users</Text>
    )}
  </View>
);
```

### Using Translation Outside Components
```tsx
import i18n from '../i18n.config';

// Access translations
const text = i18n.t('header.greeting.morning');

// Change language
i18n.changeLanguage('hi');

// Get current language
const lang = i18n.language;
```

## Translation Namespaces (Organization)

Current namespaces in translation files:
- `header.*` - Header component texts
- `common.*` - Common UI elements (buttons, labels, etc.)
- `navigation.*` - Navigation/tab bar labels
- `panchang.*` - Panchang-related terms

**Recommended structure for new features:**
```json
{
  "featureName": {
    "title": "...",
    "description": "...",
    "buttons": {
      "submit": "...",
      "cancel": "..."
    },
    "errors": {
      "required": "...",
      "invalid": "..."
    }
  }
}
```

## Best Practices

### ✅ DO:
- Always add translations to ALL 5 language files
- Use descriptive translation keys: `profile.settings.changePassword`
- Group related translations in nested objects
- Test the app in all languages
- Use the translation hook `useTranslation()` in components
- Keep translation keys in English for consistency

### ❌ DON'T:
- Don't hardcode user-facing text in components
- Don't mix languages in a single translation file
- Don't use generic keys like `text1`, `button2`
- Don't forget to add new keys to all language files

## Testing Your Translations

1. Open the app
2. Click the language button (🌐) in the header
3. Select each language and verify:
   - Text displays correctly
   - No missing translations (shows key instead)
   - Proper font rendering (especially for Devanagari/Telugu scripts)
   - UI doesn't break with longer/shorter text

## Troubleshooting

### Translation not showing / Shows key instead
- Check if the key exists in the translation file
- Verify the key path is correct (case-sensitive)
- Ensure the translation file is valid JSON

### Language not persisting
- Check AsyncStorage permissions
- Verify LanguageProvider wraps the app in `_layout.tsx`

### Fonts not rendering properly
- Ensure proper fonts are loaded for Devanagari/Telugu scripts
- Check font family in component styles

## Adding a New Language

If you want to add a 6th language (e.g., Tamil):

1. Create `locales/ta.json` with all translation keys
2. Update `i18n.config.ts`:
   ```tsx
   import ta from './locales/ta.json';
   
   resources: {
     // ... existing languages
     ta: { translation: ta },
   }
   ```
3. Update `LanguageContext.tsx`:
   ```tsx
   export type LanguageCode = 'en' | 'hi' | 'sa' | 'mr' | 'te' | 'ta';
   
   export const LANGUAGES: Language[] = [
     // ... existing languages
     { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', icon: '🇮🇳' },
   ];
   ```

## Example Components

### Simple Text Translation
```tsx
import { useTranslation } from 'react-i18next';

function WelcomeMessage() {
  const { t } = useTranslation();
  
  return <Text>{t('common.welcome')}</Text>;
}
```

### Button with Translation
```tsx
import { useTranslation } from 'react-i18next';

function SubmitButton() {
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity onPress={handleSubmit}>
      <Text>{t('common.submit')}</Text>
    </TouchableOpacity>
  );
}
```

### Dynamic Greeting
```tsx
import { useTranslation } from 'react-i18next';

function Greeting({ userName }: { userName: string }) {
  const { t } = useTranslation();
  
  return (
    <Text>
      {t('header.greeting.morning')}, {userName}!
    </Text>
  );
}
```

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [React Native i18n Guide](https://react.i18next.com/latest/using-with-hooks)

## Support

For questions or issues with translations:
1. Check this guide first
2. Verify translation files are valid JSON
3. Test in development mode with console logs
4. Check the LanguageContext implementation

---

**Happy Translating! 🎉**

The app is now accessible to millions more users across India in their native languages.
