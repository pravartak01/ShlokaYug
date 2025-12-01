import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CompanyInfo,
  TaglineTone,
  getIndustryOptions,
  getToneOptions,
  validateCompanyInfo,
} from '../../services/taglineService';

interface TaglineFormProps {
  onSubmit: (companyInfo: CompanyInfo) => void;
  isLoading: boolean;
}

interface FormField {
  key: keyof CompanyInfo;
  label: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  required?: boolean;
}

const formFields: FormField[] = [
  {
    key: 'companyName',
    label: 'Company Name',
    placeholder: 'Enter your company name',
    icon: 'business-outline',
    required: true,
  },
  {
    key: 'vision',
    label: 'Vision Statement',
    placeholder: 'What future do you envision? What impact do you want to create?',
    icon: 'eye-outline',
    multiline: true,
    required: true,
  },
  {
    key: 'mission',
    label: 'Mission Statement',
    placeholder: 'How do you plan to achieve your vision? What do you do?',
    icon: 'flag-outline',
    multiline: true,
    required: true,
  },
  {
    key: 'coreValues',
    label: 'Core Values',
    placeholder: 'What principles guide your company? (e.g., Innovation, Integrity, Excellence)',
    icon: 'heart-outline',
    multiline: true,
  },
  {
    key: 'targetAudience',
    label: 'Target Audience',
    placeholder: 'Who are your primary customers or beneficiaries?',
    icon: 'people-outline',
  },
  {
    key: 'uniqueSellingPoint',
    label: 'Unique Selling Point',
    placeholder: 'What makes your company different from competitors?',
    icon: 'diamond-outline',
    multiline: true,
  },
];

export default function TaglineForm({ onSubmit, isLoading }: TaglineFormProps) {
  const [formData, setFormData] = useState<Partial<CompanyInfo>>({
    tone: 'inspirational',
  });
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleInputChange = (key: keyof CompanyInfo, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors([]);
  };

  const handleToneSelect = (tone: TaglineTone) => {
    setFormData(prev => ({ ...prev, tone }));
  };

  const handleIndustrySelect = (industry: string) => {
    setSelectedIndustry(industry);
    setFormData(prev => ({ ...prev, industry }));
    setShowIndustryPicker(false);
  };

  const handleSubmit = () => {
    const validationErrors = validateCompanyInfo(formData);
    if (!selectedIndustry) {
      validationErrors.push('Please select an industry');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData as CompanyInfo);
  };

  const industries = getIndustryOptions();
  const tones = getToneOptions();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Industry Selector */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginLeft: 4 }}>
              Industry <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowIndustryPicker(!showIndustryPicker)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 14,
                padding: 16,
                borderWidth: 2,
                borderColor: showIndustryPicker ? '#f97316' : '#e5e7eb',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: '#fff7ed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="briefcase-outline" size={20} color="#ea580c" />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: selectedIndustry ? '#1f2937' : '#9ca3af',
                }}
              >
                {selectedIndustry || 'Select your industry'}
              </Text>
              <Ionicons
                name={showIndustryPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>

            {/* Industry Dropdown */}
            {showIndustryPicker && (
              <View
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  maxHeight: 200,
                  overflow: 'hidden',
                }}
              >
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {industries.map((industry, index) => (
                    <TouchableOpacity
                      key={industry}
                      onPress={() => handleIndustrySelect(industry)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: selectedIndustry === industry ? '#fff7ed' : 'transparent',
                        borderBottomWidth: index < industries.length - 1 ? 1 : 0,
                        borderBottomColor: '#f3f4f6',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: selectedIndustry === industry ? '#ea580c' : '#374151',
                          fontWeight: selectedIndustry === industry ? '600' : '400',
                        }}
                      >
                        {industry}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Form Fields */}
          {formFields.map((field) => (
            <View key={field.key} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginLeft: 4 }}>
                {field.label} {field.required && <Text style={{ color: '#ef4444' }}>*</Text>}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: field.multiline ? 'flex-start' : 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  padding: 4,
                  borderWidth: 2,
                  borderColor: focusedField === field.key ? '#f97316' : '#e5e7eb',
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: '#fff7ed',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 8,
                    marginTop: field.multiline ? 8 : 0,
                  }}
                >
                  <Ionicons name={field.icon} size={20} color="#ea580c" />
                </View>
                <TextInput
                  value={(formData[field.key] as string) || ''}
                  onChangeText={(text) => handleInputChange(field.key, text)}
                  onFocus={() => setFocusedField(field.key)}
                  onBlur={() => setFocusedField(null)}
                  placeholder={field.placeholder}
                  placeholderTextColor="#9ca3af"
                  multiline={field.multiline}
                  numberOfLines={field.multiline ? 3 : 1}
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: '#1f2937',
                    paddingHorizontal: 12,
                    paddingVertical: field.multiline ? 12 : 8,
                    textAlignVertical: field.multiline ? 'top' : 'center',
                    minHeight: field.multiline ? 80 : 48,
                  }}
                />
              </View>
            </View>
          ))}

          {/* Tone Selector */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12, marginLeft: 4 }}>
              Tagline Tone
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {tones.map((tone) => (
                <TouchableOpacity
                  key={tone.value}
                  onPress={() => handleToneSelect(tone.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: formData.tone === tone.value ? '#ea580c' : '#ffffff',
                    borderWidth: 1.5,
                    borderColor: formData.tone === tone.value ? '#ea580c' : '#e5e7eb',
                  }}
                >
                  <Text style={{ marginRight: 6 }}>{tone.icon}</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: formData.tone === tone.value ? '#ffffff' : '#374151',
                    }}
                  >
                    {tone.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <View
              style={{
                backgroundColor: '#fef2f2',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#fecaca',
              }}
            >
              {errors.map((error, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: index < errors.length - 1 ? 8 : 0 }}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 13, color: '#dc2626' }}>{error}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#ea580c', '#f97316', '#fb923c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 18,
                borderRadius: 16,
                shadowColor: '#ea580c',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              {isLoading ? (
                <>
                  <Animated.View
                    style={{
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="sparkles" size={22} color="#ffffff" />
                  </Animated.View>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: '#ffffff' }}>
                    Generating Magic...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={22} color="#ffffff" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 17, fontWeight: '700', color: '#ffffff' }}>
                    Generate Sanskrit Taglines
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Tip Card */}
          <View
            style={{
              backgroundColor: '#eff6ff',
              borderRadius: 14,
              padding: 16,
              marginTop: 20,
              borderWidth: 1,
              borderColor: '#bfdbfe',
              flexDirection: 'row',
            }}
          >
            <Ionicons name="bulb-outline" size={20} color="#2563eb" style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#1e40af', marginBottom: 4 }}>
                Pro Tip
              </Text>
              <Text style={{ fontSize: 12, color: '#3b82f6', lineHeight: 18 }}>
                The more detailed your vision and mission, the more personalized and meaningful your Sanskrit tagline will be. Think about what truly makes your company unique!
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
