require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Assignment = require('./models/Assignment');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check all users
    const users = await User.find({ role: 'teacher' });
    console.log('\n👥 Teacher Users:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user._id}`);
    });

    // Check all teachers
    const teachers = await Teacher.find().populate('userId', 'name email');
    console.log('\n👨‍🏫 Teacher Profiles:');
    teachers.forEach(teacher => {
      console.log(`  - ${teacher.userId?.name} - ID: ${teacher._id}`);
    });

    // Check all assignments
    const assignments = await Assignment.find().populate('teacherId', 'name email');
    console.log('\n📚 Assignments:');
    assignments.forEach(assignment => {
      console.log(`  - ${assignment.className} -> Teacher: ${assignment.teacherId}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkData();