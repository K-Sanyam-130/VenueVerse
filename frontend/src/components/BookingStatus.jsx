import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  User,
  AlertCircle,
  XCircle,
} from "lucide-react";

import "./BookingStatus.css";
import logo from "../assets/venueverse-logo.jpg";
import { ENDPOINTS, getAuthHeaders } from "../api";

export default function BookingStatus({ onBack }) {
  const [bookings, setBookings] = useState([]);

  // The API constant is no longer needed as ENDPOINTS will be used
  // const API = "http://localhost:5000/api/events";

  /* ----------------------------------------------------
      FETCH BOOKINGS (AUTO REFRESH)
  ---------------------------------------------------- */
  useEffect(() => {
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
      }
    };

    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ----------------------------------------------------
      STATUS HELPERS (UNCHANGED)
  ---------------------------------------------------- */
  const getStatusBadge = (status) => {
    if (status === "APPROVED") return "status-confirmed";
    if (status === "REJECTED") return "status-rejected";
    return "status-pending";
  };

  const getStatusText = (status) => {
    if (status === "APPROVED") return "Approved";
    if (status === "REJECTED") return "Rejected";
    return "Pending";
  };

  const adminContacts = [
    { name: "Kanishka Krish", phone: "+91 9876500011" },
    { name: "Sanyam Khajuria", phone: "+91 9876500012" },
    { name: "Kevan Patira", phone: "+91 9876500013" },
    { name: "Krish Raj", phone: "+91 9876500014" },
  ];

  return (
    <div className="bs-root">
      <div className="bs-bg-gradient" />
      <div className="bs-bg-radial" />

      {/* HEADER */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="bs-header"
      >
        <div className="bs-header-inner">
          <div className="bs-header-left">
            <button className="bs-back" onClick={onBack}>
              <ArrowLeft />
              <span>Back to Dashboard</span>
            </button>

            <div className="bs-logo-title">
              <img src={logo} alt="VenueVerse" className="bs-logo" />
              <div>
                <h1 className="bs-page-title">Booking Status</h1>
                <p className="bs-page-sub">
                  Track approval status of your event requests
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* MAIN */}
      <main className="bs-main">
        <div className="bs-container">

          {/* ADMIN CONTACTS */}
          <div className="bs-admin">
            <div className="bs-admin-card">
              <AlertCircle className="bs-admin-icon" />
              <span>For any issues, contact admins:</span>

              <div className="bs-admin-contacts">
                {adminContacts.map((admin, i) => (
                  <div key={i} className="bs-admin-item">
                    <span>{admin.name}</span>
                    <a href={`tel:${admin.phone}`}>{admin.phone}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOOKINGS */}
          <div className="bs-list">
            {bookings.length === 0 ? (
              <p className="bs-empty">No event bookings yet.</p>
            ) : (
              bookings.map((b) => (
                <div key={b._id} className="bs-card-horizontal">

                  <div className="bs-card-top">
                    <div className="bs-title-wrap">
                      <h3 className="bs-event-name">
                        <Calendar size={18} />
                        {b.eventName}
                      </h3>
                      <p className="bs-booking-id">
                        Booking ID: #{b._id.slice(-4)}
                      </p>
                    </div>

                    <span
                      className={`bs-status-pill ${getStatusBadge(b.status)}`}
                    >
                      {getStatusText(b.status)}
                    </span>
                  </div>

                  <div className="bs-card-info-row">

                    <div className="bs-info-block">
                      <User size={18} />
                      <div>
                        <span className="label">Club</span>
                        <span className="value">{b.clubName}</span>
                      </div>
                    </div>

                    <div className="bs-info-block">
                      <Clock size={18} />
                      <div>
                        <span className="label">Time</span>
                        <span className="value">{b.timeSlot || "—"}</span>
                      </div>
                    </div>

                    <div className="bs-info-block">
                      <Calendar size={18} />
                      <div>
                        <span className="label">Date</span>
                        <span className="value">{b.date}</span>
                      </div>
                    </div>

                    <div className="bs-info-block">
                      <MapPin size={18} />
                      <div>
                        <span className="label">Venue</span>
                        <span className="value">{b.venue}</span>
                      </div>
                    </div>

                  </div>

                  {b.status === "REJECTED" && b.adminMessage && (
                    <div className="bs-rejected">
                      <XCircle />
                      <p>{b.adminMessage}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
