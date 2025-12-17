import React from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  Play,
} from "lucide-react";

import logo from "../assets/venueverse-logo.jpg";   // ⭐ added

export default function LandingPage({ onRoleSelect }) {
  const pastEvents = [
    { name: "Tech Summit 2024", date: "Nov 15, 2024", venue: "Main Auditorium", club: "Tech Club", attendees: 250 },
    { name: "Cultural Fest", date: "Nov 10, 2024", venue: "Open Arena", club: "Cultural Society", attendees: 500 },
    { name: "Workshop on AI", date: "Nov 5, 2024", venue: "Lab 301", club: "CS Club", attendees: 80 },
    { name: "Sports Day", date: "Oct 28, 2024", venue: "Sports Complex", club: "Sports Committee", attendees: 400 },
    { name: "Hackathon 2024", date: "Oct 20, 2024", venue: "Tech Park", club: "Code Warriors", attendees: 150 },
    { name: "Art Exhibition", date: "Oct 15, 2024", venue: "Gallery Hall", club: "Art Society", attendees: 200 },
  ];

  const upcomingEvents = [
    { name: "Fun and Hunt", date: "Dec 5, 2024", time: "8 AM - 12 PM", venue: "Campus Grounds", club: "Adventure Club", status: "ongoing", registrations: 45 },
    { name: "Coding Marathon", date: "Dec 10, 2024", time: "9 AM - 6 PM", venue: "Computer Lab", club: "Code Warriors", status: "upcoming", registrations: 32 },
    { name: "Music Festival", date: "Dec 15, 2024", time: "5 PM - 10 PM", venue: "Central Hall", club: "Music Society", status: "upcoming", registrations: 120 },
    { name: "Debate Competition", date: "Dec 20, 2024", time: "2 PM - 5 PM", venue: "Seminar Room", club: "Debate Society", status: "upcoming", registrations: 28 },
    { name: "Photography Walk", date: "Dec 22, 2024", time: "7 AM - 11 AM", venue: "City Streets", club: "Photo Club", status: "upcoming", registrations: 15 },
    { name: "Year End Gala", date: "Dec 28, 2024", time: "6 PM - 11 PM", venue: "Grand Ballroom", club: "Student Council", status: "upcoming", registrations: 200 },
  ];

  return (
    <div className="page-load-pop">

      {/* NAVBAR */}
      <div className="navbar fade-down">

        {/* ⭐ UPDATED ROTATING LOGO BLOCK */}
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
              overflow: "hidden",           // ensures logo stays inside
            }}
          >
            <img
              src={logo}
              alt="VenueVerse Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",         // keeps clean cropping
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

      {/* PAST EVENTS */}
      <section style={{ padding: "60px 20px" }}>
        <div className="container">

          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "28px" }}>
            <Calendar size={30} color="#60a5fa" /> Past Events
          </h2>

          <div className="event-grid">
            {pastEvents.map((ev, i) => (
              <div key={i} className="card hover-scale">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div className="badge badge-gray">Completed</div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Users size={16} /> {ev.attendees}
                  </div>
                </div>

                <div className="event-title">{ev.name}</div>
                <div style={{ color: "var(--purple)", marginBottom: "8px" }}>{ev.club}</div>

                <div style={{ color: "var(--text-muted)" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Clock size={16} /> {ev.date}
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <MapPin size={16} /> {ev.venue}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section style={{ padding: "60px 20px", background: "var(--bg-dark-3)" }}>
        <div className="container">

          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "28px" }}>
            <Sparkles size={30} color="#c084fc" /> Upcoming & Ongoing Events
          </h2>

          <div className="event-grid">
            {upcomingEvents.map((ev, i) => (
              <div key={i} className="card card-purple hover-scale">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div className={`badge ${ev.status === "ongoing" ? "badge-green" : "badge-purple"}`}>
                    {ev.status === "ongoing" ? "Live Now" : "Upcoming"}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Users size={16} /> {ev.registrations}
                  </div>
                </div>

                <div className="event-title">{ev.name}</div>
                <div style={{ color: "var(--purple)", marginBottom: "8px" }}>{ev.club}</div>

                <div style={{ color: "var(--text-muted)" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Calendar size={16} /> {ev.date}
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Clock size={16} /> {ev.time}
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <MapPin size={16} /> {ev.venue}
                  </div>
                </div>

                <button className="role-btn hover-scale" style={{ marginTop: "10px" }}>
                  View Details <ArrowRight size={16} />
                </button>
              </div>
            ))}
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
