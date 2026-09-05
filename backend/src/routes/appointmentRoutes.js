const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  createAppointment,
  getStudentAppointments,
  cancelAppointment,
  rescheduleAppointment,
} = require("../controllers/appointmentController");

const requireRole =
  authMiddleware.requireRole;

const router = express.Router();

// =====================================================
// STUDENT APPOINTMENT ROUTES
// All routes require:
// 1. Valid JWT
// 2. Student role
// =====================================================

// BOOK APPOINTMENT
router.post(
  "/",
  authMiddleware,
  requireRole("student"),
  createAppointment
);

// GET STUDENT APPOINTMENTS
router.get(
  "/student/:user_id",
  authMiddleware,
  requireRole("student"),
  getStudentAppointments
);

// CANCEL APPOINTMENT
router.patch(
  "/:id/cancel",
  authMiddleware,
  requireRole("student"),
  cancelAppointment
);

// RESCHEDULE APPOINTMENT
router.patch(
  "/:id/reschedule",
  authMiddleware,
  requireRole("student"),
  rescheduleAppointment
);

module.exports = router;