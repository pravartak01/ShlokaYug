const axios = require('axios');

const testRegistration = async () => {
  try {
    console.log('Testing registration endpoint...');
    
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!'
    };
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
};

testRegistration();