/**
 * CourseDetailScreen
 * Displays detailed course information with enrollment/payment options
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import courseService, { Course } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState('');

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(id as string);
      console.log('Course response:', response);
      // Backend returns { success: true, data: { course: {...}, userAccess: {...} } }
      const courseData = response.data?.course || response.course;
      setCourse(courseData);
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
      Alert.alert('Success', 'You have been enrolled in this course!', [
        { text: 'Start Learning', onPress: () => router.push(`/courses/${course!._id}/learn`) }
      ]);
      loadCourse(); // Reload to update enrollment status
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
      
      // Create Razorpay order with amount from new pricing structure
      const oneTimeAmount = (course!.pricing as any)?.oneTime?.amount;
      const subscriptionAmount = (course!.pricing as any)?.subscription?.monthly?.amount;
      const paymentAmount = oneTimeAmount || subscriptionAmount || course!.pricing?.amount || 0;
      
      const orderResponse = await courseService.createPaymentOrder(
        course!._id, 
        paymentAmount
      );
      const { orderId, amount, currency, razorpayKeyId } = orderResponse.data;

      // Create Razorpay checkout HTML for WebView
      const checkoutHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h2 { color: #333; text-align: center; }
    .info { margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 6px; }
    .label { font-weight: bold; color: #666; }
    .value { color: #333; }
    button {
      width: 100%;
      padding: 14px;
      background: #f97316;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 20px;
    }
    button:active { opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Complete Payment</h2>
    <div class="info">
      <div class="label">Course</div>
      <div class="value">${course!.title}</div>
    </div>
    <div class="info">
      <div class="label">Amount</div>
      <div class="value">₹${(amount / 100).toFixed(2)}</div>
    </div>
    <div class="info">
      <div class="label">Order ID</div>
      <div class="value">${orderId}</div>
    </div>
    <button onclick="startPayment()">Pay Now</button>
  </div>

  <script>
    function startPayment() {
      var options = {
        key: '${razorpayKeyId}',
        amount: ${amount},
        currency: '${currency}',
        name: 'Sanskrit Learning Platform',
        description: '${course!.title}',
        order_id: '${orderId}',
        prefill: {
          name: '${user.profile?.firstName} ${user.profile?.lastName}',
          email: '${user.email}',
          contact: '${user.email}'
        },
        theme: {
          color: '#f97316'
        },
        handler: function (response) {
          // Payment successful
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'success',
            data: response
          }));
        },
        modal: {
          ondismiss: function() {
            // Payment cancelled
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'cancelled'
            }));
          }
        }
      };

      var rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response) {
        // Payment failed
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'failed',
          error: response.error
        }));
      });
      
      rzp.open();
    }

    // Auto-start payment on load
    setTimeout(startPayment, 500);
  </script>
</body>
</html>
      `;

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
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'success') {
        setShowPaymentModal(false);
        setEnrolling(true);
        
        try {
          await courseService.verifyPayment({
            razorpay_order_id: message.data.razorpay_order_id,
            razorpay_payment_id: message.data.razorpay_payment_id,
            razorpay_signature: message.data.razorpay_signature,
            courseId: course!._id,
          });

          Alert.alert('Success', 'Payment successful! You are now enrolled.', [
            { text: 'Start Learning', onPress: () => router.push('/') }
          ]);
          loadCourse();
        } catch (verifyError: any) {
          Alert.alert('Error', 'Payment verification failed. Please contact support.');
          console.error('Payment verification failed:', verifyError);
        } finally {
          setEnrolling(false);
        }
      } else if (message.type === 'cancelled') {
        setShowPaymentModal(false);
        Alert.alert('Payment Cancelled', 'You cancelled the payment.');
      } else if (message.type === 'failed') {
        setShowPaymentModal(false);
        Alert.alert('Payment Failed', message.error?.description || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('WebView message error:', error);
      setShowPaymentModal(false);
    }
  };

  const handleEnroll = () => {
    // Check if course is free using new pricing structure
    const oneTimeAmount = (course?.pricing as any)?.oneTime?.amount;
    const subscriptionAmount = (course?.pricing as any)?.subscription?.monthly?.amount;
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-ancient-50 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-ancient-50 items-center justify-center">
        <Text className="text-ancient-600">Course not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ancient-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 bg-white border-b border-ancient-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#5c4106" />
        </TouchableOpacity>
        <Text className="text-ancient-800 text-lg font-bold">Course Details</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="share-social" size={24} color="#5c4106" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        {course.thumbnail ? (
          <Image
            source={{ uri: course.thumbnail }}
            className="w-full h-64"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-64 bg-gradient-to-br from-ancient-400 to-ancient-600 items-center justify-center">
            <Ionicons name="book" size={80} color="white" />
          </View>
        )}

        {/* Content */}
        <View className="p-6">
          {/* Title & Rating */}
          <Text className="text-ancient-800 text-2xl font-bold mb-3">
            {course.title}
          </Text>

          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center mr-4">
              <Ionicons name="star" size={18} color="#f59e0b" />
              <Text className="text-ancient-700 text-base ml-1 font-semibold">
                {(course.stats?.rating || 0).toFixed(1)}
              </Text>
              <Text className="text-ancient-500 text-sm ml-1">
                ({course.stats?.reviews || 0} reviews)
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="people" size={18} color="#6b7280" />
              <Text className="text-ancient-600 text-base ml-1">
                {course.stats?.enrollments || 0}+ students
              </Text>
            </View>
          </View>

          {/* Instructor */}
          <View className="bg-white p-4 rounded-xl mb-4 border border-ancient-200">
            <Text className="text-ancient-600 text-sm mb-1">Instructor</Text>
            <View className="flex-row items-center">
              <Ionicons name="person-circle" size={40} color="#996f0a" />
              <View className="ml-3">
                <Text className="text-ancient-800 text-lg font-semibold">
                  {course.instructor?.name || 'Unknown'}
                </Text>
                <Text className="text-ancient-600 text-sm">
                  {course.instructor?.credentials || 'Instructor'}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-ancient-800 text-lg font-bold mb-2">
              About this Course
            </Text>
            <Text className="text-ancient-700 text-base leading-6">
              {course.description}
            </Text>
          </View>

          {/* Course Stats */}
          <View className="bg-white p-4 rounded-xl mb-4 border border-ancient-200">
            <Text className="text-ancient-800 text-lg font-bold mb-3">
              Course Content
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <Ionicons name="book-outline" size={20} color="#996f0a" />
                  <Text className="text-ancient-700 text-base ml-3">Units</Text>
                </View>
                <Text className="text-ancient-800 font-semibold">
                  {course.structure?.totalUnits || 0}
                </Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <Ionicons name="list-outline" size={20} color="#996f0a" />
                  <Text className="text-ancient-700 text-base ml-3">Lessons</Text>
                </View>
                <Text className="text-ancient-800 font-semibold">
                  {course.structure?.totalLessons || 0}
                </Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <Ionicons name="play-circle-outline" size={20} color="#996f0a" />
                  <Text className="text-ancient-700 text-base ml-3">Lectures</Text>
                </View>
                <Text className="text-ancient-800 font-semibold">
                  {course.structure?.totalLectures || 0}
                </Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={20} color="#996f0a" />
                  <Text className="text-ancient-700 text-base ml-3">Duration</Text>
                </View>
                <Text className="text-ancient-800 font-semibold">
                  {Math.floor((course.structure?.totalDuration || 0) / 60)}h {(course.structure?.totalDuration || 0) % 60}m
                </Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          <View className="mb-6">
            <Text className="text-ancient-800 text-lg font-bold mb-3">Tags</Text>
            <View className="flex-row flex-wrap">
              {(course.metadata?.tags || []).map((tag, index) => (
                <View
                  key={index}
                  className="bg-ancient-100 px-3 py-1 rounded-full mr-2 mb-2"
                >
                  <Text className="text-ancient-700 text-sm">#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="bg-white p-6 border-t border-ancient-200">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-ancient-600 text-sm">Price</Text>
            <Text className="text-ancient-800 text-2xl font-bold">
              {(() => {
                const oneTimeAmount = (course.pricing as any)?.oneTime?.amount;
                const subscriptionAmount = (course.pricing as any)?.subscription?.monthly?.amount;
                const oldAmount = course.pricing?.amount;
                const oldType = course.pricing?.type;
                
                if (oldType === 'free') return 'Free';
                if (oneTimeAmount && oneTimeAmount > 0) return `₹${oneTimeAmount}`;
                if (subscriptionAmount && subscriptionAmount > 0) return `₹${subscriptionAmount}/mo`;
                if (oldAmount && oldAmount > 0) return `₹${oldAmount}`;
                return 'Free';
              })()}
            </Text>
          </View>
          {course.isEnrolled ? (
            <TouchableOpacity
              onPress={() => router.push(`/courses/${course._id}/learn`)}
              className="bg-green-500 px-6 py-4 rounded-xl flex-row items-center"
            >
              <Ionicons name="play-circle" size={24} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                Continue Learning
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleEnroll}
              disabled={enrolling}
              className="bg-saffron-500 px-6 py-4 rounded-xl flex-row items-center"
            >
              {enrolling ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons 
                    name={(() => {
                      const oneTimeAmount = (course.pricing as any)?.oneTime?.amount;
                      const subscriptionAmount = (course.pricing as any)?.subscription?.monthly?.amount;
                      const oldAmount = course.pricing?.amount;
                      return (!oneTimeAmount && !subscriptionAmount && !oldAmount) || 
                             (course.pricing?.type === 'free') 
                        ? 'checkmark-circle' 
                        : 'card';
                    })()} 
                    size={24} 
                    color="white" 
                  />
                  <Text className="text-white text-lg font-semibold ml-2">
                    {(() => {
                      const oneTimeAmount = (course.pricing as any)?.oneTime?.amount;
                      const subscriptionAmount = (course.pricing as any)?.subscription?.monthly?.amount;
                      const oldAmount = course.pricing?.amount;
                      return (!oneTimeAmount && !subscriptionAmount && !oldAmount) || 
                             (course.pricing?.type === 'free') 
                        ? 'Enroll Now' 
                        : 'Buy Now';
                    })()}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Payment Modal with WebView */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">Complete Payment</Text>
            <TouchableOpacity
              onPress={() => {
                setShowPaymentModal(false);
                Alert.alert('Payment Cancelled', 'You cancelled the payment.');
              }}
            >
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
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="mt-4 text-gray-600">Loading payment gateway...</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
