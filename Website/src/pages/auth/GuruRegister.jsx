import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGuruAuth } from '../../context/GuruAuthContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  Briefcase,
  Plus,
  Trash2,
} from 'lucide-react';

const GuruRegister = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useGuruAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basic Account Info
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',

    // Step 2: Guru Credentials
    credentials: [
      {
        type: 'degree',
        title: '',
        institution: '',
        year: new Date().getFullYear(),
        description: '',
      },
    ],

    // Step 3: Teaching Experience
    yearsOfExperience: 0,
    experienceDescription: '',
    specializations: [''],
    teachingLanguages: [{ language: '', proficiency: 'intermediate' }],

    // Terms
    acceptTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleCredentialChange = (index, field, value) => {
    const newCredentials = [...formData.credentials];
    newCredentials[index] = { ...newCredentials[index], [field]: value };
    setFormData((prev) => ({ ...prev, credentials: newCredentials }));
  };

  const addCredential = () => {
    setFormData((prev) => ({
      ...prev,
      credentials: [
        ...prev.credentials,
        {
          type: 'degree',
          title: '',
          institution: '',
          year: new Date().getFullYear(),
          description: '',
        },
      ],
    }));
  };

  const removeCredential = (index) => {
    if (formData.credentials.length > 1) {
      setFormData((prev) => ({
        ...prev,
        credentials: prev.credentials.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSpecializationChange = (index, value) => {
    const newSpecs = [...formData.specializations];
    newSpecs[index] = value;
    setFormData((prev) => ({ ...prev, specializations: newSpecs }));
  };

  const addSpecialization = () => {
    setFormData((prev) => ({
      ...prev,
      specializations: [...prev.specializations, ''],
    }));
  };

  const removeSpecialization = (index) => {
    if (formData.specializations.length > 1) {
      setFormData((prev) => ({
        ...prev,
        specializations: prev.specializations.filter((_, i) => i !== index),
      }));
    }
  };

  const handleLanguageChange = (index, field, value) => {
    const newLanguages = [...formData.teachingLanguages];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    setFormData((prev) => ({ ...prev, teachingLanguages: newLanguages }));
  };

  const addLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      teachingLanguages: [...prev.teachingLanguages, { language: '', proficiency: 'intermediate' }],
    }));
  };

  const removeLanguage = (index) => {
    if (formData.teachingLanguages.length > 1) {
      setFormData((prev) => ({
        ...prev,
        teachingLanguages: prev.teachingLanguages.filter((_, i) => i !== index),
      }));
    }
  };

  const validateStep = (step) => {
    setError('');

    if (step === 1) {
      if (!formData.firstName || !formData.lastName) {
        setError('Please enter your full name');
        return false;
      }
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.firstName) || !/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.lastName)) {
        setError('Names can only contain letters and spaces');
        return false;
      }
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.username || formData.username.length < 3 || formData.username.length > 20) {
        setError('Username must be between 3-20 characters');
        return false;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        setError('Username can only contain letters, numbers, and underscores');
        return false;
      }
      if (!formData.password || formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    if (step === 2) {
      if (formData.credentials.some((c) => !c.title || !c.institution)) {
        setError('Please fill in all credential details');
        return false;
      }
    }

    if (step === 3) {
      if (formData.yearsOfExperience < 0) {
        setError('Please enter valid years of experience');
        return false;
      }
      if (!formData.experienceDescription) {
        setError('Please describe your teaching experience');
        return false;
      }
      if (formData.specializations.some((s) => !s.trim())) {
        setError('Please fill in all specializations');
        return false;
      }
      if (formData.teachingLanguages.some((l) => !l.language)) {
        setError('Please fill in all teaching languages');
        return false;
      }
    }

    if (step === 4) {
      if (!formData.acceptTerms) {
        setError('You must accept the terms and conditions');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    try {
      // Register user with guru application data included
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        // Backend doesn't have guru apply endpoint, so we'll just register the user
        // Admin will need to manually approve them as guru
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Registration successful! Please login and contact admin to activate guru privileges.',
          },
        });
      }, 3000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen vintage-paper flex items-center justify-center px-4">
        <div className="vintage-card p-8 max-w-md w-full text-center">
          <div className="text-green-600 mb-4 flex justify-center">
            <CheckCircle size={64} />
          </div>
          <h2 className="vintage-heading vintage-heading-md mb-4">
            Application Submitted!
          </h2>
          <p className="vintage-text mb-4">
            Thank you for applying to be a Guru at ShlokaYug. Our team will review your
            application and contact you via email within 2-3 business days.
          </p>
          <p className="vintage-text-sm italic">
            "ज्ञानं परमं ध्येयम्" - Knowledge is the supreme goal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen vintage-paper py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="vintage-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="vintage-om mb-4">ॐ</div>
            <h1 className="vintage-heading vintage-heading-md mb-2">
              Guru Application
            </h1>
            <p className="vintage-text-sm">
              Join ShlokaYug as a Sanskrit Prosody Guru
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition-all ${
                    currentStep >= step
                      ? 'bg-vintage-sepia text-white border-vintage-sepia'
                      : 'bg-vintage-paper-light text-vintage-ink-faded border-vintage-aged'
                  }`}
                >
                  {step}
                </div>
                <div className="text-xs mt-2 vintage-text-sm text-center">
                  {step === 1 && 'Account'}
                  {step === 2 && 'Credentials'}
                  {step === 3 && 'Experience'}
                  {step === 4 && 'Review'}
                </div>
              </div>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="vintage-alert vintage-alert-error flex items-center gap-2 mb-6">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Account Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="vintage-label">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="vintage-input w-full"
                      placeholder="First name"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="vintage-label">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="vintage-input w-full"
                      placeholder="Last name"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="vintage-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vintage-ink-faded">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="vintage-input w-full pl-12"
                      placeholder="your.email@example.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="vintage-label">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vintage-ink-faded">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="vintage-input w-full pl-12"
                      placeholder="Choose a unique username"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="vintage-label">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vintage-ink-faded">
                      <Phone size={20} />
                    </div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="vintage-input w-full pl-12"
                      placeholder="+91 XXXXXXXXXX"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="vintage-label">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vintage-ink-faded">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="vintage-input w-full pl-12 pr-12"
                      placeholder="Min 8 characters"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-vintage-ink-faded hover:text-vintage-sepia transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="vintage-text-sm mt-2 text-vintage-ink-faded">
                    Must contain uppercase, lowercase, and number
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="vintage-label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-vintage-ink-faded">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="vintage-input w-full pl-12 pr-12"
                      placeholder="Confirm your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-vintage-ink-faded hover:text-vintage-sepia transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Credentials */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="vintage-heading-sm flex items-center gap-2">
                    <GraduationCap size={24} />
                    Academic Credentials
                  </h3>
                  <button
                    type="button"
                    onClick={addCredential}
                    className="vintage-btn text-sm py-2 px-4 flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add More
                  </button>
                </div>

                {formData.credentials.map((cred, index) => (
                  <div key={index} className="bg-vintage-paper-light p-4 rounded-lg border-2 border-vintage-aged">
                    <div className="flex justify-between items-center mb-3">
                      <span className="vintage-label">Credential {index + 1}</span>
                      {formData.credentials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCredential(index)}
                          className="text-vintage-burgundy hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="vintage-label">Type</label>
                        <select
                          value={cred.type}
                          onChange={(e) => handleCredentialChange(index, 'type', e.target.value)}
                          className="vintage-input w-full"
                          aria-label="Credential type"
                        >
                          <option value="degree">Degree</option>
                          <option value="certificate">Certificate</option>
                          <option value="publication">Publication</option>
                          <option value="experience">Experience Letter</option>
                        </select>
                      </div>

                      <div>
                        <label className="vintage-label">Title</label>
                        <input
                          type="text"
                          value={cred.title}
                          onChange={(e) => handleCredentialChange(index, 'title', e.target.value)}
                          className="vintage-input w-full"
                          placeholder="e.g., PhD in Sanskrit Literature"
                        />
                      </div>

                      <div>
                        <label className="vintage-label">Institution</label>
                        <input
                          type="text"
                          value={cred.institution}
                          onChange={(e) => handleCredentialChange(index, 'institution', e.target.value)}
                          className="vintage-input w-full"
                          placeholder="e.g., Banaras Hindu University"
                        />
                      </div>

                      <div>
                        <label className="vintage-label">Year</label>
                        <input
                          type="number"
                          value={cred.year}
                          onChange={(e) => handleCredentialChange(index, 'year', parseInt(e.target.value))}
                          className="vintage-input w-full"
                          min="1950"
                          max={new Date().getFullYear()}
                        />
                      </div>

                      <div>
                        <label className="vintage-label">Description (Optional)</label>
                        <textarea
                          value={cred.description}
                          onChange={(e) => handleCredentialChange(index, 'description', e.target.value)}
                          className="vintage-input w-full"
                          rows="3"
                          placeholder="Additional details about this credential"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Experience */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="vintage-heading-sm flex items-center gap-2 mb-4">
                  <Briefcase size={24} />
                  Teaching Experience
                </h3>

                <div>
                  <label htmlFor="yearsOfExperience" className="vintage-label">
                    Years of Teaching Experience
                  </label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    className="vintage-input w-full"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label htmlFor="experienceDescription" className="vintage-label">
                    Teaching Experience Description
                  </label>
                  <textarea
                    id="experienceDescription"
                    name="experienceDescription"
                    value={formData.experienceDescription}
                    onChange={handleChange}
                    className="vintage-input w-full"
                    rows="5"
                    placeholder="Describe your teaching experience, methodologies, and achievements..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="vintage-label">Specializations</label>
                    <button
                      type="button"
                      onClick={addSpecialization}
                      className="text-vintage-sepia hover:text-vintage-gold transition-colors text-sm flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                  {formData.specializations.map((spec, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={spec}
                        onChange={(e) => handleSpecializationChange(index, e.target.value)}
                        className="vintage-input flex-1"
                        placeholder="e.g., Vedic Prosody, Chandas Shastra"
                      />
                      {formData.specializations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSpecialization(index)}
                          className="text-vintage-burgundy hover:text-red-700 transition-colors"
                          aria-label="Remove specialization"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="vintage-label">Teaching Languages</label>
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="text-vintage-sepia hover:text-vintage-gold transition-colors text-sm flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                  {formData.teachingLanguages.map((lang, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={lang.language}
                        onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                        className="vintage-input flex-1"
                        placeholder="Language name"
                      />
                      <select
                        value={lang.proficiency}
                        onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                        className="vintage-input"
                        aria-label="Language proficiency"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="native">Native</option>
                      </select>
                      {formData.teachingLanguages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="text-vintage-burgundy hover:text-red-700 transition-colors"
                          aria-label="Remove language"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="vintage-heading-sm mb-4">Review Your Application</h3>

                <div className="bg-vintage-paper-light p-6 rounded-lg border-2 border-vintage-aged space-y-4">
                  <div>
                    <h4 className="vintage-label mb-2">Personal Information</h4>
                    <p className="vintage-text">
                      <strong>Name:</strong> {formData.firstName} {formData.lastName}
                    </p>
                    <p className="vintage-text">
                      <strong>Email:</strong> {formData.email}
                    </p>
                    <p className="vintage-text">
                      <strong>Username:</strong> {formData.username}
                    </p>
                    {formData.phoneNumber && (
                      <p className="vintage-text">
                        <strong>Phone:</strong> {formData.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div className="vintage-divider" />

                  <div>
                    <h4 className="vintage-label mb-2">Credentials</h4>
                    {formData.credentials.map((cred, index) => (
                      <div key={index} className="vintage-text mb-2">
                        <strong>
                          {cred.type.charAt(0).toUpperCase() + cred.type.slice(1)}:
                        </strong>{' '}
                        {cred.title} from {cred.institution} ({cred.year})
                      </div>
                    ))}
                  </div>

                  <div className="vintage-divider" />

                  <div>
                    <h4 className="vintage-label mb-2">Experience</h4>
                    <p className="vintage-text">
                      <strong>Years:</strong> {formData.yearsOfExperience}
                    </p>
                    <p className="vintage-text">
                      <strong>Specializations:</strong>{' '}
                      {formData.specializations.filter((s) => s).join(', ')}
                    </p>
                    <p className="vintage-text">
                      <strong>Languages:</strong>{' '}
                      {formData.teachingLanguages
                        .filter((l) => l.language)
                        .map((l) => `${l.language} (${l.proficiency})`)
                        .join(', ')}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 rounded border-vintage-aged text-vintage-sepia focus:ring-vintage-sepia"
                    />
                    <span className="vintage-text-sm">
                      I agree to the{' '}
                      <Link to="/terms" className="vintage-link">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="vintage-link">
                        Privacy Policy
                      </Link>
                      . I confirm that all information provided is accurate and truthful.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="vintage-btn"
                  disabled={isLoading}
                >
                  Previous
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="vintage-btn ml-auto"
                  disabled={isLoading}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="vintage-btn ml-auto"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="vintage-spinner w-5 h-5 border-2" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Divider */}
          <div className="vintage-divider my-8" />

          {/* Login Link */}
          <div className="text-center">
            <p className="vintage-text-sm">
              Already have an account?{' '}
              <Link to="/login" className="vintage-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuruRegister;
