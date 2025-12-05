# Complete Application Translation Guide

## 🌍 Full Application Language Support

Your ShlokaYug app now has **complete multi-language support** across:
- ✅ All UI elements
- ✅ Navigation and tabs
- ✅ API requests and responses
- ✅ Dynamic content
- ✅ Error messages
- ✅ Success notifications
- ✅ Date/Time formatting
- ✅ Number formatting

## 📱 What's Translated

### 1. User Interface (UI)
- Header greetings
- Tab bar labels (Home, Learn, Videos, Practice, Community)
- All buttons (Save, Share, Listen, Submit, etc.)
- Form labels
- Settings
- Profile screens

### 2. Navigation
All navigation elements automatically switch when language changes:
```tsx
import { useTranslation } from 'react-i18next';

function MyScreen() {
  const { t } = useTranslation();
  
  return <Text>{t('navigation.home')}</Text>; // होम / ಹೋಮ್ / etc.
}
```

### 3. API Requests
All API calls automatically include language parameter:
```tsx
import { api } from '../utils/apiClient';

// Automatically adds ?lang=hi to URL
const courses = await api.get('/courses');
// Request: GET /courses?lang=hi
```

### 4. API Responses
Multilingual API responses are automatically transformed:
```tsx
// API returns:
{
  title: {
    en: "Bhagavad Gita",
    hi: "भगवद गीता",
    sa: "भगवद्गीता",
    mr: "भगवद्गीता",
    te: "భగవద్గీత"
  }
}

// Your app receives (when Hindi is selected):
{
  title: "भगवद गीता"
}
```

## 🔧 How to Use in Your Code

### Basic Translation
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.welcome')}</Text>
      <Button title={t('common.submit')} />
    </View>
  );
}
```

### Translation with Variables
```tsx
const { t } = useTranslation();

<Text>{t('welcome.message', { name: userName })}</Text>
// Add to translation file: "welcome": { "message": "Welcome, {{name}}!" }
```

### Dynamic Content Translation
```tsx
import { translateContent } from '../utils/translationUtils';

// For content from API with multiple languages
const course = {
  title: {
    en: "Sanskrit Basics",
    hi: "संस्कृत बुनियादी बातें",
    sa: "संस्कृत आधार",
    mr: "संस्कृत मूलभूत गोष्टी",
    te: "సంస్కృత ప్రాథమికాలు"
  }
};

const translatedTitle = translateContent(course.title);
// Returns title in current language
```

### Date & Time Formatting
```tsx
import { formatDate, formatTime } from '../utils/translationUtils';

const date = new Date();
const formattedDate = formatDate(date);
// English: December 5, 2025
// Hindi: 5 दिसंबर 2025
// Telugu: డిసెంబర్ 5, 2025

const formattedTime = formatTime(date);
// Formats time according to language locale
```

### Number Formatting
```tsx
import { formatNumber } from '../utils/translationUtils';

const count = 1234567;
const formatted = formatNumber(count);
// English: 1,234,567
// Hindi: 12,34,567 (Indian numbering)
```

## 📡 API Integration

### Automatic Language Support
```tsx
import { api } from '../utils/apiClient';

// All requests automatically include language
async function fetchCourses() {
  const courses = await api.get('/courses');
  // Multilingual fields are auto-translated
  return courses;
}
```

### Manual Language Control
```tsx
import { getApiLanguageParam } from '../utils/translationUtils';

const currentLang = getApiLanguageParam(); // 'hi', 'sa', 'mr', 'te'
```

## 🎨 Translation Keys Reference

### Common UI Elements
```
common.ok → "OK" / "ठीक है" / "సరే"
common.cancel → "Cancel" / "रद्द करें" / "రద్దు చేయండి"
common.save → "Save" / "सहेजें" / "సేవ్ చేయండి"
common.share → "Share" / "साझा करें" / "షేర్ చేయండి"
common.submit → "Submit" / "जमा करें" / "సమర్పించండి"
common.edit → "Edit" / "संपादित करें" / "సవరించండి"
common.delete → "Delete" / "हटाएं" / "తొలగించండి"
```

### Navigation
```
navigation.home → "Home" / "होम" / "హోమ్"
navigation.learn → "Learn" / "सीखें" / "నేర్చుకోండి"
navigation.videos → "Videos" / "वीडियो" / "వీడియోలు"
navigation.practice → "Practice" / "अभ्यास" / "అభ్యాసం"
navigation.community → "Community" / "समुदाय" / "కమ్యూనిటీ"
```

### Learning
```
learn.title → "Learning Path" / "सीखने का मार्ग" / "నేర్చుకునే మార్గం"
learn.courses → "Courses" / "पाठ्यक्रम" / "కోర్సులు"
learn.progress → "Progress" / "प्रगति" / "పురోగతి"
learn.beginner → "Beginner" / "शुरुआती" / "ప్రారంభకుడు"
learn.intermediate → "Intermediate" / "मध्यवर्ती" / "మధ్యస్థ"
learn.advanced → "Advanced" / "उन्नत" / "ఆధునిక"
```

### Errors
```
errors.networkError → Network error messages
errors.serverError → Server error messages
errors.invalidCredentials → Login errors
errors.requiredField → Form validation
```

## 🔄 Real-Time Language Switching

When user changes language:
1. ✅ All UI text updates instantly
2. ✅ All navigation labels change
3. ✅ Future API calls use new language
4. ✅ Dates/numbers reformat
5. ✅ Error messages translate
6. ✅ Success messages translate

## 📝 Adding New Translations

### Step 1: Add to ALL language files
```json
// locales/en.json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is amazing"
  }
}

