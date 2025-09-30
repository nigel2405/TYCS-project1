require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testBulkNotifications() {
  try {
    // Create a JWT token for pranav (who has TYBSc CS class)
    const userId = '68bfafee3055a4bf0ecdee25'; // pranav's user ID
    const token = jwt.sign(
      { userId: userId, role: 'teacher' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🔑 Generated token for testing bulk notifications');

    // Test the bulk notifications API
    const response = await axios.post('http://localhost:5000/api/teacher/send-bulk-notifications', {
      className: 'TYBSc CS',
      skipDuplicateCheck: true, // Skip duplicate check for testing
      includeParents: false
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Bulk Notifications Response:');
    console.log('Status:', response.status);
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testBulkNotifications();