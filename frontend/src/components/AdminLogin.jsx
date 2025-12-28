import { useState } from "react";
import { Eye, EyeOff, Shield, ArrowLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";
import "./AdminLogin.css";

import logo from "../assets/venueverse-logo.jpg";
import { ENDPOINTS } from "../api";

export default function AdminLogin({ onLogin, onBack }) {
  const [formData, setFormData] = useState({
    adminId: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  /* ------------------------------------
     ADMIN LOGIN (ADMIN MODEL)
  ------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${ENDPOINTS.ADMIN}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.adminId,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        setError(data.msg || "Admin login failed");
        return;
      }

      // ✅ SUCCESS (ADMIN)
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      setIsLoading(false);
      onLogin && onLogin();

    } catch (err) {
      console.error("ADMIN LOGIN ERROR:", err);
      setIsLoading(false);
      setError("Server error during admin login");
    }
  };

  return (
    <div className="admin-root">

      {/* Background Glow */}
      <div className="admin-bg-gradient"></div>
      <motion.div
        className="admin-bg-pulse"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Floating Particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="admin-particle"
          initial={{
            left: Math.random() * window.innerWidth,
            top: Math.random() * window.innerHeight
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.7, 0.2]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="admin-card"
      >

        {/* HEADER */}
        <div className="admin-header">
          <motion.button
            onClick={onBack}
            className="admin-back"
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
          </motion.button>

          <div className="admin-header-right">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="admin-logo-box"
            >
              <img src={logo} alt="logo" className="admin-logo" />
            </motion.div>

            <div>
              <h1 className="admin-title">Admin Portal</h1>
              <p className="admin-subtitle">System Administration</p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="admin-body">

          {/* ERROR */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="admin-error"
            >
              <Lock size={16} /> {error}
            </motion.div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="admin-form">

            <label className="admin-label">
              <Shield size={16} className="admin-icon indigo" />
              Admin Email
            </label>
            <input
              type="email"
              name="adminId"
              value={formData.adminId}
              onChange={handleChange}
              className="admin-input"
              placeholder="admin@venueverse.com"
              required
            />

            <label className="admin-label">
              <Lock size={16} className="admin-icon purple" />
              Password
            </label>
            <div className="admin-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="admin-input"
                placeholder="Enter your password"
                required
              />

              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="admin-eye"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </motion.button>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="admin-submit"
            >
              {isLoading ? "Authenticating..." : "Login as Admin"}
            </motion.button>
          </form>

          <div className="admin-security">
            <Shield size={14} />
            <span><strong>Security Notice:</strong> Admin access only</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
