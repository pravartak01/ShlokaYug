// Simple Auto-Enrollment Test
const http = require('http');

const testData = {
  transactionId: "TXN_TEST_123",
  userId: "507f1f77bcf86cd799439011", // dummy ObjectId
  courseId: "507f1f77bcf86cd799439022"
};

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/enrollments/auto-enroll',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dummy-token-for-testing'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(JSON.stringify(testData));
req.end();

console.log('Testing auto-enroll endpoint...');
console.log('Request data:', testData);