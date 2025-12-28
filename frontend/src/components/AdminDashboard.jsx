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

  useEffect(() => {
    fetchStats();
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

  const stats = [
    { label: "Total Events", value: dashboardStats.totalEvents, icon: Calendar, color: "cyan" },
    { label: "Events Going On", value: dashboardStats.activeEvents, icon: Activity, color: "lime" },
    { label: "Club Officials", value: dashboardStats.totalUsers, icon: UserCheck, color: "amber" },
    { label: "System Alerts", value: "3", icon: AlertTriangle, color: "pink" },
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
              </div>
            </div>
          </div>
        )}

        {/* PLACEHOLDER */}
        {activeSection !== "overview" &&
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
