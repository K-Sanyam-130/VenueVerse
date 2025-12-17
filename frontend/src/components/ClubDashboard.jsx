import React from "react";
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  ArrowLeft,
  LogOut,
  Sparkles,
} from "lucide-react";
import "./ClubDashboard.css";

export default function Dashboard({ onLogout, onNavigate, onBack }) {   // ✅ DEFAULT EXPORT FIXED
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
                <MapPin className="cv-logo-icon" />
              </div>
            </div>

            <div>
              <h1 className="cv-site-title">Club & Event Management</h1>
              <p className="cv-site-sub">Management Dashboard</p>
            </div>
          </div>

          <div className="cv-header-actions">
            <button
              className="cv-logout-btn"
              onClick={() => onLogout && onLogout()}
              aria-label="Logout"
            >
              <LogOut className="cv-logout-icon" />
              <span>Logout</span>
            </button>
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
