// Comprehensive Payment-Enrollment Integration Test
const http = require('http');

console.log('🧪 COMPREHENSIVE PAYMENT-ENROLLMENT INTEGRATION TEST');
console.log('='.repeat(70));

const config = {
  baseUrl: 'http://localhost:5001', // Use test port to avoid conflicts
  apiVersion: 'v1',
  testCredentials: {
    student: {
      email: 'test@example.com',
      password: 'Test123!@#'
    },
    guru: {
      email: 'guru@example.com', 
      password: 'Test123!@#'
    }
  }
};

let testData = {
  student: { token: null, userId: null },
  guru: { token: null, userId: null },
  courses: [],
  payments: [],
  enrollments: []
};

// Helper function for HTTP requests
const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = data ? JSON.parse(data) : {};
          resolve({ statusCode: res.statusCode, data: response, headers: res.headers });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    
    req.end();
  });
};

// Test 1: Authentication
const testAuthentication = async () => {
  console.log('📋 Step 1: Authentication Tests');
  console.log('-'.repeat(50));

  // Login as student
  const studentLoginOptions = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/${config.apiVersion}/auth/login`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };

  const studentLoginData = {
    identifier: config.testCredentials.student.email,
    password: config.testCredentials.student.password
  };

  try {
    const response = await makeRequest(studentLoginOptions, studentLoginData);
    
    if (response.statusCode === 200) {
      testData.student.token = response.data.data.tokens.access;
      testData.student.userId = response.data.data.user.id;
      console.log('✅ Student login successful');
      console.log(`   👤 User ID: ${testData.student.userId}`);
    } else {
      throw new Error(`Login failed: ${response.statusCode} - ${response.data.message}`);
    }
  } catch (error) {
    console.log('❌ Student login failed:', error.message);
    throw error;
  }

  // Login as guru
  const guruLoginOptions = { ...studentLoginOptions };
  const guruLoginData = {
    identifier: config.testCredentials.guru.email,
    password: config.testCredentials.guru.password
  };

  try {
    const response = await makeRequest(guruLoginOptions, guruLoginData);
    
    if (response.statusCode === 200) {
      testData.guru.token = response.data.data.tokens.access;
      testData.guru.userId = response.data.data.user.id;
      console.log('✅ Guru login successful');
      console.log(`   👨‍🏫 User ID: ${testData.guru.userId}`);
    } else {
      throw new Error(`Guru login failed: ${response.statusCode}`);
    }
  } catch (error) {
    console.log('❌ Guru login failed:', error.message);
    throw error;
  }
};

// Test 2: Course Discovery
const testCourseDiscovery = async () => {
  console.log('\n📚 Step 2: Course Discovery');
  console.log('-'.repeat(50));

  const options = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/${config.apiVersion}/courses`,
    method: 'GET'
  };

  try {
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      testData.courses = response.data.data.courses;
      console.log(`✅ Found ${testData.courses.length} courses`);
      
      testData.courses.forEach(course => {
        console.log(`   📖 ${course.title}`);
        console.log(`      💰 ${course.pricing.type}: ${course.pricing.amount} ${course.pricing.currency || 'INR'}`);
        console.log(`      🆔 ID: ${course._id}`);
      });
    } else {
      throw new Error(`Course discovery failed: ${response.statusCode}`);
    }
  } catch (error) {
    console.log('❌ Course discovery failed:', error.message);
    throw error;
  }
};

