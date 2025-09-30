const mongoose = require("mongoose");

const EmailLogSchema = new mongoose.Schema({
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: true 
  },
  className: { 
    type: String, 
    required: true 
  },
  emailType: {
    type: String,
    enum: ['attendance_alert', 'bulk_notification', 'parent_notification'],
    required: true
  },
  recipientEmail: { 
    type: String, 
    required: true 
  },
  attendanceRate: { 
    type: Number, 
    required: true 
  },
  emailTemplate: {
    type: String,
    enum: ['critical', 'warning', 'notice'],
    required: true
  },
  sentAt: { 
    type: Date, 
    default: Date.now 
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending'
  },
  errorMessage: String
});

// Index for efficient queries
EmailLogSchema.index({ teacherId: 1, studentId: 1, className: 1 });
EmailLogSchema.index({ sentAt: -1 });

module.exports = mongoose.model("EmailLog", EmailLogSchema);