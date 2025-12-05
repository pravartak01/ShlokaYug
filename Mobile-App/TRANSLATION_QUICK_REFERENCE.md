# Quick Reference: Using Translations

## Basic Usage

### 1. Import the hook
```tsx
import { useTranslation } from 'react-i18next';
```

### 2. Use in component
```tsx
function MyComponent() {
  const { t } = useTranslation();
  
  return <Text>{t('header.greeting.morning')}</Text>;
}
```

## Available Translation Keys

### Header (`header.*`)
```tsx
t('header.greeting.morning')     // "Good Morning" / "सुप्रभात" / etc.
t('header.greeting.afternoon')   // "Good Afternoon" / "नमस्कार" / etc.
t('header.greeting.evening')     // "Good Evening" / "शुभ संध्या" / etc.
t('header.greeting.night')       // "Good Night" / "शुभ रात्रि" / etc.
t('header.guest')                // "Guest" / "अतिथि" / etc.
t('header.quoteOfTheDay')       // "Quote of the Day"
t('header.deeperMeaning')       // "Deeper Meaning"
t('header.save')                // "Save"
t('header.share')               // "Share"
t('header.listen')              // "Listen"
t('header.loading')             // "Loading..."
```

### Common (`common.*`)
```tsx
t('common.notifications')        // "Notifications"
t('common.profile')             // "Profile"
t('common.menu')                // "Menu"
t('common.settings')            // "Settings"
t('common.logout')              // "Logout"
t('common.cancel')              // "Cancel"
t('common.confirm')             // "Confirm"
t('common.language')            // "Language"
t('common.selectLanguage')      // "Select Language"
```

### Navigation (`navigation.*`)
```tsx
t('navigation.home')            // "Home"
t('navigation.learn')           // "Learn"
t('navigation.community')       // "Community"
t('navigation.profile')         // "Profile"
t('navigation.settings')        // "Settings"
```

### Panchang (`panchang.*`)
```tsx
t('panchang.tithi')             // "Tithi"
t('panchang.nakshatra')         // "Nakshatra"
t('panchang.paksha')            // "Paksha"
```

## Language Control

### Get current language
```tsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { currentLanguage } = useLanguage();
  // currentLanguage will be: 'en', 'hi', 'sa', 'mr', or 'te'
}
```

### Change language programmatically
```tsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { changeLanguage } = useLanguage();
  
  const switchToHindi = async () => {
    await changeLanguage('hi');
  };
}
```

### Get all available languages
```tsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { languages } = useLanguage();
  // languages = [
  //   { code: 'en', name: 'English', nativeName: 'English', icon: '🇬🇧' },
  //   { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', icon: '🇮🇳' },
  //   ...
  // ]
}
```

## Language Codes

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `hi` | Hindi | हिन्दी |
| `sa` | Sanskrit | संस्कृतम् |
| `mr` | Marathi | मराठी |
| `te` | Telugu | తెలుగు |

## Adding New Translations

1. **Add to all 5 language files** (`locales/*.json`)
2. **Use the translation** with `t('your.key')`

Example:
```json
// locales/en.json
{
  "myFeature": {
    "title": "My Feature",
    "subtitle": "Feature description"
  }
}
```

```tsx
// MyComponent.tsx
const { t } = useTranslation();

<Text>{t('myFeature.title')}</Text>
<Text>{t('myFeature.subtitle')}</Text>
```
