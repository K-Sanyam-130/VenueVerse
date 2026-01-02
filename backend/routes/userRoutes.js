const express = require("express");
const {
    register,
    login,
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword,
    getClubStats
} = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Password Reset Routes
router.post("/forgot-password/send-otp", sendPasswordResetOtp);
router.post("/forgot-password/verify-otp", verifyPasswordResetOtp);
router.post("/forgot-password/reset", resetPassword);

// Club Statistics (protected route)
router.get("/club/stats", auth, getClubStats);

module.exports = router;
