const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARES
========================= */
const allowedOrigins = [
   'http://localhost:5173', // Local development
   process.env.FRONTEND_URL // Production frontend
].filter(Boolean);

app.use(cors({
   origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
         callback(null, true);
      } else {
         callback(new Error('Not allowed by CORS'));
      }
   },
   credentials: true
}));
app.use(express.json());

/* =========================
   DATABASE
========================= */
connectDB();

/* =========================
   BACKGROUND JOBS
========================= */
// 🔥 Auto LIVE / UPCOMING scheduler
require("./jobs/eventScheduler");

/* =========================
   ROUTES
========================= */

// Auth & Users
app.use("/api/users", require("./routes/userRoutes"));    // Users / Clubs
app.use("/api/otp", require("./routes/otpRoutes"));       // OTP

// Admin (Dedicated Admin Model)
app.use("/api/admin", require("./routes/adminRoutes"));   // Admin login + actions
// Routes
app.use("/api/admin", require("./routes/adminRoutes"));

// ADD THIS DEBUG CODE
console.log("✅ Admin routes registered");
const adminRouter = require("./routes/adminRoutes");
console.log("📋 Admin router stack:", adminRouter.stack.map(r => ({
   path: r.route?.path,
   methods: Object.keys(r.route?.methods || {})
})));

// Events
app.use("/api/events", require("./routes/eventRoutes"));  // Event lifecycle
app.use("/api/requests", require("./routes/requestRoutes")); // Venue Change Requests

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
   res.status(200).send("VenueVerse Backend is Running...");
});

/* =========================
   ERROR HANDLER (OPTIONAL BUT SAFE)
========================= */
app.use((err, req, res, next) => {
   console.error("UNHANDLED ERROR:", err);
   res.status(500).json({
      success: false,
      message: "Internal server error"
   });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`🚀 Server running on port ${PORT}`);
});
