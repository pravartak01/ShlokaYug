import { useEffect } from 'react';
import './App.css';
import './styles/enhanced-global.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextBypass';
import { MainDashboardPage } from './pages/MainDashboardPageEnhanced';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Preload critical fonts for better performance
const preloadFonts = () => {
  const fonts = [
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@100;200;300;400;500;600;700;800;900&display=swap',
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap',
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap'
  ];
  
  fonts.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'style';
    document.head.appendChild(link);
    
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = href;
    document.head.appendChild(styleLink);
  });
};

// Enhanced document metadata for Sanskrit app
const setupDocumentMeta = () => {
  document.title = 'ShlokaYug - Divine Sanskrit Prosody Experience';
  
  // Meta tags for better SEO and experience
  const metaTags = [
    { name: 'description', content: 'Experience the divine art of Sanskrit prosody with ShlokaYug. Learn, practice, and master ancient meters with surreal animations and real karaoke experience.' },
    { name: 'keywords', content: 'ShlokaYug, Sanskrit, Chandas, Prosody, Ancient Literature, Vedic Meters, Indian Classical Poetry, Learning App' },
    { name: 'author', content: 'ShlokaYug Team' },
    { name: 'theme-color', content: '#f97316' },
    { property: 'og:title', content: '🕉️ ShlokaYug - Divine Sanskrit Experience' },
    { property: 'og:description', content: 'Master the sacred art of Sanskrit prosody with ShlokaYug - extraordinary animations and real karaoke' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ];
  
  metaTags.forEach(({ name, property, content }) => {
    const meta = document.createElement('meta');
    if (name) meta.name = name;
    if (property) meta.setAttribute('property', property);
    meta.content = content;
    document.head.appendChild(meta);
  });
  
  // Favicon for divine experience
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🕉️</text></svg>';
  document.head.appendChild(favicon);
};

// Sacred app initialization
const initializeSacredApp = () => {
  // Add sacred body classes
  document.body.classList.add('font-sanskrit', 'antialiased');
  
  // Enable smooth scrolling behavior
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Add sacred greeting based on time
  const hour = new Date().getHours();
  let greeting = '';
  
  if (hour < 6) {
    greeting = 'शुभ रात्रि'; // Good night
  } else if (hour < 12) {
    greeting = 'शुभ प्रभात'; // Good morning
  } else if (hour < 17) {
    greeting = 'शुभ अपराह्न'; // Good afternoon
  } else if (hour < 20) {
    greeting = 'शुभ सायंकाल'; // Good evening
  } else {
    greeting = 'शुभ रात्रि'; // Good night
  }
  
  console.log(`🕉️ ${greeting} | Welcome to ShlokaYug - The Divine Sanskrit Experience`);
};

function App() {
  useEffect(() => {
    // Initialize all sacred enhancements
    preloadFonts();
    setupDocumentMeta();
    initializeSacredApp();
    
    // Add loading animation
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      setTimeout(() => {
        loadingElement.style.opacity = '0';
        setTimeout(() => {
          loadingElement.remove();
        }, 500);
      }, 1000);
    }
    
    // Sacred keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        console.log('🕉️ Sacred search activated');
        // Future: implement global search
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App relative min-h-screen w-full">
          {/* Sacred Loading Overlay */}
          <div 
            id="loading" 
            className="fixed inset-0 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 z-50 flex items-center justify-center transition-opacity duration-500"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 animate-om-sacred">🕉️</div>
              <div className="text-2xl font-sanskrit text-orange-800 animate-sacred-glow">
                आलोकयामः दिव्यम् अनुभवम्
              </div>
              <div className="text-lg text-orange-600 mt-2">
                Loading Divine Experience...
              </div>
              <div className="loader-divine mx-auto mt-4"></div>
            </div>
          </div>

          {/* Sacred Background Particles */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-orange-100/30"></div>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full bg-orange-300/20 animate-float particle-${i}`}
              />
            ))}
          </div>

          {/* Main Application Routes */}
          <div className="relative z-10">
            <Routes>
              {/* Auth routes that redirect on submit */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Main application */}
              <Route path="/dashboard" element={<MainDashboardPage />} />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>

          {/* Sacred Footer with Divine Quote */}
          <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500/80 to-orange-600/80 backdrop-blur-sm text-white text-center py-2 z-20">
            <div className="text-sm font-sanskrit">
              🕉️ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः | May all beings be happy and free from illness 🕉️
            </div>
          </footer>

          {/* Sacred Error Boundary Fallback */}
          <div id="error-boundary" className="invisible fixed inset-0 bg-red-500/90 text-white items-center justify-center z-50">
            <div className="text-center p-8">
              <div className="text-4xl mb-4">🙏</div>
              <div className="text-xl font-sanskrit mb-2">क्षमा करें</div>
              <div className="text-lg">Something went wrong. Please refresh the page.</div>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;