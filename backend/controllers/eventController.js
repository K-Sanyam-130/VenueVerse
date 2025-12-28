const Event = require("../model/Event");
const { sendEmail } = require("../utils/sendEmail");

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
      status: "APPROVED",
      eventType: "UPCOMING"
    });

    if (!event) {
      return res.status(400).json({
        success: false,
        message: "Only approved upcoming events can request venue change"
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

    try {
      await sendEmail({
        to: event.email,
        subject: "🎉 Event Approved – VenueVerse",
        html: `
          <h2>Your event has been approved!</h2>
          <p><b>Event:</b> ${event.eventName}</p>
          <p><b>Date:</b> ${event.date}</p>
          <p><b>Time:</b> ${event.timeSlot}</p>
          <p><b>Venue:</b> ${event.venue}</p>
        `
      });
    } catch (e) {
      console.error("EMAIL FAILED:", e.message);
    }

    res.json({
      success: true,
      message: "Event approved successfully",
      event
    });
  } catch {
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
