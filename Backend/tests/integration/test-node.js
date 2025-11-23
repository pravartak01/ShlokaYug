// Simple test without PowerShell complexity
const http = require('http');

console.log('🧪 Testing Auto-Enrollment Integration...');

let authToken = null;
let userId = null;

// Login to get token
const login = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      identifier: "test@example.com",
      password: "Test123!@#"
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          authToken = response.data.tokens.access;
          userId = response.data.user.id;
          console.log('✅ Login successful');
          console.log(`👤 User ID: ${userId}`);
          resolve(true);
        } else {
          console.log(`❌ Login failed: ${res.statusCode}`);
          console.log(`Response: ${data}`);
          reject(new Error('Login failed'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Test auto-enroll with authentication
const testAutoEnroll = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      transactionId: "TXN_TEST_INTEGRATION_123",
      userId: userId,
      courseId: "507f1f77bcf86cd799439022"
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/enrollments/auto-enroll',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('🚀 Testing Auto-Enrollment with Auth...');
    console.log(`📦 Payload:`, JSON.parse(postData));

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📊 Response:`, data);
        
        if (res.statusCode === 201) {
          const response = JSON.parse(data);
          console.log('✅ Auto-Enrollment SUCCESS!');
          console.log(`🎓 Enrollment ID: ${response.enrollment.enrollmentId}`);
        } else if (res.statusCode === 404) {
          console.log('❌ Course not found (expected in test environment)');
        } else if (res.statusCode === 500) {
          console.log('⚠️ Server error (check logs for details)');
        } else {
          console.log(`❓ Unexpected status: ${res.statusCode}`);
        }
        
        resolve(res.statusCode);
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Run complete integration test
async function runIntegrationTest() {
  try {
    console.log('='.repeat(60));
    console.log('🚀 INTEGRATION TEST: Payment → Auto-Enrollment');
    console.log('='.repeat(60));
    
    await login();
    console.log('-'.repeat(60));
    await testAutoEnroll();
    
    console.log('='.repeat(60));
    console.log('🏁 Integration test completed!');
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

runIntegrationTest();