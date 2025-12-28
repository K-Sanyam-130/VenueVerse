const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },

    clubName: {
      type: String,
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    venue: {
      type: String,
      required: true,
    },

    // ✅ UPDATED: Added CANCELLED
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    eventType: {
      type: String,
      enum: ["LIVE", "UPCOMING"],
      default: "UPCOMING",
    },

    email: {
      type: String,
      required: true,
    },

    adminMessage: {
      type: String,
      default: "",
    },

    // ✅ NEW (MINIMAL): Venue Change Request
    venueChange: {
      requestedVenue: {
        type: String,
      },
      reason: {
        type: String,
      },
      status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
