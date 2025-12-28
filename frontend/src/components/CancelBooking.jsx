import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
} from "lucide-react";

import logo from "../assets/venueverse-logo.jpg";
import "./CancelBooking.css";
import { ENDPOINTS, getAuthHeaders } from "../api";

export default function CancelBooking({ onBack, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "http://localhost:5000/api/events";
  const token = localStorage.getItem("clubToken");

  /* ----------------------------------------------------
      FETCH CLUB BOOKINGS
  ---------------------------------------------------- */
  const fetchBookings = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.EVENTS}/club`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [onLogout]);

  /* ----------------------------------------------------
      CANCEL BOOKING (LIVE UPDATE)
  ---------------------------------------------------- */
  const handleCancelBooking = async (eventId) => {
    if (!token) return;

    try {
      const res = await fetch(
        `${ENDPOINTS.EVENTS}/club/cancel/${eventId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      // 🔄 Live UI update
      setBookings((prev) =>
        prev.map((b) =>
          b._id === eventId ? { ...b, status: "CANCELLED" } : b
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to cancel booking"
      );
    }
  };

  /* ----------------------------------------------------
      FILTER BOOKINGS
  ---------------------------------------------------- */
  const active = bookings.filter(
    (b) => b.status !== "CANCELLED"
  );
  const cancelled = bookings.filter(
    (b) => b.status === "CANCELLED"
  );

  return (
    <div className="cb-root">
      <div className="cb-bg-layer"></div>
      <div className="cb-bg-radial"></div>

      {/* HEADER */}
      <motion.nav
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="cb-nav"
      >
        <button onClick={onBack} className="cb-back-btn">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="cb-header-content">
          <img src={logo} className="cb-logo" alt="VenueVerse Logo" />
          <div>
            <h1 className="cb-title">Cancel Bookings</h1>
            <p className="cb-subtitle">
              Cancel existing event bookings and registrations
            </p>
          </div>
        </div>
      </motion.nav>

      {/* MAIN */}
      <div className="cb-container">
        {loading && (
          <p className="cb-empty">Loading bookings...</p>
        )}

        {!loading && (
          <>
            {/* ACTIVE BOOKINGS */}
            <motion.h2 className="cb-section-title">
              Active Bookings
            </motion.h2>

            {active.length === 0 && (
              <div className="cb-card">
                <p className="cb-empty">No active bookings.</p>
              </div>
            )}

            {active.map((b, idx) => (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="cb-card"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h3 className="cb-card-title">
                      <Calendar size={18} /> {b.eventName}
                    </h3>
                    <p className="cb-booking-id">
                      Booking ID: #{b._id.slice(-4)}
                    </p>
                  </div>

                  <div
                    style={{ display: "flex", gap: "10px" }}
                  >
                    <span className="cb-badge-confirmed">
                      {b.status}
                    </span>
                    <button
                      onClick={() =>
                        handleCancelBooking(b._id)
                      }
                      className="cb-cancel-btn"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>

                <div className="cb-details-grid">
                  <Detail
                    icon={<User size={16} />}
                    label="Club"
                    value={b.clubName}
                  />
                  <Detail
                    icon={<Clock size={16} />}
                    label="Time"
                    value={b.timeSlot}
                  />
                  <Detail
                    icon={<Calendar size={16} />}
                    label="Date"
                    value={b.date}
                  />
                  <Detail
                    icon={<MapPin size={16} />}
                    label="Venue"
                    value={b.venue}
                  />
                </div>
              </motion.div>
            ))}

            {/* CANCELLED BOOKINGS */}
            {cancelled.length > 0 && (
              <>
                <motion.h2
                  className="cb-section-title"
                  style={{ marginTop: 40 }}
                >
                  Recently Cancelled
                </motion.h2>

                {cancelled.map((b, idx) => (
                  <motion.div
                    key={b._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: idx * 0.05,
                    }}
                    className="cb-card cb-card-cancelled"
                  >
                    <h3
                      className="cb-card-title"
                      style={{ color: "#fca5a5" }}
                    >
                      <Calendar size={18} /> {b.eventName}
                    </h3>

                    <div className="cb-details-grid">
                      <Detail
                        icon={<User size={16} />}
                        label="Club"
                        value={b.clubName}
                      />
                      <Detail
                        icon={<Clock size={16} />}
                        label="Time"
                        value={b.timeSlot}
                      />
                      <Detail
                        icon={<Calendar size={16} />}
                        label="Date"
                        value={b.date}
                      />
                      <Detail
                        icon={<MapPin size={16} />}
                        label="Venue"
                        value={b.venue}
                      />
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------
    DETAIL BLOCK
---------------------------------------------------- */
function Detail({ icon, label, value }) {
  return (
    <div className="cb-detail">
      {icon}
      <div>
        <p className="cb-detail-label">{label}</p>
        <p>{value || "—"}</p>
      </div>
    </div>
  );
}
