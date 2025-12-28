const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

    res.status(201).json({
      msg: "User registered successfully",
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