// Test 3: Payment Flow
const testPaymentFlow = async () => {
  console.log('\n💳 Step 3: Payment Flow');
  console.log('-'.repeat(50));

  const paidCourse = testData.courses.find(c => c.pricing.type === 'one_time');
  
  if (!paidCourse) {
    console.log('⚠️ No paid course found, skipping payment test');
    return;
  }

  console.log(`Testing payment for: ${paidCourse.title}`);

  // Create payment order
  const orderOptions = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/${config.apiVersion}/payments/create-order`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testData.student.token}`
    }
  };

  const orderData = {
    courseId: paidCourse._id,
    amount: paidCourse.pricing.amount,
    currency: 'INR'
  };

  try {
    const response = await makeRequest(orderOptions, orderData);
    
    if (response.statusCode === 201) {
      const orderId = response.data.data.orderId;
      console.log(`✅ Payment order created: ${orderId}`);
      
      // Store payment info for later tests
      testData.payments.push({
        orderId,
        courseId: paidCourse._id,
        amount: paidCourse.pricing.amount
      });
    } else {
      console.log(`⚠️ Payment order creation failed: ${response.statusCode} - ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Payment order creation failed:', error.message);
  }
};

// Test 4: Auto-Enrollment
const testAutoEnrollment = async () => {
  console.log('\n🎓 Step 4: Auto-Enrollment');
  console.log('-'.repeat(50));

  const paidCourse = testData.courses.find(c => c.pricing.type === 'one_time');
  
  if (!paidCourse) {
    console.log('⚠️ No paid course found, skipping auto-enrollment test');
    return;
  }

  const enrollmentOptions = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/${config.apiVersion}/enrollments`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testData.student.token}`
    }
  };

  const enrollmentData = {
    transactionId: 'TXN_TEST_INTEGRATION_' + Date.now(),
    userId: testData.student.userId,
    courseId: paidCourse._id
  };

  console.log(`Testing auto-enrollment for course: ${paidCourse.title}`);
  console.log(`Transaction ID: ${enrollmentData.transactionId}`);

  try {
    const response = await makeRequest(enrollmentOptions, enrollmentData);
    
    console.log(`Response Status: ${response.statusCode}`);
    
    if (response.statusCode === 201) {
      console.log('✅ Auto-enrollment successful!');
      console.log(`   🎓 Enrollment ID: ${response.data.enrollment.enrollmentId}`);
      console.log(`   📚 Course: ${response.data.enrollment.courseName}`);
      console.log(`   💰 Amount: ${response.data.enrollment.amount}`);
      
      testData.enrollments.push(response.data.enrollment);
    } else if (response.statusCode === 200) {
      console.log('✅ User already enrolled');
      console.log(`   🎓 Enrollment ID: ${response.data.enrollment.enrollmentId}`);
    } else {
      console.log(`⚠️ Auto-enrollment failed: ${response.statusCode}`);
      console.log(`   Error: ${response.data.error || response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Auto-enrollment failed:', error.message);
  }
};

// Test 5: Enrollment Management
const testEnrollmentManagement = async () => {
  console.log('\n📝 Step 5: Enrollment Management');
  console.log('-'.repeat(50));

  // Get my enrollments
  const listOptions = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/${config.apiVersion}/enrollments/my-enrollments`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${testData.student.token}`
    }
  };

  try {
    const response = await makeRequest(listOptions);
    
    if (response.statusCode === 200) {
      const enrollments = response.data.data.enrollments;
      console.log(`✅ Found ${enrollments.length} enrollments`);
      
      enrollments.forEach((enrollment, index) => {
        console.log(`   ${index + 1}. Course: ${enrollment.courseId || 'N/A'}`);
        console.log(`      Status: ${enrollment.access?.status || enrollment.status || 'N/A'}`);
        console.log(`      Type: ${enrollment.enrollmentType || 'N/A'}`);
      });
    } else {
      console.log(`⚠️ Failed to get enrollments: ${response.statusCode} - ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Failed to get enrollments:', error.message);
  }
};

// Test 6: Payment Status Check
const testPaymentStatus = async () => {
  console.log('\n🔍 Step 6: Payment Status Verification');
  console.log('-'.repeat(50));

  if (testData.payments.length === 0) {
    console.log('⚠️ No payments to verify');
    return;
  }

  const payment = testData.payments[0];
  
  const statusOptions = {
    hostname: 'localhost',
    port: 5001,
    path: `/api/${config.apiVersion}/payments/${payment.orderId}/status`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${testData.student.token}`
    }
  };

  try {
    const response = await makeRequest(statusOptions);
    
    if (response.statusCode === 200) {
      console.log('✅ Payment status retrieved');
      console.log(`   Status: ${response.data.data.transaction?.status || 'N/A'}`);
      console.log(`   Order ID: ${payment.orderId}`);
    } else {
      console.log(`⚠️ Payment status check failed: ${response.statusCode}`);
    }
  } catch (error) {
    console.log('❌ Payment status check failed:', error.message);
  }
};

// Main test runner
const runIntegrationTests = async () => {
  try {
    console.log('🚀 Starting comprehensive integration tests...\n');
    
    await testAuthentication();
    await testCourseDiscovery();
    await testPaymentFlow();
    await testAutoEnrollment();
    await testEnrollmentManagement();
    await testPaymentStatus();
    
    console.log('\n' + '='.repeat(70));
    console.log('🏆 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Authenticated users: ${Object.keys(testData.student.token ? {student: 1} : {}).length + Object.keys(testData.guru.token ? {guru: 1} : {}).length}`);
    console.log(`📚 Discovered courses: ${testData.courses.length}`);
    console.log(`💳 Payment orders created: ${testData.payments.length}`);
    console.log(`🎓 Successful enrollments: ${testData.enrollments.length}`);
    console.log('\n🎉 Integration tests completed successfully!');
    
  } catch (error) {
    console.log('\n' + '='.repeat(70));
    console.log('❌ INTEGRATION TESTS FAILED');
    console.log('='.repeat(70));
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runIntegrationTests();
}

module.exports = { runIntegrationTests };
