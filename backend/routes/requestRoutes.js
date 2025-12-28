const express = require("express");
const router = express.Router();
const Request = require("../model/Request");
const Event = require("../model/Event");
const User = require("../model/User"); // Assuming User model exists for emails
const nodemailer = require("nodemailer");

// Configure Nodemailer (Using a mock or environment variables)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ✅ CREATE A REQUEST
router.post("/", async (req, res) => {
    try {
        const { eventId, clubId, requestedVenue, reason } = req.body;

        const newRequest = new Request({
            event: eventId,
            club: clubId,
            requestedVenue,
            reason,
        });

        await newRequest.save();

        res.status(201).json({ success: true, request: newRequest });
    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// ✅ GET REQUESTS FOR A SPECIFIC CLUB
router.get("/club/:clubId", async (req, res) => {
    try {
        const requests = await Request.find({ club: req.params.clubId })
            .populate("event", "eventName date venue") // Populate event details
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// ✅ GET ALL PENDING REQUESTS (FOR ADMIN)
router.get("/admin", async (req, res) => {
    try {
        const requests = await Request.find({ status: "PENDING" })
            .populate("event", "eventName date venue")
            .populate("club", "username email") // Populate club name/email
            .sort({ createdAt: 1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// ✅ APPROVE / REJECT REQUEST
router.post("/:id/action", async (req, res) => {
    const { action, adminComment } = req.body; // action: 'APPROVED' or 'REJECTED'

    try {
        const request = await Request.findById(req.params.id)
            .populate("event")
            .populate("club");

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.status !== "PENDING") {
            return res.status(400).json({ success: false, message: "Request already processed" });
        }

        request.status = action;
        request.adminComment = adminComment || "";
        await request.save();

        // IF APPROVED, UPDATE THE EVENT VENUE
        if (action === "APPROVED") {
            const event = await Event.findById(request.event._id);
            if (event) {
                // 🛠 FIX: Ensure email exists (legacy data issue)
                if (!event.email && request.club && request.club.email) {
                    event.email = request.club.email;
                }

                event.venue = request.requestedVenue;
                // Optionally store history in event too
                event.venueChange = {
                    requestedVenue: request.requestedVenue,
                    reason: request.reason,
                    status: "APPROVED"
                };
                await event.save();
            }
        } else if (action === "REJECTED") {
            // Update event status just for record if needed
            const event = await Event.findById(request.event._id);
            if (event) {
                // 🛠 FIX: Ensure email exists
                if (!event.email && request.club && request.club.email) {
                    event.email = request.club.email;
                }

                event.venueChange = {
                    requestedVenue: request.requestedVenue,
                    reason: request.reason,
                    status: "REJECTED"
                };
                await event.save();
            }
        }

        // 📧 SEND EMAIL NOTIFICATION
        if (request.club && request.club.email) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: request.club.email,
                subject: `Venue Change Request ${action} - ${request.event.eventName}`,
                text: `Your request to change venue for "${request.event.eventName}" to "${request.requestedVenue}" has been ${action}.\n\nAdmin Comment: ${adminComment || "None"}`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) console.log("Error sending email:", err);
                else console.log("Email sent:", info.response);
            });
        }

        res.status(200).json({ success: true, message: `Request ${action}`, request });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
