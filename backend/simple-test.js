console.log('Testing bulk notifications endpoint...');

require('dotenv').config();
const axios = require('axios');

async function test() {
  try {
    const response = await axios.get('http://localhost:5000/api/teacher/blacklist', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log('Response:', response.status);
  } catch (error) {
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message);
  }
}

test();