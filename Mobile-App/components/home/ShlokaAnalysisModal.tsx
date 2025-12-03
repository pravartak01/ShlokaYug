import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ShlokaAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
}

// Demo Shloka Examples
const demoShlokas = [
  {
    id: 1,
    title: 'Gayatri Mantra',
    text: 'तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥',
    description: 'Most sacred Vedic mantra'
  },
  {
    id: 2,
    title: 'Bhagavad Gita 2.47',
    text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    description: 'Famous verse on action without attachment'
  },
  {
    id: 3,
    title: 'Shanti Mantra',
    text: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥',
    description: 'Universal peace prayer'
  },
  {
    id: 4,
    title: 'Guru Stotram',
    text: 'गुरुर्ब्रह्मा गुरुर्विष्णुर्गुरुर्देवो महेश्वरः। गुरुर्साक्षात्परं ब्रह्म तस्मै श्रीगुरवे नमः॥',
    description: 'Reverence to the Guru'
  }
];

const getAnalysisForText = (text: string) => {
  if (text.includes('तत्सवितुर्वरेण्यं')) {
    // Gayatri Mantra Analysis
    return {
      inputText: text,
      chandas: {
        name: 'Gayatri',
        pattern: 'Vedic meter with 24 syllables',
        structure: '8+8+8 syllables (tripada)',
        description: 'Sacred Vedic meter used for the most powerful mantras'
      },
      syllableCount: {
        pada1: 8,
        pada2: 8,
        pada3: 8,
        pada4: 0,
        total: 24
      },
      metrics: {
        difficulty: 'Advanced',
        pronunciation: 'Sacred',
        rhythm: 'Divine'
      },
      meaning: {
        literal: 'We meditate on the divine light of the Sun, may it illuminate our minds',
        spiritual: 'Invocation for divine wisdom and enlightenment',
        context: 'Rigveda 3.62.10 - Most sacred of all Vedic mantras'
      },
      recommendations: [
        'Chant during sunrise for maximum spiritual benefit',
        'Focus on the divine light while reciting',
        'Maintain slow, meditative rhythm with proper breath control'
      ]
    };
  } else if (text.includes('कर्मण्येवाधिकारस्ते')) {
    // Bhagavad Gita Analysis
    return {
      inputText: text,
      chandas: {
        name: 'Anushtup (Shloka)',
        pattern: 'Epic meter with 32 syllables',
        structure: '8+8+8+8 syllables per pada',
        description: 'Most common meter in Sanskrit epic literature'
      },
      syllableCount: {
        pada1: 8,
        pada2: 8,
        pada3: 8,
        pada4: 8,
        total: 32
      },
      metrics: {
        difficulty: 'Medium',
        pronunciation: 'Clear',
        rhythm: 'Balanced'
      },
      meaning: {
        literal: 'You have the right to perform action, but not to the fruits of action',
        spiritual: 'Foundation of Karma Yoga - selfless action without attachment',
        context: 'Bhagavad Gita 2.47 - Core teaching of detached action'
      },
      recommendations: [
        'Reflect on the philosophy while chanting',
        'Practice with understanding of Karma Yoga principles',
        'Maintain steady rhythm to internalize the teaching'
      ]
    };
  } else if (text.includes('सर्वे भवन्तु सुखिनः')) {
    // Shanti Mantra Analysis
    return {
      inputText: text,
      chandas: {
        name: 'Anushtup (Shloka)',
        pattern: 'Compassionate meter with 32 syllables',
        structure: '8+8+8+8 syllables per pada',
        description: 'Universal prayer meter invoking peace for all beings'
      },
      syllableCount: {
        pada1: 8,
        pada2: 8,
        pada3: 8,
        pada4: 8,
        total: 32
      },
      metrics: {
        difficulty: 'Easy',
        pronunciation: 'Gentle',
        rhythm: 'Peaceful'
      },
      meaning: {
        literal: 'May all beings be happy, may all be free from illness, may all see what is auspicious',
        spiritual: 'Universal compassion and loving-kindness for all existence',
        context: 'Traditional Shanti (peace) mantra for universal wellbeing'
      },
      recommendations: [
        'Chant with feeling of universal love and compassion',
        'Visualize all beings experiencing happiness and peace',
        'Use gentle, flowing rhythm to cultivate inner peace'
      ]
    };
  } else if (text.includes('गुरुर्ब्रह्मा')) {
    // Guru Stotram Analysis
    return {
      inputText: text,
      chandas: {
        name: 'Anushtup (Shloka)',
        pattern: 'Devotional meter with 32 syllables',
        structure: '8+8+8+8 syllables per pada',
        description: 'Sacred meter expressing reverence and devotion'
      },
      syllableCount: {
        pada1: 8,
        pada2: 8,
        pada3: 8,
        pada4: 8,
        total: 32
      },
      metrics: {
        difficulty: 'Medium',
        pronunciation: 'Devotional',
        rhythm: 'Reverent'
      },
      meaning: {
        literal: 'Guru is Brahma, Guru is Vishnu, Guru is Shiva, Guru is the Supreme Brahman',
        spiritual: 'Recognition of the Guru as the embodiment of divine consciousness',
        context: 'Traditional Guru Stotram expressing ultimate reverence to the teacher'
      },
      recommendations: [
        'Chant with deep reverence and gratitude',
        'Contemplate the divine nature of true knowledge',
        'Maintain respectful, devotional rhythm throughout'
      ]
    };
  } else {
    // Generic Analysis for custom input
    return {
      inputText: text,
      chandas: {
        name: 'Anushtup (Shloka)',
        pattern: 'Standard meter with 32 syllables',
        structure: '8+8+8+8 syllables per pada',
        description: 'Most common meter in Sanskrit poetry and sacred texts'
      },
      syllableCount: {
        pada1: 8,
        pada2: 8,
        pada3: 8,
        pada4: 8,
        total: 32
      },
      metrics: {
        difficulty: 'Medium',
        pronunciation: 'Clear',
        rhythm: 'Balanced'
      },
      meaning: {
        literal: 'Divine wisdom flows through sacred Sanskrit verses',
        spiritual: 'Sanskrit text carries spiritual vibrations and ancient wisdom',
        context: 'Traditional Sanskrit composition following classical patterns'
      },
      recommendations: [
        'Focus on proper pronunciation of each syllable',
        'Maintain consistent rhythm while chanting',
        'Study the meaning for deeper spiritual understanding'
      ]
    };
  }
};

