const axios = require('axios');

async function testEmailAPI() {
  try {
    console.log('🧪 Testing email API endpoint...');
    
    // First, let's test without authentication to see what error we get
    const response = await axios.post('http://localhost:5000/api/teacher/send-attendance-notification', {
      studentId: 'test',
      className: 'test',
      studentEmail: 'test@test.com',
      studentName: 'Test Student'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    console.log('✅ Response:', response.data);
  } catch (error) {
    console.log('❌ Error status:', error.response?.status);
    console.log('❌ Error message:', error.response?.data);
    console.log('❌ Full error:', error.message);
  }
}

testEmailAPI();