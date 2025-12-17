// src/components/BookingStatus.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  User,
  Phone,
  AlertCircle,
  XCircle,
} from "lucide-react";

import "./BookingStatus.css";
import logo from "../assets/venueverse-logo.jpg";

export default function BookingStatus({ onBack }) {
  const [userRegistrations, setUserRegistrations] = useState([]);

  useEffect(() => {
    const registrations = localStorage.getItem("registrations");
    if (registrations) {
      setUserRegistrations(JSON.parse(registrations));
    }
  }, []);

  const adminContacts = [
    { name: "Kanishka Krish", phone: "+91 9876500011" },
    { name: "Sanyam Khajuria", phone: "+91 9876500012" },
    { name: "Kevan Patira", phone: "+91 9876500013" },
    { name: "Krish Raj", phone: "+91 9876500014" },
  ];

  const defaultBookings = [
    {
      id: 2,
      memberName: "Sarah Johnson",
      eventName: "Photography Workshop",
      timeSlot: "2:00 P.M. - 5:00 P.M.",
      date: "December 18, 2024",
      venue: "Studio Room A",
      status: "Pending",
      statusColor: "status-pending",
    },
    {
      id: 3,
      memberName: "Mike Chen",
      eventName: "Board Game Night",
      timeSlot: "6:00 P.M. - 10:00 P.M.",
      date: "December 20, 2024",
      venue: "Recreation Area",
      status: "Confirmed",
      statusColor: "status-confirmed",
    },
    {
      id: 4,
      memberName: "James Wilson",
      eventName: "Photography Workshop",
      timeSlot: "2:00 P.M. - 5:00 P.M.",
      date: "December 18, 2024",
      venue: "Studio Room A",
      status: "Venue Changed",
      statusColor: "status-changed",
      venueChangeInfo: {
        originalVenue: "Media Center",
        newVenue: "Studio Room A",
        approvedBy: "Admin Smith",
        approvedDate: "December 13, 2024",
      },
    },
    {
      id: 5,
      memberName: "Emma Thompson",
      eventName: "Late Night DJ Party",
      timeSlot: "10:00 P.M. - 2:00 A.M.",
      date: "December 31, 2024",
      venue: "Student Center",
      status: "Rejected",
      statusColor: "status-rejected",
      rejectionReason:
        "Violates campus noise policy and timing regulations",
    },
  ];

  const bookings = [...userRegistrations, ...defaultBookings];

  return (
    <div className="bs-root">
      <div className="bs-bg-gradient" />
      <div className="bs-bg-radial" />

      <div className="bs-particles" aria-hidden>
        {Array.from({ length: 15 }).map((_, i) => (
          <span
            key={i}
            className="bs-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
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
                  View and track all current bookings
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="bs-main">
        <div className="bs-container">

          {/* --- Admin Contacts Section --- */}
          <div className="bs-admin">
            <div className="bs-admin-card">
              <div className="bs-admin-left">
                <AlertCircle className="bs-admin-icon" />
                <span className="bs-admin-label">
                  For any issues, contact admins:
                </span>
              </div>

              <div className="bs-admin-contacts">
                {adminContacts.map((admin, i) => (
                  <div key={i} className="bs-admin-item">
                    <span className="bs-admin-name">{admin.name}</span>
                    <a href={`tel:${admin.phone}`} className="bs-admin-phone">
                      {admin.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- Bookings List --- */}
          <div className="bs-list">
            {bookings.map((b) => (
              <div key={b.id} className="bs-card">
                <div className="bs-card-head">
                  <div>
                    <h3 className="bs-card-title">{b.eventName}</h3>
                    <p className="bs-card-sub">
                      Booked by {b.memberName}
                    </p>
                  </div>

                  <span className={`bs-badge ${b.statusColor}`}>
                    {b.status}
                  </span>
                </div>

                <div className="bs-card-body">
                  <div className="bs-grid">

                    {/* Left Info Column */}
                    <div className="bs-info">
                      <div className="bs-info-row">
                        <Calendar className="bs-info-icon" />
                        <div>
                          <div className="bs-info-label">Date</div>
                          <div className="bs-info-value">{b.date}</div>
                        </div>
                      </div>

                      <div className="bs-info-row">
                        <Clock className="bs-info-icon" />
                        <div>
                          <div className="bs-info-label">Time</div>
                          <div className="bs-info-value">{b.timeSlot}</div>
                        </div>
                      </div>

                      <div className="bs-info-row">
                        <MapPin className="bs-info-icon" />
                        <div>
                          <div className="bs-info-label">Venue</div>
                          <div className="bs-info-value">{b.venue}</div>
                        </div>
                      </div>

                      <div className="bs-info-row">
                        <User className="bs-info-icon" />
                        <div>
                          <div className="bs-info-label">Member</div>
                          <div className="bs-info-value">{b.memberName}</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="bs-aside">

                      {/* Venue Change */}
                      {b.venueChangeInfo && (
                        <div className="bs-venue-change">
                          <div className="bs-venue-change-head">
                            <MapPin className="bs-icon purple" />
                            <div className="bs-venue-info">Venue Updated</div>
                          </div>

                          <div className="bs-venue-original">
                            Old: {b.venueChangeInfo.originalVenue}
                          </div>
                          <div className="bs-venue-new">
                            New: {b.venueChangeInfo.newVenue}
                          </div>

                          <div className="bs-venue-meta">
                            Approved by {b.venueChangeInfo.approvedBy} on{" "}
                            {b.venueChangeInfo.approvedDate}
                          </div>
                        </div>
                      )}

                      {/* Rejected */}
                      {b.rejectionReason && (
                        <div className="bs-rejected">
                          <div className="bs-rejected-head">
                            <XCircle className="bs-icon red" />
                            <div>Rejected</div>
                          </div>

                          <div className="bs-rejected-text">
                            {b.rejectionReason}
                          </div>
                          <div className="bs-rejected-note">
                            Contact admin for more details.
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* --- Summary Section --- */}
          <div className="bs-summary">
            <div className="bs-summary-grid">
              <div className="bs-stat-card stat-indigo">
                <div className="stat-title">Total Bookings</div>
                <div className="stat-value">{bookings.length}</div>
              </div>

              <div className="bs-stat-card stat-green">
                <div className="stat-title">Confirmed</div>
                <div className="stat-value">
                  {bookings.filter((b) => b.status === "Confirmed").length}
                </div>
              </div>

              <div className="bs-stat-card stat-yellow">
                <div className="stat-title">Pending</div>
                <div className="stat-value">
                  {bookings.filter((b) => b.status === "Pending").length}
                </div>
              </div>

              <div className="bs-stat-card stat-red">
                <div className="stat-title">Rejected</div>
                <div className="stat-value">
                  {bookings.filter((b) => b.status === "Rejected").length}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
