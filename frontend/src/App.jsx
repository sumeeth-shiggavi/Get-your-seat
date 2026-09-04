import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import About from "./pages/About";
import Colleges from "./pages/Colleges";
import Counsellors from "./pages/Counsellors";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CounsellorRegister from "./pages/CounsellorRegister";
import CounsellorProfile from "./pages/CounsellorProfile";
import Predictor from "./pages/Predictor";
import CollegeDetails from "./pages/CollegeDetails";
import MyAppointments from "./pages/MyAppointments";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import CounsellorDashboard from "./pages/CounsellorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* About */}
        <Route
          path="/about"
          element={<About />}
        />

        {/* Colleges */}
        <Route
          path="/colleges"
          element={<Colleges />}
        />

        {/* Counsellors */}
        <Route
          path="/counsellors"
          element={<Counsellors />}
        />

        {/* Student Appointments */}
        <Route
          path="/my-appointments"
          element={<MyAppointments />}
        />

        {/* Student Profile */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Student Notifications */}
        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* Counsellor Dashboard */}
        <Route
          path="/counsellor-dashboard"
          element={<CounsellorDashboard />}
        />

        {/* Counsellor Profile */}
        <Route
          path="/counsellor-profile"
          element={<CounsellorProfile />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Student Registration */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Counsellor Registration */}
        <Route
          path="/counsellor-register"
          element={<CounsellorRegister />}
        />

        {/* Predictor */}
        <Route
          path="/predictor/:exam"
          element={<Predictor />}
        />

        {/* College Details */}
        <Route
          path="/college-details"
          element={<CollegeDetails />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;