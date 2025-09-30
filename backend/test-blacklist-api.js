require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testBlacklistAPI() {
  try {
    // Create a JWT token for pranav (who has TYBSc CS class)
    const userId = '68bfafee3055a4bf0ecdee25'; // pranav's user ID from the data
    const token = jwt.sign(
      { userId: userId, role: 'teacher' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🔑 Generated token for testing');
    console.log('👤 User ID:', userId);

    // Test the blacklist API
    const response = await axios.get('http://localhost:5000/api/teacher/blacklist', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Blacklist API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    // Check specific student data
    if (response.data.blacklistData && response.data.blacklistData.length > 0) {
      console.log('\n📊 Student Details:');
      response.data.blacklistData.forEach(classData => {
        console.log(`\n🎓 Class: ${classData.className}`);
        classData.students.forEach(studentData => {
          const student = studentData.student;
          console.log(`  - Student ID: ${student._id}`);
          console.log(`    Name: ${student.userId?.name || 'NO NAME'}`);
          console.log(`    Email: ${student.userId?.email || 'NO EMAIL'}`);
          console.log(`    Attendance: ${studentData.presentDays}/${studentData.totalDays} (${Math.round(studentData.attendanceRate)}%)`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testBlacklistAPI();