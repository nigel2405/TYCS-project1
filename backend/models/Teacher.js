const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedClasses: [
    {
      type: String, // or ObjectId if you create a separate Class model
    },
  ],
});

module.exports = mongoose.model("Teacher", teacherSchema);
