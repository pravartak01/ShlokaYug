/**
 * Landing Page / Home Page
 * SVARAM - The Ultimate Sanskrit Learning Platform
 * Authentic Bharatiya Heritage Theme
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Feature data with all platform capabilities
const features = [
  {
    icon: '🎭',
    title: 'Chandas Identification',
    description: 'AI + rule-based engine that identifies poetic meters, performs laghu-guru classification and syllable computation',
    category: 'AI Intelligence',
  },
  {
    icon: '🎤',
    title: 'Real-Time Karaoke',
    description: 'Chant along with color-coded syllable highlights and synchronized rhythmic guidance in real-time',
    category: 'Interactive',
  },
  {
    icon: '✨',
    title: 'Visual Meter Patterns',
    description: 'Experience rhythmic beauty through stunning visual dashboards and pattern representations',
    category: 'Visualization',
  },
  {
    icon: '🎧',
    title: 'Audio to Meter Detection',
    description: 'Speak or upload audio — our AI maps your voice to metrical patterns instantly',
    category: 'AI Intelligence',
  },
  {
    icon: '📜',
    title: 'Multi-Script Support',
    description: 'Input in Devanagari, IAST, ITRANS or Roman script with seamless normalization',
    category: 'Accessibility',
  },
  {
    icon: '🎮',
    title: 'Gamified Learning',
    description: 'Earn badges, climb levels, complete quizzes and unlock achievements on your journey',
    category: 'Engagement',
  },
  {
    icon: '🙏',
    title: 'Guru-Shishya LMS',
    description: 'Structured courses from Sanskrit scholars with verified certifications upon completion',
    category: 'Education',
  },
  {
    icon: '🗣️',
    title: 'Voice Analysis',
    description: 'AI-powered pronunciation feedback with confidence scores comparing your chanting to ideal rhythm',
    category: 'AI Intelligence',
  },
  {
    icon: '📚',
    title: 'Shloka Library',
    description: '10,000+ curated verses from Vedas, Upanishads, Bhagavad Gita, Ramayana and more',
    category: 'Content',
  },
  {
    icon: '🤖',
    title: 'AI Composer',
    description: 'Generate original shlokas in any Chandas — witness AI creating Sanskrit poetry',
    category: 'AI Intelligence',
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    description: 'Festival-specific collections like Navratri mantras, morning shlokas and peace chants',
    category: 'Personalization',
  },
  {
    icon: '🎙️',
    title: 'Voice Assistant',
    description: 'Ask anything about Sanskrit prosody — your AI guide responds with clarity',
    category: 'AI Intelligence',
  },
  {
    icon: '📡',
    title: 'Live Sessions',
    description: 'Join live chanting workshops, recitation events and community sessions globally',
    category: 'Community',
  },
  {
    icon: '💬',
    title: 'Modern Sanskrit',
    description: 'Create contemporary Sanskrit expressions blending ancient wisdom with modern communication',
    category: 'Innovation',
  },
  {
    icon: '🎬',
    title: 'Video Platform',
    description: 'YouTube-like streaming for Sanskrit educational content, tutorials and cultural programs',
    category: 'Content',
  },
  {
    icon: '📝',
    title: 'Micro-Blogs',
    description: 'Twitter-style posts for sharing interpretations, insights and daily wisdom',
    category: 'Social',
  },
  {
    icon: '👥',
    title: 'Sangha Community',
    description: 'Connect with learners, contribute verified verses and join temple & institution portals',
    category: 'Community',
  },
];

// Sanskrit quotes relevant to SVARAM's mission - prosody, rhythm, learning
const heroShlokas = [
  { text: 'छन्दः पादौ तु वेदस्य', meaning: 'Chandas (meter) is the feet of the Vedas' },
  { text: 'स्वरो वर्णश्च मात्रा च', meaning: 'Svara, Varna and Matra — the essence of sound' },
  { text: 'गुरुलाघवयोगेन छन्दो जायते', meaning: 'From the union of Guru and Laghu, Chandas is born' },
  { text: 'विद्या ददाति विनयम्', meaning: 'Knowledge bestows humility' },
];

const HomePage: React.FC = () => {
  const [currentShloka, setCurrentShloka] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShloka((prev) => (prev + 1) % heroShlokas.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF5E6] text-[#2D1810] relative overflow-hidden">
      {/* Decorative Temple Border Top */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#8B0000] via-[#CD853F] to-[#8B0000]" />
      
      {/* Decorative Rangoli Corners */}
      <div className="absolute top-4 left-4 w-24 h-24 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#8B0000]">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1"/>
          <path d="M50 5 L50 95 M5 50 L95 50 M15 15 L85 85 M85 15 L15 85" stroke="currentColor" strokeWidth="0.5"/>
        </svg>
      </div>
      <div className="absolute top-4 right-4 w-24 h-24 opacity-20 rotate-45">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#8B0000]">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>

      {/* Subtle Paisley Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-paisley-pattern" />

      {/* Header with Temple Arch Design */}
      <header className="relative z-20 py-4 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Decorative Arch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-8 overflow-hidden opacity-30">
            <svg viewBox="0 0 200 30" className="w-full h-full">
              <path d="M0 30 Q50 0 100 0 Q150 0 200 30" fill="none" stroke="#8B0000" strokeWidth="2"/>
              <path d="M20 30 Q60 5 100 5 Q140 5 180 30" fill="none" stroke="#CD853F" strokeWidth="1"/>
            </svg>
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Om Symbol */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B0000] to-[#CD853F] flex items-center justify-center shadow-lg">
                <span className="text-2xl text-[#FDF5E6]">ॐ</span>
              </div>
              <div>
                <h1 className="text-4xl text-[#8B0000] font-samarkan tracking-wider">
                  SVARAM
                </h1>
                <p className="text-xs text-[#CD853F] tracking-widest -mt-1">स्वरम्</p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <Link to="/auth/login">
                <button className="px-5 py-2 text-[#8B0000] border-2 border-[#8B0000] rounded-full hover:bg-[#8B0000] hover:text-[#FDF5E6] transition-all duration-300 font-semibold text-sm font-sans">
                  Sign In
                </button>
              </Link>
              <Link to="/auth/register">
                <button className="px-5 py-2 bg-gradient-to-r from-[#8B0000] to-[#A52A2A] text-[#FDF5E6] rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold text-sm font-sans">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-16 text-center">
        {/* Decorative Lotus Divider */}
        <motion.div 
          className="flex justify-center items-center gap-4 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[#CD853F]" />
          <span className="text-4xl">🪷</span>
          <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[#CD853F]" />
        </motion.div>

        {/* Animated Shloka Carousel */}
        <div className="h-20 mb-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentShloka}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-2xl md:text-3xl text-[#8B0000] font-sanskrit mb-1">
                ॥ {heroShlokas[currentShloka].text} ॥
              </p>
              <p className="text-[#CD853F] italic text-sm">
                "{heroShlokas[currentShloka].meaning}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl mb-2 text-[#2D1810] font-samarkan leading-tight">
            SVARAM
          </h2>
          <p className="text-xl md:text-2xl text-[#5D4037] font-sans font-medium mb-4">
            AI-Powered Sanskrit Learning Ecosystem
          </p>
          <h3 className="text-2xl md:text-3xl lg:text-4xl mb-8 text-[#8B0000] font-sans font-semibold">
            Reviving Rhythmic Sanskrit for the Digital Generation
          </h3>
        </motion.div>

        {/* Decorative Mandala */}
        <motion.div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] -z-10 opacity-[0.04]"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {[...Array(8)].map((_, i) => (
              <g key={i} transform={`rotate(${i * 45} 200 200)`}>
                <ellipse cx="200" cy="80" rx="30" ry="60" fill="none" stroke="#8B0000" strokeWidth="1"/>
                <ellipse cx="200" cy="100" rx="20" ry="40" fill="none" stroke="#8B0000" strokeWidth="0.5"/>
              </g>
            ))}
            <circle cx="200" cy="200" r="150" fill="none" stroke="#8B0000" strokeWidth="1"/>
            <circle cx="200" cy="200" r="100" fill="none" stroke="#8B0000" strokeWidth="0.5"/>
            <circle cx="200" cy="200" r="50" fill="none" stroke="#8B0000" strokeWidth="0.5"/>
          </svg>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-lg md:text-xl text-[#5D4037] max-w-3xl mx-auto mb-10 leading-relaxed font-sans"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          A holistic platform uniting{' '}
          <span className="text-[#8B0000] font-semibold">AI-driven prosody intelligence</span> with{' '}
          <span className="text-[#8B0000] font-semibold">gamified learning</span> — 
          from Chandas identification to real-time karaoke chanting. Aligned with NEP 2020 & Digital India.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link to="/auth/register">
            <button className="group relative px-10 py-4 bg-gradient-to-r from-[#8B0000] via-[#A52A2A] to-[#8B0000] text-[#FDF5E6] rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden font-sans">
              <span className="relative z-10 flex items-center gap-2">
                Start Learning Free
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#CD853F] to-[#DAA520] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </Link>
          <Link to="/auth/login">
            <button className="px-10 py-4 border-2 border-[#8B0000] text-[#8B0000] rounded-full font-semibold text-lg hover:bg-[#8B0000] hover:text-[#FDF5E6] transition-all duration-300 font-sans">
              Explore Platform
            </button>
          </Link>
        </motion.div>

        {/* Stats with Indian Design */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {[
            { number: '10,000+', label: 'Shlokas in Library' },
            { number: '50+', label: 'Expert Gurus' },
            { number: '17', label: 'Platform Features' },
            { number: '4', label: 'Major Dimensions' },
          ].map((stat, index) => (
            <div 
              key={index}
              className="relative p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-[#CD853F]/30 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-3xl md:text-4xl font-bold text-[#8B0000] font-sans">{stat.number}</p>
              <p className="text-[#5D4037] text-sm mt-1 font-sans">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Decorative Temple Pillars Divider */}
      <div className="relative py-8">
        <div className="flex items-center justify-center gap-8">
          <div className="w-4 h-24 bg-gradient-to-b from-[#CD853F] via-[#DAA520] to-[#CD853F] rounded-full opacity-60" />
          <div className="text-center">
            <div className="text-4xl mb-2">🏛️</div>
            <p className="text-[#8B0000] font-sans font-bold text-xl">17 FEATURES</p>
            <p className="text-[#CD853F] text-sm tracking-widest font-sans">Four Major Dimensions</p>
          </div>
          <div className="w-4 h-24 bg-gradient-to-b from-[#CD853F] via-[#DAA520] to-[#CD853F] rounded-full opacity-60" />
        </div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 py-12 px-8 bg-gradient-to-b from-transparent via-[#FFF8DC]/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="group relative"
              >
                <div className="relative h-full p-5 rounded-2xl bg-white border border-[#E8DCC8] shadow-sm hover:shadow-xl hover:border-[#CD853F] transition-all duration-300 overflow-hidden">
                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#CD853F]/20 to-transparent transform rotate-45 translate-x-6 -translate-y-6" />
                  </div>
                  
                  {/* Icon */}
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  
                  {/* Category Badge */}
                  <p className="text-[#CD853F] text-xs font-sans font-medium mb-1 uppercase tracking-wide">{feature.category}</p>
                  
                  {/* Title */}
                  <h4 className="text-lg font-bold text-[#2D1810] mb-2 group-hover:text-[#8B0000] transition-colors font-sans">
                    {feature.title}
                  </h4>
                  
                  {/* Description */}
                  <p className="text-[#5D4037] text-sm leading-relaxed font-sans">
                    {feature.description}
                  </p>
                  
                  {/* Bottom Accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B0000] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action with Temple Design */}
      <section className="relative z-10 py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Temple Top Decoration */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-16">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                <path d="M50 0 L60 20 L90 20 L90 50 L10 50 L10 20 L40 20 Z" fill="#8B0000" opacity="0.1"/>
                <path d="M50 5 L58 20 L85 20 L85 45 L15 45 L15 20 L42 20 Z" fill="none" stroke="#8B0000" strokeWidth="1"/>
              </svg>
            </div>

            <div className="bg-gradient-to-br from-[#FFF8DC] to-[#FAEBD7] border-2 border-[#CD853F] rounded-3xl p-10 md:p-14 text-center shadow-2xl">
              {/* Diya Animation */}
              <motion.div 
                className="text-5xl mb-6"
                animate={{ 
                  filter: ['drop-shadow(0 0 10px #FFD700)', 'drop-shadow(0 0 20px #FFA500)', 'drop-shadow(0 0 10px #FFD700)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🪔
              </motion.div>
              
              <h3 className="text-4xl md:text-5xl text-[#8B0000] mb-4 font-samarkan">
                SVARAM
              </h3>
              <p className="text-xl text-[#2D1810] mb-2 font-sans font-semibold">
                Begin Your Learning Journey Today
              </p>
              
              <p className="text-[#5D4037] mb-8 max-w-2xl mx-auto font-sans">
                Join thousands of learners exploring Sanskrit prosody through AI-powered tools. 
                From Chandas detection to gamified learning — your path starts here.
              </p>

              <Link to="/auth/register">
                <button className="px-12 py-5 bg-gradient-to-r from-[#8B0000] to-[#A52A2A] text-[#FDF5E6] rounded-full font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-sans">
                  Join SVARAM — Free
                </button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-[#5D4037] text-sm font-sans">
                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> No Credit Card Required
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Forever Free Plan
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Instant Access
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer with Cultural Elements */}
      <footer className="relative z-10 py-10 px-8 bg-gradient-to-b from-[#FDF5E6] to-[#F5DEB3] border-t-2 border-[#CD853F]">
        <div className="max-w-7xl mx-auto">
          {/* Decorative Top Border */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-16 bg-gradient-to-r from-transparent to-[#8B0000]" />
              <span className="text-2xl">🪷</span>
              <div className="h-[2px] w-16 bg-gradient-to-l from-transparent to-[#8B0000]" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B0000] to-[#CD853F] flex items-center justify-center">
                <span className="text-lg text-[#FDF5E6]">ॐ</span>
              </div>
              <div>
                <span className="text-2xl text-[#8B0000] font-samarkan">SVARAM</span>
                <p className="text-xs text-[#CD853F] font-sans">Heritage meets Technology</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8 font-sans">
              <a href="#" className="text-[#5D4037] hover:text-[#8B0000] text-sm transition-colors">
                Privacy
              </a>
              <a href="#" className="text-[#5D4037] hover:text-[#8B0000] text-sm transition-colors">
                Terms
              </a>
              <a href="#" className="text-[#5D4037] hover:text-[#8B0000] text-sm transition-colors">
                Contact
              </a>
            </div>
          </div>
          
          {/* Sanskrit Blessing */}
          <div className="text-center mt-8 pt-6 border-t border-[#CD853F]/30">
            <p className="text-[#8B0000] font-sanskrit text-lg mb-1">
              छन्दः पादौ तु वेदस्य
            </p>
            <p className="text-[#5D4037] text-xs italic font-sans">
              "Chandas (meter) is the feet of the Vedas"
            </p>
            <p className="text-[#CD853F] text-xs mt-4 font-sans">
              © 2025 SVARAM • Made with ❤️ in Bharat • Aligned with NEP 2020 & Digital India
            </p>
          </div>
        </div>
      </footer>

      {/* Decorative Temple Border Bottom */}
      <div className="h-3 bg-gradient-to-r from-[#8B0000] via-[#CD853F] to-[#8B0000]" />
    </div>
  );
};

export default HomePage;
