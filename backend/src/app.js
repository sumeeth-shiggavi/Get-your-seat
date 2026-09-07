const express = require("express");
const cors = require("cors");

const collegeDetailsRoutes = require("./routes/collegeDetailsRoutes");
const examRoutes = require("./routes/examRoutes");
const collegeRoutes = require("./routes/collegeRoutes");
const predictorRoutes = require("./routes/predictorRoutes");
const authRoutes = require("./routes/authRoutes");
const counsellorRoutes = require("./routes/counsellorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const profileRoutes = require("./routes/profileRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const counsellorDashboardRoutes = require("./routes/counsellorDashboardRoutes");
const counsellorAuthRoutes = require("./routes/counsellorAuthRoutes");
const counsellorProfileRoutes = require("./routes/counsellorProfileRoutes");
const counsellorAvailabilityRoutes = require("./routes/counsellorAvailabilityRoutes");
const counsellorSlotsRoutes = require("./routes/counsellorSlotsRoutes");
const noticeRoutes = require("./routes/noticeRoutes");

const app = express();

app.use(cors());

app.use(express.json());

// =====================================================
// PUBLIC / GENERAL ROUTES
// =====================================================

app.use(
  "/api/exams",
  examRoutes
);

app.use(
  "/api/colleges",
  collegeRoutes
);

app.use(
  "/api/predict",
  predictorRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/college-details",
  collegeDetailsRoutes
);

app.use(
  "/api/counsellors",
  counsellorRoutes
);

// =====================================================
// STUDENT ROUTES
// =====================================================

app.use(
  "/api/appointments",
  appointmentRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/password",
  passwordRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

// =====================================================
// COUNSELLOR ROUTES
// =====================================================

app.use(
  "/api/counsellor-dashboard",
  counsellorDashboardRoutes
);

app.use(
  "/api/counsellor-auth",
  counsellorAuthRoutes
);

app.use(
  "/api/counsellor-profile",
  counsellorProfileRoutes
);

app.use(
  "/api/counsellor-availability",
  counsellorAvailabilityRoutes
);

app.use(
  "/api/counsellor-slots",
  counsellorSlotsRoutes
);

// =====================================================
// NOTICE BOARD
// =====================================================

app.use(
  "/api/notices",
  noticeRoutes
);

// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "GET YOUR SEAT backend is running",
  });
});

module.exports = app;