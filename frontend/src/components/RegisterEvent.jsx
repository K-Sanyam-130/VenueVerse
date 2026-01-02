import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
} from "lucide-react";

import "./RegisterEvent.css";
import logo from "../assets/venueverse-logo.jpg";

import { ENDPOINTS, getAuthHeaders, getUser } from "../api";

export default function RegisterEvent({ onBack, onRegistered }) {
  const [formData, setFormData] = useState({
    memberName: "",
    eventName: "",
    eventDate: "",
    timeSlot: "",
    customStart: "",
    customEnd: "",
    venue: "",
    description: "",
  });

  const [lastRegistration, setLastRegistration] = useState(null);
  const [availableVenues, setAvailableVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(false);

  /* ----------------------------------------------------
      HANDLE SUBMIT
  ---------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.memberName ||
      !formData.eventName ||
      !formData.eventDate ||
      (!formData.timeSlot &&
        (!formData.customStart || !formData.customEnd))
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const timeSlot =
      formData.timeSlot === "custom"
        ? `${formData.customStart} - ${formData.customEnd}`
        : formData.timeSlot;

    try {
      const user = getUser();

      if (!user) {
        alert("User session not found. Please login again.");
        return;
      }

      const clubName = user.name || "Unknown Club";
      const userEmail = user.email || "";

      // ✅ FIXED ENDPOINT + AUTH HEADER
      const res = await axios.post(
        `${ENDPOINTS.EVENTS}/add`,
        {
          eventName: formData.eventName,
          clubName,
          email: userEmail,
          date: formData.eventDate,
          timeSlot,
          venue: formData.venue || "Not specified",
        },
        {
          headers: getAuthHeaders(),
        }
      );

      alert(res.data.message || "Event registered successfully!");

      setLastRegistration({
        memberName: formData.memberName,
        eventName: formData.eventName,
        timeSlot,
        venue: formData.venue || "Not specified",
        description: formData.description,
      });

      // RESET FORM
      setFormData({
        memberName: "",
        eventName: "",
        eventDate: "",
        timeSlot: "",
        customStart: "",
        customEnd: "",
        venue: "",
        description: "",
      });

      if (onRegistered) onRegistered();
    } catch (err) {
      console.error("❌ Event registration failed:", err);
      // Log detailed error from Axios
      if (err.response) {
        console.error("Response Data:", err.response.data);
        console.error("Response Status:", err.response.status);
        alert(`Failed: ${err.response.data.message || err.response.statusText}`);
      } else {
        alert("Failed to register event. Please check your connection.");
      }
    }
  };

  /* ----------------------------------------------------
      TIME SLOTS + VENUES
  ---------------------------------------------------- */
  const timeSlots = [
    "8:00 A.M. - 10:00 A.M.",
    "9:00 A.M. - 11:00 A.M",
    "1:00 P.M. - 4:00 P.M.",
    "12:00 P.M. - 3:00 P.M.",
    "8:00 A.M. - 6:00 P.M.",
    "Full Day (8:00 A.M. - 10:00 P.M.)",
    "custom",
  ];

  const allVenues = [
    "Audi 1",
    "Audi 2",
    "BSN Hall",
    "Indoor Stadium",
    "AIML Lab 1",
    "CSE Lab ",
    "CSE Lab 2",
    "PG Lab First Floor",
  ];

  /* ----------------------------------------------------
      FETCH AVAILABLE VENUES WHEN DATE/TIME CHANGES
  ---------------------------------------------------- */
  useEffect(() => {
    const fetchAvailableVenues = async () => {
      // Only fetch if both date and time slot are selected
      if (!formData.eventDate || !formData.timeSlot) {
        setAvailableVenues([]);
        return;
      }

      // Determine the actual time slot value
      const actualTimeSlot =
        formData.timeSlot === "custom"
          ? formData.customStart && formData.customEnd
            ? `${formData.customStart} - ${formData.customEnd}`
            : ""
          : formData.timeSlot;

      // If custom time but not fully specified, don't fetch yet
      if (!actualTimeSlot) {
        setAvailableVenues([]);
        return;
      }

      setLoadingVenues(true);
      try {
        const res = await axios.get(
          `${ENDPOINTS.EVENTS}/available-venues`,
          {
            params: {
              date: formData.eventDate,
              timeSlot: actualTimeSlot,
            },
          }
        );

        if (res.data.success) {
          setAvailableVenues(res.data.availableVenues || []);
        }
      } catch (err) {
        console.error("Failed to fetch available venues:", err);
        // On error, show all venues as fallback
        setAvailableVenues(allVenues);
      } finally {
        setLoadingVenues(false);
      }
    };

    fetchAvailableVenues();
  }, [formData.eventDate, formData.timeSlot, formData.customStart, formData.customEnd]);

  return (
    <div className="re-root">
      <div className="re-bg-layer"></div>
      <div className="re-bg-radial"></div>

      {/* HEADER */}
      <motion.nav
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="re-nav"
      >
        <button onClick={onBack} className="re-back-btn">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="re-header-content">
          <img src={logo} className="re-logo" alt="VenueVerse Logo" />
          <div>
            <h1 className="re-title">Event Registration</h1>
            <p className="re-subtitle">
              Register a new member for an event or create a new event booking
            </p>
          </div>
        </div>
      </motion.nav>

      {/* MAIN CONTENT */}
      <div className="re-container">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="re-card"
        >
          <h2 className="re-card-title">Registration Form</h2>
          <p className="re-card-sub">Fill in the details below to register</p>

          <form onSubmit={handleSubmit} className="re-form">
            {/* NAME + EVENT */}
            <div className="re-grid-2">
              <div className="re-field">
                <label>
                  <User size={16} /> Member Name *
                </label>
                <input
                  type="text"
                  value={formData.memberName}
                  onChange={(e) =>
                    setFormData({ ...formData, memberName: e.target.value })
                  }
                />
              </div>

              <div className="re-field">
                <label>
                  <Calendar size={16} /> Event Name *
                </label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) =>
                    setFormData({ ...formData, eventName: e.target.value })
                  }
                />
              </div>
            </div>

            {/* DATE + TIME */}
            <div className="re-grid-2">
              <div className="re-field">
                <label>
                  <Calendar size={16} /> Event Date *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]} // ✅ Prevent past dates
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                />
              </div>

              <div className="re-field">
                <label>
                  <Clock size={16} /> Time Slot *
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) =>
                    setFormData({ ...formData, timeSlot: e.target.value })
                  }
                >
                  <option value="">Select time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot === "custom" ? "Custom Time Range" : slot}
                    </option>
                  ))}
                </select>

                {formData.timeSlot === "custom" && (
                  <div className="re-custom-time">
                    <input
                      type="time"
                      value={formData.customStart}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customStart: e.target.value,
                        })
                      }
                    />
                    <span className="re-to">to</span>
                    <input
                      type="time"
                      value={formData.customEnd}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customEnd: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {/* VENUE */}
            <div className="re-field">
              <label>
                <MapPin size={16} /> Venue
              </label>
              <select
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                disabled={!formData.eventDate || !formData.timeSlot || loadingVenues}
              >
                {!formData.eventDate || !formData.timeSlot ? (
                  <option value="">Please select date and time first</option>
                ) : loadingVenues ? (
                  <option value="">Loading available venues...</option>
                ) : availableVenues.length === 0 ? (
                  <option value="">No venues available for selected date/time</option>
                ) : (
                  <>
                    <option value="">Select venue</option>
                    {availableVenues.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* DESCRIPTION */}
            <div className="re-field">
              <label>Event Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* BUTTONS */}
            <div className="re-btn-row">
              <button type="submit" className="re-submit">
                Register Event
              </button>
              <button
                type="button"
                className="re-clear"
                onClick={() =>
                  setFormData({
                    memberName: "",
                    eventName: "",
                    eventDate: "",
                    timeSlot: "",
                    customStart: "",
                    customEnd: "",
                    venue: "",
                    description: "",
                  })
                }
              >
                Clear Form
              </button>
            </div>
          </form>
        </motion.div>

        {/* LAST REGISTRATION */}
        {lastRegistration && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="re-last-card"
          >
            <h2>
              <CheckCircle className="re-last-icon" />
              Most Recent Registration
            </h2>
            <div className="re-last-grid">
              <p>
                <strong>Member:</strong> {lastRegistration.memberName}
              </p>
              <p>
                <strong>Event:</strong> {lastRegistration.eventName}
              </p>
              <p>
                <strong>Time:</strong> {lastRegistration.timeSlot}
              </p>
              <p>
                <strong>Venue:</strong> {lastRegistration.venue}
              </p>
            </div>

            {lastRegistration.description && (
              <p>
                <strong>Description:</strong>{" "}
                {lastRegistration.description}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
