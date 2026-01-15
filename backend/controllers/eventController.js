const Event = require("../model/Event");
const Receipt = require("../model/Receipt");
const { sendEmail } = require("../utils/sendEmail");
const { generateReceiptPDF } = require("../utils/generateReceipt");

/*
|--------------------------------------------------------------------------
| STUDENT / CLUB: Register Event (Always PENDING)
|--------------------------------------------------------------------------
*/
exports.registerEvent = async (req, res) => {
  try {
    const clubName = req.user?.clubName || req.body.clubName;
    const { eventName, email, date, timeSlot, venue } = req.body;

    if (!eventName || !clubName || !email || !date || !timeSlot || !venue) {
      return res.status(400).json({
        success: false,
        message:
          "eventName, clubName, email, date, timeSlot and venue are required"
      });
    }

    const newEvent = new Event({
      eventName,
      clubName,
      email,
      date,
      timeSlot,
      venue,
      status: "PENDING",
      isPublished: false,
      adminMessage: ""
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event request submitted. Awaiting admin approval.",
      event: newEvent
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
|--------------------------------------------------------------------------
| CLUB: Booking Status Page (ALL events of club)
|--------------------------------------------------------------------------
*/
exports.getEventsForClub = async (req, res) => {
  try {
    const clubName = req.user?.clubName || req.query.clubName;

    if (!clubName) {
      return res.status(400).json({
        success: false,
        message: "clubName is required"
      });
    }

    const events = await Event.find({ clubName }).sort({ createdAt: -1 });
    res.json(events);
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
};

/*
|--------------------------------------------------------------------------
| CLUB: Existing Events Page (APPROVED ONLY)
|--------------------------------------------------------------------------
*/
exports.getApprovedEventsForClub = async (req, res) => {
  try {
    const clubName = req.user?.clubName || req.query.clubName;

    if (!clubName) {
      return res.status(400).json({
        success: false,
        message: "clubName is required"
      });
    }

    console.log(`🔍 Fetching approved events for club: "${clubName}"`);

    // Removed isPublished: true to prevent filtering issues
    const events = await Event.find({
      clubName,
      status: "APPROVED",
    }).sort({ date: 1 });

    console.log(`✅ Found ${events.length} approved events for ${clubName}`);

    res.json(events);
  } catch (err) {
    console.error("GET APPROVED EVENTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved events"
    });
  }
};

/*
|--------------------------------------------------------------------------
| CLUB: Cancel Own Booking (SAFE)
|--------------------------------------------------------------------------
*/
exports.cancelEventByClub = async (req, res) => {
  try {
    const eventId = req.params.id;
    const clubName = req.user?.clubName;

    if (!clubName) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized club"
      });
    }

    const event = await Event.findOne({ _id: eventId, clubName });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or not owned by this club"
      });
    }

    if (event.eventType === "LIVE") {
      return res.status(400).json({
        success: false,
        message: "Live events cannot be cancelled"
      });
    }

    event.status = "CANCELLED";
    event.isPublished = false;
    event.adminMessage = "Cancelled by club";

    await event.save();

    try {
      if (event.email) {
        await sendEmail({
          to: event.email,
          subject: "❌ Event Cancelled – VenueVerse",
          html: `
            <h2>Your event has been cancelled</h2>
            <p><b>Event:</b> ${event.eventName}</p>
            <p><b>Date:</b> ${event.date}</p>
            <p><b>Time:</b> ${event.timeSlot}</p>
            <p><b>Venue:</b> ${event.venue}</p>
          `
        });
      }
    } catch (emailErr) {
      console.error("EMAIL FAILED (non-blocking):", emailErr.message);
    }

    res.json({
      success: true,
      message: "Event cancelled successfully",
      event
    });
  } catch (err) {
    console.error("CANCEL EVENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel event"
    });
  }
};

