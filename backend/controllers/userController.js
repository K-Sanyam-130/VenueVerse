const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");

/* =========================
   REGISTER (ONE TIME ONLY)
========================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        msg: "Account already exists. Please login.",
      });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    // Send email notification based on role
    if (role === "club") {
      // Club official needs approval
      await sendEmail({
        to: email,
        subject: "Account Pending Approval - VenueVerse",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Registration Submitted ✅</h2>
            <p>Dear ${name},</p>
            <p>Your club official account has been created and is <strong>waiting for admin approval</strong>.</p>
            <p>You will receive an email notification once your account is reviewed and approved by our administrators.</p>
            <p>Thank you for your patience!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">VenueVerse - Venue Management System</p>
          </div>
        `
      });
    }

    res.status(201).json({
      msg: role === "club"
        ? "Registration successful! Your account is pending admin approval. You will receive an email once approved."
        : "User registered successfully",
      approvalStatus: user.approvalStatus
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* =========================
   LOGIN (EVERY TIME) ✅ FIXED
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        msg: "Invalid email or password",
      });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid email or password",
      });
    }

    // ⛔ CHECK IF BLOCKED
    if (user.isBlocked) {
      return res.status(403).json({
        msg: "Your account has been blocked. Please contact the administrator.",
      });
    }

    // ⛔ CHECK APPROVAL STATUS
    if (user.approvalStatus === "pending") {
      return res.status(403).json({
        msg: "Your account is pending admin approval. You will receive an email once approved.",
      });
    }

    if (user.approvalStatus === "rejected") {
      return res.status(403).json({
        msg: "Your account registration was rejected. Please contact the administrator for more information.",
      });
    }

    // 🕒 UPDATE LAST LOGIN
    user.lastLogin = new Date();
    await user.save();

    // 3. Generate token (✅ clubName ADDED)
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        // 👇 REQUIRED FOR CLUB EVENT APIs
        clubName: user.role === "club" ? user.name : undefined,
      },
      process.env.JWT_SECRET || "venueverse_secret",
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin, // Return to frontend if needed
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* =========================
   FORGOT PASSWORD - SEND OTP
========================= */
exports.sendPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        msg: "No account found with this email address"
      });
    }

    // Generate OTP
    const Otp = require("../model/Otp");
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp: otpCode });

    // Send email
    await sendEmail({
      to: email,
      subject: "Password Reset OTP - VenueVerse",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Dear ${user.name},</p>
          <p>You have requested to reset your password. Please use the OTP below:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; margin: 0; font-size: 32px; letter-spacing: 4px;">${otpCode}</h1>
          </div>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">VenueVerse - Venue Management System</p>
        </div>
      `
    });

    res.json({
      msg: "Password reset OTP sent to your email"
    });
  } catch (err) {
    console.error("Send Password Reset OTP Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* =========================
   FORGOT PASSWORD - VERIFY OTP
========================= */
exports.verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const Otp = require("../model/Otp");
    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    // Don't delete OTP yet - will delete after password reset
    res.json({ msg: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify Password Reset OTP Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* =========================
   FORGOT PASSWORD - RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP one more time
    const Otp = require("../model/Otp");
    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Delete OTP
    await Otp.deleteMany({ email });

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: "Password Reset Successful - VenueVerse",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Password Reset Successful ✓</h2>
          <p>Dear ${user.name},</p>
          <p>Your password has been successfully reset.</p>
          <p>You can now log in with your new password.</p>
          <p>If you did not make this change, please contact us immediately.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">VenueVerse - Venue Management System</p>
        </div>
      `
    });

    res.json({
      msg: "Password reset successful. You can now login with your new password."
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* =========================
   GET CLUB STATISTICS
========================= */
exports.getClubStats = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Count events created by this club
    const Event = require("../model/Event");
    const totalEvents = await Event.countDocuments({
      clubName: user.name
    });

    res.json({
      name: user.name,
      email: user.email,
      totalEvents,
      role: user.role
    });
  } catch (err) {
    console.error("Get Club Stats Error:", err);
    res.status(500).json({ msg: "Error fetching club statistics" });
  }
};
