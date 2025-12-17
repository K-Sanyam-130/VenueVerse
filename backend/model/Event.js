const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  time: String,
  venue: String,
  requestedBy: String,
  status: {
    type: String,
    enum: ["pending", "approved", "cancelled"],
    default: "pending"
  },
  cancelReason: String
});

module.exports = mongoose.model("Event", eventSchema);
