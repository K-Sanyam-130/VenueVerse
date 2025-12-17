import { useState } from "react";
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

export default function CancelBooking({ onBack }) {   // ✅ FIXED (default export)
  const [bookings, setBookings] = useState([
    {
      id: 1,
      memberName: "Krish",
      eventName: "Fun and Hunt",
      timeSlot: "8:00 A.M. - 12:00 P.M.",
      date: "December 15, 2024",
      venue: "Main Club Hall",
      status: "Confirmed",
    },
    {
      id: 2,
      memberName: "Sarah Johnson",
      eventName: "Photography Workshop",
      timeSlot: "2:00 P.M. - 5:00 P.M.",
      date: "December 18, 2024",
      venue: "Studio Room A",
      status: "Confirmed",
    },
    {
      id: 3,
      memberName: "Mike Chen",
      eventName: "Board Game Night",
      timeSlot: "6:00 P.M. - 10:00 P.M.",
      date: "December 20, 2024",
      venue: "Recreation Area",
      status: "Confirmed",
    },
  ]);

  const handleCancelBooking = (id) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "Cancelled" } : b
      )
    );
  };

  const active = bookings.filter((b) => b.status === "Confirmed");
  const cancelled = bookings.filter((b) => b.status === "Cancelled");

  return (
    <div className="cb-root">
      {/* BACKGROUND */}
      <div className="cb-bg-layer"></div>
      <div className="cb-bg-radial"></div>

      {/* NAV HEADER */}
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
        {/* ACTIVE BOOKINGS */}
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="cb-section-title"
        >
          Active Bookings
        </motion.h2>

        {active.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cb-card"
          >
            <p className="cb-empty">No active bookings.</p>
          </motion.div>
        )}

        {active.map((b, idx) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="cb-card"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h3 className="cb-card-title">
                  <Calendar size={18} /> {b.eventName}
                </h3>
                <p className="cb-booking-id">
                  Booking ID: #{String(b.id).padStart(4, "0")}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <span className="cb-badge-confirmed">Confirmed</span>
                <button
                  onClick={() => handleCancelBooking(b.id)}
                  className="cb-cancel-btn"
                >
                  Cancel Booking
                </button>
              </div>
            </div>

            <div className="cb-details-grid">
              <div className="cb-detail">
                <User size={16} color="#64748b" />
                <div>
                  <p className="cb-detail-label">Member</p>
                  <p>{b.memberName}</p>
                </div>
              </div>

              <div className="cb-detail">
                <Clock size={16} color="#64748b" />
                <div>
                  <p className="cb-detail-label">Time</p>
                  <p>{b.timeSlot}</p>
                </div>
              </div>

              <div className="cb-detail">
                <Calendar size={16} color="#64748b" />
                <div>
                  <p className="cb-detail-label">Date</p>
                  <p>{b.date}</p>
                </div>
              </div>

              <div className="cb-detail">
                <MapPin size={16} color="#64748b" />
                <div>
                  <p className="cb-detail-label">Venue</p>
                  <p>{b.venue}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* CANCELLED BOOKINGS */}
        {cancelled.length > 0 && (
          <>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="cb-section-title"
              style={{ marginTop: "40px" }}
            >
              Recently Cancelled
            </motion.h2>

            {cancelled.map((b, idx) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="cb-card cb-card-cancelled"
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3 className="cb-card-title" style={{ color: "#fca5a5" }}>
                      <Calendar size={18} /> {b.eventName}
                    </h3>
                    <p className="cb-booking-id">
                      Booking ID: #{String(b.id).padStart(4, "0")}
                    </p>
                  </div>

                  <span className="cb-badge-cancelled">Cancelled</span>
                </div>

                <div className="cb-details-grid">
                  <div className="cb-detail">
                    <User size={16} color="#64748b" />
                    <div>
                      <p className="cb-detail-label">Member</p>
                      <p>{b.memberName}</p>
                    </div>
                  </div>

                  <div className="cb-detail">
                    <Clock size={16} color="#64748b" />
                    <div>
                      <p className="cb-detail-label">Time</p>
                      <p>{b.timeSlot}</p>
                    </div>
                  </div>

                  <div className="cb-detail">
                    <Calendar size={16} color="#64748b" />
                    <div>
                      <p className="cb-detail-label">Date</p>
                      <p>{b.date}</p>
                    </div>
                  </div>

                  <div className="cb-detail">
                    <MapPin size={16} color="#64748b" />
                    <div>
                      <p className="cb-detail-label">Venue</p>
                      <p>{b.venue}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