// locales/hi.json
{
  "myFeature": {
    "title": "मेरी सुविधा",
    "description": "यह अद्भुत है"
  }
}

// Repeat for sa.json, mr.json, te.json
```

### Step 2: Use in Component
```tsx
const { t } = useTranslation();

<View>
  <Text>{t('myFeature.title')}</Text>
  <Text>{t('myFeature.description')}</Text>
</View>
```

## 🎯 Best Practices

### DO ✅
- Always use `t()` for user-facing text
- Add translations to ALL 5 language files
- Test in all languages
- Use translation utils for dates/numbers
- Let API client handle language params

### DON'T ❌
- Don't hardcode user-facing text
- Don't forget any language file
- Don't manually add lang params to API calls
- Don't format dates/numbers without utils

## 🚀 Backend Integration

### What Backend Needs to Support

1. **Accept Language Parameter**
```javascript
// Backend receives: ?lang=hi or Accept-Language: hi
app.get('/api/courses', (req, res) => {
  const lang = req.query.lang || req.headers['accept-language'] || 'en';
  // Return content in requested language
});
```

2. **Return Multilingual Content**
```javascript
// Option 1: Single language (recommended)
{
  "title": "भगवद गीता",  // Already in requested language
  "description": "..."
}

// Option 2: All languages (auto-transformed by app)
{
  "title": {
    "en": "Bhagavad Gita",
    "hi": "भगवद गीता",
    "sa": "भगवद्गीता",
    "mr": "भगवद्गीता",
    "te": "భగవద్గీత"
  }
}
```

3. **Database Schema**
```sql
-- Store multilingual content
CREATE TABLE courses (
  id INT PRIMARY KEY,
  title_en VARCHAR(255),
  title_hi VARCHAR(255),
  title_sa VARCHAR(255),
  title_mr VARCHAR(255),
  title_te VARCHAR(255),
  description_en TEXT,
  description_hi TEXT,
  -- etc.
);

-- OR use JSON
CREATE TABLE courses (
  id INT PRIMARY KEY,
  title JSON, -- {"en": "...", "hi": "...", ...}
  description JSON
);
```

## 📊 Testing Checklist

- [ ] Switch to Hindi - all text changes
- [ ] Switch to Sanskrit - all text changes
- [ ] Switch to Marathi - all text changes
- [ ] Switch to Telugu - all text changes
- [ ] Back to English - all text changes
- [ ] API calls include language param
- [ ] Dates format correctly
- [ ] Numbers format correctly
- [ ] Errors show in selected language
- [ ] Tab labels translate
- [ ] Navigation works
- [ ] No missing translations (no keys showing)

## 🆘 Troubleshooting

### Text shows translation key instead of text
- Check if key exists in all language files
- Verify key path is correct (case-sensitive)
- Ensure language files are valid JSON

### Language doesn't persist
- Check LanguageProvider is in _layout.tsx
- Verify AsyncStorage permissions

### API doesn't use language
- Import api client from utils/apiClient
- Don't use axios directly

## 📦 Summary

Your app now has **COMPLETE** multi-language support:

✅ **UI Components** - All buttons, labels, text
✅ **Navigation** - Tabs, screens, routes
✅ **API Integration** - Automatic language params
✅ **Response Transformation** - Auto-translate multilingual data
✅ **Date/Time** - Locale-aware formatting
✅ **Numbers** - Locale-aware formatting
✅ **Errors** - Translated error messages
✅ **Persistence** - Saves user preference

**The entire application adapts to user's language choice!** 🌍🎉
