const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
   adminLogin,
   getEventsByStatus,
   approveEvent,
   rejectEvent,
   getVenueChangeRequests,     // ⭐ NEW
   approveVenueChange,         // ⭐ NEW
   rejectVenueChange,          // ⭐ NEW
   getAllUsers,                // ⭐ NEW
   blockUser,                  // ⭐ NEW
   unblockUser,                // ⭐ NEW
   getSystemStats,             // ⭐ NEW
   getPendingUsers,            // ⭐ USER APPROVAL
   approveUser,                // ⭐ USER APPROVAL
   rejectUser,                 // ⭐ USER APPROVAL
   updateEventStatuses         // ⭐ MANUAL EVENT UPDATE
} = require("../controllers/adminController");

/*
|--------------------------------------------------------------------------
| ADMIN AUTH
|--------------------------------------------------------------------------
*/

// 🔐 Admin Login
router.post("/login", adminLogin);

/*
|--------------------------------------------------------------------------
| ADMIN PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

// Get events by status (PENDING / APPROVED / REJECTED / CANCELLED)
router.get("/events/:status", auth, getEventsByStatus);

// Approve event
router.put("/approve/:id", auth, approveEvent);

// Reject event
router.put("/reject/:id", auth, rejectEvent);

/* =========================
   ⭐ VENUE CHANGE ROUTES
========================= */

// Get all pending venue change requests
router.get("/venue-requests", auth, getVenueChangeRequests);

// Approve venue change
router.put("/venue-approve/:id", auth, approveVenueChange);

// Reject venue change
router.put("/venue-reject/:id", auth, rejectVenueChange);

/* =========================
   ⭐ USER MANAGEMENT ROUTES
========================= */

// Get all users
router.get("/users", auth, getAllUsers);

// Block user
router.put("/users/:id/block", auth, blockUser);

// Unblock user
router.put("/users/:id/unblock", auth, unblockUser);

/* =========================
   ⭐ USER APPROVAL ROUTES
========================= */

// Get pending club official registrations
router.get("/pending-users", auth, getPendingUsers);

// Approve pending user
router.post("/approve-user/:userId", auth, approveUser);

// Reject pending user
router.post("/reject-user/:userId", auth, rejectUser);

/* =========================
   ⭐ MANUAL EVENT UPDATE
========================= */
router.post("/update-event-statuses", auth, updateEventStatuses);

/* =========================
   ⭐ DASHBOARD STATS
========================= */
router.get("/stats", auth, getSystemStats);

console.log("🔍 adminRoutes.js loaded");
console.log("Routes registered:");
router.stack.forEach(r => {
   if (r.route) {
      console.log(`  ${Object.keys(r.route.methods)[0].toUpperCase()} /api/admin${r.route.path}`);
   }
});

module.exports = router;
