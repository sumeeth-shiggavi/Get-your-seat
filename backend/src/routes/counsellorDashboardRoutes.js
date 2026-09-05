const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const dashboardController = require("../controllers/counsellorDashboardController");

const router = express.Router();

const requireRole = authMiddleware.requireRole;

// =====================================================
// COUNSELLOR DASHBOARD
// =====================================================

router.get(
  "/:user_id",
  authMiddleware,
  requireRole("counsellor"),
  dashboardController.getCounsellorAppointments
);

// =====================================================
// COMPLETE APPOINTMENT
// =====================================================

router.patch(
  "/appointments/:id/complete",
  authMiddleware,
  requireRole("counsellor"),
  dashboardController.completeAppointment
);

// =====================================================
// UPDATE APPOINTMENT NOTES
// =====================================================

router.patch(
  "/appointments/:id/notes",
  authMiddleware,
  requireRole("counsellor"),
  dashboardController.updateAppointmentNotes
);

module.exports = router;