import { BrowserRouter, Routes, Route } from "react-router-dom";

// =====================================================
// COMPONENTS
// =====================================================

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Home from "./pages/Home";
import About from "./pages/About";
import Colleges from "./pages/Colleges";
import Counsellors from "./pages/Counsellors";
import Predictor from "./pages/Predictor";
import CollegeDetails from "./pages/CollegeDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CounsellorRegister from "./pages/CounsellorRegister";

// =====================================================
// STUDENT PAGES
// =====================================================

import CounsellorBooking from "./pages/CounsellorBooking";
import MyAppointments from "./pages/MyAppointments";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

// =====================================================
// COUNSELLOR PAGES
// =====================================================

import CounsellorDashboard from "./pages/CounsellorDashboard";
import CounsellorProfile from "./pages/CounsellorProfile";
import CounsellorAvailability from "./pages/CounsellorAvailability";
import CounsellorNotices from "./pages/CounsellorNotices";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/colleges"
          element={<Colleges />}
        />

        <Route
          path="/counsellors"
          element={<Counsellors />}
        />

        <Route
          path="/predictor/:exam"
          element={<Predictor />}
        />

        <Route
          path="/college-details"
          element={<CollegeDetails />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/counsellor-register"
          element={<CounsellorRegister />}
        />

        {/* =====================================================
            STUDENT PROTECTED ROUTES
        ===================================================== */}

        <Route
          path="/counsellor-booking"
          element={
            <ProtectedRoute
              allowedRoles={["student"]}
            >
              <CounsellorBooking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute
              allowedRoles={["student"]}
            >
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={["student"]}
            >
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              allowedRoles={["student"]}
            >
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            COUNSELLOR PROTECTED ROUTES
        ===================================================== */}

        <Route
          path="/counsellor-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["counsellor"]}
            >
              <CounsellorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/counsellor-profile"
          element={
            <ProtectedRoute
              allowedRoles={["counsellor"]}
            >
              <CounsellorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/counsellor-availability"
          element={
            <ProtectedRoute
              allowedRoles={["counsellor"]}
            >
              <CounsellorAvailability />
            </ProtectedRoute>
          }
        />

        <Route
          path="/counsellor-notices"
          element={
            <ProtectedRoute
              allowedRoles={["counsellor"]}
            >
              <CounsellorNotices />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={<Home />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;