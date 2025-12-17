const nodemailer = require("nodemailer");
const Otp = require("../model/Otp");

// SEND OTP
exports.sendOtp = async (req, res) => {
  console.log("🔥 OTP SEND ROUTE HIT"); // debug 1

  try {
    const { email } = req.body;
    console.log("📨 Email received:", email); // debug 2

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🔢 OTP generated:", otpCode); // debug 3

    const otpSaved = await Otp.create({ email, otp: otpCode });
    console.log("💾 OTP saved to DB:", otpSaved); // debug 4


    // SAVE OTP
    await Otp.create({ email, otp: otpCode });

    // Gmail SMTP Transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"VenueVerse" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otpCode}`,
      html: `<h2>Your OTP: ${otpCode}</h2>`
    });

    res.json({ msg: "OTP sent successfully" });

  } catch (err) {
    console.error("OTP Send Error:", err);
    res.status(500).json({ msg: "Error sending OTP" });
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    await Otp.deleteMany({ email });

    res.json({ msg: "OTP verified successfully" });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
