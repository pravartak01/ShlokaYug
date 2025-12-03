/**
 * CourseDetailScreen - Comprehensive Course Details
 * Displays all course information with creative design
 * Videos are only shown to enrolled users
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import courseService, { Course } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import { getFullImageUrl } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Theme colors - Vintage Brown with Gold/Saffron/Copper highlights
const PRIMARY_BROWN = '#4A2E1C';    // Vintage brown for theme
const COPPER = '#B87333';           // Copper for warmth
const GOLD = '#D4A017';             // Gold for highlights
const SAFFRON = '#DD7A1F';          // Saffron for actions
const SAND = '#F3E4C8';             // Sand/Beige for backgrounds

// Section Header Component
const SectionHeader = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <View className="flex-row items-center mb-4">
    <View className="w-10 h-10 bg-[#F3E4C8] rounded-xl items-center justify-center">
      <Ionicons name={icon as any} size={20} color={PRIMARY_BROWN} />
    </View>
    <View className="ml-3 flex-1">
      <Text className="text-gray-900 text-lg font-bold">{title}</Text>
      {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
    </View>
  </View>
);

// Info Card Component
const InfoCard = ({ icon, label, value, color = COPPER }: { icon: string; label: string; value: string; color?: string }) => (
  <View className="bg-white rounded-2xl p-4 flex-1 mx-1 border border-gray-100" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
    <View className="w-9 h-9 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
      <Ionicons name={icon as any} size={18} color={color} />
    </View>
    <Text className="text-gray-500 text-xs mb-1">{label}</Text>
    <Text className="text-gray-900 text-base font-bold" numberOfLines={2}>{value}</Text>
  </View>
);

// Objective/Prerequisite Item Component
const ListItem = ({ text, icon = 'checkmark-circle' }: { text: string; icon?: string }) => (
  <View className="flex-row items-start mb-3">
    <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center mt-0.5">
      <Ionicons name={icon as any} size={14} color="#10b981" />
    </View>
    <Text className="flex-1 text-gray-700 text-base ml-3 leading-6">{text}</Text>
  </View>
);

// Expandable Unit Card Component
const UnitCard = ({ unit, index, isEnrolled, totalUnits }: { unit: any; index: number; isEnrolled: boolean; totalUnits: number }) => {
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    Animated.timing(animatedHeight, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const totalLessons = unit.lessons?.length || 0;
  const totalLectures = unit.lessons?.reduce((sum: number, lesson: any) => sum + (lesson.lectures?.length || 0), 0) || 0;

  return (
    <View className="bg-white rounded-2xl mb-3 overflow-hidden border border-gray-100" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8} className="p-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-[#F3E4C8] rounded-xl items-center justify-center">
            <Text className="text-[#B87333] font-bold">{index + 1}</Text>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-gray-900 font-bold text-base" numberOfLines={2}>{unit.title}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-500 text-sm">{totalLessons} Lessons • {totalLectures} Lectures</Text>
              {unit.estimatedDuration > 0 && (
                <Text className="text-gray-400 text-sm ml-2">• {unit.estimatedDuration} min</Text>
              )}
            </View>
          </View>
          <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center">
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#6b7280" />
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 border-t border-gray-100">
          {unit.description && (
            <Text className="text-gray-600 text-sm mt-3 mb-4 leading-5">{unit.description}</Text>
          )}
          
          {/* Lessons */}
          {unit.lessons?.map((lesson: any, lessonIndex: number) => (
            <View key={lesson.lessonId || lessonIndex} className="mb-4">
              <View className="flex-row items-center mb-2">
                <View className="w-7 h-7 bg-[#FDF8E8] rounded-lg items-center justify-center">
                  <Text className="text-[#D4A017] font-bold text-xs">{lessonIndex + 1}</Text>
                </View>
                <Text className="text-gray-800 font-semibold text-sm ml-2 flex-1" numberOfLines={2}>{lesson.title}</Text>
              </View>
              
              {lesson.description && (
                <Text className="text-gray-500 text-xs ml-9 mb-2">{lesson.description}</Text>
              )}

              {/* Lectures */}
              {lesson.lectures?.map((lecture: any, lectureIndex: number) => (
                <View key={lecture.lectureId || lectureIndex} className="ml-9 flex-row items-center py-2 border-b border-gray-50">
                  <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: lecture.content?.videoUrl ? '#dbeafe' : '#f3f4f6' }}>
                    <Ionicons 
                      name={lecture.content?.videoUrl ? 'play-circle' : 'document-text'} 
                      size={14} 
                      color={lecture.content?.videoUrl ? '#3b82f6' : '#6b7280'} 
                    />
                  </View>
                  <View className="flex-1 ml-2">
                    <Text className="text-gray-700 text-sm" numberOfLines={1}>{lecture.title}</Text>
                    {lecture.content?.duration > 0 && (
                      <Text className="text-gray-400 text-xs">{lecture.content.duration} min</Text>
                    )}
                  </View>
                  {!isEnrolled && lecture.content?.videoUrl && (
                    <View className="bg-gray-100 px-2 py-1 rounded">
                      <Ionicons name="lock-closed" size={12} color="#6b7280" />
                    </View>
                  )}
                  {lecture.metadata?.isFree && (
                    <View className="bg-emerald-100 px-2 py-1 rounded ml-1">
                      <Text className="text-emerald-700 text-xs font-medium">Free</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'curriculum' | 'instructor'>('overview');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadCourse();
  }, [id]);

  // Helper function to calculate content stats from units array
  const calculateContentStats = (units: any[]) => {
    if (!units || !Array.isArray(units)) {
      return { totalUnits: 0, totalLessons: 0, totalLectures: 0, totalDuration: 0 };
    }
    
    let totalLessons = 0;
    let totalLectures = 0;
    let totalDuration = 0;
    
    units.forEach(unit => {
      const lessons = unit.lessons || [];
      totalLessons += lessons.length;
      
      lessons.forEach((lesson: any) => {
        const lectures = lesson.lectures || [];
        totalLectures += lectures.length;
        
        lectures.forEach((lecture: any) => {
          totalDuration += lecture.content?.duration || 0;
        });
      });
    });
    
    return {
      totalUnits: units.length,
      totalLessons,
      totalLectures,
      totalDuration
    };
  };

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(id as string);
      console.log('Course response:', response);
      
      // Get course data and userAccess from response
      const courseData = response.data?.course || response.course;
      const userAccess = response.data?.userAccess || response.userAccess;
      
      // Calculate content stats from actual units array
      const units = courseData?.structure?.units || [];
      const contentStats = calculateContentStats(units);
      
      // Merge course data with calculated stats and enrollment status
      const enrichedCourse = {
        ...courseData,
        isEnrolled: userAccess?.isEnrolled || false,
        enrollmentStatus: userAccess?.enrollmentStatus,
        userProgress: userAccess?.progress,
        structure: {
          ...courseData?.structure,
          totalUnits: contentStats.totalUnits,
          totalLessons: contentStats.totalLessons,
          totalLectures: contentStats.totalLectures,
          totalDuration: courseData?.structure?.totalDuration || contentStats.totalDuration
        }
      };
      
      console.log('Enriched course structure:', {
        units: enrichedCourse.structure?.units?.length,
        totalUnits: enrichedCourse.structure?.totalUnits,
        totalLessons: enrichedCourse.structure?.totalLessons,
        totalLectures: enrichedCourse.structure?.totalLectures,
        isEnrolled: enrichedCourse.isEnrolled
      });
      
      setCourse(enrichedCourse);
    } catch (error) {
      console.error('Failed to load course:', error);
      Alert.alert('Error', 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollFree = async () => {
    try {
      setEnrolling(true);
      await courseService.enrollInCourse(course!._id);
      Alert.alert('🎉 Congratulations!', 'You have been enrolled in this course!', [
        { text: 'Start Learning', onPress: () => router.push(`/courses/${course!._id}/learn`) }
      ]);
      loadCourse();
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to purchase this course');
      router.push('/auth/login');
      return;
    }

    try {
      setEnrolling(true);
      
      const oneTimeAmount = course?.pricing?.oneTime?.amount;
      const subscriptionAmount = course?.pricing?.subscription?.monthly?.amount;
      const paymentAmount = oneTimeAmount || subscriptionAmount || course?.pricing?.amount || 0;
      
      const orderResponse = await courseService.createPaymentOrder(course!._id, paymentAmount);
      const { orderId, amount, currency, razorpayKeyId } = orderResponse.data;

      const checkoutHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #333; text-align: center; }
    .info { margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 6px; }
    .label { font-weight: bold; color: #666; }
    .value { color: #333; }
    button { width: 100%; padding: 14px; background: #4A2E1C; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Complete Payment</h2>
    <div class="info"><div class="label">Course</div><div class="value">${course!.title}</div></div>
    <div class="info"><div class="label">Amount</div><div class="value">₹${(amount / 100).toFixed(2)}</div></div>
    <button onclick="startPayment()">Pay Now</button>
  </div>
  <script>
    function startPayment() {
      var options = {
        key: '${razorpayKeyId}', amount: ${amount}, currency: '${currency}',
        name: 'ShlokaYug', description: '${course!.title}', order_id: '${orderId}',
        prefill: { name: '${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}', email: '${user?.email || ''}' },
        theme: { color: '#4A2E1C' },
        handler: function(response) { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', data: response })); },
        modal: { ondismiss: function() { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cancelled' })); } }
      };
      var rzp = new Razorpay(options);
      rzp.on('payment.failed', function(response) { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'failed', error: response.error })); });
      rzp.open();
    }
    setTimeout(startPayment, 500);
  </script>
</body>
</html>`;

      setPaymentHtml(checkoutHtml);
      setShowPaymentModal(true);
      setEnrolling(false);
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      Alert.alert('Error', 'Failed to initiate payment');
      setEnrolling(false);
    }
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      console.log('📱 WebView message received:', event.nativeEvent.data);
      const message = JSON.parse(event.nativeEvent.data);
      console.log('📱 Parsed message:', message);
      
      if (message.type === 'success') {
        setShowPaymentModal(false);
        setEnrolling(true);
        
        try {
          console.log('🔐 Verifying payment...', {
            order_id: message.data.razorpay_order_id,
            payment_id: message.data.razorpay_payment_id,
            courseId: course!._id
          });
          
          const verifyResponse = await courseService.verifyPayment({
            razorpay_order_id: message.data.razorpay_order_id,
            razorpay_payment_id: message.data.razorpay_payment_id,
            razorpay_signature: message.data.razorpay_signature,
            courseId: course!._id,
          });
          
          console.log('✅ Payment verification response:', JSON.stringify(verifyResponse, null, 2));

          // Wait a moment for backend enrollment to complete
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Reload course to get updated enrollment status
          await loadCourse();

          Alert.alert('🎉 Success!', 'Payment successful! You are now enrolled.', [
            { text: 'Start Learning', onPress: () => router.push(`/courses/${course!._id}/learn`) }
          ]);
        } catch (verifyError: any) {
          console.error('❌ Payment verification error:', verifyError);
          console.error('❌ Error response:', verifyError.response?.data);
          // Even if verification API fails, the payment might have succeeded on Razorpay side
          // and the webhook might handle enrollment. Show a softer error message.
          Alert.alert(
            'Payment Processing', 
            'Your payment may have been processed. Please check your "My Learning" section. If the course is not visible, contact support.',
            [
              { text: 'Check My Learning', onPress: () => router.push('/(tabs)/learn') },
              { text: 'OK', style: 'cancel' }
            ]
          );
        } finally {
          setEnrolling(false);
        }
      } else if (message.type === 'cancelled') {
        console.log('📱 Payment cancelled by user');
        setShowPaymentModal(false);
      } else if (message.type === 'failed') {
        console.log('📱 Payment failed:', message.error);
        setShowPaymentModal(false);
        Alert.alert('Payment Failed', message.error?.description || 'Payment failed. Please try again.');
      } else {
        console.log('📱 Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('WebView message parse error:', error);
      console.error('Raw message data:', event.nativeEvent?.data);
      // Don't show error alert for parse errors - might be internal Razorpay messages
      // setShowPaymentModal(false);
    }
  };

  const handleEnroll = () => {
    const oneTimeAmount = course?.pricing?.oneTime?.amount;
    const subscriptionAmount = course?.pricing?.subscription?.monthly?.amount;
    const oldAmount = course?.pricing?.amount;
    const oldType = course?.pricing?.type;
    
    const isFree = oldType === 'free' || 
                   (!oneTimeAmount && !subscriptionAmount && !oldAmount) ||
                   (oneTimeAmount === 0 && subscriptionAmount === 0);
    
    if (isFree) {
      handleEnrollFree();
    } else {
      handlePayment();
    }
  };

  const getPrice = () => {
    const oneTimeAmount = course?.pricing?.oneTime?.amount;
    const subscriptionAmount = course?.pricing?.subscription?.monthly?.amount;
    const oldAmount = course?.pricing?.amount;
    const oldType = course?.pricing?.type;
    
    if (oldType === 'free') return { text: 'Free', isFree: true };
    if (oneTimeAmount && oneTimeAmount > 0) return { text: `₹${oneTimeAmount}`, isFree: false };
    if (subscriptionAmount && subscriptionAmount > 0) return { text: `₹${subscriptionAmount}/mo`, isFree: false };
    if (oldAmount && oldAmount > 0) return { text: `₹${oldAmount}`, isFree: false };
    return { text: 'Free', isFree: true };
  };

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { color: '#10b981', bg: '#d1fae5', label: 'Beginner', icon: 'leaf' };
      case 'intermediate': return { color: SAFFRON, bg: '#FEF3E8', label: 'Intermediate', icon: 'trending-up' };
      case 'advanced': return { color: '#ef4444', bg: '#fee2e2', label: 'Advanced', icon: 'flash' };
      case 'expert': return { color: '#7c3aed', bg: '#ede9fe', label: 'Expert', icon: 'diamond' };
      default: return { color: COPPER, bg: SAND, label: 'All Levels', icon: 'school' };
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      'vedic_chanting': 'Vedic Chanting',
      'sanskrit_language': 'Sanskrit Language',
      'philosophy': 'Philosophy',
      'rituals_ceremonies': 'Rituals & Ceremonies',
      'yoga_meditation': 'Yoga & Meditation',
      'ayurveda': 'Ayurveda',
      'music_arts': 'Music & Arts',
      'scriptures': 'Scriptures',
      'other': 'Other',
    };
    return labels[cat] || cat;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <View className="w-16 h-16 bg-[#F3E4C8] rounded-full items-center justify-center mb-4">
          <ActivityIndicator size="large" color={PRIMARY_BROWN} />
        </View>
        <Text className="text-gray-600 font-medium">Loading course details...</Text>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Ionicons name="alert-circle" size={60} color="#ef4444" />
        <Text className="text-gray-600 text-lg mt-4">Course not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-6 py-3 rounded-xl" style={{ backgroundColor: SAFFRON }}>
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const priceInfo = getPrice();
  const difficultyConfig = getDifficultyConfig(course.metadata?.difficulty);
  const thumbnailUrl = getFullImageUrl(course.thumbnail);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Animated Header */}
      <Animated.View 
        className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
        style={{ opacity: headerOpacity }}
      >
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center justify-between px-4 py-3">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={20} color="#333" />
            </TouchableOpacity>
            <Text className="text-gray-900 text-lg font-bold flex-1 text-center mx-4" numberOfLines={1}>{course.title}</Text>
            <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="share-social" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Hero Section with Thumbnail */}
        <View className="relative">
          {thumbnailUrl ? (
            <Image source={{ uri: thumbnailUrl }} className="w-full h-72" resizeMode="cover" />
          ) : (
            <View className="w-full h-72 bg-[#E5D1AF] items-center justify-center">
              <Ionicons name="book" size={80} color={PRIMARY_BROWN} />
            </View>
          )}
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            className="absolute bottom-0 left-0 right-0 h-32"
          />

          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="absolute top-4 left-4 w-10 h-10 bg-black/30 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity className="absolute top-4 right-4 w-10 h-10 bg-black/30 rounded-full items-center justify-center">
            <Ionicons name="share-social" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Enrolled Badge */}
          {course.isEnrolled && (
            <View className="absolute top-4 left-16 bg-emerald-500 px-3 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text className="text-white text-sm font-bold ml-1">Enrolled</Text>
            </View>
          )}

          {/* Price Badge */}
          <View className={`absolute top-4 right-16 px-4 py-1.5 rounded-full ${priceInfo.isFree ? 'bg-emerald-500' : ''}`} style={!priceInfo.isFree ? { backgroundColor: SAFFRON } : undefined}>
            <Text className="text-white text-base font-bold">{priceInfo.text}</Text>
          </View>

          {/* Title on Image */}
          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-white text-2xl font-bold" numberOfLines={2}>{course.title}</Text>
            <Text className="text-white/80 text-sm mt-1" numberOfLines={1}>by {course.instructor?.name}</Text>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View className="flex-row px-4 py-4 -mt-4 bg-white rounded-t-3xl">
          <View className="flex-1 items-center py-2">
            <View className="flex-row items-center">
              <Ionicons name="star" size={18} color="#fbbf24" />
              <Text className="text-gray-900 text-lg font-bold ml-1">{(course.stats?.rating || course.stats?.ratings?.average || 0).toFixed(1)}</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">{course.stats?.reviews || course.stats?.ratings?.count || 0} reviews</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center py-2">
            <View className="flex-row items-center">
              <Ionicons name="people" size={18} color={COPPER} />
              <Text className="text-gray-900 text-lg font-bold ml-1">{course.stats?.enrollments || course.stats?.enrollment?.total || 0}</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">students</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center py-2">
            <View className="flex-row items-center">
              <Ionicons name="time" size={18} color="#3b82f6" />
              <Text className="text-gray-900 text-lg font-bold ml-1">{Math.floor((course.structure?.totalDuration || 0) / 60)}h</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">{(course.structure?.totalDuration || 0) % 60}m</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row bg-white px-4 pb-3 border-b border-gray-100">
          {(['overview', 'curriculum', 'instructor'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveSection(tab)}
              className={`flex-1 py-3 rounded-xl ${activeSection !== tab && 'bg-gray-100'} mx-1`}
              style={activeSection === tab ? { backgroundColor: COPPER } : undefined}
              activeOpacity={0.8}
            >
              <Text className={`text-center font-semibold capitalize ${activeSection === tab ? 'text-white' : 'text-gray-600'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Sections */}
        <View className="px-4 py-6">
          {activeSection === 'overview' && (
            <>
              {/* Course Info Cards */}
              <View className="flex-row mb-6">
                <InfoCard icon="school" label="Difficulty" value={difficultyConfig.label} color={difficultyConfig.color} />
                <InfoCard icon="language" label="Language" value={course.metadata?.language?.instruction || 'English'} color="#3b82f6" />
              </View>
              <View className="flex-row mb-6">
                <InfoCard icon="pricetag" label="Category" value={getCategoryLabel(course.metadata?.category?.[0] || 'other')} color="#8b5cf6" />
                <InfoCard icon="layers" label="Content" value={`${course.structure?.totalLectures || 0} Lectures`} color="#f59e0b" />
              </View>

              {/* Short Description */}
              {course.shortDescription && (
                <View className="bg-[#FDF8E8] rounded-2xl p-4 mb-6 border border-[#EDD999]">
                  <Text className="text-[#8B6914] text-base leading-6 italic">&ldquo;{course.shortDescription}&rdquo;</Text>
                </View>
              )}

              {/* Full Description */}
              <View className="mb-6">
                <SectionHeader icon="document-text" title="About This Course" />
                <View className="bg-white rounded-2xl p-4 border border-gray-100">
                  <Text className="text-gray-700 text-base leading-7">{course.description}</Text>
                </View>
              </View>

              {/* Learning Objectives - if available from course data */}
              {course.learningObjectives && course.learningObjectives.length > 0 && (
                <View className="mb-6">
                  <SectionHeader icon="bulb" title="What You'll Learn" subtitle="Key learning outcomes" />
                  <View className="bg-white rounded-2xl p-4 border border-gray-100">
                    {course.learningObjectives.map((objective: string, index: number) => (
                      <ListItem key={index} text={objective} />
                    ))}
                  </View>
                </View>
              )}

              {/* Prerequisites - if available */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <View className="mb-6">
                  <SectionHeader icon="clipboard" title="Prerequisites" subtitle="What you need to know" />
                  <View className="bg-white rounded-2xl p-4 border border-gray-100">
                    {course.prerequisites.map((prereq: string, index: number) => (
                      <ListItem key={index} text={prereq} icon="alert-circle" />
                    ))}
                  </View>
                </View>
              )}

              {/* Target Audience - if available */}
              {course.targetAudience && course.targetAudience.length > 0 && (
                <View className="mb-6">
                  <SectionHeader icon="people" title="Who This Course is For" subtitle="Target audience" />
                  <View className="bg-white rounded-2xl p-4 border border-gray-100">
                    {course.targetAudience.map((audience: string, index: number) => (
                      <ListItem key={index} text={audience} icon="person" />
                    ))}
                  </View>
                </View>
              )}

              {/* Course Stats */}
              <View className="mb-6">
                <SectionHeader icon="stats-chart" title="Course Details" subtitle="What's included" />
                <View className="bg-white rounded-2xl p-4 border border-gray-100">
                  <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
                    <View className="flex-row items-center">
                      <Ionicons name="folder" size={20} color={PRIMARY_BROWN} />
                      <Text className="text-gray-700 text-base ml-3">Total Units</Text>
                    </View>
                    <Text className="text-gray-900 font-bold text-lg">{course.structure?.totalUnits || 0}</Text>
                  </View>
                  <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
                    <View className="flex-row items-center">
                      <Ionicons name="book" size={20} color={COPPER} />
                      <Text className="text-gray-700 text-base ml-3">Total Lessons</Text>
                    </View>
                    <Text className="text-gray-900 font-bold text-lg">{course.structure?.totalLessons || 0}</Text>
                  </View>
                  <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
                    <View className="flex-row items-center">
                      <Ionicons name="play-circle" size={20} color={GOLD} />
                      <Text className="text-gray-700 text-base ml-3">Total Lectures</Text>
                    </View>
                    <Text className="text-gray-900 font-bold text-lg">{course.structure?.totalLectures || 0}</Text>
                  </View>
                  <View className="flex-row items-center justify-between py-3">
                    <View className="flex-row items-center">
                      <Ionicons name="time" size={20} color={SAFFRON} />
                      <Text className="text-gray-700 text-base ml-3">Total Duration</Text>
                    </View>
                    <Text className="text-gray-900 font-bold text-lg">
                      {Math.floor((course.structure?.totalDuration || 0) / 60)}h {(course.structure?.totalDuration || 0) % 60}m
                    </Text>
                  </View>
                </View>
              </View>

              {/* Tags */}
              {course.metadata?.tags && course.metadata.tags.length > 0 && (
                <View className="mb-6">
                  <SectionHeader icon="pricetags" title="Tags" />
                  <View className="flex-row flex-wrap">
                    {course.metadata.tags.map((tag: string, index: number) => (
                      <View key={index} className="bg-[#F3E4C8] px-3 py-1.5 rounded-full mr-2 mb-2">
                        <Text className="text-[#B87333] text-sm">#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          {activeSection === 'curriculum' && (
            <>
              {/* Curriculum Header */}
              <View className="bg-[#FDF8E8] rounded-2xl p-4 mb-4 border border-[#EDD999]">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-[#8B6914] text-lg font-bold">Course Curriculum</Text>
                    <Text className="text-[#B87333] text-sm mt-1">
                      {course.structure?.totalUnits || 0} Units • {course.structure?.totalLessons || 0} Lessons • {course.structure?.totalLectures || 0} Lectures
                    </Text>
                  </View>
                  {!course.isEnrolled && (
                    <View className="bg-[#FEF3E8] px-3 py-1.5 rounded-lg flex-row items-center">
                      <Ionicons name="lock-closed" size={14} color={SAFFRON} />
                      <Text className="text-[#DD7A1F] text-xs font-medium ml-1">Preview</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Units List */}
              {course.structure?.units && course.structure.units.length > 0 ? (
                course.structure.units
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((unit: any, index: number) => (
                    <UnitCard 
                      key={unit.unitId || index} 
                      unit={unit} 
                      index={index} 
                      isEnrolled={course.isEnrolled}
                      totalUnits={course.structure.units.length}
                    />
                  ))
              ) : (
                <View className="bg-gray-100 rounded-2xl p-8 items-center">
                  <Ionicons name="folder-open" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 text-base mt-3">Curriculum coming soon</Text>
                </View>
              )}
            </>
          )}

          {activeSection === 'instructor' && (
            <>
              {/* Instructor Card */}
              <View className="bg-white rounded-2xl p-6 border border-gray-100 mb-6" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}>
                <View className="flex-row items-center mb-4">
                  <View className="w-20 h-20 bg-[#F3E4C8] rounded-full items-center justify-center">
                    {course.instructor?.avatar ? (
                      <Image source={{ uri: getFullImageUrl(course.instructor.avatar) }} className="w-20 h-20 rounded-full" />
                    ) : (
                      <Ionicons name="person" size={40} color={PRIMARY_BROWN} />
                    )}
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-gray-900 text-xl font-bold">{course.instructor?.name || 'Unknown Instructor'}</Text>
                    <Text className="text-[#B87333] text-sm mt-1">{course.instructor?.credentials || 'Instructor'}</Text>
                  </View>
                </View>

                {course.instructor?.bio && (
                  <Text className="text-gray-700 text-base leading-6 mb-4">{course.instructor.bio}</Text>
                )}

                {course.instructor?.specializations && course.instructor.specializations.length > 0 && (
                  <View className="pt-4 border-t border-gray-100">
                    <Text className="text-gray-500 text-sm font-medium mb-2">Specializations</Text>
                    <View className="flex-row flex-wrap">
                      {course.instructor.specializations.map((spec: string, index: number) => (
                        <View key={index} className="bg-[#F3E4C8] px-3 py-1.5 rounded-full mr-2 mb-2">
                          <Text className="text-[#B87333] text-sm">{spec}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* Bottom Padding */}
        <View className="h-32" />
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 }}>
        <SafeAreaView edges={['bottom']}>
          <View className="flex-row items-center">
            {/* Price Section */}
            <View className="flex-1">
              <Text className="text-gray-500 text-xs">Total Price</Text>
              <Text className={`text-2xl font-bold ${priceInfo.isFree ? 'text-emerald-600' : 'text-gray-900'}`}>
                {priceInfo.text}
              </Text>
            </View>

            {/* Action Button */}
            {course.isEnrolled ? (
              <TouchableOpacity
                onPress={() => router.push(`/courses/${course._id}/learn`)}
                className="bg-emerald-500 px-8 py-4 rounded-2xl flex-row items-center"
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle" size={22} color="#fff" />
                <Text className="text-white text-lg font-bold ml-2">Study Now</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleEnroll}
                disabled={enrolling}
                className="px-8 py-4 rounded-2xl flex-row items-center"
                style={{ backgroundColor: SAFFRON }}
                activeOpacity={0.8}
              >
                {enrolling ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons 
                      name={priceInfo.isFree ? 'checkmark-circle' : 'card'} 
                      size={22} 
                      color="#fff" 
                    />
                    <Text className="text-white text-lg font-bold ml-2">
                      {priceInfo.isFree ? 'Enroll Free' : 'Buy Now'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">Complete Payment</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: paymentHtml }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={PRIMARY_BROWN} />
                <Text className="mt-4 text-gray-600">Loading payment gateway...</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
