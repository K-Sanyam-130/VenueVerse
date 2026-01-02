const Admin = require("../model/Admin");
const Event = require("../model/Event");
const User = require("../model/User");
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

    // Send approval email to club official
    try {
      await sendEmail({
        to: event.email,
        subject: "🎉 Event Approved – VenueVerse",
        html: `
          <h2>Congratulations! Your event has been approved!</h2>
          <p>Your event registration has been reviewed and approved by the VenueVerse admin team.</p>
          
          <h3>Event Details:</h3>
          <ul>
            <li><b>Event Name:</b> ${event.eventName}</li>
            <li><b>Club Name:</b> ${event.clubName}</li>
            <li><b>Date:</b> ${event.date}</li>
            <li><b>Time Slot:</b> ${event.timeSlot}</li>
            <li><b>Venue:</b> ${event.venue}</li>
            <li><b>Status:</b> ${event.eventType}</li>
          </ul>
          
          <p>Your event is now published and visible to students on the VenueVerse platform.</p>
          <p>Thank you for using VenueVerse!</p>
        `
      });
    } catch (e) {
      console.error("EMAIL FAILED:", e.message);
    }

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

    // Send rejection email to club official
    try {
      await sendEmail({
        to: event.email,
        subject: "❌ Event Registration Rejected – VenueVerse",
        html: `
          <h2>Event Registration Status Update</h2>
          <p>We regret to inform you that your event registration has been reviewed and rejected by the VenueVerse admin team.</p>
          
          <h3>Event Details:</h3>
          <ul>
            <li><b>Event Name:</b> ${event.eventName}</li>
            <li><b>Club Name:</b> ${event.clubName}</li>
            <li><b>Date:</b> ${event.date}</li>
            <li><b>Time Slot:</b> ${event.timeSlot}</li>
            <li><b>Venue:</b> ${event.venue}</li>
          </ul>
          
          <h3>Rejection Reason:</h3>
          <p>${adminMessage}</p>
          
          <p>If you have any questions or would like to submit a revised event registration, please feel free to contact the admin team.</p>
          <p>Thank you for your understanding.</p>
        `
      });
    } catch (e) {
      console.error("EMAIL FAILED:", e.message);
    }

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
   ⭐ ADMIN USER APPROVAL
========================= */

// Get Pending Users (Club Officials)
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      role: "club",
      approvalStatus: "pending"
    }).select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      users: pendingUsers
    });
  } catch (err) {
    console.error("❌ Get Pending Users Error:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch pending users"
    });
  }
};

// Approve User
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id; // From auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    if (user.approvalStatus !== "pending") {
      return res.status(400).json({
        success: false,
        msg: "User is not pending approval"
      });
    }

    // Update approval status
    user.approvalStatus = "approved";
    user.approvedAt = new Date();
    user.approvedBy = adminId;
    await user.save();

    // Send approval email
    await sendEmail({
      to: user.email,
      subject: "Account Approved - VenueVerse",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Account Approved ✅</h2>
          <p>Dear ${user.name},</p>
          <p>Great news! Your club official account has been <strong>approved</strong>!</p>
          <p>You can now log in and start managing events on VenueVerse.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Login Now
            </a>
          </div>
          <p>Welcome to VenueVerse!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">VenueVerse - Venue Management System</p>
        </div>
      `
    });

    res.json({
      success: true,
      msg: "User approved successfully"
    });
  } catch (err) {
    console.error("❌ Approve User Error:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to approve user"
    });
  }
};

// Reject User
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    if (user.approvalStatus !== "pending") {
      return res.status(400).json({
        success: false,
        msg: "User is not pending approval"
      });
    }

    // Update approval status
    user.approvalStatus = "rejected";
    await user.save();

    // Send rejection email
    await sendEmail({
      to: user.email,
      subject: "Account Registration Update - VenueVerse",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Account Registration Update</h2>
          <p>Dear ${user.name},</p>
          <p>We regret to inform you that your club official registration has not been approved at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you have any questions or would like to discuss this decision, please contact our administrators.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">VenueVerse - Venue Management System</p>
        </div>
      `
    });

    res.json({
      success: true,
      msg: "User rejected successfully"
    });
  } catch (err) {
    console.error("❌ Reject User Error:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to reject user"
    });
  }
};

/* =========================
   MANUAL EVENT STATUS UPDATE
========================= */
exports.updateEventStatuses = async (req, res) => {
  try {
    const normalizeDate = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const today = normalizeDate(new Date());

    // 🟤 MARK past events as PAST
    const pastResult = await Event.updateMany(
      {
        status: "APPROVED",
        date: { $lt: today }
      },
      { $set: { eventType: "PAST" } }
    );

    // 🟢 SET LIVE for today's events
    const liveResult = await Event.updateMany(
      {
        status: "APPROVED",
        date: today
      },
      { $set: { eventType: "LIVE" } }
    );

    // 🔵 SET UPCOMING for future events
    const upcomingResult = await Event.updateMany(
      {
        status: "APPROVED",
        date: { $gt: today }
      },
      { $set: { eventType: "UPCOMING" } }
    );

    res.json({
      success: true,
      msg: "Event statuses updated successfully",
      updated: {
        past: pastResult.modifiedCount,
        live: liveResult.modifiedCount,
        upcoming: upcomingResult.modifiedCount,
        total: pastResult.modifiedCount + liveResult.modifiedCount + upcomingResult.modifiedCount
      }
    });
  } catch (err) {
    console.error("Update Event Statuses Error:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to update event statuses"
    });
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
