import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";

import logo from "../assets/venueverse-logo.jpg";
import "./VenueChangeRequest.css";
import { ENDPOINTS, getAuthHeaders, getUser } from "../api";

// Base API URL
// Ensuring this matches backend port
const API_BASE = "http://localhost:5000/api";

// HARDCODED VENUES (Simulation)
const AVAILABLE_VENUES = [
  "Main Auditorium",
  "Open Arena",
  "Lab 301",
  "Sports Complex",
  "Tech Park",
  "Gallery Hall",
];

export default function VenueChangeRequest({ onBack }) {
  // ✅ Support both club specific and generic tokens
  const [clubId, setClubId] = useState(null);

  const [formData, setFormData] = useState({
    eventId: "",
    requestedVenue: "",
    reason: "",
  });

  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get Club ID from localStorage User object
    try {
      const user = getUser();
      if (user) {
        // ✅ Fix: Support both id formats
        setClubId(user.id || user._id);
      }
    } catch (e) {
      console.error("Error parsing user", e);
    }
  }, []);

  // Fetch APPROVED events for this club
  // Fetch APPROVED events for this club
  const fetchApprovedEvents = async () => {
    try {
      const user = getUser();
      const name = user?.name;

      if (!name) return;

      const res = await fetch(`${ENDPOINTS.EVENTS}/club/approved?clubName=${encodeURIComponent(name)}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  /* ----------------------------------
     FETCH VENUE CHANGE REQUESTS
  ---------------------------------- */
  const fetchRequests = useCallback(async () => {
    if (!clubId) return;
    try {
      const res = await fetch(`${ENDPOINTS.REQUESTS}/club/${clubId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId) {
      fetchApprovedEvents();
      fetchRequests();
    }
  }, [clubId, fetchRequests]);

  /* ----------------------------------
     BOOKING SELECT
  ---------------------------------- */
  const handleEventSelect = (eventId) => {
    const ev = events.find((e) => e._id === eventId);
    if (!ev) return;

    setFormData({
      eventId,
      currentVenue: ev.venue,
      requestedVenue: "",
      reason: "",
    });
  };

  /* ----------------------------------
     SUBMIT VENUE REQUEST
  ---------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventId || !formData.requestedVenue || !formData.reason) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${ENDPOINTS.REQUESTS}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          eventId: formData.eventId,
          clubId,
          requestedVenue: formData.requestedVenue,
          reason: formData.reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Request failed");
        return;
      }

      alert("Venue change request submitted");
      setFormData({
        eventId: "",
        currentVenue: "", // Keep logic if needed or remove
        requestedVenue: "",
        reason: "",
      });

      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="vcr-root">
      {/* BACKGROUND ELEMENTS FROM CSS */}
      <div className="vcr-bg-layer"></div>
      <div className="vcr-bg-radial"></div>

      <motion.nav
        className="vcr-nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <button onClick={onBack} className="vcr-back-btn">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="vcr-header-content">
          <img src={logo} className="vcr-logo" alt="VenueVerse" />
          <div>
            <h1 className="vcr-title">Venue Change Request</h1>
            <p className="vcr-subtitle">Request venue update for an event</p>
          </div>
        </div>
      </motion.nav>

      <div className="vcr-container">
        <div className="vcr-grid">

          {/* FORM */}
          <motion.div
            className="vcr-card"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="vcr-card-title">New Venue Request</h2>
            <p className="vcr-card-sub">Submit a request to change your event location.</p>

            <form onSubmit={handleSubmit} className="vcr-form">
              <div className="vcr-field">
                <label><Calendar size={16} /> Select Event *</label>
                <select
                  value={formData.eventId}
                  onChange={(e) => handleEventSelect(e.target.value)}
                >
                  <option value="">Choose event</option>
                  {events.length === 0 ? (
                    <option disabled>No approved upcoming events found</option>
                  ) : (
                    events.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.eventName} ({new Date(e.date).toLocaleDateString()})
                      </option>
                    ))
                  )}
                </select>
                {events.length === 0 && (
                  <p className="vcr-hint">
                    * Only <strong>approved</strong> and <strong>upcoming</strong> events can request a venue change.
                    Please check your <span style={{ color: '#a855f7', cursor: 'pointer' }} onClick={() => window.location.href = '/club/bookings'}>Booking Status</span>.
                  </p>
                )}
              </div>

              {formData.eventId && (
                <>
                  <div className="vcr-field">
                    <label><MapPin size={16} /> Current Venue</label>
                    <input value={formData.currentVenue} disabled />
                  </div>

                  <div className="vcr-field">
                    <label><MapPin size={16} /> Requested Venue *</label>
                    <select
                      value={formData.requestedVenue}
                      onChange={(e) =>
                        setFormData({ ...formData, requestedVenue: e.target.value })
                      }
                    >
                      <option value="">Choose new venue</option>
                      {AVAILABLE_VENUES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="vcr-field">
                    <label>Reason *</label>
                    <textarea
                      rows={4}
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      placeholder="Why do you need to change the venue?"
                    />
                  </div>

                  <button className="vcr-submit">
                    <Send size={16} /> Submit Request
                  </button>
                </>
              )}
            </form>
          </motion.div>

          {/* REQUEST LIST */}
          <motion.div
            className="vcr-card"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="vcr-card-title">My Venue Requests</h2>
            <p className="vcr-card-sub">Track status of your submitted requests.</p>

            <div className="vcr-request-list">
              {requests.length === 0 && (
                <p className="vcr-empty">No requests found</p>
              )}

              {requests.map((r) => (
                <div key={r._id} className="vcr-request-card">
                  <div className="vcr-request-head">
                    <h4>{r.event?.eventName || "Event Name"}</h4>
                    <span className={`vcr-badge-${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </div>

                  <p className="vcr-small" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} />
                    <span style={{ textDecoration: 'line-through', color: '#6b7280' }}>{r.event?.venue}</span>
                    <span> → </span>
                    <span style={{ color: '#a855f7' }}>{r.requestedVenue}</span>
                  </p>

                  <p className="vcr-reason">"{r.reason}"</p>

                  {r.status === "APPROVED" && (
                    <div className="vcr-approved-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={14} /> <strong>Approved</strong>
                      </div>
                      <div className="vcr-small" style={{ marginTop: '4px' }}>
                        {r.adminComment || "Venue updated successfully."}
                      </div>
                    </div>
                  )}

                  {r.status === "REJECTED" && (
                    <div className="vcr-rejected-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <XCircle size={14} /> <strong>Rejected</strong>
                      </div>
                      <div className="vcr-reject-reason">
                        {r.adminComment || "No reason provided."}
                      </div>
                    </div>
                  )}

                  {r.status === "PENDING" && (
                    <div className="vcr-date" style={{ marginTop: '10px' }}>
                      Submitted on {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
