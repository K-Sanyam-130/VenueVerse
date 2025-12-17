import { useState } from "react";
import "./AdminEventManagement.css";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  ArrowLeft,
  Info,
} from "lucide-react";

export default function AdminEventManagement({ onBack, onLogout }) {
  // Dummy data
  const [pendingEvents, setPendingEvents] = useState([
    {
      id: 1,
      title: "Tech Talk: AI in 2025",
      club: "Coding Club",
      date: "2025-12-10",
      venue: "Main Auditorium",
      description: "A collaborative session on AI advancements.",
    },
    {
      id: 2,
      title: "Dance Auditions",
      club: "Cultural Club",
      date: "2025-12-12",
      venue: "Dance Room 3",
      description: "Auditions for annual fest performance.",
    },
  ]);

  const [approvedEvents, setApprovedEvents] = useState([
    {
      id: 3,
      title: "Startup Bootcamp",
      club: "Entrepreneurship Cell",
      date: "2025-12-06",
      venue: "Innovation Hall",
      description: "Intensive workshop on building startups.",
    },
  ]);

  const [cancelledEvents, setCancelledEvents] = useState([]);

  // Reject popup
  const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Details modal
  const [detailsPopup, setDetailsPopup] = useState(false);

  // Approve
  const approveEvent = (event) => {
    setPendingEvents(pendingEvents.filter((e) => e.id !== event.id));
    setApprovedEvents([...approvedEvents, event]);
  };

  // Open reject popup
  const openRejectPopup = (event) => {
    setSelectedEvent(event);
    setRejectPopupOpen(true);
  };

  // Confirm rejection
  const confirmReject = () => {
    if (!rejectReason.trim()) return;

    setCancelledEvents([
      ...cancelledEvents,
      { ...selectedEvent, reason: rejectReason },
    ]);

    setPendingEvents(pendingEvents.filter((e) => e.id !== selectedEvent.id));

    setRejectPopupOpen(false);
    setRejectReason("");
  };

  // Open event details modal
  const openDetails = (event) => {
    setSelectedEvent(event);
    setDetailsPopup(true);
  };

  return (
    <div className="admin-event-root">
      <div className="admin-bg" />

      {/* HEADER */}
      <header className="admin-event-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="event-title">Event Management</h1>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {/* MAIN */}
      <main className="event-main">
        {/* PENDING EVENTS */}
        <section className="event-section">
          <h2 className="section-title">
            <Clock size={18} className="yellow-icon" /> Pending Requests
          </h2>

          <div className="event-grid">
            {pendingEvents.length === 0 ? (
              <p className="empty-msg">No pending event requests.</p>
            ) : (
              pendingEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h3 className="event-name">{event.title}</h3>
                  <p className="event-info">Club: {event.club}</p>
                  <p className="event-info">Venue: {event.venue}</p>
                  <p className="event-info">Date: {event.date}</p>

                  <div className="event-btn-row">
                    <button
                      className="view-btn"
                      onClick={() => openDetails(event)}
                    >
                      <Info size={16} /> View Details
                    </button>

                    <button
                      className="approve-btn"
                      onClick={() => approveEvent(event)}
                    >
                      <CheckCircle size={16} /> Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => openRejectPopup(event)}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* APPROVED */}
        <section className="event-section">
          <h2 className="section-title">
            <CheckCircle size={18} className="green-icon" /> Approved Events
          </h2>

          <div className="event-grid">
            {approvedEvents.length === 0 ? (
              <p className="empty-msg">No approved events.</p>
            ) : (
              approvedEvents.map((event) => (
                <div key={event.id} className="event-card approved-card">
                  <h3 className="event-name">{event.title}</h3>
                  <p className="event-info">Club: {event.club}</p>
                  <p className="event-info">Venue: {event.venue}</p>
                  <p className="event-info">Date: {event.date}</p>

                  <button
                    className="view-btn"
                    onClick={() => openDetails(event)}
                  >
                    <Info size={16} /> View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* CANCELLED */}
        <section className="event-section">
          <h2 className="section-title">
            <XCircle size={18} className="red-icon" /> Cancelled Events
          </h2>

          <div className="event-grid">
            {cancelledEvents.length === 0 ? (
              <p className="empty-msg">No cancelled events.</p>
            ) : (
              cancelledEvents.map((event) => (
                <div key={event.id} className="event-card cancelled-card">
                  <h3 className="event-name">{event.title}</h3>
                  <p className="event-info">Club: {event.club}</p>
                  <p className="event-info">Venue: {event.venue}</p>
                  <p className="event-info">Date: {event.date}</p>

                  <p className="cancel-reason">
                    <strong>Reason:</strong> {event.reason}
                  </p>

                  <button
                    className="view-btn"
                    onClick={() => openDetails(event)}
                  >
                    <Info size={16} /> View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* REJECT POPUP */}
      {rejectPopupOpen && (
        <div className="reject-popup-overlay">
          <div className="reject-popup">
            <h3>Reject Event</h3>
            <p className="popup-sub">
              Give a reason for rejecting:
              <strong> {selectedEvent.title}</strong>
            </p>

            <textarea
              className="reject-input"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="popup-btn-row">
              <button
                className="cancel-btn"
                onClick={() => setRejectPopupOpen(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmReject}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📌 EVENT DETAILS MODAL */}
      {detailsPopup && (
        <div className="details-overlay">
          <div className="details-modal">
            <h2 className="details-title">{selectedEvent.title}</h2>

            <p className="details-info">
              <strong>Club:</strong> {selectedEvent.club}
            </p>
            <p className="details-info">
              <strong>Venue:</strong> {selectedEvent.venue}
            </p>
            <p className="details-info">
              <strong>Date:</strong> {selectedEvent.date}
            </p>
            <p className="details-info">
              <strong>Description:</strong> {selectedEvent.description}
            </p>

            {selectedEvent.reason && (
              <p className="details-reason">
                <strong>Rejection Reason:</strong> {selectedEvent.reason}
              </p>
            )}

            <button
              className="close-details-btn"
              onClick={() => setDetailsPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
