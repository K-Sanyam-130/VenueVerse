import { useState, useEffect } from "react";

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

export default function App() {
  const [page, setPage] = useState("landing");
  const [studentUSN, setStudentUSN] = useState("");
  const [user, setUser] = useState(null);

  // 🔐 Restore login on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (parsedUser.role === "club") {
        setPage("club-dashboard");
      } else if (parsedUser.role === "admin") {
        setPage("admin-dashboard");
      }
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

  // ✅ Club/Admin login success
  const handleAuthLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    if (userData.role === "club") {
      setPage("club-dashboard");
    } else if (userData.role === "admin") {
      setPage("admin-dashboard");
    }
  };

  const handleNavigate = (to) => setPage(to);

  // 🚪 Logout
  const handleLogout = () => {
    setUser(null);
    setStudentUSN("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setPage("landing");
  };

  return (
    <>
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
          onLogin={handleAuthLogin}
        />
      )}

      {page === "club-dashboard" && user?.role === "club" && (
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
          onLogin={handleAuthLogin}
        />
      )}

      {page === "admin-dashboard" && user?.role === "admin" && (
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
    </>
  );
}
