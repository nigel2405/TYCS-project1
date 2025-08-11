const mongoose = require("mongoose");
module.exports = mongoose.model("Teacher", new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }));
