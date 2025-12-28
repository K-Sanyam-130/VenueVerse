import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import LandingPage from "./components/LandingPage";
import StudentLogin from "./components/StudentLogin";
import ClubLogin from "./components/ClubLogin";
import ExistingEvents from "./components/ExistingEvents";
import Dashboard from "./components/ClubDashboard";
import RegisterEvent from "./components/RegisterEvent";
import BookingStatus from "./components/BookingStatus";
import CancelBooking from "./components/CancelBooking";
import VenueChangeRequest from "./components/VenueChangeRequest";

import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminUserManagement from "./components/AdminUserManagement";
import AdminEventManagement from "./components/AdminEventManagement";

const VALID_PAGES = [
  "landing",
  "student-login",
  "existing-events",
  "club-login",
  "club-dashboard",
  "register-event",
  "booking-status",
  "cancel-booking",
  "venue-change-request",
  "admin-login",
  "admin-dashboard",
  "admin-user-management",
  "admin-event-management"
];

export default function App() {
  const [page, setPage] = useState("landing");
  const [studentUSN, setStudentUSN] = useState("");
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  // 🔐 Restore login on refresh
  useEffect(() => {
    try {
      // ✅ CHECK FOR CLUB TOKEN
      const savedUser = localStorage.getItem("club") || localStorage.getItem("user");
      const token = localStorage.getItem("clubToken") || localStorage.getItem("token");

      const savedAdmin = localStorage.getItem("admin");
      const adminToken = localStorage.getItem("adminToken");

      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
        setPage("club-dashboard");
        return;
      }

      if (savedAdmin && adminToken) {
        setAdmin(JSON.parse(savedAdmin));
        setPage("admin-dashboard");
      }
    } catch {
      setPage("landing");
    }
  }, []);

  const handleRoleSelect = (role) => {
    if (role === "student") setPage("student-login");
    else if (role === "club-official") setPage("club-login");
    else if (role === "admin") setPage("admin-login");
  };

  const handleStudentSubmit = (usn) => {
    setStudentUSN(usn);
    setPage("existing-events");
  };

  const handleClubLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("club", JSON.stringify(userData)); // Set 'club' specifically
    // Note: Token is set in ClubLogin.jsx, so we might not need to set it here if this is just updating state
    // But if we do, we should be consistent.
    // However, this function is called ON SUCCESS from ClubLogin, so the token is likely already in LS.
    setPage("club-dashboard");
  };

  const handleAdminLogin = () => {
    const adminData = JSON.parse(localStorage.getItem("admin"));
    setAdmin(adminData);
    setPage("admin-dashboard");
  };

  const handleNavigate = (to) => {
    if (VALID_PAGES.includes(to)) {
      setPage(to);
    } else {
      setPage("landing");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAdmin(null);
    setStudentUSN("");

    localStorage.clear();
    setPage("landing");
  };

  // 🛟 FINAL SAFETY NET (prevents blank screen)
  if (!VALID_PAGES.includes(page)) {
    return <LandingPage onRoleSelect={handleRoleSelect} />;
  }

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{ width: "100%" }}
        >
          {page === "landing" && <LandingPage onRoleSelect={handleRoleSelect} />}

          {page === "student-login" && (
            <StudentLogin
              onBack={() => setPage("landing")}
              onSubmit={handleStudentSubmit}
            />
          )}

          {page === "existing-events" && (
            <ExistingEvents
              onBack={() =>
                studentUSN ? setPage("student-login") : setPage("club-dashboard")
              }
            />
          )}

          {page === "club-login" && (
            <ClubLogin
              onBack={() => setPage("landing")}
              onLogin={handleClubLogin}
            />
          )}

          {page === "club-dashboard" && user && (
            <Dashboard
              onBack={() => setPage("club-login")}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          )}

          {page === "register-event" && (
            <RegisterEvent onBack={() => setPage("club-dashboard")} />
          )}

          {page === "booking-status" && (
            <BookingStatus onBack={() => setPage("club-dashboard")} />
          )}

          {page === "cancel-booking" && (
            <CancelBooking onBack={() => setPage("club-dashboard")} />
          )}

          {page === "venue-change-request" && (
            <VenueChangeRequest onBack={() => setPage("club-dashboard")} />
          )}

          {page === "admin-login" && (
            <AdminLogin
              onBack={() => setPage("landing")}
              onLogin={handleAdminLogin}
            />
          )}

          {page === "admin-dashboard" && admin && (
            <AdminDashboard
              onLogout={handleLogout}
              onUserManagement={() => setPage("admin-user-management")}
              onEventManagement={() => setPage("admin-event-management")}
            />
          )}

          {page === "admin-user-management" && (
            <AdminUserManagement
              onBack={() => setPage("admin-dashboard")}
              onLogout={handleLogout}
            />
          )}

          {page === "admin-event-management" && (
            <AdminEventManagement
              onBack={() => setPage("admin-dashboard")}
              onLogout={handleLogout}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
