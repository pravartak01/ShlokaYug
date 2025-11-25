// Simple test to check server connection

async function testConnection() {
  const fetch = (await import('node-fetch')).default;
  try {
    console.log('🔗 Testing server connection...');
    const response = await fetch('http://localhost:5000/api/v1/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is running:', data);
    } else {
      console.log('❌ Server returned error:', response.status);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
  
  // Test basic registration
  try {
    console.log('\n📝 Testing user registration...');
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'student'
    };
    
    const response = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    console.log('📊 Registration response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ Registration test failed:', error.message);
  }
}

testConnection();