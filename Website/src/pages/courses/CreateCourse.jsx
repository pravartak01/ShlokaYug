import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Plus,
  BookOpen,
  DollarSign,
  Target,
  Tag,
  Upload,
  Image as ImageIcon,
  Sparkles,
  GraduationCap,
  Clock,
  Users,
  Globe,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Info,
  Trash2,
  Loader2,
  FileText,
  Lightbulb,
  Award,
  Zap,
} from 'lucide-react';

const CreateCourse = () => {
  const navigate = useNavigate();
  const thumbnailInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    subCategory: '',
    level: 'beginner',
    language: 'sanskrit',
    pricingType: 'free',
    price: '',
    subscriptionPeriod: 'monthly',
    isFree: true,
    learningObjectives: [''],
    prerequisites: [''],
    targetAudience: [''],
    durationHours: 0,
    durationMinutes: 0,
    tags: [''],
  });

  const categories = [
    { value: 'vedic_chanting', label: 'Vedic Chanting', icon: '🕉️' },
    { value: 'sanskrit_language', label: 'Sanskrit Language', icon: '📖' },
    { value: 'philosophy', label: 'Philosophy', icon: '🧘' },
    { value: 'rituals_ceremonies', label: 'Rituals & Ceremonies', icon: '🪔' },
    { value: 'yoga_meditation', label: 'Yoga & Meditation', icon: '🧘‍♀️' },
    { value: 'ayurveda', label: 'Ayurveda', icon: '🌿' },
    { value: 'music_arts', label: 'Music & Arts', icon: '🎵' },
    { value: 'scriptures', label: 'Scriptures', icon: '📜' },
    { value: 'other', label: 'Other', icon: '✨' },
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner', description: 'No prior knowledge needed', icon: Zap },
    { value: 'intermediate', label: 'Intermediate', description: 'Some basics required', icon: BarChart3 },
    { value: 'advanced', label: 'Advanced', description: 'Strong foundation needed', icon: Award },
    { value: 'expert', label: 'Expert', description: 'For professionals', icon: GraduationCap },
  ];

  const languages = [
    { value: 'sanskrit', label: 'Sanskrit', flag: '🇮🇳' },
    { value: 'hindi', label: 'Hindi', flag: '🇮🇳' },
    { value: 'english', label: 'English', flag: '🇬🇧' },
    { value: 'mixed', label: 'Mixed', flag: '🌐' },
  ];

  const handleInputChange = (field, value) => {
    setCourseData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field) => {
    setCourseData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field, index) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Thumbnail must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!courseData.title.trim()) { setError('Course title is required'); return false; }
        if (courseData.title.trim().length < 10) { setError('Title must be at least 10 characters'); return false; }
        if (!courseData.description.trim()) { setError('Course description is required'); return false; }
        if (courseData.description.trim().length < 50) { setError('Description must be at least 50 characters'); return false; }
        if (!courseData.category) { setError('Please select a category'); return false; }
        break;
      case 2:
        if (!courseData.isFree && !courseData.price) { setError('Please enter the course price'); return false; }
        if (!courseData.isFree && parseFloat(courseData.price) < 1) { setError('Price must be at least ₹1'); return false; }
        break;
      case 3:
        if (courseData.learningObjectives.filter((o) => o.trim()).length === 0) {
          setError('Please add at least one learning objective'); return false;
        }
        break;
      default: break;
    }
    setError(null);
    return true;
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(prev + 1, 4)); };
  const prevStep = () => { setCurrentStep((prev) => Math.max(prev - 1, 1)); setError(null); };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    try {
      setLoading(true);
      setError(null);
      const payload = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        language: courseData.language,
        duration: { hours: parseInt(courseData.durationHours) || 0, minutes: parseInt(courseData.durationMinutes) || 0 },
        pricing: courseData.isFree
          ? { type: 'free', amount: 0, currency: 'INR' }
          : courseData.pricingType === 'one_time'
          ? { type: 'one_time', currency: 'INR', oneTime: { amount: parseFloat(courseData.price) || 0 } }
          : { type: 'subscription', currency: 'INR', subscription: { monthly: { amount: parseFloat(courseData.price) || 0 }, subscriptionPeriod: courseData.subscriptionPeriod } },
        learningObjectives: courseData.learningObjectives.filter((o) => o.trim()),
        prerequisites: courseData.prerequisites.filter((p) => p.trim()),
        targetAudience: courseData.targetAudience.filter((t) => t.trim()),
        tags: courseData.tags.filter((t) => t.trim()),
        ...(courseData.shortDescription && { shortDescription: courseData.shortDescription }),
        ...(courseData.subCategory && { subCategory: courseData.subCategory }),
      };
      const response = await apiService.createCourse(payload);
      const courseId = response.data?.course?._id || response.data?.course?.id || response.data?.data?.course?._id;
      if (thumbnailFile && courseId) {
        const formData = new FormData();
        formData.append('thumbnail', thumbnailFile);
        try { await apiService.uploadCourseThumbnail(courseId, formData); } catch (e) { console.warn('Thumbnail upload failed:', e); }
      }
      navigate(`/courses/${courseId}/edit`);
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Basic Info', icon: BookOpen, description: 'Course details' },
    { num: 2, label: 'Pricing', icon: DollarSign, description: 'Set your price' },
    { num: 3, label: 'Content', icon: Target, description: 'Learning goals' },
    { num: 4, label: 'Finish', icon: Tag, description: 'Tags & review' },
  ];

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="hidden md:flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: currentStep === step.num ? 1.1 : 1 }}
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${
                  currentStep > step.num ? 'bg-linear-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-200'
                    : currentStep === step.num ? 'bg-linear-to-br from-sandalwood-500 to-sandalwood-600 text-white shadow-lg shadow-sandalwood-200'
                    : 'bg-sandalwood-100 text-sandalwood-400'
                }`}
              >
                {currentStep > step.num ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
              </motion.div>
              <p className={`text-sm font-medium mt-2 ${currentStep >= step.num ? 'text-sandalwood-900' : 'text-sandalwood-400'}`}>{step.label}</p>
              <p className="text-xs text-sandalwood-500">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 relative">
                <div className="h-1 bg-sandalwood-100 rounded-full">
                  <motion.div className="h-full bg-linear-to-r from-sandalwood-500 to-sandalwood-600 rounded-full" initial={{ width: '0%' }} animate={{ width: currentStep > step.num ? '100%' : '0%' }} transition={{ duration: 0.3 }} />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="md:hidden flex items-center justify-center gap-2">
        {steps.map((step) => (
          <div key={step.num} className={`w-3 h-3 rounded-full transition-all ${currentStep >= step.num ? 'bg-sandalwood-500 scale-110' : 'bg-sandalwood-200'}`} />
        ))}
        <span className="ml-3 text-sm font-medium text-sandalwood-700">Step {currentStep} of 4</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      {/* Thumbnail Upload */}
      <div className="bg-sandalwood-50 rounded-2xl p-6 border-2 border-dashed border-sandalwood-200">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-shrink-0">
            {thumbnailPreview ? (
              <div className="relative group">
                <img src={thumbnailPreview} alt="Thumbnail" className="w-40 h-24 object-cover rounded-xl shadow-md" />
                <button type="button" onClick={removeThumbnail} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div onClick={() => thumbnailInputRef.current?.click()} className="w-40 h-24 bg-sandalwood-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-sandalwood-200 transition-colors border border-sandalwood-200">
                <ImageIcon className="w-8 h-8 text-sandalwood-400 mb-1" />
                <span className="text-xs text-sandalwood-500">Add Thumbnail</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sandalwood-900 mb-1 flex items-center gap-2"><Upload className="w-4 h-4" />Course Thumbnail</h3>
            <p className="text-sm text-sandalwood-600 mb-3">Upload an eye-catching thumbnail. Recommended: 1280x720px, max 5MB.</p>
            <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
            <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="px-4 py-2 bg-white border border-sandalwood-300 rounded-xl text-sm font-medium text-sandalwood-700 hover:bg-sandalwood-50 transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />{thumbnailPreview ? 'Change Image' : 'Upload Image'}
            </button>
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-2"><FileText className="w-4 h-4 text-sandalwood-600" />Course Title <span className="text-red-500">*</span></label>
        <input type="text" value={courseData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="e.g., Vedic Prosody Fundamentals - A Complete Guide" className="w-full px-4 py-3 bg-white border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 transition-all" />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-sandalwood-500 flex items-center gap-1"><Info className="w-3 h-3" />Minimum 10 characters</p>
          <span className={`text-xs font-medium ${courseData.title.length >= 10 ? 'text-green-600' : 'text-sandalwood-400'}`}>{courseData.title.length}/200</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-2"><FileText className="w-4 h-4 text-sandalwood-600" />Description <span className="text-red-500">*</span></label>
        <textarea value={courseData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Provide a comprehensive description of your course..." rows={5} className="w-full px-4 py-3 bg-white border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 transition-all resize-none" />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-sandalwood-500">Minimum 50 characters</p>
          <span className={`text-xs font-medium ${courseData.description.length >= 50 ? 'text-green-600' : 'text-sandalwood-400'}`}>{courseData.description.length}/5000</span>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-3"><Tag className="w-4 h-4 text-sandalwood-600" />Category <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button key={cat.value} type="button" onClick={() => handleInputChange('category', cat.value)} className={`p-4 rounded-xl border-2 text-left transition-all ${courseData.category === cat.value ? 'border-sandalwood-500 bg-sandalwood-50 shadow-md' : 'border-sandalwood-100 bg-white hover:border-sandalwood-200 hover:bg-sandalwood-50'}`}>
              <span className="text-2xl mb-2 block">{cat.icon}</span>
              <span className={`text-sm font-medium ${courseData.category === cat.value ? 'text-sandalwood-900' : 'text-sandalwood-700'}`}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Level & Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-3"><BarChart3 className="w-4 h-4 text-sandalwood-600" />Difficulty Level</label>
          <div className="space-y-2">
            {levels.map((level) => (
              <button key={level.value} type="button" onClick={() => handleInputChange('level', level.value)} className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${courseData.level === level.value ? 'border-sandalwood-500 bg-sandalwood-50' : 'border-sandalwood-100 bg-white hover:border-sandalwood-200'}`}>
                <level.icon className={`w-5 h-5 ${courseData.level === level.value ? 'text-sandalwood-600' : 'text-sandalwood-400'}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${courseData.level === level.value ? 'text-sandalwood-900' : 'text-sandalwood-700'}`}>{level.label}</p>
                  <p className="text-xs text-sandalwood-500">{level.description}</p>
                </div>
                {courseData.level === level.value && <CheckCircle2 className="w-5 h-5 text-sandalwood-600 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-3"><Globe className="w-4 h-4 text-sandalwood-600" />Language</label>
          <div className="space-y-2">
            {languages.map((lang) => (
              <button key={lang.value} type="button" onClick={() => handleInputChange('language', lang.value)} className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${courseData.language === lang.value ? 'border-sandalwood-500 bg-sandalwood-50' : 'border-sandalwood-100 bg-white hover:border-sandalwood-200'}`}>
                <span className="text-xl">{lang.flag}</span>
                <span className={`text-sm font-medium ${courseData.language === lang.value ? 'text-sandalwood-900' : 'text-sandalwood-700'}`}>{lang.label}</span>
                {courseData.language === lang.value && <CheckCircle2 className="w-5 h-5 text-sandalwood-600 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Short Description */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-2"><Sparkles className="w-4 h-4 text-sandalwood-600" />Short Description <span className="text-xs text-sandalwood-400 font-normal">(Optional)</span></label>
        <textarea value={courseData.shortDescription} onChange={(e) => handleInputChange('shortDescription', e.target.value)} placeholder="A brief summary shown in course cards" rows={2} maxLength={300} className="w-full px-4 py-3 bg-white border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 transition-all resize-none" />
        <p className="text-xs text-sandalwood-500 mt-1 text-right">{courseData.shortDescription?.length || 0}/300</p>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      {/* Free Toggle */}
      <div className="bg-linear-to-br from-sandalwood-50 to-sandalwood-100 rounded-2xl p-6 border border-sandalwood-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sandalwood-900 text-lg">Free Course</h3>
              <p className="text-sm text-sandalwood-600">Make this course freely available to all</p>
            </div>
          </div>
          <button type="button" onClick={() => { handleInputChange('isFree', !courseData.isFree); if (!courseData.isFree) handleInputChange('pricingType', 'free'); }} className={`relative w-14 h-8 rounded-full transition-colors ${courseData.isFree ? 'bg-green-500' : 'bg-sandalwood-300'}`}>
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${courseData.isFree ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!courseData.isFree && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
            {/* Pricing Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-3"><DollarSign className="w-4 h-4 text-sandalwood-600" />Pricing Model</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{ value: 'one_time', label: 'One-time Payment', desc: 'Pay once, lifetime access', icon: DollarSign }, { value: 'subscription', label: 'Subscription', desc: 'Recurring payment', icon: Clock }].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => handleInputChange('pricingType', opt.value)} className={`p-5 rounded-2xl border-2 text-left transition-all ${courseData.pricingType === opt.value ? 'border-sandalwood-500 bg-sandalwood-50 shadow-md' : 'border-sandalwood-100 bg-white hover:border-sandalwood-200'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${courseData.pricingType === opt.value ? 'bg-sandalwood-500 text-white' : 'bg-sandalwood-100 text-sandalwood-500'}`}>
                        <opt.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sandalwood-900">{opt.label}</h4>
                        <p className="text-sm text-sandalwood-600 mt-1">{opt.desc}</p>
                      </div>
                      {courseData.pricingType === opt.value && <CheckCircle2 className="w-6 h-6 text-sandalwood-600 ml-auto flex-shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-2">Price (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sandalwood-500 font-semibold">₹</span>
                  <input type="number" value={courseData.price} onChange={(e) => handleInputChange('price', e.target.value)} placeholder="0" min="1" max="100000" className="w-full pl-10 pr-4 py-3 bg-white border border-sandalwood-200 rounded-xl text-sandalwood-900 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 transition-all text-lg font-semibold" />
                </div>
                <p className="text-xs text-sandalwood-500 mt-2">Range: ₹1 - ₹1,00,000</p>
              </div>
              {courseData.pricingType === 'subscription' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-2">Billing Period</label>
                  <div className="flex gap-2">
                    {['monthly', 'quarterly', 'yearly'].map((period) => (
                      <button key={period} type="button" onClick={() => handleInputChange('subscriptionPeriod', period)} className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${courseData.subscriptionPeriod === period ? 'border-sandalwood-500 bg-sandalwood-50 text-sandalwood-900' : 'border-sandalwood-100 bg-white text-sandalwood-600 hover:border-sandalwood-200'}`}>
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Preview */}
      <div className="bg-sandalwood-900 text-white rounded-2xl p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-saffron-400" />Pricing Preview</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{courseData.isFree ? 'FREE' : `₹${courseData.price || 0}`}</span>
          {!courseData.isFree && courseData.pricingType === 'subscription' && <span className="text-sandalwood-300">/{courseData.subscriptionPeriod}</span>}
        </div>
        <p className="text-sandalwood-300 text-sm mt-2">{courseData.isFree ? 'Students can access this course at no cost' : courseData.pricingType === 'one_time' ? 'One-time payment, lifetime access' : `Billed ${courseData.subscriptionPeriod}`}</p>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      {/* Learning Objectives */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900"><Target className="w-4 h-4 text-sandalwood-600" />Learning Objectives <span className="text-red-500">*</span></label>
            <p className="text-xs text-sandalwood-500 mt-1">What will students learn?</p>
          </div>
          <span className="text-xs font-medium text-sandalwood-600 bg-sandalwood-100 px-3 py-1 rounded-full">{courseData.learningObjectives.filter((o) => o.trim()).length}/20</span>
        </div>
        <div className="space-y-3">
          {courseData.learningObjectives.map((obj, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-sandalwood-100 flex items-center justify-center text-sm font-semibold text-sandalwood-600 flex-shrink-0">{i + 1}</div>
              <input type="text" value={obj} onChange={(e) => handleArrayChange('learningObjectives', i, e.target.value)} placeholder={`Learning objective ${i + 1}`} className="flex-1 px-4 py-3 bg-white border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 transition-all" />
              {courseData.learningObjectives.length > 1 && <button type="button" onClick={() => removeArrayItem('learningObjectives', i)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5" /></button>}
            </div>
          ))}
        </div>
        {courseData.learningObjectives.length < 20 && <button type="button" onClick={() => addArrayItem('learningObjectives')} className="mt-3 px-4 py-2 rounded-xl border-2 border-dashed border-sandalwood-300 text-sandalwood-600 text-sm font-medium hover:bg-sandalwood-50 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Add Learning Objective</button>}
      </div>

      {/* Prerequisites */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-4"><Lightbulb className="w-4 h-4 text-sandalwood-600" />Prerequisites <span className="text-xs text-sandalwood-400 font-normal">(Optional)</span></label>
        <div className="space-y-3">
          {courseData.prerequisites.map((prereq, i) => (
            <div key={i} className="flex gap-3 items-center">
              <CheckCircle2 className="w-5 h-5 text-sandalwood-400 flex-shrink-0" />
              <input type="text" value={prereq} onChange={(e) => handleArrayChange('prerequisites', i, e.target.value)} placeholder={`Prerequisite ${i + 1}`} className="flex-1 px-4 py-3 bg-white border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 transition-all" />
              {courseData.prerequisites.length > 1 && <button type="button" onClick={() => removeArrayItem('prerequisites', i)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5" /></button>}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addArrayItem('prerequisites')} className="mt-3 px-4 py-2 rounded-xl border-2 border-dashed border-sandalwood-300 text-sandalwood-600 text-sm font-medium hover:bg-sandalwood-50 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Add Prerequisite</button>
      </div>

      {/* Target Audience */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-4"><Users className="w-4 h-4 text-sandalwood-600" />Target Audience <span className="text-xs text-sandalwood-400 font-normal">(Optional)</span></label>
        <div className="space-y-3">
          {courseData.targetAudience.map((aud, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Users className="w-5 h-5 text-sandalwood-400 flex-shrink-0" />
              <input type="text" value={aud} onChange={(e) => handleArrayChange('targetAudience', i, e.target.value)} placeholder={`Target audience ${i + 1}`} className="flex-1 px-4 py-3 bg-white border border-sandalwood-200 rounded-xl text-sandalwood-900 placeholder-sandalwood-400 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 transition-all" />
              {courseData.targetAudience.length > 1 && <button type="button" onClick={() => removeArrayItem('targetAudience', i)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5" /></button>}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addArrayItem('targetAudience')} className="mt-3 px-4 py-2 rounded-xl border-2 border-dashed border-sandalwood-300 text-sandalwood-600 text-sm font-medium hover:bg-sandalwood-50 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Add Target Audience</button>
      </div>

      {/* Duration */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900 mb-3"><Clock className="w-4 h-4 text-sandalwood-600" />Estimated Duration</label>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input type="number" value={courseData.durationHours} onChange={(e) => handleInputChange('durationHours', e.target.value)} placeholder="0" min="0" className="w-full px-4 py-3 bg-white border border-sandalwood-200 rounded-xl text-sandalwood-900 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 transition-all text-center text-lg font-semibold" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-sandalwood-500">hours</span>
          </div>
          <div className="flex-1 relative">
            <input type="number" value={courseData.durationMinutes} onChange={(e) => handleInputChange('durationMinutes', e.target.value)} placeholder="0" min="0" max="59" className="w-full px-4 py-3 bg-white border border-sandalwood-200 rounded-xl text-sandalwood-900 focus:outline-none focus:ring-2 focus:ring-sandalwood-500/20 focus:border-sandalwood-400 transition-all text-center text-lg font-semibold" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-sandalwood-500">mins</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-sandalwood-900"><Tag className="w-4 h-4 text-sandalwood-600" />Tags <span className="text-xs text-sandalwood-400 font-normal">(Optional)</span></label>
          <span className="text-xs font-medium text-sandalwood-600 bg-sandalwood-100 px-3 py-1 rounded-full">{courseData.tags.filter((t) => t.trim()).length}/10</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {courseData.tags.map((tag, i) => (
            <div key={i} className="flex items-center gap-2 bg-sandalwood-50 rounded-full pl-4 pr-2 py-2 border border-sandalwood-200">
              <input type="text" value={tag} onChange={(e) => handleArrayChange('tags', i, e.target.value)} placeholder="Tag" maxLength={30} className="bg-transparent border-none outline-none text-sm text-sandalwood-800 w-24" />
              {courseData.tags.length > 1 && <button type="button" onClick={() => removeArrayItem('tags', i)} className="w-6 h-6 rounded-full bg-sandalwood-200 text-sandalwood-600 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>}
            </div>
          ))}
          {courseData.tags.length < 10 && <button type="button" onClick={() => addArrayItem('tags')} className="px-4 py-2 rounded-full border-2 border-dashed border-sandalwood-300 text-sandalwood-600 text-sm font-medium hover:bg-sandalwood-50 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Add Tag</button>}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-linear-to-br from-sandalwood-50 to-sandalwood-100 rounded-2xl p-6 border border-sandalwood-200">
        <h3 className="font-semibold text-sandalwood-900 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-sandalwood-600" />Course Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {thumbnailPreview && <div className="md:col-span-2"><img src={thumbnailPreview} alt="Thumbnail" className="w-full h-48 object-cover rounded-xl shadow-md" /></div>}
          {[
            { icon: BookOpen, label: 'Title', value: courseData.title || 'Not set' },
            { icon: Tag, label: 'Category', value: categories.find((c) => c.value === courseData.category)?.label || 'Not set' },
            { icon: BarChart3, label: 'Level', value: courseData.level },
            { icon: Globe, label: 'Language', value: courseData.language },
            { icon: DollarSign, label: 'Pricing', value: courseData.isFree ? 'Free' : `₹${courseData.price}` },
            { icon: Clock, label: 'Duration', value: `${courseData.durationHours}h ${courseData.durationMinutes}m` },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-sandalwood-500" />
              <div>
                <p className="text-xs text-sandalwood-500">{item.label}</p>
                <p className="font-medium text-sandalwood-900 capitalize">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
        <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-900">What's Next?</h4>
          <p className="text-sm text-amber-700 mt-1">After creating, you'll add units, lessons, and lectures.</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#faf5f0]">
      <header className="bg-white border-b border-sandalwood-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/courses" className="w-10 h-10 rounded-xl bg-sandalwood-100 flex items-center justify-center hover:bg-sandalwood-200 transition-colors">
                <ArrowLeft className="w-5 h-5 text-sandalwood-700" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-sandalwood-900">Create New Course</h1>
                <p className="text-sm text-sandalwood-500">Share your knowledge with the world</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-sandalwood-500">
              <Sparkles className="w-4 h-4 text-saffron-500" />Step {currentStep} of 4
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepIndicator()}

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto"><X className="w-5 h-5 text-red-400 hover:text-red-600" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-3xl shadow-xl border border-sandalwood-100 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-sandalwood-100">
            <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-6 py-3 rounded-xl border border-sandalwood-200 text-sandalwood-700 font-medium hover:bg-sandalwood-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex items-center gap-3">
              {currentStep === 4 ? (
                <button type="button" onClick={handleSubmit} disabled={loading} className="px-8 py-3 rounded-xl bg-linear-to-r from-sandalwood-500 to-sandalwood-600 text-white font-semibold hover:from-sandalwood-600 hover:to-sandalwood-700 transition-all shadow-lg shadow-sandalwood-200 disabled:opacity-50 flex items-center gap-2">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Creating...</> : <><Check className="w-5 h-5" />Create Course</>}
                </button>
              ) : (
                <button type="button" onClick={nextStep} className="px-8 py-3 rounded-xl bg-linear-to-r from-sandalwood-500 to-sandalwood-600 text-white font-semibold hover:from-sandalwood-600 hover:to-sandalwood-700 transition-all shadow-lg shadow-sandalwood-200 flex items-center gap-2">
                  <span className="hidden sm:inline">Continue</span><ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
