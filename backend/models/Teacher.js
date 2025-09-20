const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedClasses: [
    {
      name: { type: String, required: true },
      students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
    }
  ]
});

module.exports = mongoose.model("Teacher", TeacherSchema);