/*
|--------------------------------------------------------------------------
| ⭐ CLUB: Request Venue Change (NEW – MINIMAL ADDITION)
|--------------------------------------------------------------------------
*/
exports.requestVenueChange = async (req, res) => {
  try {
    const { requestedVenue, reason } = req.body;
    const clubName = req.user?.clubName;

    if (!requestedVenue || !reason) {
      return res.status(400).json({
        success: false,
        message: "requestedVenue and reason are required"
      });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      clubName,
      status: { $in: ["APPROVED", "PENDING"] },
      eventType: "UPCOMING"
    });

    if (!event) {
      return res.status(400).json({
        success: false,
        message: "Only approved or pending upcoming events can request venue change"
      });
    }

    if (event.venueChange?.status === "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Venue change request already pending"
      });
    }

    event.venueChange = {
      requestedVenue,
      reason,
      status: "PENDING"
    };

    await event.save();

    res.json({
      success: true,
      message: "Venue change request submitted",
      event
    });
  } catch (err) {
    console.error("VENUE CHANGE REQUEST ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to request venue change"
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN: Get Events by Status
|--------------------------------------------------------------------------
*/
exports.getEventsByStatus = async (req, res) => {
  try {
    const status = req.params.status.toUpperCase();

    if (!["PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const events = await Event.find({ status }).sort({ createdAt: -1 });
    res.json(events);
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN: Approve Event
|--------------------------------------------------------------------------
*/
exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    event.status = "APPROVED";
    event.isPublished = true;

    const today = new Date();
    const eventDate = new Date(event.date);

    event.eventType =
      eventDate.toDateString() === today.toDateString()
        ? "LIVE"
        : "UPCOMING";

    event.adminMessage = "";

    await event.save();

    // Get admin email from request (from JWT token)
    const adminEmail = req.user?.email || "admin@venueverse.com";
    const approvalDate = new Date();

    let pdfPath = null;
    let receiptRecord = null;

    try {
      // Generate receipt PDF
      console.log("📄 Generating receipt PDF...");
      pdfPath = await generateReceiptPDF({
        eventName: event.eventName,
        clubName: event.clubName,
        memberEmail: event.email,
        approvedBy: adminEmail,
        approvalDate: approvalDate,
        venue: event.venue,
        date: event.date,
        timeSlot: event.timeSlot,
        eventId: event._id.toString(),
      });

      console.log(`✅ Receipt PDF generated: ${pdfPath}`);

      // Save receipt record to database
      receiptRecord = new Receipt({
        eventId: event._id,
        eventName: event.eventName,
        clubName: event.clubName,
        memberEmail: event.email,
        approvedBy: adminEmail,
        approvalDate: approvalDate,
        pdfPath: pdfPath,
        venue: event.venue,
        date: event.date,
        timeSlot: event.timeSlot,
      });

      await receiptRecord.save();
      console.log("✅ Receipt record saved to database");
    } catch (receiptErr) {
      console.error("❌ Receipt generation failed:", receiptErr.message);
      // Continue with approval even if receipt generation fails
    }

    try {
      const emailOptions = {
        to: event.email,
        subject: "🎉 Event Approved – VenueVerse",
        html: `
          <h2>Your event has been approved!</h2>
          <p><b>Event:</b> ${event.eventName}</p>
          <p><b>Date:</b> ${event.date}</p>
          <p><b>Time:</b> ${event.timeSlot}</p>
          <p><b>Venue:</b> ${event.venue}</p>
          <p><b>Approved by:</b> ${adminEmail}</p>
          <hr />
          <p>Please find the attached receipt for your records. You can also download it from your club dashboard.</p>
        `
      };

      // Attach PDF if it was generated successfully
      if (pdfPath) {
        emailOptions.attachments = [
          {
            filename: `receipt_${event.eventName.replace(/\s+/g, "_")}.pdf`,
            path: pdfPath,
          },
        ];
      }

      await sendEmail(emailOptions);
      console.log("✅ Approval email sent with receipt attachment");
    } catch (e) {
      console.error("❌ EMAIL FAILED:", e.message);
    }

    res.json({
      success: true,
      message: "Event approved successfully",
      event,
      receiptGenerated: !!pdfPath,
    });
  } catch (err) {
    console.error("❌ APPROVE EVENT ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to approve event" });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN: Reject Event
|--------------------------------------------------------------------------
*/
exports.rejectEvent = async (req, res) => {
  try {
    const { adminMessage } = req.body;

    if (!adminMessage) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: "REJECTED",
        isPublished: false,
        adminMessage
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    try {
      await sendEmail({
        to: event.email,
        subject: "❌ Event Rejected – VenueVerse",
        html: `
          <h2>Your event request was rejected</h2>
          <p><b>Event:</b> ${event.eventName}</p>
          <p><b>Reason:</b> ${adminMessage}</p>
        `
      });
    } catch (e) {
      console.error("EMAIL FAILED:", e.message);
    }

    res.json({
      success: true,
      message: "Event rejected successfully",
      event
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to reject event" });
  }
};

/*
|--------------------------------------------------------------------------
| PUBLIC: Get ALL Approved Events
|--------------------------------------------------------------------------
*/
exports.getAllApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: "APPROVED",
      isPublished: true
    }).sort({ date: 1 });

    res.json(events);
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch all approved events"
    });
  }
};

/*
|--------------------------------------------------------------------------
| PUBLIC: Get Available Venues for a Given Date and Time
|--------------------------------------------------------------------------
*/
exports.getAvailableVenues = async (req, res) => {
  try {
    const { date, timeSlot } = req.query;

    // Fetch all venues from all admins dynamically
    const Admin = require("../model/Admin");
    const admins = await Admin.find({});

    const allVenuesSet = new Set();
    admins.forEach(admin => {
      if (admin.venues && admin.venues.length > 0) {
        admin.venues.forEach(venue => allVenuesSet.add(venue));
      }
    });

    const allVenues = Array.from(allVenuesSet).sort();

    // If no date or time provided, return all venues
    if (!date || !timeSlot) {
      return res.json({
        success: true,
        availableVenues: allVenues
      });
    }

    // Find all APPROVED events for the given date
    const bookedEvents = await Event.find({
      date,
      status: "APPROVED"
    });

    // Helper function to check if two time slots overlap
    const timeSlotsOverlap = (slot1, slot2) => {
      // If either is a full day booking, they overlap
      if (
        slot1.includes("Full Day") ||
        slot2.includes("Full Day") ||
        slot1.includes("8:00 A.M. - 10:00 P.M.") ||
        slot2.includes("8:00 A.M. - 10:00 P.M.")
      ) {
        return true;
      }

      // If slots are identical
      if (slot1 === slot2) {
        return true;
      }

      // Parse time strings to compare ranges
      const parseTime = (timeStr) => {
        const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(A\.M\.|P\.M\.)/i);
        if (!match) return null;

        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3].toUpperCase();

        if (period === "P.M." && hours !== 12) hours += 12;
        if (period === "A.M." && hours === 12) hours = 0;

        return hours * 60 + minutes;
      };

      const extractRange = (slot) => {
        const parts = slot.split("-").map(s => s.trim());
        if (parts.length !== 2) return null;

        const start = parseTime(parts[0]);
        const end = parseTime(parts[1]);

        return start !== null && end !== null ? { start, end } : null;
      };

      const range1 = extractRange(slot1);
      const range2 = extractRange(slot2);

      if (!range1 || !range2) return false;

      // Check for overlap: slots overlap if one starts before the other ends
      return (
        (range1.start < range2.end && range1.end > range2.start)
      );
    };

    // Filter out booked venues
    const bookedVenues = new Set();

    bookedEvents.forEach(event => {
      if (timeSlotsOverlap(event.timeSlot, timeSlot)) {
        bookedVenues.add(event.venue);
      }
    });

    const availableVenues = allVenues.filter(
      venue => !bookedVenues.has(venue)
    );

    res.json({
      success: true,
      availableVenues,
      bookedVenues: Array.from(bookedVenues)
    });
  } catch (err) {
    console.error("GET AVAILABLE VENUES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available venues"
    });
  }
};