export default function ShlokaAnalysisModal({ visible, onClose }: ShlokaAnalysisModalProps) {
  const [inputShloka, setInputShloka] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeShloka = async (text: string) => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter a shloka to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const analysis = getAnalysisForText(text);
      setAnalysisResult(analysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleClose = () => {
    setInputShloka('');
    setAnalysisResult(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-ancient-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Modal Header */}
          <View 
            className="px-6 pt-4 pb-6"
            style={{ backgroundColor: '#DD7A1F' }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-2xl font-bold">ShlokaYug Analyzer</Text>
              <TouchableOpacity
                onPress={handleClose}
                className="bg-white/20 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-white/90 text-base">
              Enter a Sanskrit shloka to get detailed chandas analysis
            </Text>
          </View>

          {/* Input Section */}
          <View className="px-6 mt-6">
            <Text className="text-ancient-800 text-lg font-semibold mb-3">
              Enter Sanskrit Shloka
            </Text>
            <View className="bg-white rounded-2xl border border-ancient-200 shadow-sm">
              <TextInput
                value={inputShloka}
                onChangeText={setInputShloka}
                placeholder="Type or paste your Sanskrit shloka here..."
                placeholderTextColor="#996f0a"
                multiline
                numberOfLines={4}
                className="p-4 text-ancient-800 text-base leading-6"
                textAlignVertical="top"
              />
            </View>
            
            <TouchableOpacity
              onPress={() => analyzeShloka(inputShloka)}
              disabled={isAnalyzing || !inputShloka.trim()}
              className={`mt-4 rounded-2xl p-4 flex-row items-center justify-center`}
              style={{ backgroundColor: isAnalyzing || !inputShloka.trim() ? '#d4d4aa' : '#DD7A1F' }}
            >
              {isAnalyzing && (
                <Ionicons name="refresh" size={20} color="white" style={{ marginRight: 8 }} />
              )}
              <Text className="text-white font-semibold text-lg">
                {isAnalyzing ? 'Analyzing...' : 'Analyze Shloka'}
              </Text>
            </TouchableOpacity>

            {/* Demo Examples Section */}
            <View className="mt-8">
              <Text className="text-ancient-800 text-lg font-semibold mb-4">
                ✨ Try These Examples
              </Text>
              <Text className="text-ancient-600 text-sm mb-4">
                Click any example below to analyze instantly
              </Text>
              
              {demoShlokas.map((demo) => (
                <TouchableOpacity
                  key={demo.id}
                  onPress={() => {
                    setInputShloka(demo.text);
                    analyzeShloka(demo.text);
                  }}
                  className="bg-white p-4 rounded-xl border border-ancient-200 shadow-sm mb-3"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-start">
                    <View className="flex-1">
                      <Text className="text-[#D4A017] font-semibold text-base mb-1">
                        {demo.title}
                      </Text>
                      <Text className="text-ancient-600 text-sm mb-2 leading-5">
                        {demo.description}
                      </Text>
                      <Text className="text-ancient-800 text-sm leading-6" numberOfLines={2}>
                        {demo.text}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#D4A017" className="ml-2 mt-1" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Analysis Results */}
          {analysisResult && (
            <View className="px-6 mt-8 mb-8">
              <Text className="text-ancient-800 text-xl font-bold mb-6">Analysis Results</Text>
              
              {/* Chandas Information */}
              <View className="bg-white p-6 rounded-2xl shadow-sm border border-ancient-200 mb-4">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="musical-note" size={24} color="#B87333" />
                  <Text className="text-[#B87333] text-lg font-bold ml-2">
                    Chandas Pattern
                  </Text>
                </View>
                <Text className="text-ancient-800 text-lg font-semibold mb-2">
                  {analysisResult.chandas.name}
                </Text>
                <Text className="text-ancient-600 text-base mb-3">
                  {analysisResult.chandas.description}
                </Text>
                <View className="bg-ancient-50 p-3 rounded-xl">
                  <Text className="text-ancient-700 text-sm font-medium">
                    Structure: {analysisResult.chandas.structure}
                  </Text>
                </View>
              </View>

              {/* Syllable Count */}
              <View className="bg-white p-6 rounded-2xl shadow-sm border border-ancient-200 mb-4">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="list" size={24} color="#D4A017" />
                  <Text className="text-[#D4A017] text-lg font-bold ml-2">
                    Syllable Analysis
                  </Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-ancient-600">Pada 1:</Text>
                  <Text className="text-ancient-800 font-semibold">{analysisResult.syllableCount.pada1} syllables</Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-ancient-600">Pada 2:</Text>
                  <Text className="text-ancient-800 font-semibold">{analysisResult.syllableCount.pada2} syllables</Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-ancient-600">Pada 3:</Text>
                  <Text className="text-ancient-800 font-semibold">{analysisResult.syllableCount.pada3} syllables</Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-ancient-600">Pada 4:</Text>
                  <Text className="text-ancient-800 font-semibold">{analysisResult.syllableCount.pada4} syllables</Text>
                </View>
                <View className="border-t border-ancient-200 pt-3 mt-3">
                  <View className="flex-row justify-between">
                    <Text className="text-ancient-800 font-bold">Total:</Text>
                    <Text className="text-[#D4A017] font-bold text-lg">{analysisResult.syllableCount.total} syllables</Text>
                  </View>
                </View>
              </View>

              {/* Metrics */}
              <View className="bg-white p-6 rounded-2xl shadow-sm border border-ancient-200 mb-4">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="speedometer" size={24} color="#DD7A1F" />
                  <Text className="text-[#DD7A1F] text-lg font-bold ml-2">
                    Quality Metrics
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-ancient-600">Difficulty:</Text>
                  <View className="bg-ancient-100 px-3 py-1 rounded-full">
                    <Text className="text-ancient-700 font-semibold">{analysisResult.metrics.difficulty}</Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-ancient-600">Pronunciation:</Text>
                  <View className="bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-green-700 font-semibold">{analysisResult.metrics.pronunciation}</Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-ancient-600">Rhythm:</Text>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-700 font-semibold">{analysisResult.metrics.rhythm}</Text>
                  </View>
                </View>
              </View>

              {/* Meaning Analysis */}
              <View className="bg-white p-6 rounded-2xl shadow-sm border border-ancient-200 mb-4">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="book" size={24} color="#B87333" />
                  <Text className="text-[#B87333] text-lg font-bold ml-2">
                    Meaning & Context
                  </Text>
                </View>
                <View className="mb-4">
                  <Text className="text-ancient-700 font-semibold mb-2">Literal Meaning:</Text>
                  <Text className="text-ancient-600 leading-6">{analysisResult.meaning.literal}</Text>
                </View>
                <View className="mb-4">
                  <Text className="text-ancient-700 font-semibold mb-2">Spiritual Significance:</Text>
                  <Text className="text-ancient-600 leading-6">{analysisResult.meaning.spiritual}</Text>
                </View>
                <View>
                  <Text className="text-ancient-700 font-semibold mb-2">Context:</Text>
                  <Text className="text-ancient-600 leading-6">{analysisResult.meaning.context}</Text>
                </View>
              </View>

              {/* Recommendations */}
              <View className="bg-white p-6 rounded-2xl shadow-sm border border-ancient-200">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="bulb" size={24} color="#D4A017" />
                  <Text className="text-[#D4A017] text-lg font-bold ml-2">
                    Learning Tips
                  </Text>
                </View>
                {analysisResult.recommendations.map((tip: string, index: number) => (
                  <View key={index} className="flex-row items-start mb-3">
                    <View className="w-2 h-2 bg-[#B87333] rounded-full mt-2 mr-3" />
                    <Text className="text-ancient-600 leading-6 flex-1">{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
