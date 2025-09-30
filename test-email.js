const axios = require('axios');

async function testEmailNotification() {
  try {
    // First login as teacher to get token
    console.log('🔐 Logging in as teacher...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'teacher.fy@gmail.com', // Try the FY teacher
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Get blacklist data first
    console.log('📄 Getting blacklist data...');
    const blacklistResponse = await axios.get('http://localhost:5000/api/teacher/blacklist', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Blacklist data received:', blacklistResponse.data);
    
    if (blacklistResponse.data.blacklistData && blacklistResponse.data.blacklistData.length > 0) {
      const firstClass = blacklistResponse.data.blacklistData[0];
      const firstStudent = firstClass.students[0];
      
      console.log('📧 Testing email notification for:', firstStudent.student.userId.name);
      
      // Test email notification with actual data
      const emailResponse = await axios.post('http://localhost:5000/api/teacher/send-attendance-notification', {
        studentId: firstStudent.student._id,
        className: firstClass.className,
        studentEmail: firstStudent.student.userId.email,
        studentName: firstStudent.student.userId.name
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Email notification response:', emailResponse.data);
    } else {
      console.log('⚠️ No blacklist data found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testEmailNotification();