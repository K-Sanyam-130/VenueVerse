const express = require("express");
const router = express.Router();

const {
  registerEvent,
  getEventsForClub,
  getApprovedEventsForClub,
  getAllApprovedEvents,
  cancelEventByClub,
  requestVenueChange        // ✅ NEW
} = require("../controllers/eventController");

const auth = require("../middleware/auth");

/*
|--------------------------------------------------------------------------
| STUDENT / CLUB ROUTES
|--------------------------------------------------------------------------
*/

// Register new event (always PENDING)
router.post("/add", auth, registerEvent);

// Booking status page (ALL events of logged-in club)
router.get("/club", auth, getEventsForClub);

// Club dashboard – Existing Events (APPROVED ONLY)
router.get("/club/approved", auth, getApprovedEventsForClub);

// Cancel own booking (NOT LIVE events)
router.put("/club/cancel/:id", auth, cancelEventByClub);

// ✅ NEW: Request venue change (APPROVED + UPCOMING only)
router.put("/club/venue-change/:id", auth, requestVenueChange);

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

// 🌍 Landing page / Students – ALL approved events
router.get("/approved", getAllApprovedEvents);

module.exports = router;
