import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Calendar,
  UserCheck,
  AlertTriangle,
  Activity,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import "./AdminDashboard.css";
import logo from "../assets/venueverse-logo.jpg";
import { ENDPOINTS, getAuthHeaders } from "../api";

export default function AdminDashboard({
  onLogout,
  onUserManagement,
  onEventManagement,
}) {
  const [activeSection, setActiveSection] = useState("overview");
  const [dashboardStats, setDashboardStats] = useState({
    totalEvents: 0,
    activeEvents: 0, // Events Going On
    totalUsers: 0,   // Total Clubs
    activeUsers: 0   // Active Clubs
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchPendingUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.ADMIN}/stats`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.ADMIN}/pending-users`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setPendingUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch pending users", err);
    }
  };

  const handleUpdateEventStatuses = async () => {
    if (!confirm("This will update all event statuses based on current date. Continue?")) return;

    try {
      const res = await fetch(`${ENDPOINTS.ADMIN}/update-event-statuses`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ Events updated!\n🟤 PAST: ${data.updated.past}\n🟢 LIVE: ${data.updated.live}\n🔵 UPCOMING: ${data.updated.upcoming}\n📊 Total: ${data.updated.total}`);
        fetchStats(); // Refresh stats
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to update event statuses");
      }
    } catch (err) {
      console.error("Failed to update events", err);
      alert("Error updating event statuses");
    }
  };

  const handleApproveUser = async (userId) => {
    if (!confirm("Are you sure you want to approve this user?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${ENDPOINTS.ADMIN}/approve-user/${userId}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        alert("User approved successfully!");
        fetchPendingUsers(); // Refresh list
        fetchStats(); // Update stats
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to approve user");
      }
    } catch (err) {
      console.error("Failed to approve user", err);
      alert("Error approving user");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectUser = async (userId) => {
    const reason = prompt("Please enter a reason for rejection:");
    if (!reason) return;

    setLoading(true);
    try {
      const res = await fetch(`${ENDPOINTS.ADMIN}/reject-user/${userId}`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        alert("User rejected successfully!");
        fetchPendingUsers(); // Refresh list
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to reject user");
      }
    } catch (err) {
      console.error("Failed to reject user", err);
      alert("Error rejecting user");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Total Events", value: dashboardStats.totalEvents, icon: Calendar, color: "cyan" },
    { label: "Events Going On", value: dashboardStats.activeEvents, icon: Activity, color: "lime" },
    { label: "Club Officials", value: dashboardStats.totalUsers, icon: UserCheck, color: "amber" },
    { label: "Pending Approvals", value: pendingUsers.length, icon: AlertTriangle, color: "pink" },
  ];

  const recentActivity = [
    { action: "New event created", user: "John Smith", time: "2 hours ago" },
    { action: "User registration", user: "Sarah Johnson", time: "4 hours ago" },
    { action: "Event cancelled", user: "Mike Chen", time: "6 hours ago" },
    { action: "System backup completed", user: "System", time: "8 hours ago" },
  ];

  const systemAlerts = [
    {
      type: "warning",
      message: "High event registration volume detected",
      time: "1 hour ago",
    },
    {
      type: "info",
      message: "Scheduled maintenance in 24 hours",
      time: "3 hours ago",
    },
    {
      type: "error",
      message: "Database connection timeout resolved",
      time: "5 hours ago",
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "pending", label: "Pending Users", icon: Users },
    { id: "users", label: "User Management", icon: Users, isExternal: true },
    { id: "events", label: "Event Management", icon: Calendar, isExternal: true },
    { id: "system", label: "System Settings", icon: Activity },
  ];

  return (
    <div className="admin-root">
      {/* BACKGROUND */}
      <div className="admin-bg" />

      {/* HEADER */}
      <header className="admin-header-fixed">
        <div className="admin-header-left">
          <img src={logo} className="admin-header-logo" alt="logo" />
          <div>
            <h1 className="admin-header-title">Admin Dashboard</h1>
            <p className="admin-header-sub">System Administration</p>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {/* MAIN */}
      <main className="admin-main">
        {/* TABS */}
        <div className="admin-tabs">
          {tabs.map((tab) => {
            const isExternal = tab.isExternal;
            const isActive = !isExternal && activeSection === tab.id;

            return (
              <button
                key={tab.id}
                className={isActive ? "admin-tab active" : "admin-tab"}
                onClick={() => {
                  if (isExternal) {
                    if (tab.id === "users") onUserManagement();
                    if (tab.id === "events") onEventManagement();
                  } else {
                    setActiveSection(tab.id);
                  }
                }}
              >
                <tab.icon size={18} />
                {tab.label}
                {isActive && <div className="tab-underline" />}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW */}
        {activeSection === "overview" && (
          <div className="overview-wrapper">
            {/* STATS */}
            <div className="stats-grid">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`stat-icon ${stat.color}`}>
                    <stat.icon size={26} />
                  </div>
                  <div>
                    <p className="stat-label">{stat.label}</p>
                    <p className="stat-value">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 2 COLUMN GRID (Venue card removed) */}
            <div className="three-col-grid">
              {/* Recent Activity */}
              <div className="mini-card">
                <h3 className="mini-title">
                  <Activity size={16} className="blue-text" />
                  Recent Activity
                </h3>

                <div className="mini-scroll">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="mini-row">
                      <span className="dot-blue" />
                      <div>
                        <p className="mini-main">{item.action}</p>
                        <p className="mini-sub">
                          by {item.user} • {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Alerts */}
              <div className="mini-card">
                <h3 className="mini-title">
                  <AlertTriangle size={16} className="orange-text" />
                  System Alerts
                </h3>

                <div className="mini-scroll">
                  {systemAlerts.map((alert, i) => (
                    <div key={i} className="mini-row">
                      <span
                        className={
                          alert.type === "error"
                            ? "dot-red"
                            : alert.type === "warning"
                              ? "dot-yellow"
                              : "dot-blue"
                        }
                      />
                      <div>
                        <p className="mini-main">{alert.message}</p>
                        <p className="mini-sub">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* UPDATE EVENT STATUSES BUTTON */}
                <button
                  onClick={handleUpdateEventStatuses}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "16px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <Activity size={16} />
                  Update Event Statuses
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PENDING USERS SECTION */}
        {activeSection === "pending" && (
          <div className="overview-wrapper">
            <div className="mini-card" style={{ maxWidth: "100%" }}>
              <h3 className="mini-title">
                <Users size={20} className="blue-text" />
                Pending Club Official Registrations
              </h3>

              {pendingUsers.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
                  <UserCheck size={48} style={{ margin: "0 auto 16px" }} />
                  <p>No pending registrations at this time</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="pending-users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Registered On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => handleApproveUser(user._id)}
                                disabled={loading}
                                style={{
                                  padding: "6px 16px",
                                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: loading ? "not-allowed" : "pointer",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  opacity: loading ? 0.6 : 1
                                }}
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleRejectUser(user._id)}
                                disabled={loading}
                                style={{
                                  padding: "6px 16px",
                                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: loading ? "not-allowed" : "pointer",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  opacity: loading ? 0.6 : 1
                                }}
                              >
                                ✗ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PLACEHOLDER */}
        {activeSection !== "overview" &&
          activeSection !== "pending" &&
          activeSection !== "users" &&
          activeSection !== "events" && (
            <div className="placeholder">
              <h2>Coming Soon</h2>
              <p>This module is under development.</p>
            </div>
          )}
      </main>
    </div>
  );
}
