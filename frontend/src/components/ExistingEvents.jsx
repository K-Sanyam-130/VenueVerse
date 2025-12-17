import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Mail,
  Phone,
  User,
  Building2,
  Filter,
  Sparkles,
} from "lucide-react";

import "./ExistingEvents.css";
import logo from "../assets/venueverse-logo.jpg";

export default function ExistingEvents({ onBack }) {   // ✅ default export
  const [selectedClub, setSelectedClub] = useState("all");

  const events = [
    {
      id: 1,
      name: "Fun and Hunt",
      club: "Adventure Club",
      date: "Dec 5, 2024",
      time: "8 AM – 12 PM",
      venue: "Campus Grounds",
      description:
        "A thrilling treasure hunt adventure across campus with multiple clue stages.",
      capacity: 45,
      registered: 21,
      status: "ongoing",
      coordinator: {
        name: "Aditya Sharma",
        email: "aditya.sharma@college.edu",
        phone: "+91 9876543210",
      },
    },
    {
      id: 2,
      name: "Coding Marathon",
      club: "Code Warriors",
      date: "Dec 10, 2024",
      time: "9 AM – 6 PM",
      venue: "Computer Lab",
      description:
        "A competitive coding marathon for students to solve challenging problems.",
      capacity: 32,
      registered: 17,
      status: "upcoming",
      coordinator: {
        name: "Riya Verma",
        email: "riya.verma@college.edu",
        phone: "+91 9001122334",
      },
    },
    {
      id: 3,
      name: "Music Festival",
      club: "Music Society",
      date: "Dec 15, 2024",
      time: "5 PM – 10 PM",
      venue: "Central Hall",
      description:
        "An evening filled with live music, band performances, and acoustic sessions.",
      capacity: 120,
      registered: 68,
      status: "upcoming",
      coordinator: {
        name: "Karan Mehta",
        email: "karan.mehta@college.edu",
        phone: "+91 9812233445",
      },
    },
  ];

  const clubs = ["all", ...Array.from(new Set(events.map((e) => e.club)))];

  const filteredEvents =
    selectedClub === "all"
      ? events
      : events.filter((e) => e.club === selectedClub);

  const ongoing = filteredEvents.filter((e) => e.status === "ongoing");
  const upcoming = filteredEvents.filter((e) => e.status === "upcoming");

  return (
    <div className="events-container">
      <div className="events-bg"></div>

      {/* HEADER */}
      <div className="events-header-modern">
        <div className="events-header-left">
          <img src={logo} alt="VenueVerse Logo" className="events-logo-modern" />

          <div>
            <h1 className="events-title">Existing Events</h1>
            <p className="events-subtitle">View all ongoing & upcoming events</p>
          </div>
        </div>

        {/* FIXED BACK BUTTON */}
        <button className="back-button-modern" onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      {/* FILTER */}
      <div className="filter-card">
        <div className="filter-label">
          <Filter size={20} />
          <span>Filter by Club:</span>
        </div>

        <div className="filter-buttons">
          {clubs.map((club) => (
            <button
              key={club}
              className={selectedClub === club ? "filter-btn active" : "filter-btn"}
              onClick={() => setSelectedClub(club)}
            >
              {club === "all" ? "All Clubs" : club}
            </button>
          ))}
        </div>

        <p className="event-count">
          Showing {filteredEvents.length} event
          {filteredEvents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ONGOING EVENTS */}
      {ongoing.length > 0 && (
        <div className="section-block">
          <div className="section-title">
            <Sparkles size={25} className="icon-green" />
            <h2>Happening Now</h2>
          </div>

          {ongoing.map((event) => (
            <EventCard key={event.id} event={event} isOngoing />
          ))}
        </div>
      )}

      {/* UPCOMING EVENTS */}
      {upcoming.length > 0 && (
        <div className="section-block">
          <div className="section-title">
            <Calendar size={25} className="icon-indigo" />
            <h2>Upcoming Events</h2>
          </div>

          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

/* EVENT CARD COMPONENT */
function EventCard({ event, isOngoing }) {
  const percent = Math.round((event.registered / event.capacity) * 100);

  return (
    <div className="event-card">
      {isOngoing && <div className="event-live-bar"></div>}

      <div className="event-header">
        <div>
          <h3 className="event-name">{event.name}</h3>

          <span className="event-badge">
            <Building2 size={14} />
            {event.club}
          </span>
        </div>

        <div className="event-capacity">
          <Users size={18} />
          {event.registered}/{event.capacity}
        </div>
      </div>

      <p className="event-desc">{event.description}</p>

      <div className="event-grid">
        {/* LEFT */}
        <div className="event-info">
          <div className="info-row">
            <Calendar size={18} />
            <div>
              <small>Date</small>
              <p>{event.date}</p>
            </div>
          </div>

          <div className="info-row">
            <Clock size={18} />
            <div>
              <small>Time</small>
              <p>{event.time}</p>
            </div>
          </div>

          <div className="info-row">
            <MapPin size={18} />
            <div>
              <small>Venue</small>
              <p>{event.venue}</p>
            </div>
          </div>

          {/* PROGRESS */}
          <div>
            <div className="progress-label">
              Registration Status — {percent}% Full
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${percent}%`,
                  background:
                    percent < 70
                      ? "#4ade80"
                      : percent < 90
                      ? "#facc15"
                      : "#ef4444",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* COORDINATOR */}
        <div className="coordinator-card">
          <h4>Event Coordinator</h4>

          <div className="coord-row">
            <User size={18} />
            <p>{event.coordinator.name}</p>
          </div>

          <div className="coord-row">
            <Mail size={18} />
            <a href={`mailto:${event.coordinator.email}`}>
              {event.coordinator.email}
            </a>
          </div>

          <div className="coord-row">
            <Phone size={18} />
            <a href={`tel:${event.coordinator.phone}`}>
              {event.coordinator.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
