const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },

        eventName: {
            type: String,
            required: true,
        },

        clubName: {
            type: String,
            required: true,
        },

        memberEmail: {
            type: String,
            required: true,
        },

        approvedBy: {
            type: String,
            required: true,
        },

        approvalDate: {
            type: Date,
            required: true,
        },

        pdfPath: {
            type: String,
            required: true,
        },

        venue: {
            type: String,
            required: true,
        },

        date: {
            type: String,
            required: true,
        },

        timeSlot: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Receipt", receiptSchema);
