const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/users", require("./routes/userRoutes"));   // Register + Login (all users)
app.use("/api/club", require("./routes/clubRoutes"));     // Club login only
app.use("/api/otp", require("./routes/otpRoutes"));       // OTP send + verify

// Default route (optional)
app.get("/", (req, res) => {
  res.send("VenueVerse Backend is Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
