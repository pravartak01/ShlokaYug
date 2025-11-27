import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Plus,
} from 'lucide-react';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [courseData, setCourseData] = useState({
    // Step 1: Basic Information
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    subCategory: '',
    level: 'beginner',
    language: 'sanskrit',

    // Step 2: Pricing & Access
    pricingType: 'free',
    price: '',
    subscriptionPeriod: 'monthly',
    isFree: true,

    // Step 3: Course Content
    learningObjectives: [''],
    prerequisites: [''],
    targetAudience: [''],
    durationHours: 0,
    durationMinutes: 0,

    // Step 4: Additional Details
    tags: [''],
  });

  const categories = [
    { value: 'vedic_chanting', label: 'Vedic Chanting' },
    { value: 'sanskrit_language', label: 'Sanskrit Language' },
    { value: 'philosophy', label: 'Philosophy' },
    { value: 'rituals_ceremonies', label: 'Rituals & Ceremonies' },
    { value: 'yoga_meditation', label: 'Yoga & Meditation' },
    { value: 'ayurveda', label: 'Ayurveda' },
    { value: 'music_arts', label: 'Music & Arts' },
    { value: 'scriptures', label: 'Scriptures' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field, index) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!courseData.title.trim()) {
          setError('Course title is required');
          return false;
        }
        if (courseData.title.trim().length < 10) {
          setError('Title must be at least 10 characters');
          return false;
        }
        if (courseData.title.trim().length > 200) {
          setError('Title must not exceed 200 characters');
          return false;
        }
        if (!courseData.description.trim()) {
          setError('Course description is required');
          return false;
        }
        if (courseData.description.trim().length < 50) {
          setError('Description must be at least 50 characters');
          return false;
        }
        if (courseData.description.trim().length > 5000) {
          setError('Description must not exceed 5000 characters');
          return false;
        }
        if (!courseData.category) {
          setError('Please select a category');
          return false;
        }
        break;

      case 2:
        if (!courseData.isFree) {
          if (!courseData.price) {
            setError('Please enter the course price');
            return false;
          }
          if (parseFloat(courseData.price) < 1) {
            setError('Price must be at least ₹1');
            return false;
          }
          if (parseFloat(courseData.price) > 100000) {
            setError('Price must not exceed ₹100,000');
            return false;
          }
          if (courseData.pricingType === 'subscription' && !courseData.subscriptionPeriod) {
            setError('Please select a subscription period');
            return false;
          }
        }
        break;

      case 3:
        if (courseData.learningObjectives.filter((o) => o.trim()).length === 0) {
          setError('Please add at least one learning objective');
          return false;
        }
        break;

      default:
        break;
    }

    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async (saveAsDraft = false) => {
    if (!saveAsDraft && !validateStep(currentStep)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare payload to match backend validation exactly
      const payload = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        language: courseData.language,
        
        // Duration object with hours and minutes
        duration: {
          hours: parseInt(courseData.durationHours) || 0,
          minutes: parseInt(courseData.durationMinutes) || 0,
        },

        // Pricing structure matching validation
        pricing: {
          type: courseData.isFree ? 'free' : courseData.pricingType,
          amount: courseData.isFree 
            ? 0 
            : parseFloat(courseData.price) || 0,
          currency: 'INR',
        },

        // Learning objectives (not outcomes!)
        learningObjectives: courseData.learningObjectives.filter((o) => o.trim()),
        
        // Prerequisites and target audience as arrays
        prerequisites: courseData.prerequisites.filter((p) => p.trim()),
        targetAudience: courseData.targetAudience.filter((t) => t.trim()),
        
        // Tags
        tags: courseData.tags.filter((t) => t.trim()),

        // Optional fields
        ...(courseData.shortDescription && { shortDescription: courseData.shortDescription }),
        ...(courseData.subCategory && { subCategory: courseData.subCategory }),
      };

      // Add subscription period if needed
      if (courseData.pricingType === 'subscription' && !courseData.isFree) {
        payload.pricing.subscriptionPeriod = courseData.subscriptionPeriod;
      }

      console.log('Submitting course data:', payload);
      const response = await apiService.createCourse(payload);
      
      console.log('Course created successfully:', response.data);
      
      // Extract course ID from response (handle both response.data.course and response.data.data.course)
      const courseId = response.data?.course?._id || response.data?.course?.id || 
                       response.data?.data?.course?._id || response.data?.data?.course?.id;
      
      if (!courseId) {
        console.error('No course ID in response:', response.data);
        throw new Error('Course created but no ID returned');
      }
      
      // Navigate to edit page to add content
      navigate(`/courses/${courseId}/edit`);
    } catch (err) {
      console.error('Error creating course:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create course');
      
      // If there are validation errors, show them
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors
          .map(e => e.msg || e.message)
          .join(', ');
        setError(validationErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'Basic Info' },
      { num: 2, label: 'Pricing' },
      { num: 3, label: 'Content' },
      { num: 4, label: 'Additional' },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step.num
                    ? 'bg-vintage-sepia text-white'
                    : 'bg-vintage-aged text-vintage-ink'
                }`}
              >
                {currentStep > step.num ? <Check size={20} /> : step.num}
              </div>
              <p className="vintage-text-sm mt-2">{step.label}</p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  currentStep > step.num ? 'bg-vintage-sepia' : 'bg-vintage-aged'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="vintage-label">
          Course Title <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={courseData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="e.g., Vedic Prosody Fundamentals"
          className="vintage-input w-full"
        />
        <p className="vintage-text-sm mt-1">
          {courseData.title.length}/200 characters (minimum 10)
        </p>
      </div>

      <div>
        <label className="vintage-label">
          Description <span className="text-red-600">*</span>
        </label>
        <textarea
          value={courseData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Provide a comprehensive description of your course..."
          rows={5}
          className="vintage-input w-full"
        />
        <p className="vintage-text-sm mt-1">
          {courseData.description.length}/5000 characters (minimum 50)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="vintage-label">
            Category <span className="text-red-600">*</span>
          </label>
          <select
            value={courseData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="vintage-input w-full"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="vintage-label">Difficulty Level</label>
          <select
            value={courseData.level}
            onChange={(e) => handleInputChange('level', e.target.value)}
            className="vintage-input w-full"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="vintage-label">Language</label>
          <select
            value={courseData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="vintage-input w-full"
          >
            <option value="sanskrit">Sanskrit</option>
            <option value="hindi">Hindi</option>
            <option value="english">English</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <div>
          <label className="vintage-label">Sub Category (Optional)</label>
          <input
            type="text"
            value={courseData.subCategory}
            onChange={(e) => handleInputChange('subCategory', e.target.value)}
            placeholder="e.g., Rigveda Prosody"
            className="vintage-input w-full"
            maxLength={100}
          />
        </div>
      </div>

      <div>
        <label className="vintage-label">Short Description (Optional)</label>
        <textarea
          value={courseData.shortDescription}
          onChange={(e) => handleInputChange('shortDescription', e.target.value)}
          placeholder="A brief summary of your course (max 300 characters)"
          rows={2}
          className="vintage-input w-full"
          maxLength={300}
        />
        <p className="vintage-text-sm mt-1">
          {courseData.shortDescription?.length || 0}/300 characters
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="vintage-card p-6">
        <h3 className="vintage-heading text-lg mb-4">Pricing Options</h3>

        <div className="mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={courseData.isFree}
              onChange={(e) => {
                handleInputChange('isFree', e.target.checked);
                if (e.target.checked) {
                  handleInputChange('pricingType', 'free');
                }
              }}
              className="w-5 h-5 text-vintage-sepia border-vintage-ink rounded focus:ring-vintage-sepia"
            />
            <span className="vintage-label">This is a free course</span>
          </label>
        </div>

        {!courseData.isFree && (
          <>
            <div className="mb-6">
              <label className="vintage-label">Pricing Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <label className="vintage-card p-4 cursor-pointer border-2 hover:border-vintage-sepia transition-colors">
                  <input
                    type="radio"
                    name="pricingType"
                    value="one_time"
                    checked={courseData.pricingType === 'one_time'}
                    onChange={(e) => handleInputChange('pricingType', e.target.value)}
                    className="mr-3"
                  />
                  <span className="vintage-text">One-time Payment</span>
                </label>

                <label className="vintage-card p-4 cursor-pointer border-2 hover:border-vintage-sepia transition-colors">
                  <input
                    type="radio"
                    name="pricingType"
                    value="subscription"
                    checked={courseData.pricingType === 'subscription'}
                    onChange={(e) => handleInputChange('pricingType', e.target.value)}
                    className="mr-3"
                  />
                  <span className="vintage-text">Subscription</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="vintage-label">
                  Price (₹) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={courseData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  max="100000"
                  className="vintage-input w-full"
                />
                <p className="vintage-text-sm mt-1">
                  Amount must be between ₹1 and ₹100,000
                </p>
              </div>

              {courseData.pricingType === 'subscription' && (
                <div>
                  <label className="vintage-label">
                    Subscription Period <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={courseData.subscriptionPeriod}
                    onChange={(e) => handleInputChange('subscriptionPeriod', e.target.value)}
                    className="vintage-input w-full"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="vintage-label mb-2 block">
          Learning Objectives <span className="text-red-600">*</span>
        </label>
        <p className="vintage-text-sm mb-4">
          What will students learn from this course? (Maximum 20)
        </p>
        {courseData.learningObjectives.map((outcome, index) => (
          <div key={index} className="flex gap-2 mb-3">
            <input
              type="text"
              value={outcome}
              onChange={(e) =>
                handleArrayChange('learningObjectives', index, e.target.value)
              }
              placeholder={`Learning objective ${index + 1}`}
              className="vintage-input flex-1"
            />
            {courseData.learningObjectives.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('learningObjectives', index)}
                className="vintage-btn-secondary px-3"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        {courseData.learningObjectives.length < 20 && (
          <button
            type="button"
            onClick={() => addArrayItem('learningObjectives')}
            className="vintage-btn-secondary"
          >
            <Plus size={16} className="mr-2" />
            Add Learning Objective
          </button>
        )}
      </div>

      <div>
        <label className="vintage-label mb-2 block">Prerequisites (Optional)</label>
        <p className="vintage-text-sm mb-4">
          What should students know before taking this course?
        </p>
        {courseData.prerequisites.map((prereq, index) => (
          <div key={index} className="flex gap-2 mb-3">
            <input
              type="text"
              value={prereq}
              onChange={(e) =>
                handleArrayChange('prerequisites', index, e.target.value)
              }
              placeholder={`Prerequisite ${index + 1}`}
              className="vintage-input flex-1"
            />
            {courseData.prerequisites.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('prerequisites', index)}
                className="vintage-btn-secondary px-3"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('prerequisites')}
          className="vintage-btn-secondary"
        >
          <Plus size={16} className="mr-2" />
          Add Prerequisite
        </button>
      </div>

      <div>
        <label className="vintage-label mb-2 block">Target Audience (Optional)</label>
        <p className="vintage-text-sm mb-4">
          Who is this course designed for?
        </p>
        {courseData.targetAudience.map((audience, index) => (
          <div key={index} className="flex gap-2 mb-3">
            <input
              type="text"
              value={audience}
              onChange={(e) =>
                handleArrayChange('targetAudience', index, e.target.value)
              }
              placeholder={`Target audience ${index + 1}`}
              className="vintage-input flex-1"
            />
            {courseData.targetAudience.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('targetAudience', index)}
                className="vintage-btn-secondary px-3"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('targetAudience')}
          className="vintage-btn-secondary"
        >
          <Plus size={16} className="mr-2" />
          Add Target Audience
        </button>
      </div>

      <div>
        <label className="vintage-label mb-2 block">Course Duration</label>
        <p className="vintage-text-sm mb-4">
          Estimated time to complete the course
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="vintage-label">Hours</label>
            <input
              type="number"
              value={courseData.durationHours}
              onChange={(e) => handleInputChange('durationHours', e.target.value)}
              placeholder="0"
              min="0"
              max="1000"
              className="vintage-input w-full"
            />
          </div>
          <div>
            <label className="vintage-label">Minutes</label>
            <input
              type="number"
              value={courseData.durationMinutes}
              onChange={(e) => handleInputChange('durationMinutes', e.target.value)}
              placeholder="0"
              min="0"
              max="59"
              className="vintage-input w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="vintage-label mb-2 block">Tags (Optional)</label>
        <p className="vintage-text-sm mb-4">
          Add tags to help students find your course (Maximum 10, 2-30 characters each)
        </p>
        {courseData.tags.map((tag, index) => (
          <div key={index} className="flex gap-2 mb-3">
            <input
              type="text"
              value={tag}
              onChange={(e) => handleArrayChange('tags', index, e.target.value)}
              placeholder={`Tag ${index + 1}`}
              className="vintage-input flex-1"
              minLength={2}
              maxLength={30}
            />
            {courseData.tags.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('tags', index)}
                className="vintage-btn-secondary px-3"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        {courseData.tags.length < 10 && (
          <button
            type="button"
            onClick={() => addArrayItem('tags')}
            className="vintage-btn-secondary"
          >
            <Plus size={16} className="mr-2" />
            Add Tag
          </button>
        )}
      </div>

      <div className="vintage-card p-6 bg-vintage-aged/30">
        <h3 className="vintage-heading text-lg mb-4">Review Your Course</h3>
        <div className="space-y-3 vintage-text-sm">
          <p>
            <strong>Title:</strong> {courseData.title || 'Not set'}
          </p>
          <p>
            <strong>Category:</strong>{' '}
            {categories.find((c) => c.value === courseData.category)?.label || 'Not set'}
          </p>
          <p>
            <strong>Level:</strong> {courseData.level || 'Not set'}
          </p>
          <p>
            <strong>Language:</strong> {courseData.language || 'Not set'}
          </p>
          <p>
            <strong>Pricing:</strong>{' '}
            {courseData.isFree
              ? 'Free'
              : `₹${courseData.price} (${courseData.pricingType === 'one_time' ? 'One-time' : `Subscription - ${courseData.subscriptionPeriod}`})`}
          </p>
          <p>
            <strong>Duration:</strong> {courseData.durationHours}h {courseData.durationMinutes}m
          </p>
          <p>
            <strong>Learning Objectives:</strong>{' '}
            {courseData.learningObjectives.filter((o) => o.trim()).length}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen vintage-paper">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="vintage-om text-5xl mb-4">ॐ</div>
          <h1 className="vintage-heading vintage-heading-lg mb-2">Create New Course</h1>
          <p className="vintage-text">Share your knowledge and inspire learners</p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Error Display */}
        {error && (
          <div className="vintage-alert vintage-alert-error mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="vintage-card p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-vintage-aged">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="vintage-btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} />
              Previous
            </button>

            <div className="flex gap-3">
              {currentStep === 4 ? (
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  className="vintage-btn flex items-center gap-2"
                >
                  {loading ? 'Creating...' : 'Create Course'}
                  {!loading && <Check size={20} />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="vintage-btn flex items-center gap-2"
                >
                  Next
                  <ArrowRight size={20} />
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
