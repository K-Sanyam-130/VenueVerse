const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "club", "student"],
    required: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: function () {
      // Only club officials need approval
      return this.role === "club" ? "pending" : "approved";
    }
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

module.exports = mongoose.model("User", userSchema);
