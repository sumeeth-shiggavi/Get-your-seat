import {
BrowserRouter,
Routes,
Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Colleges from "./pages/Colleges";
import Counsellors from "./pages/Counsellors";
import CounsellorBooking from "./pages/CounsellorBooking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CounsellorRegister from "./pages/CounsellorRegister";
import CounsellorProfile from "./pages/CounsellorProfile";
import CounsellorAvailability from "./pages/CounsellorAvailability";
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

    {/* Public Pages */}

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

    {/* Authentication */}

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

    {/* Student Protected Pages */}

    <Route
      path="/counsellor-booking"
      element={
        <ProtectedRoute allowedRoles={["student"]}>
          <CounsellorBooking />
        </ProtectedRoute>
      }
    />

    <Route
      path="/my-appointments"
      element={
        <ProtectedRoute allowedRoles={["student"]}>
          <MyAppointments />
        </ProtectedRoute>
      }
    />

    <Route
      path="/profile"
      element={
        <ProtectedRoute allowedRoles={["student"]}>
          <Profile />
        </ProtectedRoute>
      }
    />

    <Route
      path="/notifications"
      element={
        <ProtectedRoute allowedRoles={["student"]}>
          <Notifications />
        </ProtectedRoute>
      }
    />

    {/* Counsellor Protected Pages */}

    <Route
      path="/counsellor-dashboard"
      element={
        <ProtectedRoute allowedRoles={["counsellor"]}>
          <CounsellorDashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/counsellor-profile"
      element={
        <ProtectedRoute allowedRoles={["counsellor"]}>
          <CounsellorProfile />
        </ProtectedRoute>
      }
    />

    <Route
      path="/counsellor-availability"
      element={
        <ProtectedRoute allowedRoles={["counsellor"]}>
          <CounsellorAvailability />
        </ProtectedRoute>
      }
    />

  </Routes>
</BrowserRouter>

);
}

export default App;