import React from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Colleges from "./pages/Colleges";
import CollegeDetails from "./pages/CollegeDetails";
import Predictor from "./pages/Predictor";
import Counsellors from "./pages/Counsellors";
import Notices from "./pages/Notices";
import Notifications from "./pages/Notifications";

import Login from "./pages/Login";
import Register from "./pages/Register";

import CounsellorLogin from "./pages/CounsellorLogin";
import CounsellorRegister from "./pages/CounsellorRegister";

import CounsellorBooking from "./pages/CounsellorBooking";
import MyAppointments from "./pages/MyAppointments";
import Profile from "./pages/Profile";

import CounsellorDashboard from "./pages/CounsellorDashboard";
import CounsellorProfile from "./pages/CounsellorProfile";
import CounsellorAvailability from "./pages/CounsellorAvailability";
import CounsellorNotices from "./pages/CounsellorNotices";

// =====================================================
// AUTH HELPERS
// =====================================================

const getStoredUser = () => {
  try {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Failed to read stored user:",
      error
    );

    return null;
  }
};

const getToken = () => {
  return localStorage.getItem("token");
};

const isLoggedIn = () => {
  return Boolean(
    getToken() &&
      getStoredUser()
  );
};

// =====================================================
// STUDENT PROTECTED ROUTE
// =====================================================

const StudentProtectedRoute = ({
  children,
}) => {
  const user =
    getStoredUser();

  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    user?.role !==
    "student"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

// =====================================================
// COUNSELLOR PROTECTED ROUTE
// =====================================================

const CounsellorProtectedRoute = ({
  children,
}) => {
  const user =
    getStoredUser();

  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/counsellor-login"
        replace
      />
    );
  }

  if (
    user?.role !==
    "counsellor"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

// =====================================================
// PUBLIC AUTH ROUTE
// =====================================================

const PublicAuthRoute = ({
  children,
}) => {
  if (isLoggedIn()) {
    const user =
      getStoredUser();

    if (
      user?.role ===
      "counsellor"
    ) {
      return (
        <Navigate
          to="/counsellor-dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

// =====================================================
// COUNSELLOR AUTH ROUTE
// =====================================================

const CounsellorAuthRoute = ({
  children,
}) => {
  if (isLoggedIn()) {
    const user =
      getStoredUser();

    if (
      user?.role ===
      "counsellor"
    ) {
      return (
        <Navigate
          to="/counsellor-dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

// =====================================================
// APP
// =====================================================

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* =========================================
            PUBLIC PAGES
        ========================================= */}

        <Route
          path="/"
          element={
            <Home />
          }
        />

        <Route
          path="/colleges"
          element={
            <Colleges />
          }
        />

        <Route
          path="/colleges/:id"
          element={
            <CollegeDetails />
          }
        />

        <Route
          path="/predictor"
          element={
            <Predictor />
          }
        />

        <Route
          path="/counsellors"
          element={
            <Counsellors />
          }
        />

        <Route
          path="/notices"
          element={
            <Notices />
          }
        />

        {/* =========================================
            STUDENT AUTH
        ========================================= */}

        <Route
          path="/login"
          element={
            <PublicAuthRoute>
              <Login />
            </PublicAuthRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicAuthRoute>
              <Register />
            </PublicAuthRoute>
          }
        />

        {/* =========================================
            COUNSELLOR AUTH
        ========================================= */}

        <Route
          path="/counsellor-login"
          element={
            <CounsellorAuthRoute>
              <CounsellorLogin />
            </CounsellorAuthRoute>
          }
        />

        <Route
          path="/counsellor-register"
          element={
            <CounsellorAuthRoute>
              <CounsellorRegister />
            </CounsellorAuthRoute>
          }
        />

        {/* =========================================
            STUDENT PROTECTED PAGES
        ========================================= */}

        <Route
          path="/counsellors/:id/book"
          element={
            <StudentProtectedRoute>
              <CounsellorBooking />
            </StudentProtectedRoute>
          }
        />

        <Route
          path="/my-appointments"
          element={
            <StudentProtectedRoute>
              <MyAppointments />
            </StudentProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <StudentProtectedRoute>
              <Notifications />
            </StudentProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <StudentProtectedRoute>
              <Profile />
            </StudentProtectedRoute>
          }
        />

        {/* =========================================
            COUNSELLOR PROTECTED PAGES
        ========================================= */}

        <Route
          path="/counsellor-dashboard"
          element={
            <CounsellorProtectedRoute>
              <CounsellorDashboard />
            </CounsellorProtectedRoute>
          }
        />

        <Route
          path="/counsellor-profile"
          element={
            <CounsellorProtectedRoute>
              <CounsellorProfile />
            </CounsellorProtectedRoute>
          }
        />

        <Route
          path="/counsellor-availability"
          element={
            <CounsellorProtectedRoute>
              <CounsellorAvailability />
            </CounsellorProtectedRoute>
          }
        />

        <Route
          path="/counsellor-notices"
          element={
            <CounsellorProtectedRoute>
              <CounsellorNotices />
            </CounsellorProtectedRoute>
          }
        />

        {/* =========================================
            FALLBACK
        ========================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;