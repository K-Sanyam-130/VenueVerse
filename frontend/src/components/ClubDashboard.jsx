import React, { useState, useEffect } from "react";
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  ArrowLeft,
  Sparkles,
  User,
  Mail,
  Calendar,
} from "lucide-react";
import "./ClubDashboard.css";
import { ENDPOINTS } from "../api";
import logo from "../assets/venueverse-logo.jpg";

export default function Dashboard({ onLogout, onNavigate, onBack }) {   // ✅ DEFAULT EXPORT FIXED
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [clubStats, setClubStats] = useState({
    name: "",
    email: "",
    totalEvents: 0
  });

  useEffect(() => {
    fetchClubStats();
  }, []);

  const fetchClubStats = async () => {
    try {
      const token = localStorage.getItem("clubToken");
      const res = await fetch(`${ENDPOINTS.USERS}/club/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClubStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch club stats", err);
    }
  };

  const menuOptions = [
    {
      title: "Register",
      description: "Register a new member for an event",
      icon: UserPlus,
      colorClass: "option-blue",
      action: () => onNavigate && onNavigate("register-event"),  // ⭐ FIXED NAV KEY
    },
    {
      title: "Booking Status",
      description: "View current booking status and details",
      icon: CheckCircle,
      colorClass: "option-purple",
      action: () => onNavigate && onNavigate("booking-status"),
    },

    {
      title: "Cancel",
      description: "Cancel an existing event booking",
      icon: XCircle,
      colorClass: "option-red",
      action: () => onNavigate && onNavigate("cancel-booking"),
    },

    {
      title: "Existing Events",
      description: "View all existing events",
      icon: Users,
      colorClass: "option-green",
      action: () => onNavigate && onNavigate("existing-events"),  // ⭐ FIXED NAV KEY
    },

    {
      title: "Venue Change Request",
      description: "Request a venue change for an event",
      icon: MapPin,
      colorClass: "option-orange",
      action: () => onNavigate && onNavigate("venue-change-request"),
    },
  ];

  return (
    <div className="cv-root">
      {/* animated background */}
      <div className="cv-bg-gradient" />
      <div className="cv-bg-radial" />

      {/* floating particles */}
      <div className="cv-particles" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="cv-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* header */}
      <header className="cv-header" role="navigation" aria-label="Main navigation">
        <div className="cv-header-inner">
          <div className="cv-brand">
            {onBack ? (
              <button className="cv-back-btn" onClick={onBack} aria-label="Go back">
                <ArrowLeft />
              </button>
            ) : (
              <div className="cv-space" />
            )}

            <div className="cv-logo" aria-hidden>
              <div className="cv-logo-rotator">
                <img src={logo} alt="VenueVerse" className="cv-logo-icon" style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  borderRadius: "8px"
                }} />
              </div>
            </div>

            <div>
              <h1 className="cv-site-title">Club & Event Management</h1>
              <p className="cv-site-sub">Management Dashboard</p>
            </div>
          </div>

          <div className="cv-header-actions">
            {/* Profile Icon */}
            <div
              className="profile-button"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              style={{
                cursor: "pointer",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "10px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "15px",
                position: "relative"
              }}
            >
              <User size={20} color="white" />
            </div>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div style={{
                position: "absolute",
                top: "70px",
                right: "90px",
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "12px",
                padding: "20px",
                minWidth: "280px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                backdropFilter: "blur(12px)",
                zIndex: 1000
              }}>
                <div style={{
                  borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                  paddingBottom: "12px",
                  marginBottom: "12px"
                }}>
                  <div style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#e2e8f0",
                    marginBottom: "4px"
                  }}>
                    {clubStats.name}
                  </div>
                  <div style={{
                    fontSize: "12px",
                    color: "#94a3b8"
                  }}>
                    Club Official
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Mail size={16} color="#60a5fa" />
                    <div style={{ color: "#cbd5e1", fontSize: "14px" }}>
                      {clubStats.email}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Calendar size={16} color="#a78bfa" />
                    <div style={{ color: "#cbd5e1", fontSize: "14px" }}>
                      <strong>{clubStats.totalEvents}</strong> Events Registered
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* main content */}
      <main className="cv-main">
        <section className="cv-intro">
          <div className="cv-intro-left">
            <div className="cv-sparkle">
              <Sparkles />
            </div>
            <h2 className="cv-intro-title">Welcome to your Management Dashboard</h2>
          </div>
          <p className="cv-intro-desc">
            Select an option below to manage your club and events
          </p>
        </section>

        <section className="cv-grid" aria-label="Dashboard menu">
          {menuOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <article
                key={option.title}
                className={`cv-card ${option.colorClass}`}
                tabIndex={0}
                role="button"
                onClick={option.action}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") option.action();
                }}
                style={{ animationDelay: `${0.15 + index * 0.08}s` }}
                aria-label={option.title}
              >
                <span className="cv-status-dot" aria-hidden />

                <div className="cv-card-head">
                  <div className="cv-card-icon-wrap">
                    <div className="cv-card-icon-bg" />
                    <Icon className="cv-card-icon" />
                  </div>

                  <div className="cv-card-title-wrap">
                    <h3 className="cv-card-title">{option.title}</h3>
                    <div className="cv-card-accent" aria-hidden />
                  </div>
                </div>

                <div className="cv-card-body">
                  <p className="cv-card-desc">{option.description}</p>

                  <div className="cv-card-cta">
                    <span className="cv-cta-text">Click to access</span>
                    <ArrowLeft className="cv-cta-arrow" />
                  </div>
                </div>

                <div className="cv-corner tl" />
                <div className="cv-corner br" />
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
