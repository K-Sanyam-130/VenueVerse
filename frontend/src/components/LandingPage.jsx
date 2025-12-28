import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  Play,
} from "lucide-react";

import logo from "../assets/venueverse-logo.jpg";
import { ENDPOINTS } from "../api";

export default function LandingPage({ onRoleSelect }) {
  const [activeEvents, setActiveEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.EVENTS}/approved`);
      const data = await res.json();
      if (Array.isArray(data)) {
        processEvents(data);
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  const processEvents = (events) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];
    const past = [];

    events.forEach((ev) => {
      const evDate = new Date(ev.date);
      evDate.setHours(0, 0, 0, 0);

      if (evDate < today) {
        past.push(ev);
      } else {
        // Mark as LIVE if date is today
        const isLive = evDate.getTime() === today.getTime();
        upcoming.push({ ...ev, isLive });
      }
    });

    setActiveEvents(upcoming);
    setPastEvents(past);
  };

  return (
    <div className="page-load-pop">

      {/* NAVBAR */}
      <div className="navbar fade-down">

        {/* ROTATING LOGO BLOCK */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            className="rotate-slow"
            style={{
              width: "50px",
              height: "50px",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={logo}
              alt="VenueVerse Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <div>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>Venue Verse</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Venue Management System
            </div>
          </div>
        </div>

        {/* Role Buttons */}
        <div className="nav-buttons">
          <button className="role-btn" onClick={() => onRoleSelect("student")}>
            <Users size={16} /> Student
          </button>

          <button className="role-btn" onClick={() => onRoleSelect("club-official")}>
            <Calendar size={16} /> Club Officials
          </button>

          <button className="role-btn" onClick={() => onRoleSelect("admin")}>
            <MapPin size={16} /> Admin Portal
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="hero fade-down">
        <div
          className="hover-scale"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.3)",
            padding: "8px 20px",
            borderRadius: "50px",
          }}
        >
          <Sparkles size={18} color="#c084fc" />
          <span style={{ color: "#c084fc", fontSize: "14px" }}>
            SMARTER EVENT & VENUE COORDINATION FOR YOUR COLLEGE CAMPUS
          </span>
        </div>

        <h1 className="hero-title" style={{ marginTop: "20px" }}>
          <span
            style={{
              background: "linear-gradient(to right, #fb923c, #ec4899, #a855f7)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Craft event
          </span>
          <br />
          experiences your
          <br />
          audience will love
        </h1>

        <p className="hero-sub">
          Organize, promote, and execute the most unique events—all through VenueVerse.
        </p>

        <div style={{ marginTop: "25px", display: "flex", gap: "15px", justifyContent: "center" }}>
          <button className="btn btn-primary hover-scale" onClick={() => onRoleSelect("club-official")}>
            GET STARTED <ArrowRight size={18} />
          </button>

          <button className="btn btn-outline hover-scale">
            <Play size={18} /> WATCH OVERVIEW
          </button>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section style={{ padding: "60px 20px", background: "var(--bg-dark-3)" }}>
        <div className="container">

          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "28px" }}>
            <Sparkles size={30} color="#c084fc" /> Upcoming & Ongoing Events
          </h2>

          <div className="event-grid">
            {activeEvents.length === 0 ? (
              <p className="text-muted">No upcoming events found.</p>
            ) : (
              activeEvents.map((ev, i) => (
                <div key={i} className="card card-purple hover-scale">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div className={`badge ${ev.isLive ? "badge-green" : "badge-purple"}`}>
                      {ev.isLive ? "Live Now" : "Upcoming"}
                    </div>
                  </div>

                  <div className="event-title">{ev.eventName}</div>
                  <div style={{ color: "var(--purple)", marginBottom: "8px" }}>{ev.clubName}</div>

                  <div style={{ color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Calendar size={16} /> {new Date(ev.date).toLocaleDateString()}
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Clock size={16} /> {ev.timeSlot}
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <MapPin size={16} /> {ev.venue}
                    </div>
                  </div>

                  <button className="role-btn hover-scale" style={{ marginTop: "10px" }}>
                    View Details <ArrowRight size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* PAST EVENTS */}
      <section style={{ padding: "60px 20px" }}>
        <div className="container">

          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "28px" }}>
            <Calendar size={30} color="#60a5fa" /> Past Events
          </h2>

          <div className="event-grid">
            {pastEvents.length === 0 ? (
              <p className="text-muted">No past events found.</p>
            ) : (
              pastEvents.map((ev, i) => (
                <div key={i} className="card hover-scale">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div className="badge badge-gray">Completed</div>
                  </div>

                  <div className="event-title">{ev.eventName}</div>
                  <div style={{ color: "var(--purple)", marginBottom: "8px" }}>{ev.clubName}</div>

                  <div style={{ color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Clock size={16} /> {new Date(ev.date).toLocaleDateString()}
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <MapPin size={16} /> {ev.venue}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="footer-cta">
        <h2 style={{ fontSize: "30px", fontWeight: "700" }}>Ready to get started?</h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "10px auto" }}>
          Join hundreds of clubs managing their events with VenueVerse.
        </p>

        <button
          className="btn"
          style={{ background: "var(--purple)", color: "white", marginTop: "20px" }}
          onClick={() => onRoleSelect("club-official")}
        >
          Start Managing Events <ArrowRight size={18} />
        </button>
      </section>

    </div>
  );
}
