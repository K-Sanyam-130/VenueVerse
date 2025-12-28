import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, LogOut, ShieldAlert } from "lucide-react";
import "./AdminUserManagement.css";
import logo from "../assets/venueverse-logo.jpg";
import { ENDPOINTS, getAuthHeaders } from "../api";

export default function AdminUserManagement({ onBack, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingBlockId, setPendingBlockId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH USERS
  ========================= */
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.ADMIN}/users`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401 || res.status === 403) {
        onLogout();
        return;
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================
     COMPUTED VALUES
  ========================= */
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    // u.name is the Club Name
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u._id && u._id.toLowerCase().includes(q))
    );
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.isBlocked).length;
  const blockedUsers = totalUsers - activeUsers;

  /* =========================
     HANDLERS
  ========================= */
  const handleToggle = (id) => {
    const target = users.find((u) => u._id === id);
    if (!target) return;

    if (!target.isBlocked) {
      // Asking to BLOCK -> Confirm first
      setPendingBlockId(id);
      setIsModalOpen(true);
    } else {
      // Asking to UNBLOCK -> Do immediately
      performAction(id, "unblock");
    }
  };

  const confirmBlock = () => {
    if (pendingBlockId) {
      performAction(pendingBlockId, "block");
    }
    setPendingBlockId(null);
    setIsModalOpen(false);
  };

  const performAction = async (id, action) => {
    // Optimistic update
    setUsers((prev) =>
      prev.map((u) =>
        u._id === id ? { ...u, isBlocked: action === "block" } : u
      )
    );

    try {
      const res = await fetch(`${ENDPOINTS.ADMIN}/users/${id}/${action}`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Action failed");

      // Refresh to ensure sync
      fetchUsers();
    } catch (err) {
      console.error(`Failed to ${action} user`, err);
      alert(`Failed to ${action} user. Please try again.`);
      // Revert on failure
      fetchUsers();
    }
  };

  const cancelBlock = () => {
    setPendingBlockId(null);
    setIsModalOpen(false);
  };

  const pendingUser = pendingBlockId
    ? users.find((u) => u._id === pendingBlockId)
    : null;

  return (
    <div className="user-root">
      {/* BACKGROUND */}
      <div className="user-bg" />

      {/* HEADER */}
      <header className="user-header-fixed">
        <div className="user-header-left">
          <button className="user-back-btn" onClick={onBack}>
            ← Back
          </button>
          <img src={logo} className="user-header-logo" alt="logo" />
          <div>
            <h1 className="user-header-title">User Management</h1>
            <p className="user-header-sub">
              Club login access · Block / Unblock
            </p>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {/* MAIN */}
      <main className="user-main">
        {/* TOP ROW: Search + Summary */}
        <motion.section
          className="user-top-row"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Search Card */}
          <div className="user-search-card">
            <div className="user-search-inner">
              <Search className="user-search-icon" size={18} />
              <input
                type="text"
                placeholder="Search by club name, user ID, or user name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="user-search-input"
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="user-summary-card">
            <div className="user-summary-icon">
              <Users size={22} />
            </div>
            <div className="user-summary-stats">
              <div>
                <p className="user-summary-label">Total Users</p>
                <p className="user-summary-value">{totalUsers}</p>
              </div>
              <div>
                <p className="user-summary-label">Active</p>
                <p className="user-summary-value green">{activeUsers}</p>
              </div>
              <div>
                <p className="user-summary-label">Blocked</p>
                <p className="user-summary-value red">{blockedUsers}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* TABLE */}
        <motion.section
          className="user-table-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="user-table-header">
            <h2 className="user-table-title">
              Registered Clubs & Officials ({filteredUsers.length})
            </h2>
          </div>

          <div className="user-table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Club Name</th>
                  <th>Email / ID</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td className="muted">
                      {u.email}
                      <br />
                      <span style={{ fontSize: "0.8em" }}>{u._id}</span>
                    </td>
                    <td className="muted">
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleString()
                        : "Never"}
                    </td>
                    <td>
                      <span
                        className={
                          "user-access-pill " +
                          (!u.isBlocked ? "pill-active" : "pill-blocked")
                        }
                      >
                        {!u.isBlocked ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td>
                      <div className="user-access-cell">
                        <div
                          className={
                            "user-switch " +
                            (!u.isBlocked ? "on" : "")
                          }
                          onClick={() => handleToggle(u._id)}
                        >
                          <div className="user-switch-knob" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="user-empty">
                      No clubs found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>
      </main>

      {/* CONFIRM BLOCK MODAL */}
      {isModalOpen && pendingUser && (
        <div className="user-modal-backdrop">
          <motion.div
            className="user-modal"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
          >
            <div className="user-modal-icon-wrap">
              <ShieldAlert size={26} className="user-modal-icon" />
            </div>
            <h3 className="user-modal-title">Block this club?</h3>
            <p className="user-modal-text">
              Are you sure you want to block{" "}
              <span className="highlight">{pendingUser.name}</span>?
              <br />
              <span className="highlight">{pendingUser.email}</span>
              <br />
              <br />
              They will not be able to log in again until you manually unblock
              them from this page.
            </p>

            <div className="user-modal-actions">
              <button className="modal-btn secondary" onClick={cancelBlock}>
                Cancel
              </button>
              <button className="modal-btn danger" onClick={confirmBlock}>
                Yes, Block User
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
