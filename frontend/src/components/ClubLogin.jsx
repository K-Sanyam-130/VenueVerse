import React, { useState } from "react";
import {
  ArrowLeft,
  Users,
  Calendar,
  User,
  Mail,
  Lock,
  UserPlus,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import "./ClubLogin.css";

export default function ClubLogin({ onBack, onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 👁 password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const API = "http://localhost:5000";

  /* ============================
     SEND OTP (SIGNUP ONLY)
  ============================ */
  const sendOtp = async () => {
    if (!email) {
      alert("Enter your email first!");
      return;
    }

    try {
      const res = await fetch(`${API}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.msg === "OTP sent successfully") {
        setOtpSent(true);
        alert("OTP sent to your email!");
      } else {
        alert(data.msg || "Failed to send OTP");
      }
    } catch {
      alert("Server error while sending OTP");
    }
  };

  /* ============================
     VERIFY OTP (SIGNUP ONLY)
  ============================ */
  const verifyOtp = async () => {
    if (!enteredOtp) {
      alert("Enter the OTP!");
      return;
    }

    try {
      const res = await fetch(`${API}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await res.json();

      if (data.msg === "OTP verified successfully") {
        setOtpVerified(true);
        alert("OTP verified! You can create your account.");
      } else {
        alert(data.msg || "Invalid OTP");
      }
    } catch {
      alert("Error verifying OTP");
    }
  };

  /* ============================
     REGISTER CLUB (ONCE)
  ============================ */
  const registerClub = async () => {
    try {
      const res = await fetch(`${API}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: "club",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account created! Please login.");
        setIsSignUp(false);
        setOtpSent(false);
        setOtpVerified(false);
      } else {
        alert(data.msg || "Registration failed");
      }
    } catch {
      alert("Server error during registration");
    }
  };

  /* ============================
     CLUB LOGIN (EVERY TIME)
  ============================ */
  const handleClubLogin = async () => {
    try {
      const res = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Login failed");
        return;
      }

      if (data.user.role !== "club") {
        alert("This is not a club account");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");
      onLogin && onLogin(data.user);
    } catch {
      alert("Server error during login");
    }
  };

  /* ============================
     FORM SUBMIT
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      if (!fullName || !email || !password || !confirmPassword) {
        alert("All fields are required!");
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (!otpSent || !otpVerified) {
        alert("Please complete OTP verification");
        return;
      }
      await registerClub();
      return;
    }

    if (!loginEmail || !password) {
      alert("Email and password are required!");
      return;
    }

    await handleClubLogin();
  };

  return (
    <div className="club-login-root">
      <div className="club-bg-layer"></div>
      <div className="club-bg-radial"></div>

      <div className="club-particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="club-particle"></div>
        ))}
      </div>

      <div className="club-center-wrapper">
        <div className="club-card">
          <div className="club-card-header">
            <button className="club-back-btn" onClick={onBack}>
              <ArrowLeft size={20} />
            </button>

            <div className="club-header-icons">
              <Users size={28} className="icon-purple" />
              <Calendar size={28} className="icon-indigo" />
            </div>
          </div>

          <div className="club-badge">
            <Sparkles size={16} className="icon-purple" />
            CLUB OFFICIALS
          </div>

          <h2 className="club-title">
            {isSignUp ? "Create Club Account" : "Welcome Back"}
          </h2>

          <p className="club-subtitle">
            {isSignUp
              ? "Verify your email with OTP to create an account"
              : "Sign in to access your dashboard"}
          </p>

          <form onSubmit={handleSubmit} className="club-form">
            {isSignUp && (
              <>
                <div className="form-group">
                  <label>Club Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="form-group">
                    <label>OTP</label>
                    <div className="input-wrapper">
                      <KeyRound className="input-icon" />
                      <input
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="otp-btn-row">
                  {!otpSent && (
                    <button type="button" onClick={sendOtp} className="otp-btn">
                      Send OTP
                    </button>
                  )}
                  {otpSent && !otpVerified && (
                    <button type="button" onClick={verifyOtp} className="otp-btn">
                      Verify OTP
                    </button>
                  )}
                  {otpVerified && (
                    <div className="otp-verified">OTP Verified ✓</div>
                  )}
                </div>
              </>
            )}

            {!isSignUp && (
              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* PASSWORD */}
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            {isSignUp && (
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <span
                    className="eye-icon"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </span>
                </div>
              </div>
            )}

            <button className="club-submit-btn">
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <button
            className="club-toggle-btn"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>

          {/* 🔐 SECURITY FOOTER */}
          <div className="club-secured">
            🔐 Secured by <strong>VenueVerse</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
