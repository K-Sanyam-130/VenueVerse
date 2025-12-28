const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// CLUB LOGIN ONLY
exports.clubLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Club account not found!" });

    // check if role is club
    if (user.role !== "club")
      return res
        .status(403)
        .json({ msg: "Access denied. You are not a club official." });

    // compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ msg: "Invalid password!" });

    // 🔑 FIX: include clubName in JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        clubName: user.name, // 🔥 IMPORTANT (or user.clubName if field exists)
      },
      process.env.JWT_SECRET || "venueverse_secret",
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Club Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clubName: user.name, // 🔥 send to frontend
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};
