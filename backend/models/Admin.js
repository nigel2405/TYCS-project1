const mongoose = require("mongoose");
module.exports = mongoose.model("Admin", new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }));
