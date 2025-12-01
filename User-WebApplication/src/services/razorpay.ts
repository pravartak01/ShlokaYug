/**
 * Razorpay Integration
 * Handles payment processing with Razorpay
 */

import courseService from './courseService';

// Razorpay script URL
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

// Load Razorpay script dynamically
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Razorpay payment options interface
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Initialize Razorpay payment
 * @param courseId - Course ID to enroll in
 * @param amount - Payment amount in INR
 * @param onSuccess - Callback on successful payment
 * @param onError - Callback on payment error
 */
export const initiatePayment = async (
  courseId: string,
  amount: number,
  courseName: string,
  onSuccess: (paymentId: string) => void,
  onError: (error: Error) => void
) => {
  try {
    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Create payment order
    const orderResponse = await courseService.createPaymentOrder(courseId, amount);
    console.log('📦 Order Response:', orderResponse);
    
    // Extract data from nested response structure
    const orderData = orderResponse.data || orderResponse;
    const { orderId, razorpayKeyId } = orderData;
    
    if (!orderId) {
      throw new Error('Order ID not received from server');
    }
    
    if (!razorpayKeyId) {
      throw new Error('Razorpay Key ID not configured on server');
    }

    console.log('🔑 Using Razorpay Key:', razorpayKeyId);
    console.log('📋 Order ID:', orderId);

    // Razorpay options
    const options: RazorpayOptions = {
      key: razorpayKeyId,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      order_id: orderId,
      name: 'Chandas Identifier',
      description: `Enrollment for ${courseName}`,
      // Removed image: '/logo.png' - causes CORS error with localhost
      handler: async (response: RazorpayResponse) => {
        try {
          console.log('✅ Payment Response:', response);
          console.log('📝 Course ID for enrollment:', courseId);
          
          // Verify payment with courseId
          const verificationData = await courseService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            courseId, // Critical: Pass courseId to backend
          });

          console.log('✅ Verification Response:', verificationData);

          if (verificationData.success) {
            onSuccess(response.razorpay_payment_id);
          } else {
            onError(new Error('Payment verification failed'));
          }
        } catch (err) {
          console.error('❌ Verification Error:', err);
          onError(err as Error);
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#8B0000', // Maroon red to match vintage theme
      },
      modal: {
        ondismiss: () => {
          console.log('⚠️ Payment cancelled by user');
          onError(new Error('Payment cancelled'));
        },
      },
    };

    console.log('🚀 Opening Razorpay checkout...');
    
    // Create Razorpay instance and open checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('❌ Payment Error:', error);
    onError(error as Error);
  }
};

/**
 * Enroll in free course
 * @param courseId - Course ID to enroll in
 */
export const enrollInFreeCourse = async (courseId: string) => {
  try {
    const response = await courseService.enrollInCourse(courseId);
    return response;
  } catch (error) {
    throw error;
  }
};

export default { initiatePayment, enrollInFreeCourse };
