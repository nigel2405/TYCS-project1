require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');

async function checkStudents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check all students
    const students = await Student.find({ className: 'TYBSc CS' })
      .populate('userId', 'name email')
      .lean();
    
    console.log('\n👥 TYBSc CS Students:');
    students.forEach(student => {
      console.log(`  - ID: ${student._id}`);
      console.log(`    UserId: ${student.userId}`);
      console.log(`    User Data:`, student.userId);
      console.log(`    RFID: ${student.rfid || 'None'}`);
      console.log(`    ClassName: ${student.className}`);
      console.log('    ---');
    });

    // Check users without student profiles
    const users = await User.find({ role: 'student' });
    console.log('\n🧑‍🎓 Student Users:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user._id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkStudents();