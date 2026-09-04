const express = require("express");

const {
  getCounsellorAppointments,
  completeAppointment,
  updateAppointmentNotes,
} = require("../controllers/counsellorDashboardController");

const router = express.Router();

// Get counsellor profile + appointments
router.get(
  "/:user_id",
  getCounsellorAppointments
);

// Mark appointment as completed
router.patch(
  "/appointments/:id/complete",
  completeAppointment
);

// Add / update consultation notes
router.patch(
  "/appointments/:id/notes",
  updateAppointmentNotes
);

module.exports = router;