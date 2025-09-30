require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Assignment = require('./models/Assignment');

async function createTeacherLogin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if teacher already exists
    let teacherUser = await User.findOne({ email: 'teacher@test.com' });
    
    if (!teacherUser) {
      console.log('👨‍🏫 Creating teacher user...');
      teacherUser = new User({
        name: 'Test Teacher',
        email: 'teacher@test.com',
        password: 'teacher123', // Will be hashed automatically
        role: 'teacher'
      });
      await teacherUser.save();
      console.log('✅ Teacher user created');
    } else {
      console.log('👨‍🏫 Teacher user already exists');
    }

    // Check if teacher profile exists
    let teacher = await Teacher.findOne({ userId: teacherUser._id });
    
    if (!teacher) {
      console.log('📄 Creating teacher profile...');
      teacher = new Teacher({
        userId: teacherUser._id,
        assignedClasses: [] // Empty array since we use Assignment model
      });
      await teacher.save();
      console.log('✅ Teacher profile created');
    } else {
      console.log('📄 Teacher profile already exists');
    }

    // Ensure class assignments exist
    const classNames = ['FYBSc CS', 'SYBSc CS', 'TYBSc CS'];
    
    for (const className of classNames) {
      let assignment = await Assignment.findOne({ 
        teacherId: teacherUser._id, 
        className 
      });
      
      if (!assignment) {
        console.log(`📚 Creating assignment for ${className}...`);
        assignment = new Assignment({
          teacherId: teacherUser._id,
          className
        });
        await assignment.save();
        console.log(`✅ Assignment created for ${className}`);
      } else {
        console.log(`📚 Assignment already exists for ${className}`);
      }
    }

    console.log('\n🎉 Setup complete!');
    console.log('📧 Login credentials:');
    console.log('   Email: teacher@test.com');
    console.log('   Password: teacher123');
    console.log('   Role: teacher');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

createTeacherLogin();