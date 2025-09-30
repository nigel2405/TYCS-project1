const Teacher = require("../models/Teacher");
const User = require("../models/User");
const LeaveApplication = require("../models/LeaveApplication");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment");
const Attendance = require("../models/Attendance");
const EmailLog = require("../models/EmailLog");
const nodemailer = require("nodemailer");

// ===============================
// Get a teacher profile
// ===============================
exports.getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.params.id })
      .populate("userId", "name email role")
      .lean();

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.json({
      name: teacher.userId.name,
      email: teacher.userId.email,
      role: teacher.userId.role,
      assignedClasses: teacher.assignedClasses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching teacher profile" });
  }
};

// ===============================
// Get all teachers
// ===============================
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("userId", "name email role");
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching teachers" });
  }
};

// ===============================
// Update teacher
// ===============================
exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndUpdate(
      { userId: req.params.id },
      req.body,
      { new: true }
    ).populate("userId", "name email role");

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: "Error updating teacher" });
  }
};

// ===============================
// Get all leave applications of teacher's classes
// ===============================
exports.getClassLeaves = async (req, res) => {
  try {
    // 1️⃣ Find all classes assigned to this teacher
    const assignments = await Assignment.find({ teacherId: req.user._id });
    const classNames = assignments.map((a) => a.className);

    if (classNames.length === 0) {
      return res.json([]); // teacher has no assigned classes
    }

    // 2️⃣ Find all students in those classes
    const students = await Student.find({ className: { $in: classNames } });
    const studentIds = students.map((s) => s._id);

    // 3️⃣ Fetch leave applications for those students
    const leaves = await LeaveApplication.find({ student: { $in: studentIds } })
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    console.error("❌ Error fetching class leaves:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// Approve / Reject leave
// ===============================
exports.updateLeaveStatus = async (req, res) => {
  try {
    const leave = await LeaveApplication.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = req.body.status;
    await leave.save();

    res.json({ message: "Leave status updated", leave });
  } catch (err) {
    console.error("❌ Error updating leave status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// Get blacklist data (students with <75% attendance)
// ===============================
exports.getBlacklistData = async (req, res) => {
  try {
    // Find all classes assigned to this teacher
    const assignments = await Assignment.find({ teacherId: req.user._id });
    const classNames = assignments.map((a) => a.className);

    if (classNames.length === 0) {
      return res.json({ blacklistData: [] });
    }

    // Calculate current month attendance for each class
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

    const blacklistData = [];

    for (const className of classNames) {
      // Get all students in this class
      const students = await Student.find({ className })
        .populate({ path: 'userId', select: 'name email' })
        .lean();
      const studentIds = students.map(s => s._id);

      // Get attendance records for the last 2 months to have more data
      const twoMonthsAgo = new Date(currentYear, currentMonth - 1, 1);
      const records = await Attendance.find({
        student: { $in: studentIds },
        date: { $gte: twoMonthsAgo, $lt: endOfMonth }
      }).lean();

      // Calculate attendance for each student
      const studentAttendance = {};
      for (const student of students) {
        const studentRecords = records.filter(r => r.student.toString() === student._id.toString());
        const presentDays = studentRecords.filter(r => r.status === 'present').length;
        const totalDays = studentRecords.length;
        const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

        studentAttendance[student._id] = {
          student,
          presentDays,
          totalDays,
          attendanceRate
        };
      }

      // Filter students with <75% attendance
      const blacklistedStudents = Object.values(studentAttendance)
        .filter(data => data.attendanceRate < 75 && data.totalDays > 0)
        .sort((a, b) => a.attendanceRate - b.attendanceRate); // Sort by worst attendance first

      if (blacklistedStudents.length > 0) {
        blacklistData.push({
          className,
          students: blacklistedStudents
        });
      }
    }

    res.json({ blacklistData });
  } catch (err) {
    console.error("❌ Error fetching blacklist data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// Email Template Generator
// ===============================
const generateEmailTemplate = (templateType, data) => {
  const { studentName, className, attendanceRate, presentDays, totalDays, teacherName, teacherEmail } = data;
  
  const templates = {
    critical: {
      subject: `🚨 URGENT: Critical Attendance Alert - ${className}`,
      bgColor: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      alertColor: '#dc2626',
      icon: '🚨',
      urgency: 'URGENT - IMMEDIATE ACTION REQUIRED',
      message: `Your attendance is critically low at ${attendanceRate}%. This requires immediate attention to avoid academic consequences.`
    },
    warning: {
      subject: `⚠️ Attendance Warning - ${className}`,
      bgColor: 'linear-gradient(135deg, #f59e0b, #d97706)',
      alertColor: '#f59e0b',
      icon: '⚠️',
      urgency: 'WARNING - ACTION NEEDED',
      message: `Your attendance has dropped to ${attendanceRate}%. Please improve your attendance to stay on track.`
    },
    notice: {
      subject: `📢 Attendance Notice - ${className}`,
      bgColor: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      alertColor: '#3b82f6',
      icon: '📢',
      urgency: 'NOTICE - IMPROVEMENT NEEDED',
      message: `Your attendance is at ${attendanceRate}%. Consider improving your attendance for better academic performance.`
    }
  };
  
  const template = templates[templateType];
  
  return {
    subject: template.subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: ${template.bgColor}; color: white; padding: 30px 20px; text-align: center; position: relative;">
          <div style="position: absolute; top: 10px; right: 20px; background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">
            ${template.urgency}
          </div>
          <h1 style="margin: 20px 0 10px 0; font-size: 28px; font-weight: bold;">${template.icon} Attendance Alert</h1>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Academic Performance Notification</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px; background-color: #f8fafc;">
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid ${template.alertColor};">
            <p style="font-size: 18px; margin-bottom: 15px; color: #1f2937;">Dear <strong>${studentName}</strong>,</p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
              ${template.message}
            </p>
            
            <!-- Attendance Stats -->
            <div style="background: ${templateType === 'critical' ? '#fef2f2' : templateType === 'warning' ? '#fffbeb' : '#eff6ff'}; border: 2px solid ${template.alertColor}; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <h3 style="color: ${template.alertColor}; margin-top: 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                📊 Current Attendance Status
              </h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
                <div style="text-align: center; padding: 10px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="font-size: 24px; font-weight: bold; color: ${template.alertColor};">${attendanceRate}%</div>
                  <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Attendance Rate</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="font-size: 24px; font-weight: bold; color: #059669;">${presentDays}</div>
                  <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Present Days</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${totalDays}</div>
                  <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Total Days</div>
                </div>
              </div>
            </div>
            
            <!-- Action Items -->
            <div style="background: #f3f4f6; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #374151; margin-top: 0; font-size: 16px;">📋 Recommended Actions:</h4>
              <ul style="color: #4b5563; margin: 10px 0; padding-left: 20px; line-height: 1.6;">
                <li>Attend all upcoming classes regularly</li>
                <li>Contact your teacher if you have any concerns</li>
                <li>Review the class schedule and plan accordingly</li>
                ${templateType === 'critical' ? '<li><strong>Schedule an immediate meeting with your academic advisor</strong></li>' : ''}
              </ul>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
              Regular attendance is crucial for your academic success. We're here to support you in achieving your educational goals.
            </p>
          </div>
          
          <!-- Teacher Contact -->
          <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
            <h4 style="color: #374151; margin-top: 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
              👨‍🏫 Your Teacher
            </h4>
            <p style="margin: 5px 0; color: #1f2937; font-weight: 600; font-size: 16px;">${teacherName}</p>
            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${className} - Class Teacher</p>
            ${teacherEmail ? `<p style="margin: 5px 0; color: #3b82f6; font-size: 14px;">📧 ${teacherEmail}</p>` : ''}
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0;">This is an automated message from your school's attendance management system.</p>
          <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Academic Institution. All rights reserved.</p>
        </div>
      </div>
    `
  };
};

// ===============================
// Determine Email Template Type
// ===============================
const getEmailTemplateType = (attendanceRate) => {
  if (attendanceRate < 50) return 'critical';
  if (attendanceRate < 65) return 'warning';
  return 'notice';
};

// ===============================
// Check for Recent Email to Avoid Duplicates
// ===============================
const checkRecentEmail = async (teacherId, studentId, className, hoursThreshold = 24) => {
  const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
  
  const recentEmail = await EmailLog.findOne({
    teacherId,
    studentId,
    className,
    sentAt: { $gte: threshold },
    status: 'sent'
  }).sort({ sentAt: -1 });
  
  return recentEmail;
};

// ===============================
// Send attendance notification email
// ===============================
exports.sendAttendanceNotification = async (req, res) => {
  try {
    console.log('📧 Email notification request received:', req.body);
    const { studentId, className, studentEmail, studentName, skipDuplicateCheck = false } = req.body;

    if (!studentId || !className || !studentEmail || !studentName) {
      console.log('❌ Missing required fields:', { studentId, className, studentEmail, studentName });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify teacher has access to this class
    const assignment = await Assignment.findOne({ 
      teacherId: req.user._id, 
      className 
    });
    
    if (!assignment) {
      console.log('❌ Teacher not authorized for class:', className, 'Teacher ID:', req.user._id);
      return res.status(403).json({ message: "Not authorized for this class" });
    }

    console.log('✅ Teacher authorized for class:', className);

    // Check for recent email to avoid duplicates (unless skipped)
    if (!skipDuplicateCheck) {
      const recentEmail = await checkRecentEmail(req.user._id, studentId, className);
      if (recentEmail) {
        const hoursSince = Math.round((Date.now() - recentEmail.sentAt) / (1000 * 60 * 60));
        return res.status(409).json({ 
          message: `Email already sent ${hoursSince} hours ago. Wait 24 hours or use force send.`,
          lastSentAt: recentEmail.sentAt,
          hoursSince
        });
      }
    }

    // Get teacher info
    const teacher = await Teacher.findOne({ userId: req.user._id })
      .populate('userId', 'name email');
    const teacherName = teacher?.userId?.name || 'Your Teacher';
    const teacherEmail = teacher?.userId?.email;

    // Get student's current attendance data
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const twoMonthsAgo = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

    const records = await Attendance.find({
      student: studentId,
      date: { $gte: twoMonthsAgo, $lt: endOfMonth }
    });

    const presentDays = records.filter(r => r.status === 'present').length;
    const totalDays = records.length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Check if email credentials are available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Email credentials not configured');
      return res.status(500).json({ message: "Email service not configured" });
    }

    console.log('📧 Attempting to send email to:', studentEmail);
    console.log('📈 Attendance data:', { presentDays, totalDays, attendanceRate });

    // Determine email template type
    const templateType = getEmailTemplateType(attendanceRate);
    
    // Generate email content
    const emailTemplate = generateEmailTemplate(templateType, {
      studentName,
      className,
      attendanceRate,
      presentDays,
      totalDays,
      teacherName,
      teacherEmail
    });

    // Create email log entry
    const emailLog = new EmailLog({
      teacherId: req.user._id,
      studentId,
      className,
      emailType: 'attendance_alert',
      recipientEmail: studentEmail,
      attendanceRate,
      emailTemplate: templateType,
      status: 'pending'
    });

    try {
      // Create email transporter
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Email options
      const mailOptions = {
        from: `${teacherName} <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        replyTo: teacherEmail || process.env.EMAIL_USER,
      };

      // Send email
      console.log('🚀 Sending email...');
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully to:', studentEmail);
      
      // Update email log with success
      emailLog.status = 'sent';
      emailLog.sentAt = new Date();
      await emailLog.save();

      res.json({ 
        message: "Notification sent successfully",
        sentTo: studentEmail,
        attendanceRate,
        templateType,
        messageId: info.messageId
      });
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      
      // Update email log with failure
      emailLog.status = 'failed';
      emailLog.errorMessage = emailError.message;
      await emailLog.save();
      
      throw emailError;
    }
  } catch (err) {
    console.error("❌ Error sending attendance notification:", err);
    res.status(500).json({ message: "Failed to send notification", error: err.message });
  }
};

// ===============================
// Send Bulk Notifications
// ===============================
exports.sendBulkNotifications = async (req, res) => {
  try {
    const { className, skipDuplicateCheck = false, includeParents = false } = req.body;
    
    if (!className) {
      return res.status(400).json({ message: "Class name is required" });
    }

    // Verify teacher has access to this class
    const assignment = await Assignment.findOne({ 
      teacherId: req.user._id, 
      className 
    });
    
    if (!assignment) {
      return res.status(403).json({ message: "Not authorized for this class" });
    }

    // Get blacklist data for this specific class
    const students = await Student.find({ className })
      .populate({ path: 'userId', select: 'name email' })
      .lean();
    const studentIds = students.map(s => s._id);

    // Get attendance records for the last 2 months
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const twoMonthsAgo = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

    const records = await Attendance.find({
      student: { $in: studentIds },
      date: { $gte: twoMonthsAgo, $lt: endOfMonth }
    }).lean();

    // Calculate attendance for each student
    const studentsWithLowAttendance = [];
    for (const student of students) {
      const studentRecords = records.filter(r => r.student.toString() === student._id.toString());
      const presentDays = studentRecords.filter(r => r.status === 'present').length;
      const totalDays = studentRecords.length;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      if (attendanceRate < 75 && totalDays > 0 && student.userId?.email) {
        studentsWithLowAttendance.push({
          student,
          presentDays,
          totalDays,
          attendanceRate
        });
      }
    }

    if (studentsWithLowAttendance.length === 0) {
      return res.json({ 
        message: "No students with low attendance found",
        totalProcessed: 0,
        sent: 0,
        skipped: 0,
        failed: 0
      });
    }

    let sent = 0, skipped = 0, failed = 0;
    const results = [];

    // Process each student
    for (const studentData of studentsWithLowAttendance) {
      const { student, presentDays, totalDays, attendanceRate } = studentData;
      
      try {
        // Check for recent email if not skipping duplicates
        if (!skipDuplicateCheck) {
          const recentEmail = await checkRecentEmail(req.user._id, student._id, className);
          if (recentEmail) {
            skipped++;
            results.push({
              studentId: student._id,
              studentName: student.userId.name,
              status: 'skipped',
              reason: 'Recent email already sent'
            });
            continue;
          }
        }

        // Send to student
        const studentResult = await sendSingleNotification({
          teacherId: req.user._id,
          studentId: student._id,
          className,
          studentEmail: student.userId.email,
          studentName: student.userId.name,
          attendanceRate: Math.round(attendanceRate),
          presentDays,
          totalDays,
          emailType: 'bulk_notification'
        });

        if (studentResult.success) {
          sent++;
          results.push({
            studentId: student._id,
            studentName: student.userId.name,
            status: 'sent',
            email: student.userId.email
          });
        } else {
          failed++;
          results.push({
            studentId: student._id,
            studentName: student.userId.name,
            status: 'failed',
            error: studentResult.error
          });
        }

        // Send to parent if requested and parent email exists
        if (includeParents && student.parentEmail) {
          const parentResult = await sendParentNotification({
            teacherId: req.user._id,
            studentId: student._id,
            className,
            parentEmail: student.parentEmail,
            parentName: student.parentName || 'Parent/Guardian',
            studentName: student.userId.name,
            attendanceRate: Math.round(attendanceRate),
            presentDays,
            totalDays
          });

          results.push({
            studentId: student._id,
            studentName: student.userId.name,
            recipient: 'parent',
            status: parentResult.success ? 'sent' : 'failed',
            email: student.parentEmail,
            error: parentResult.error
          });
        }

      } catch (error) {
        failed++;
        results.push({
          studentId: student._id,
          studentName: student.userId.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.json({
      message: `Bulk notification completed`,
      totalStudents: studentsWithLowAttendance.length,
      sent,
      skipped,
      failed,
      results
    });

  } catch (err) {
    console.error("❌ Error sending bulk notifications:", err);
    res.status(500).json({ message: "Failed to send bulk notifications", error: err.message });
  }
};

// ===============================
// Get Email History
// ===============================
exports.getEmailHistory = async (req, res) => {
  try {
    const { className, page = 1, limit = 50 } = req.query;
    
    // Build query
    const query = { teacherId: req.user._id };
    if (className) {
      query.className = className;
    }
    
    // Get paginated email history
    const emailHistory = await EmailLog.find(query)
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ sentAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await EmailLog.countDocuments(query);
    
    res.json({
      emailHistory,
      totalCount: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error("❌ Error fetching email history:", err);
    res.status(500).json({ message: "Failed to fetch email history" });
  }
};

// ===============================
// Generate Attendance Report
// ===============================
exports.generateAttendanceReport = async (req, res) => {
  try {
    const { className, startDate, endDate, format = 'json' } = req.query;
    
    if (!className) {
      return res.status(400).json({ message: "Class name is required" });
    }

    // Verify teacher has access to this class
    const assignment = await Assignment.findOne({ 
      teacherId: req.user._id, 
      className 
    });
    
    if (!assignment) {
      return res.status(403).json({ message: "Not authorized for this class" });
    }

    // Set date range (default to last 2 months)
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = endDate ? new Date(endDate) : now;

    // Get students in class
    const students = await Student.find({ className })
      .populate({ path: 'userId', select: 'name email' })
      .lean();
    const studentIds = students.map(s => s._id);

    // Get attendance records
    const records = await Attendance.find({
      student: { $in: studentIds },
      date: { $gte: start, $lte: end }
    }).lean();

    // Calculate statistics
    const reportData = {
      className,
      reportPeriod: {
        startDate: start,
        endDate: end
      },
      generatedAt: new Date(),
      summary: {
        totalStudents: students.length,
        totalClassDays: 0,
        averageAttendance: 0,
        studentsBelow75: 0,
        studentsBelow50: 0
      },
      students: [],
      emailStats: {
        totalEmailsSent: 0,
        emailsByType: {
          critical: 0,
          warning: 0,
          notice: 0
        }
      }
    };

    // Calculate per-student statistics
    let totalAttendanceRate = 0;
    
    for (const student of students) {
      const studentRecords = records.filter(r => r.student.toString() === student._id.toString());
      const presentDays = studentRecords.filter(r => r.status === 'present').length;
      const totalDays = studentRecords.length;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      totalAttendanceRate += attendanceRate;
      
      if (attendanceRate < 75) reportData.summary.studentsBelow75++;
      if (attendanceRate < 50) reportData.summary.studentsBelow50++;
      
      reportData.students.push({
        studentId: student._id,
        name: student.userId?.name || 'Unknown',
        email: student.userId?.email,
        parentEmail: student.parentEmail,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        presentDays,
        totalDays,
        status: attendanceRate >= 75 ? 'good' : attendanceRate >= 50 ? 'warning' : 'critical'
      });
    }

    reportData.summary.averageAttendance = students.length > 0 ? Math.round((totalAttendanceRate / students.length) * 100) / 100 : 0;
    reportData.summary.totalClassDays = Math.max(...reportData.students.map(s => s.totalDays), 0);

    // Get email statistics
    const emailStats = await EmailLog.aggregate([
      {
        $match: {
          teacherId: req.user._id,
          className,
          sentAt: { $gte: start, $lte: end },
          status: 'sent'
        }
      },
      {
        $group: {
          _id: '$emailTemplate',
          count: { $sum: 1 }
        }
      }
    ]);

    reportData.emailStats.totalEmailsSent = emailStats.reduce((sum, stat) => sum + stat.count, 0);
    emailStats.forEach(stat => {
      if (stat._id && reportData.emailStats.emailsByType[stat._id] !== undefined) {
        reportData.emailStats.emailsByType[stat._id] = stat.count;
      }
    });

    if (format === 'csv') {
      // Generate CSV format
      const csvHeader = 'Student Name,Email,Parent Email,Attendance Rate (%),Present Days,Total Days,Status\n';
      const csvData = reportData.students.map(student => 
        `"${student.name}","${student.email || ''}","${student.parentEmail || ''}",${student.attendanceRate},${student.presentDays},${student.totalDays},${student.status}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendance-report-${className}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvData);
    } else {
      res.json(reportData);
    }

  } catch (err) {
    console.error("❌ Error generating attendance report:", err);
    res.status(500).json({ message: "Failed to generate attendance report" });
  }
};

// ===============================
// Helper Functions
// ===============================
const sendSingleNotification = async (data) => {
  try {
    const {
      teacherId, studentId, className, studentEmail, studentName,
      attendanceRate, presentDays, totalDays, emailType = 'attendance_alert'
    } = data;

    // Get teacher info
    const teacher = await Teacher.findOne({ userId: teacherId })
      .populate('userId', 'name email');
    const teacherName = teacher?.userId?.name || 'Your Teacher';
    const teacherEmail = teacher?.userId?.email;

    // Determine email template type
    const templateType = getEmailTemplateType(attendanceRate);
    
    // Generate email content
    const emailTemplate = generateEmailTemplate(templateType, {
      studentName,
      className,
      attendanceRate,
      presentDays,
      totalDays,
      teacherName,
      teacherEmail
    });

    // Create email log entry
    const emailLog = new EmailLog({
      teacherId,
      studentId,
      className,
      emailType,
      recipientEmail: studentEmail,
      attendanceRate,
      emailTemplate: templateType,
      status: 'pending'
    });

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `${teacherName} <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      replyTo: teacherEmail || process.env.EMAIL_USER,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Update email log with success
    emailLog.status = 'sent';
    emailLog.sentAt = new Date();
    await emailLog.save();

    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendParentNotification = async (data) => {
  try {
    const {
      teacherId, studentId, className, parentEmail, parentName, studentName,
      attendanceRate, presentDays, totalDays
    } = data;

    // Get teacher info
    const teacher = await Teacher.findOne({ userId: teacherId })
      .populate('userId', 'name email');
    const teacherName = teacher?.userId?.name || 'Your Teacher';
    const teacherEmail = teacher?.userId?.email;

    // Create email log entry
    const emailLog = new EmailLog({
      teacherId,
      studentId,
      className,
      emailType: 'parent_notification',
      recipientEmail: parentEmail,
      attendanceRate,
      emailTemplate: 'notice',
      status: 'pending'
    });

    // Parent email template with enhanced styling
    const parentEmailContent = {
      subject: `📚 Student Attendance Update - ${studentName} (${className})`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📚 Student Attendance Update</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Academic Progress Notification</p>
          </div>
          
          <div style="padding: 30px 20px; background-color: #f8fafc;">
            <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #6366f1;">
              <p style="font-size: 18px; margin-bottom: 15px; color: #1f2937;">Dear <strong>${parentName}</strong>,</p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
                This is an update regarding your child <strong>${studentName}</strong>'s attendance in <strong>${className}</strong>.
              </p>
              
              <div style="background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">📊 Current Attendance Status</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
                  <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: ${attendanceRate < 50 ? '#dc2626' : attendanceRate < 65 ? '#f59e0b' : '#3b82f6'};">${attendanceRate}%</div>
                    <div style="font-size: 12px; color: #6b7280;">Attendance Rate</div>
                  </div>
                  <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #059669;">${presentDays}</div>
                    <div style="font-size: 12px; color: #6b7280;">Present Days</div>
                  </div>
                  <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${totalDays}</div>
                    <div style="font-size: 12px; color: #6b7280;">Total Days</div>
                  </div>
                </div>
              </div>
              
              ${attendanceRate < 75 ? `
              <div style="background: #fef2f2; border: 2px solid #f87171; border-radius: 10px; padding: 20px; margin: 20px 0;">
                <h4 style="color: #dc2626; margin-top: 0;">⚠️ Attention Required</h4>
                <p style="color: #991b1b; margin: 10px 0; line-height: 1.6;">
                  Your child's attendance is below the recommended 75% threshold. Please encourage regular attendance.
                </p>
              </div>
              ` : ''}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 12px;">
              <h4 style="color: #374151; margin-top: 0;">👨‍🏫 Class Teacher Contact</h4>
              <p style="margin: 5px 0; color: #1f2937; font-weight: 600;">${teacherName}</p>
              <p style="margin: 5px 0; color: #6b7280;">${className} - Class Teacher</p>
              ${teacherEmail ? `<p style="margin: 5px 0; color: #3b82f6;">📧 ${teacherEmail}</p>` : ''}
            </div>
          </div>
          
          <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Automated message from your child's school attendance system.</p>
          </div>
        </div>
      `
    };

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `${teacherName} <${process.env.EMAIL_USER}>`,
      to: parentEmail,
      subject: parentEmailContent.subject,
      html: parentEmailContent.html,
      replyTo: teacherEmail || process.env.EMAIL_USER,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Update email log with success
    emailLog.status = 'sent';
    emailLog.sentAt = new Date();
    await emailLog.save();

    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
