import { useEffect, useState } from "react";
import "./AdminEventManagement.css";
import {
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  LogOut,
  ArrowLeft,
} from "lucide-react";

import { ENDPOINTS, getAuthHeaders } from "../api";

const FILTERS = {
  APPROVED: "APPROVED",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  VENUE: "VENUE",
};

export default function AdminEventManagement({ onBack, onLogout }) {
  const [activeFilter, setActiveFilter] = useState(FILTERS.PENDING);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH DATA
  ========================= */
  const fetchData = async (filter) => {
    setLoading(true);

    try {
      let url;
      // Use different endpoints for Venue Requests vs Events
      if (filter === FILTERS.VENUE) {
        // ✅ Fix: Use the correct REQUESTS endpoint which returns Request objects
        url = `${ENDPOINTS.REQUESTS}/admin`;
      } else {
        url = `${ENDPOINTS.ADMIN}/events/${filter}`;
      }

      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        onLogout();
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeFilter);
  }, [activeFilter]);

  /* =========================
     EVENT APPROVE / REJECT
  ========================= */
  /* =========================
     EVENT APPROVE / REJECT
  ========================= */
  const approveEvent = async (id) => {
    setItems((prev) => prev.filter((e) => e._id !== id));

    try {
      await fetch(`${ENDPOINTS.ADMIN}/approve/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      fetchData(activeFilter);
    } catch (err) {
      console.error("Error approving event", err);
    }
  };

  const rejectEvent = async (id) => {
    const reason = prompt("Enter rejection reason");
    if (!reason) return;

    setItems((prev) => prev.filter((e) => e._id !== id));

    try {
      await fetch(`${ENDPOINTS.ADMIN}/reject/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ adminMessage: reason }),
      });
      fetchData(activeFilter);
    } catch (err) {
      console.error("Error rejecting event", err);
    }
  };

  /* =========================
     VENUE APPROVE / REJECT
  ========================= */
  const approveVenue = async (id) => {
    setItems((prev) => prev.filter((r) => r._id !== id));

    try {
      // ✅ Fix: Use the REQUESTS action endpoint which handles sync
      await fetch(`${ENDPOINTS.REQUESTS}/${id}/action`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "APPROVED" }),
      });
      fetchData(FILTERS.VENUE);
    } catch (err) {
      console.error("Error approving venue", err);
    }
  };

  const rejectVenue = async (id) => {
    const reason = prompt("Enter rejection reason");
    if (!reason) return;

    setItems((prev) => prev.filter((r) => r._id !== id));

    try {
      // ✅ Fix: Use the REQUESTS action endpoint
      await fetch(`${ENDPOINTS.REQUESTS}/${id}/action`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "REJECTED", adminComment: reason }),
      });
      fetchData(FILTERS.VENUE);
    } catch (err) {
      console.error("Error rejecting venue", err);
    }
  };

  return (
    <div className="admin-event-root">
      {/* HEADER */}
      <header className="admin-event-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <h1>Event Management</h1>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("adminToken");
            onLogout();
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* FILTER BAR */}
      <div className="admin-filter-bar">
        <FilterTab
          active={activeFilter === FILTERS.APPROVED}
          icon={<CheckCircle size={16} />}
          label="Approved Events"
          onClick={() => setActiveFilter(FILTERS.APPROVED)}
        />
        <FilterTab
          active={activeFilter === FILTERS.PENDING}
          icon={<Clock size={16} />}
          label="Pending Approval"
          onClick={() => setActiveFilter(FILTERS.PENDING)}
        />
        <FilterTab
          active={activeFilter === FILTERS.REJECTED}
          icon={<XCircle size={16} />}
          label="Rejected / Cancelled"
          onClick={() => setActiveFilter(FILTERS.REJECTED)}
        />
        <FilterTab
          active={activeFilter === FILTERS.VENUE}
          icon={<MapPin size={16} />}
          label="Venue Requests"
          onClick={() => setActiveFilter(FILTERS.VENUE)}
        />
      </div>

      {/* LIST */}
      <main className="event-main">
        {loading ? (
          <p className="admin-empty">Loading...</p>
        ) : items.length === 0 ? (
          <p className="admin-empty">No records found</p>
        ) : (
          items.map((item) =>
            activeFilter === FILTERS.VENUE ? (
              <VenueRequestCard
                key={item._id}
                req={item}
                onApprove={() => approveVenue(item._id)}
                onReject={() => rejectVenue(item._id)}
              />
            ) : (
              <EventCard
                key={item._id}
                event={item}
                filter={activeFilter}
                onApprove={() => approveEvent(item._id)}
                onReject={() => rejectEvent(item._id)}
              />
            )
          )
        )}
      </main>
    </div>
  );
}

/* =========================
   FILTER TAB
========================= */
function FilterTab({ active, icon, label, onClick }) {
  return (
    <button
      className={`filter-tab ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* =========================
   EVENT CARD
========================= */
function EventCard({ event, filter, onApprove, onReject }) {
  return (
    <div className="unified-card">
      <h3>{event.eventName}</h3>
      <p>🏛 {event.clubName}</p>
      <p>📅 {event.date} • {event.timeSlot}</p>
      <p>📍 {event.venue}</p>

      {filter === "REJECTED" && event.adminMessage && (
        <p className="rejection-box">Reason: {event.adminMessage}</p>
      )}

      {filter === "PENDING" && (
        <div className="unified-actions">
          <button className="approve-btn" onClick={onApprove}>Approve</button>
          <button className="reject-btn" onClick={onReject}>Reject</button>
        </div>
      )}
    </div>
  );
}

/* =========================
   VENUE REQUEST CARD
========================= */
function VenueRequestCard({ req, onApprove, onReject }) {
  return (
    <div className="unified-card venue">
      <h3>{req.event?.eventName || "Event Name"}</h3>
      <p>🏛 {req.club?.username || req.clubName}</p>
      <p>📍 {req.event?.venue} → {req.requestedVenue}</p>
      <p>📝 {req.reason}</p>

      <div className="unified-actions">
        <button className="approve-btn" onClick={onApprove}>Approve</button>
        <button className="reject-btn" onClick={onReject}>Reject</button>
      </div>
    </div>
  );
}
