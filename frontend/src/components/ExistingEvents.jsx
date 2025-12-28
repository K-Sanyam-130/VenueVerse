import React, { useState, useEffect } from "react";
import axios from "axios";
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

export default function ExistingEvents({ onBack }) {
  const [selectedClub, setSelectedClub] = useState("all");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  /* ----------------------------------------------------
      FETCH ALL APPROVED EVENTS (ALL CLUBS)
  ---------------------------------------------------- */
  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/events/approved"
      );

      const formattedEvents = res.data.map((e) => ({
        id: e._id,
        name: e.eventName,
        club: e.clubName,
        date: e.date,
        time: e.timeSlot,
        venue: e.venue,
        description: "Approved event",
        capacity: 100,
        registered: 0,
        eventType: e.eventType || "UPCOMING",
        coordinator: {
          name: e.clubName,
          email: e.email || "club@college.edu",
          phone: "+91 XXXXXXXX",
        },
      }));

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Failed to fetch existing events", err);
    }
  };

  /* ----------------------------------------------------
      FILTER LOGIC
  ---------------------------------------------------- */
  const clubs = ["all", ...Array.from(new Set(events.map((e) => e.club)))];

  const filteredEvents =
    selectedClub === "all"
      ? events
      : events.filter((e) => e.club === selectedClub);

  const ongoing = filteredEvents.filter((e) => e.eventType === "LIVE");
  const upcoming = filteredEvents.filter((e) => e.eventType === "UPCOMING");

  return (
    <div className="events-container">
      <div className="events-bg"></div>

      {/* HEADER */}
      <div className="events-header-modern">
        <div className="events-header-left">
          <img src={logo} alt="VenueVerse Logo" className="events-logo-modern" />
          <div>
            <h1 className="events-title">Existing Events</h1>
            <p className="events-subtitle">
              View all ongoing & upcoming events
            </p>
          </div>
        </div>

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
              className={
                selectedClub === club ? "filter-btn active" : "filter-btn"
              }
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

      {/* LIVE EVENTS */}
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

/* ----------------------------------------------------
    EVENT CARD (UI UNCHANGED)
---------------------------------------------------- */
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
