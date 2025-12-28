const Admin = require("../model/Admin");
const Event = require("../model/Event");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");

/* =========================
   ADMIN LOGIN
========================= */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET || "venueverse_secret",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      msg: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      msg: "Server error during admin login"
    });
  }
};

/* =========================
   GET EVENTS BY STATUS (ADMIN)
========================= */
exports.getEventsByStatus = async (req, res) => {
  try {
    const status = req.params.status.toUpperCase();

    if (!["PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid event status"
      });
    }

    const events = await Event.find({ status }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("GET EVENTS BY STATUS ERROR:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch events"
    });
  }
};

/* =========================
   APPROVE EVENT (ADMIN)
========================= */
exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        msg: "Event not found"
      });
    }

    const today = new Date();
    const eventDate = new Date(event.date);

    event.status = "APPROVED";
    event.isPublished = true;
    event.eventType =
      eventDate.toDateString() === today.toDateString()
        ? "LIVE"
        : "UPCOMING";
    event.adminMessage = "";

    await event.save();

    res.json({
      success: true,
      msg: "Event approved successfully",
      event
    });
  } catch (err) {
    console.error("APPROVE EVENT ERROR:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to approve event"
    });
  }
};

/* =========================
   REJECT EVENT (ADMIN)
========================= */
exports.rejectEvent = async (req, res) => {
  try {
    const { adminMessage } = req.body;

    if (!adminMessage) {
      return res.status(400).json({
        success: false,
        msg: "Rejection reason required"
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        msg: "Event not found"
      });
    }

    event.status = "REJECTED";
    event.isPublished = false;
    event.adminMessage = adminMessage;

    await event.save();

    res.json({
      success: true,
      msg: "Event rejected successfully",
      event
    });
  } catch (err) {
    console.error("REJECT EVENT ERROR:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to reject event"
    });
  }
};

/* =========================
   ⭐ GET VENUE CHANGE REQUESTS (ADMIN)
========================= */
exports.getVenueChangeRequests = async (req, res) => {
  try {
    const events = await Event.find({
      "venueChange.status": "PENDING"
    }).sort({ createdAt: -1 });

    res.json(events);
  } catch (err) {
    console.error("GET VENUE CHANGE REQUESTS ERROR:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch venue change requests"
    });
  }
};

/* =========================
   ⭐ APPROVE VENUE CHANGE (ADMIN)
========================= */
exports.approveVenueChange = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event || event.eventType === "LIVE") {
      return res.status(400).json({
        success: false,
        msg: "Invalid event or live event"
      });
    }

    event.venue = event.venueChange.requestedVenue;
    event.venueChange.status = "APPROVED";

    await event.save();

    try {
      await sendEmail({
        to: event.email,
        subject: "✅ Venue Change Approved – VenueVerse",
        html: `
          <p>Your venue has been updated.</p>
          <p><b>New Venue:</b> ${event.venue}</p>
        `
      });
    } catch (e) {
      console.error("EMAIL FAILED:", e.message);
    }

    res.json({
      success: true,
      msg: "Venue updated successfully",
      event
    });
  } catch (err) {
    console.error("APPROVE VENUE CHANGE ERROR:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to approve venue change"
    });
  }
};

/* =========================
   ⭐ REJECT VENUE CHANGE (ADMIN)
========================= */
exports.rejectVenueChange = async (req, res) => {
  try {
    const { adminMessage } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        msg: "Event not found"
      });
    }

    event.venueChange.status = "REJECTED";
    event.adminMessage = adminMessage || "Venue change rejected";

    await event.save();

    try {
      await sendEmail({
        to: event.email,
        subject: "❌ Venue Change Rejected – VenueVerse",
        html: `
          <p>Your venue change request was rejected.</p>
          <p><b>Reason:</b> ${event.adminMessage}</p>
        `
      });
    } catch (e) {
      console.error("EMAIL FAILED:", e.message);
    }

    res.json({
      success: true,
      msg: "Venue change rejected",
      event
    });
  } catch (err) {
    console.error("REJECT VENUE CHANGE ERROR:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to reject venue change"
    });
  }
};

/* =========================
   ⭐ ADMIN USER MANAGEMENT
========================= */

// Get all users (Clubs only for now)
exports.getAllUsers = async (req, res) => {
  try {
    const User = require("../model/User"); // Lazy load or move to top
    const users = await User.find({ role: "club" }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch users" });
  }
};

// Block User
exports.blockUser = async (req, res) => {
  try {
    const User = require("../model/User");
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    user.isBlocked = true;
    await user.save();

    // Send Email
    try {
      await sendEmail({
        to: user.email,
        subject: "🔒 Account Blocked – VenueVerse",
        html: `
          <h3>Your account has been blocked</h3>
          <p>You can no longer access the VenueVerse club dashboard.</p>
          <p>Please contact the administrator for more details.</p>
        `
      });
    } catch (e) {
      console.error("EMAIL FAILED:", e.message);
    }

    res.json({ success: true, msg: "User blocked successfully", user });
  } catch (err) {
    console.error("BLOCK USER ERROR:", err);
    res.status(500).json({ success: false, msg: "Failed to block user" });
  }
};

// Unblock User
exports.unblockUser = async (req, res) => {
  try {
    const User = require("../model/User");
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    user.isBlocked = false;
    await user.save();

    // Send Email
    try {
      await sendEmail({
        to: user.email,
        subject: "🔓 Account Unblocked – VenueVerse",
        html: `
          <h3>Your account has been unblocked!</h3>
          <p>You can now log in and access your dashboard.</p>
        `
      });
    } catch (e) {
      console.error("EMAIL FAILED:", e.message);
    }

    res.json({ success: true, msg: "User unblocked successfully", user });
  } catch (err) {
    console.error("UNBLOCK USER ERROR:", err);
    res.status(500).json({ success: false, msg: "Failed to unblock user" });
  }
};

/* =========================
   ⭐ DASHBOARD STATS
========================= */
exports.getSystemStats = async (req, res) => {
  try {
    const User = require("../model/User"); // Lazy load
    const Event = require("../model/Event");

    // ParallelDB Calls
    const [
      totalEvents,
      activeEvents, // "Events Going On" (LIVE)
      totalClubs,
      blockedClubs
    ] = await Promise.all([
      Event.countDocuments({}),
      Event.countDocuments({ status: "APPROVED", eventType: "LIVE" }),
      User.countDocuments({ role: "club" }),
      User.countDocuments({ role: "club", isBlocked: true })
    ]);

    res.json({
      totalEvents,
      activeEvents,
      totalUsers: totalClubs,
      activeUsers: totalClubs - blockedClubs
    });
  } catch (err) {
    console.error("GET STATS ERROR:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch stats" });
  }
};
