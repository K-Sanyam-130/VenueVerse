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
import { ENDPOINTS } from "../api";

export default function ClubLogin({ onBack, onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetOtpVerified, setResetOtpVerified] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // API handled via import at top

  /* ============================
     SEND OTP
  ============================ */
  const sendOtp = async () => {
    if (!email) {
      alert("Enter your email first!");
      return;
    }

    if (!fullName) {
      alert("Enter your club name first!");
      return;
    }

    try {
      const res = await fetch(`${ENDPOINTS.OTP}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: fullName,
          role: "club"
        }),
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
     VERIFY OTP
  ============================ */
  const verifyOtp = async () => {
    if (!enteredOtp) {
      alert("Enter the OTP!");
      return;
    }

    try {
      const res = await fetch(`${ENDPOINTS.OTP}/verify`, {
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
     REGISTER CLUB
  ============================ */
  const registerClub = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.USERS}/register`, {
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
     CLUB LOGIN (ONLY FIX HERE)
  ============================ */
  const handleClubLogin = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.USERS}/login`, {
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

      // ✅ ONLY NECESSARY FIX (NO DESIGN CHANGE)
      localStorage.setItem("clubToken", data.token);
      localStorage.setItem("club", JSON.stringify(data.user));

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

  /* ============================
     FORGOT PASSWORD - SEND OTP
  ============================ */
  const handleSendResetOtp = async () => {
    if (!resetEmail) {
      alert("Please enter your email");
      return;
    }

    try {
      const res = await fetch(`${ENDPOINTS.USERS}/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setResetOtpSent(true);
        alert(data.msg || "OTP sent to your email!");
      } else {
        alert(data.msg || "Failed to send OTP");
      }
    } catch {
      alert("Server error while sending OTP");
    }
  };

  /* ============================
     FORGOT PASSWORD - VERIFY OTP
  ============================ */
  const handleVerifyResetOtp = async () => {
    if (!resetOtp) {
      alert("Please enter the OTP");
      return;
    }

    try {
      const res = await fetch(`${ENDPOINTS.USERS}/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp }),
      });

      const data = await res.json();

      if (res.ok) {
        setResetOtpVerified(true);
        alert("OTP verified! Now set your new password.");
      } else {
        alert(data.msg || "Invalid OTP");
      }
    } catch {
      alert("Error verifying OTP");
    }
  };

  /* ============================
     FORGOT PASSWORD - RESET PASSWORD
  ============================ */
  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      alert("Please enter and confirm your new password");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`${ENDPOINTS.USERS}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtp,
          newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.msg || "Password reset successful! Please login.");
        setShowForgotPassword(false);
        setResetEmail("");
        setResetOtp("");
        setNewPassword("");
        setConfirmNewPassword("");
        setResetOtpSent(false);
        setResetOtpVerified(false);
      } else {
        alert(data.msg || "Failed to reset password");
      }
    } catch {
      alert("Server error during password reset");
    }
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

          {!isSignUp && (
            <button
              className="forgot-password-link"
              onClick={() => setShowForgotPassword(true)}
              style={{
                background: "none",
                border: "none",
                color: "#a78bfa",
                cursor: "pointer",
                fontSize: "14px",
                marginTop: "10px",
                textDecoration: "underline"
              }}
            >
              Forgot Password?
            </button>
          )}

          <div className="club-secured">
            🔐 Secured by <strong>VenueVerse</strong>
          </div>
        </div>

        {/* FORGOT PASSWORD MODAL */}
        {showForgotPassword && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }} onClick={() => setShowForgotPassword(false)}>
            <div className="club-card" style={{ maxWidth: "500px", margin: "20px" }} onClick={(e) => e.stopPropagation()}>
              <h2 className="club-title">Reset Password</h2>
              <p className="club-subtitle">Enter your email to receive an OTP</p>

              <div className="club-form">
                {/* Step 1: Enter Email */}
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={resetOtpSent}
                    />
                  </div>
                </div>

                {/* Step 2: Enter OTP */}
                {resetOtpSent && !resetOtpVerified && (
                  <div className="form-group">
                    <label>Enter OTP</label>
                    <div className="input-wrapper">
                      <KeyRound className="input-icon" />
                      <input
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Enter New Password */}
                {resetOtpVerified && (
                  <>
                    <div className="form-group">
                      <label>New Password</label>
                      <div className="input-wrapper">
                        <Lock className="input-icon" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <span
                          className="eye-icon"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <div className="input-wrapper">
                        <Lock className="input-icon" />
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  {!resetOtpSent && (
                    <button onClick={handleSendResetOtp} className="club-submit-btn">
                      Send OTP
                    </button>
                  )}
                  {resetOtpSent && !resetOtpVerified && (
                    <button onClick={handleVerifyResetOtp} className="club-submit-btn">
                      Verify OTP
                    </button>
                  )}
                  {resetOtpVerified && (
                    <button onClick={handleResetPassword} className="club-submit-btn">
                      Reset Password
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail("");
                      setResetOtp("");
                      setNewPassword("");
                      setConfirmNewPassword("");
                      setResetOtpSent(false);
                      setResetOtpVerified(false);
                    }}
                    className="club-toggle-btn"
                    style={{ marginTop: 0 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
