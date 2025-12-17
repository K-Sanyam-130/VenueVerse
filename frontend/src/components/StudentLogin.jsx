import React, { useState, useMemo } from "react";
import "./StudentLogin.css";
import { ArrowLeft, GraduationCap, ArrowRight } from "lucide-react";

export default function StudentLogin({ onBack = () => {}, onSubmit = () => {} }) {
  const [usn, setUsn] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  // USN Validation (digit-alpha-digit-alpha-digit)
  const usnPattern = /^[0-9][A-Za-z]{2}[0-9]{2}[A-Za-z]{2}[0-9]{3}$/;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formatted = usn.trim().toUpperCase();

    if (!usnPattern.test(formatted)) {
      showPopup("❌ Invalid USN Format!", "error");
      return;
    }

    showPopup("✅ Login Successful!", "success");

    setTimeout(() => {
      onSubmit(formatted);
    }, 1200);
  };

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup({ show: false, message: "", type: "" });
    }, 2000);
  };

  // particles for background
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 15; i++) {
      arr.push({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2 + "s",
        duration: 3 + Math.random() * 3 + "s",
        size: 3 + Math.random() * 6,
        opacity: 0.15 + Math.random() * 0.6,
      });
    }
    return arr;
  }, []);

  return (
    <div className="student-login-root page-load-pop">
      
      {/* Background Layers */}
      <div className="student-radial" />
      <div className="login-particles">
        {particles.map((p, i) => (
          <div
            key={i}
            className="login-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <header className="navbar">
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <button className="nav-logo-small" onClick={onBack}>
            <ArrowLeft size={18} color="white" />
          </button>

          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Student Login</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Access your student portal
            </div>
          </div>
        </div>

        <div style={{ width: 56 }}></div>
      </header>

      {/* Center card */}
      <main className="login-wrapper">
        <div className="login-card">
          <div className="login-badge">
            <GraduationCap size={30} color="white" />
          </div>

          <h1 className="login-title">Welcome Student</h1>
          <p className="login-desc">Enter your USN to continue</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="login-input"
              placeholder="Enter USN (e.g., 1MS21CS001)"
              value={usn}
              onChange={(e) => setUsn(e.target.value.toUpperCase())}
              maxLength={10}
              required
            />

            <button type="submit" className="login-cta">
              Proceed <ArrowRight size={18} />
            </button>
          </form>

          <p className="login-footer-note">
            Secure access — VenueVerse Student Portal
          </p>

          <div className="login-info">
            <strong style={{ color: "white" }}>Quick Access</strong>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
              View campus events, venue details, and coordinator contacts.
            </div>
          </div>

          {/* Decorations */}
          <div className="login-deco deco-left"></div>
          <div className="login-deco deco-right"></div>
        </div>
      </main>

      {/* Popup message */}
      {popup.show && (
        <div className={`usn-popup ${popup.type}`}>
          {popup.message}
        </div>
      )}
    </div>
  );
}
