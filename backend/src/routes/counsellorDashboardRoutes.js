const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getCounsellorDashboard,
  completeAppointment,
  updateAppointmentNotes,
} = require("../controllers/counsellorDashboardController");

const router = express.Router();

const requireRole =
  authMiddleware.requireRole;

// =====================================================
// AUTHENTICATION
// =====================================================

router.use(authMiddleware);

router.use(
  requireRole("counsellor")
);

// =====================================================
// COUNSELLOR DASHBOARD
// =====================================================

// GET /api/counsellor-dashboard/:user_id
router.get(
  "/:user_id",
  getCounsellorDashboard
);

// =====================================================
// COMPLETE APPOINTMENT
// =====================================================

// PATCH
// /api/counsellor-dashboard/appointments/:id/complete
router.patch(
  "/appointments/:id/complete",
  completeAppointment
);

// =====================================================
// UPDATE APPOINTMENT NOTES
// =====================================================

// PATCH
// /api/counsellor-dashboard/appointments/:id/notes
router.patch(
  "/appointments/:id/notes",
  updateAppointmentNotes
);

module.exports = router;