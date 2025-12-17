import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, LogOut, ShieldAlert } from "lucide-react";
import "./AdminUserManagement.css";
import logo from "../assets/venueverse-logo.jpg";

export default function AdminUserManagement({ onBack, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingBlockId, setPendingBlockId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loginActivities, setLoginActivities] = useState([
    {
      id: 1,
      clubName: "Adventure Club",
      userId: "AC-2024-001",
      userName: "Alex Rodriguez",
      loginTime: "2024-12-15 08:45:23 AM",
      accessStatus: "active",
    },
    {
      id: 2,
      clubName: "Technology Club",
      userId: "TC-2024-002",
      userName: "Sarah Johnson",
      loginTime: "2024-12-15 09:12:45 AM",
      accessStatus: "active",
    },
    {
      id: 3,
      clubName: "Sports Club",
      userId: "SC-2024-003",
      userName: "Mike Chen",
      loginTime: "2024-12-15 09:30:17 AM",
      accessStatus: "blocked",
    },
    {
      id: 4,
      clubName: "Arts & Media Club",
      userId: "AMC-2024-004",
      userName: "Emma Thompson",
      loginTime: "2024-12-15 10:05:38 AM",
      accessStatus: "active",
    },
    {
      id: 5,
      clubName: "Science Club",
      userId: "SCC-2024-005",
      userName: "Dr. Emily Brown",
      loginTime: "2024-12-15 10:22:55 AM",
      accessStatus: "active",
    },
    {
      id: 6,
      clubName: "Music Club",
      userId: "MC-2024-006",
      userName: "James Wilson",
      loginTime: "2024-12-15 11:15:42 AM",
      accessStatus: "active",
    },
    {
      id: 7,
      clubName: "Adventure Club",
      userId: "AC-2024-001",
      userName: "Alex Rodriguez",
      loginTime: "2024-12-15 02:30:18 PM",
      accessStatus: "active",
    },
    {
      id: 8,
      clubName: "Culinary Club",
      userId: "CC-2024-007",
      userName: "Lisa Anderson",
      loginTime: "2024-12-15 03:45:29 PM",
      accessStatus: "active",
    },
    {
      id: 9,
      clubName: "Entertainment Club",
      userId: "EC-2024-008",
      userName: "David Martinez",
      loginTime: "2024-12-15 04:10:50 PM",
      accessStatus: "blocked",
    },
    {
      id: 10,
      clubName: "Technology Club",
      userId: "TC-2024-002",
      userName: "Sarah Johnson",
      loginTime: "2024-12-15 05:20:33 PM",
      accessStatus: "active",
    },
  ]);

  const filteredActivities = loginActivities.filter((activity) => {
    const q = searchQuery.toLowerCase();
    return (
      activity.clubName.toLowerCase().includes(q) ||
      activity.userId.toLowerCase().includes(q) ||
      activity.userName.toLowerCase().includes(q)
    );
  });

  const totalUsers = loginActivities.length;
  const activeUsers = loginActivities.filter(
    (a) => a.accessStatus === "active"
  ).length;
  const blockedUsers = totalUsers - activeUsers;

  const handleToggle = (id) => {
    const target = loginActivities.find((a) => a.id === id);
    if (!target) return;

    if (target.accessStatus === "active") {
      // 👉 Ask for confirmation before blocking
      setPendingBlockId(id);
      setIsModalOpen(true);
    } else {
      // 👉 Unblock immediately
      setLoginActivities((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, accessStatus: "active" } : a
        )
      );
    }
  };

  const confirmBlock = () => {
    if (!pendingBlockId) return;
    setLoginActivities((prev) =>
      prev.map((a) =>
        a.id === pendingBlockId ? { ...a, accessStatus: "blocked" } : a
      )
    );
    setPendingBlockId(null);
    setIsModalOpen(false);
  };

  const cancelBlock = () => {
    setPendingBlockId(null);
    setIsModalOpen(false);
  };

  const pendingUser = pendingBlockId
    ? loginActivities.find((a) => a.id === pendingBlockId)
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
              Login Activity Log ({filteredActivities.length})
            </h2>
          </div>

          <div className="user-table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Club Name</th>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Last Login</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.clubName}</td>
                    <td className="muted">{activity.userId}</td>
                    <td>{activity.userName}</td>
                    <td className="muted">{activity.loginTime}</td>
                    <td>
                      <div className="user-access-cell">
                        <div
                          className={
                            "user-switch " +
                            (activity.accessStatus === "active" ? "on" : "")
                          }
                          onClick={() => handleToggle(activity.id)}
                        >
                          <div className="user-switch-knob" />
                        </div>
                        <span
                          className={
                            "user-access-pill " +
                            (activity.accessStatus === "active"
                              ? "pill-active"
                              : "pill-blocked")
                          }
                        >
                          {activity.accessStatus === "active"
                            ? "Active"
                            : "Blocked"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredActivities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="user-empty">
                      No users match your search.
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
            <h3 className="user-modal-title">Block this user?</h3>
            <p className="user-modal-text">
              Are you sure you want to block{" "}
              <span className="highlight">{pendingUser.userName}</span> (
              {pendingUser.userId}) from{" "}
              <span className="highlight">{pendingUser.clubName}</span>?
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
