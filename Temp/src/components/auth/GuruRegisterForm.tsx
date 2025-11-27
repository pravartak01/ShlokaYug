import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Mail, Lock, User, GraduationCap, 
  Briefcase, Plus, Trash2, Phone, MapPin 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import type { GuruRegistrationFormData } from '../../types';

interface GuruRegisterFormProps {
  onSuccess?: () => void;
}

export const GuruRegisterForm: React.FC<GuruRegisterFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { registerGuru } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<GuruRegistrationFormData>({
    // Basic info
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
    role: 'guru',
    
    // Contact info
    phoneNumber: '',
    location: '',
    bio: '',
    
    // Credentials
    credentials: [{
      type: 'degree',
      title: '',
      institution: '',
      year: new Date().getFullYear(),
      description: ''
    }],
    
    // Experience
    experienceYears: 0,
    experienceDescription: '',
    specializations: [''],
    teachingLanguages: [{
      language: '',
      proficiency: 'intermediate'
    }]
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleCredentialChange = (index: number, field: string, value: string | number) => {
    const newCredentials = [...formData.credentials];
    newCredentials[index] = { ...newCredentials[index], [field]: value };
    setFormData(prev => ({ ...prev, credentials: newCredentials }));
  };

  const addCredential = () => {
    setFormData(prev => ({
      ...prev,
      credentials: [...prev.credentials, {
        type: 'degree',
        title: '',
        institution: '',
        year: new Date().getFullYear(),
        description: ''
      }]
    }));
  };

  const removeCredential = (index: number) => {
    if (formData.credentials.length > 1) {
      setFormData(prev => ({
        ...prev,
        credentials: prev.credentials.filter((_, i) => i !== index)
      }));
    }
  };

  const handleLanguageChange = (index: number, field: string, value: string) => {
    const newLanguages = [...formData.teachingLanguages];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    setFormData(prev => ({ ...prev, teachingLanguages: newLanguages }));
  };

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      teachingLanguages: [...prev.teachingLanguages, { language: '', proficiency: 'intermediate' }]
    }));
  };

  const removeLanguage = (index: number) => {
    if (formData.teachingLanguages.length > 1) {
      setFormData(prev => ({
        ...prev,
        teachingLanguages: prev.teachingLanguages.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSpecializationChange = (index: number, value: string) => {
    const newSpecializations = [...formData.specializations];
    newSpecializations[index] = value;
    setFormData(prev => ({ ...prev, specializations: newSpecializations }));
  };

  const addSpecialization = () => {
    setFormData(prev => ({
      ...prev,
      specializations: [...prev.specializations, '']
    }));
  };

  const removeSpecialization = (index: number) => {
    if (formData.specializations.length > 1) {
      setFormData(prev => ({
        ...prev,
        specializations: prev.specializations.filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    setError('');

    switch (step) {
      case 1: // Basic Info
        if (!formData.email || !formData.username || !formData.firstName || !formData.lastName) {
          setError('Please fill in all required fields');
          return false;
        }
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (formData.username.length < 3) {
          setError('Username must be at least 3 characters long');
          return false;
        }
        if (!formData.password || formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;

      case 2: // Credentials
        if (formData.credentials.length === 0) {
          setError('Please add at least one credential');
          return false;
        }
        for (const cred of formData.credentials) {
          if (!cred.title) {
            setError('Please fill in credential titles');
            return false;
          }
        }
        return true;

      case 3: // Experience
        if (formData.experienceYears < 0) {
          setError('Please enter valid years of experience');
          return false;
        }
        if (!formData.experienceDescription) {
          setError('Please describe your teaching experience');
          return false;
        }
        if (formData.specializations.every(s => !s.trim())) {
          setError('Please add at least one specialization');
          return false;
        }
        if (formData.teachingLanguages.every(l => !l.language.trim())) {
          setError('Please add at least one teaching language');
          return false;
        }
        return true;

      case 4: // Review
        if (!formData.acceptTerms) {
          setError('You must accept the terms and conditions');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;

    setIsLoading(true);
    setError('');

    try {
      await registerGuru({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        credentials: formData.credentials.map(c => ({
          type: c.type,
          title: c.title,
          institution: c.institution,
          year: c.year,
          description: c.description
        })),
        experience: {
          years: formData.experienceYears,
          description: formData.experienceDescription,
          specializations: formData.specializations.filter(s => s.trim()),
          languages: formData.teachingLanguages
            .filter(l => l.language.trim())
            .map(l => ({
              language: l.language,
              proficiency: l.proficiency
            }))
        }
      });

      onSuccess?.();
      navigate('/guru/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex flex-col items-center flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
            ${currentStep >= step 
              ? 'bg-gradient-to-br from-saffron-500 to-ancient-600 text-white' 
              : 'bg-ancient-200 text-ancient-500'
            }`}>
            {step}
          </div>
          <div className="text-xs mt-2 text-ancient-600 text-center">
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Credentials'}
            {step === 3 && 'Experience'}
            {step === 4 && 'Review'}
          </div>
          {step < 4 && (
            <div className={`h-1 w-full mt-5 -ml-full
              ${currentStep > step ? 'bg-saffron-500' : 'bg-ancient-200'}`} 
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-ancient-800 mb-4">Basic Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          label="First Name*"
          placeholder="Enter first name"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          leftIcon={<User size={20} />}
          required
        />
        <Input
          type="text"
          label="Last Name*"
          placeholder="Enter last name"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          leftIcon={<User size={20} />}
          required
        />
      </div>

      <Input
        type="text"
        label="Username*"
        placeholder="Choose a unique username"
        value={formData.username}
        onChange={(e) => handleInputChange('username', e.target.value)}
        leftIcon={<User size={20} />}
        required
      />

      <Input
        type="email"
        label="Email Address*"
        placeholder="Enter your email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        leftIcon={<Mail size={20} />}
        required
      />

      <Input
        type={showPassword ? 'text' : 'password'}
        label="Password*"
        placeholder="Create a strong password (min 8 characters)"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        leftIcon={<Lock size={20} />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-ancient-500 hover:text-ancient-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        }
        required
      />

      <Input
        type={showConfirmPassword ? 'text' : 'password'}
        label="Confirm Password*"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
        leftIcon={<Lock size={20} />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-ancient-500 hover:text-ancient-700"
          >
            {showConfirmPassword ? <EyeOff size={20} />: <Eye size={20} />}
          </button>
        }
        required
      />

      <Input
        type="tel"
        label="Phone Number"
        placeholder="Enter your phone number"
        value={formData.phoneNumber}
        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
        leftIcon={<Phone size={20} />}
      />

      <Input
        type="text"
        label="Location"
        placeholder="City, Country"
        value={formData.location}
        onChange={(e) => handleInputChange('location', e.target.value)}
        leftIcon={<MapPin size={20} />}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-ancient-700">
          Bio
        </label>
        <textarea
          className="w-full px-4 py-2 border border-ancient-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
          rows={4}
          placeholder="Tell us about yourself and your teaching philosophy..."
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-ancient-800">Credentials</h3>
        <Button type="button" onClick={addCredential} size="sm">
          <Plus size={16} className="mr-1" /> Add Credential
        </Button>
      </div>

      {formData.credentials.map((credential, index) => (
        <div key={index} className="p-4 border border-ancient-200 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-ancient-700">Credential {index + 1}</h4>
            {formData.credentials.length > 1 && (
              <button
                type="button"
                onClick={() => removeCredential(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-ancient-700 mb-1">Type*</label>
              <select
                className="w-full px-4 py-2 border border-ancient-300 rounded-lg focus:ring-2 focus:ring-saffron-500"
                value={credential.type}
                onChange={(e) => handleCredentialChange(index, 'type', e.target.value)}
                required
              >
                <option value="degree">Degree</option>
                <option value="certificate">Certificate</option>
                <option value="experience">Experience</option>
                <option value="publication">Publication</option>
              </select>
            </div>

            <Input
              type="text"
              label="Title*"
              placeholder="e.g., PhD in Sanskrit Literature"
              value={credential.title}
              onChange={(e) => handleCredentialChange(index, 'title', e.target.value)}
              leftIcon={<GraduationCap size={20} />}
              required
            />

            <Input
              type="text"
              label="Institution"
              placeholder="University or Institution name"
              value={credential.institution || ''}
              onChange={(e) => handleCredentialChange(index, 'institution', e.target.value)}
            />

            <Input
              type="number"
              label="Year"
              placeholder="Year obtained"
              value={credential.year || ''}
              onChange={(e) => handleCredentialChange(index, 'year', parseInt(e.target.value))}
              min="1950"
              max={new Date().getFullYear()}
            />

            <div>
              <label className="block text-sm font-medium text-ancient-700 mb-1">Description</label>
              <textarea
                className="w-full px-4 py-2 border border-ancient-300 rounded-lg focus:ring-2 focus:ring-saffron-500"
                rows={2}
                placeholder="Brief description..."
                value={credential.description || ''}
                onChange={(e) => handleCredentialChange(index, 'description', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-ancient-800">Teaching Experience</h3>

      <Input
        type="number"
        label="Years of Teaching Experience*"
        placeholder="Number of years"
        value={formData.experienceYears}
        onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
        leftIcon={<Briefcase size={20} />}
        min="0"
        required
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-ancient-700">
          Experience Description*
        </label>
        <textarea
          className="w-full px-4 py-2 border border-ancient-300 rounded-lg focus:ring-2 focus:ring-saffron-500"
          rows={4}
          placeholder="Describe your teaching experience, methodologies, and achievements..."
          value={formData.experienceDescription}
          onChange={(e) => handleInputChange('experienceDescription', e.target.value)}
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-ancient-700">Specializations*</label>
          <Button type="button" onClick={addSpecialization} size="sm">
            <Plus size={16} />
          </Button>
        </div>
        {formData.specializations.map((spec, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., Vedic Chanting, Sanskrit Grammar"
              value={spec}
              onChange={(e) => handleSpecializationChange(index, e.target.value)}
            />
            {formData.specializations.length > 1 && (
              <button
                type="button"
                onClick={() => removeSpecialization(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-ancient-700">Teaching Languages*</label>
          <Button type="button" onClick={addLanguage} size="sm">
            <Plus size={16} />
          </Button>
        </div>
        {formData.teachingLanguages.map((lang, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Language (e.g., English, Hindi, Sanskrit)"
                value={lang.language}
                onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <select
                className="w-full px-4 py-2 border border-ancient-300 rounded-lg focus:ring-2 focus:ring-saffron-500"
                value={lang.proficiency}
                onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="native">Native</option>
              </select>
            </div>
            {formData.teachingLanguages.length > 1 && (
              <button
                type="button"
                onClick={() => removeLanguage(index)}
                className="text-red-500 hover:text-red-700 pb-2"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-ancient-800 mb-4">Review & Submit</h3>

      <div className="bg-ancient-50 p-4 rounded-lg space-y-3">
        <div>
          <p className="text-sm text-ancient-600">Name</p>
          <p className="font-medium text-ancient-800">{formData.firstName} {formData.lastName}</p>
        </div>
        <div>
          <p className="text-sm text-ancient-600">Email</p>
          <p className="font-medium text-ancient-800">{formData.email}</p>
        </div>
        <div>
          <p className="text-sm text-ancient-600">Username</p>
          <p className="font-medium text-ancient-800">{formData.username}</p>
        </div>
        <div>
          <p className="text-sm text-ancient-600">Experience</p>
          <p className="font-medium text-ancient-800">{formData.experienceYears} years</p>
        </div>
        <div>
          <p className="text-sm text-ancient-600">Credentials</p>
          <p className="font-medium text-ancient-800">{formData.credentials.length} credential(s) added</p>
        </div>
        <div>
          <p className="text-sm text-ancient-600">Specializations</p>
          <p className="font-medium text-ancient-800">
            {formData.specializations.filter(s => s.trim()).join(', ')}
          </p>
        </div>
      </div>

      <div className="bg-saffron-50 border border-saffron-200 p-4 rounded-lg">
        <p className="text-sm text-ancient-700">
          <strong>Important:</strong> Your application will be reviewed by our team. 
          Once approved, you'll be able to create and publish courses on our platform.
          This typically takes 2-3 business days.
        </p>
      </div>

      <label className="flex items-start space-x-3">
        <input
          type="checkbox"
          className="mt-1 rounded border-ancient-300 text-saffron-500 focus:ring-saffron-500"
          checked={formData.acceptTerms}
          onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
        />
        <span className="text-sm text-ancient-600 leading-relaxed">
          I agree to the{' '}
          <Link to="/terms" className="text-saffron-600 hover:text-saffron-500 underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-saffron-600 hover:text-saffron-500 underline">
            Privacy Policy
          </Link>
          , and confirm that all information provided is accurate.
        </span>
      </label>
    </div>
  );

  return (
    <Card variant="ancient" className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-saffron-400 to-ancient-500 rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="text-white" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-ancient-800 font-ancient">
          Become a Guru
        </h2>
        <p className="text-ancient-600 font-elegant">
          Join our platform to share your knowledge and create courses
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={handlePrevious}
                variant="outline"
                className="flex-1"
              >
                Previous
              </Button>
            )}
            
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1"
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </form>

        <div className="text-center">
          <p className="text-ancient-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-saffron-600 hover:text-saffron-500 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
          <p className="text-ancient-600 mt-2">
            Want to register as a student?{' '}
            <Link
              to="/register"
              className="text-saffron-600 hover:text-saffron-500 font-medium transition-colors"
            >
              Student Registration
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
