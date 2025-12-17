import { useState } from "react";
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

export default function VenueChangeRequest({ onBack }) {
  const [formData, setFormData] = useState({
    bookingId: "",
    currentVenue: "",
    requestedVenue: "",
    reason: "",
  });

  const [requests, setRequests] = useState([
    {
      id: 1,
      bookingId: "0001",
      eventName: "Fun and Hunt",
      memberName: "Krish",
      currentVenue: "Main Club Hall",
      requestedVenue: "Outdoor Garden",
      reason: "Better suited for outdoor activities",
      status: "Pending",
      submittedDate: "2024-12-10",
    },
    {
      id: 2,
      bookingId: "0002",
      eventName: "Photography Workshop",
      memberName: "Sarah Johnson",
      currentVenue: "Media Center",
      requestedVenue: "Studio Room A",
      reason: "Better lighting and space",
      status: "Approved",
      approvedBy: "Admin Smith",
      approvedDate: "2024-12-13",
    },
    {
      id: 3,
      bookingId: "0003",
      eventName: "Board Game Night",
      memberName: "Mike Chen",
      currentVenue: "Conference Room",
      requestedVenue: "Recreation Area",
      reason: "Need bigger space",
      status: "Rejected",
      rejectedBy: "Admin Johnson",
      rejectedDate: "2024-12-12",
      rejectionReason: "Recreation Area already booked",
    },
  ]);

  const existingBookings = [
    {
      id: "0001",
      eventName: "Fun and Hunt",
      memberName: "Krish",
      venue: "Main Club Hall",
      date: "December 15, 2024",
      timeSlot: "8:00 A.M. - 12:00 P.M.",
    },
    {
      id: "0002",
      eventName: "Photography Workshop",
      memberName: "Sarah Johnson",
      venue: "Studio Room A",
      date: "December 18, 2024",
      timeSlot: "2:00 P.M. - 5:00 P.M.",
    },
    {
      id: "0003",
      eventName: "Board Game Night",
      memberName: "Mike Chen",
      venue: "Recreation Area",
      date: "December 20, 2024",
      timeSlot: "6:00 P.M. - 10:00 P.M.",
    },
  ];

  const venues = [
    "Main Club Hall",
    "Studio Room A",
    "Studio Room B",
    "Recreation Area",
    "Conference Room",
    "Outdoor Garden",
    "Sports Area",
  ];

  const handleBookingSelect = (bookingId) => {
    const booking = existingBookings.find((b) => b.id === bookingId);
    if (booking) {
      setFormData({
        ...formData,
        bookingId,
        currentVenue: booking.venue,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.bookingId || !formData.requestedVenue || !formData.reason) {
      alert("Please fill all required fields.");
      return;
    }

    const booking = existingBookings.find((b) => b.id === formData.bookingId);

    const newReq = {
      id: Date.now(),
      bookingId: formData.bookingId,
      eventName: booking.eventName,
      memberName: booking.memberName,
      currentVenue: formData.currentVenue,
      requestedVenue: formData.requestedVenue,
      reason: formData.reason,
      status: "Pending",
      submittedDate: new Date().toISOString().split("T")[0],
    };

    setRequests([...requests, newReq]);
    alert("Venue change request submitted!");

    setFormData({
      bookingId: "",
      currentVenue: "",
      requestedVenue: "",
      reason: "",
    });
  };

  return (
    <div className="vcr-root">
      <div className="vcr-bg-layer"></div>
      <div className="vcr-bg-radial"></div>

      {/* TOP NAVIGATION BAR */}
      <motion.nav
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="vcr-nav"
      >
        <button onClick={onBack} className="vcr-back-btn">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="vcr-header-content">
          <img src={logo} className="vcr-logo" alt="VenueVerse Logo" />
          <div>
            <h1 className="vcr-title">Venue Change Request</h1>
            <p className="vcr-subtitle">
              Request to change the venue for an existing event.
            </p>
          </div>
        </div>
      </motion.nav>

      <div className="vcr-container">
        <div className="vcr-grid">
          {/* LEFT FORM */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="vcr-card"
          >
            <h2 className="vcr-card-title">New Venue Change Request</h2>
            <p className="vcr-card-sub">Select booking and enter details</p>

            <form onSubmit={handleSubmit} className="vcr-form">
              {/* SELECT BOOKING */}
              <div className="vcr-field">
                <label>
                  <Calendar size={16} /> Select Booking *
                </label>
                <select
                  value={formData.bookingId}
                  onChange={(e) => handleBookingSelect(e.target.value)}
                >
                  <option value="">Choose booking</option>
                  {existingBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.id} – {b.eventName} ({b.memberName})
                    </option>
                  ))}
                </select>
              </div>

              {formData.bookingId && (
                <>
                  {/* CURRENT VENUE */}
                  <div className="vcr-field">
                    <label>
                      <MapPin size={16} /> Current Venue
                    </label>
                    <input value={formData.currentVenue} disabled />
                  </div>

                  {/* REQUEST NEW VENUE */}
                  <div className="vcr-field">
                    <label>
                      <MapPin size={16} /> Requested Venue *
                    </label>
                    <select
                      value={formData.requestedVenue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requestedVenue: e.target.value,
                        })
                      }
                    >
                      <option value="">Choose new venue</option>
                      {venues
                        .filter((v) => v !== formData.currentVenue)
                        .map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* REASON */}
                  <div className="vcr-field">
                    <label>Reason *</label>
                    <textarea
                      rows={4}
                      placeholder="Explain the reason"
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                    ></textarea>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="vcr-submit"
                  >
                    <Send size={16} />
                    Submit Request
                  </motion.button>
                </>
              )}
            </form>
          </motion.div>

          {/* RIGHT REQUEST LIST */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="vcr-card"
          >
            <h2 className="vcr-card-title">Existing Requests</h2>

            {requests.length === 0 && (
              <p className="vcr-empty">No requests submitted yet.</p>
            )}

            <div className="vcr-request-list">
              {requests.map((req) => (
                <motion.div
                  key={req.id}
                  className="vcr-request-card"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="vcr-request-head">
                    <h4>{req.eventName}</h4>
                    <span
                      className={
                        req.status === "Approved"
                          ? "vcr-badge-approved"
                          : req.status === "Rejected"
                          ? "vcr-badge-rejected"
                          : "vcr-badge-pending"
                      }
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="vcr-small">
                    #{req.bookingId} • {req.memberName}
                  </p>

                  <p className="vcr-small">
                    <MapPin size={14} /> {req.currentVenue} →{" "}
                    {req.requestedVenue}
                  </p>

                  <p className="vcr-reason">Reason: {req.reason}</p>

                  <p className="vcr-date">Submitted: {req.submittedDate}</p>

                  {/* STATUS DETAILS */}
                  {req.status === "Approved" && (
                    <div className="vcr-approved-box">
                      <CheckCircle size={14} />
                      Approved by {req.approvedBy} on {req.approvedDate}
                    </div>
                  )}

                  {req.status === "Rejected" && (
                    <div className="vcr-rejected-box">
                      <XCircle size={14} />
                      Rejected by {req.rejectedBy} on {req.rejectedDate}
                      <p className="vcr-reject-reason">
                        Reason: {req.rejectionReason}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
