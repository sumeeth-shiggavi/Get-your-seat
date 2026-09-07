const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  createAppointment,
  getStudentAppointments,
  cancelAppointment,
  rescheduleAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

// =====================================================
// ALL APPOINTMENT ROUTES REQUIRE LOGIN
// =====================================================

router.use(authMiddleware);

// =====================================================
// CREATE APPOINTMENT
// =====================================================

// POST /api/appointments
//
// Student books a counselling appointment.
//
// Required body:
// {
//   counsellor_id,
//   appointment_date,
//   start_time,
//   end_time
// }

router.post(
  "/",
  authMiddleware.requireRole("student"),
  createAppointment
);

// =====================================================
// GET STUDENT APPOINTMENTS
// =====================================================

// GET /api/appointments/student/:user_id
//
// The user_id in the URL is retained for
// compatibility with the existing frontend.
// The authenticated JWT user is used by the
// controller for the actual database lookup.

router.get(
  "/student/:user_id",
  authMiddleware.requireRole("student"),
  getStudentAppointments
);

// =====================================================
// CANCEL APPOINTMENT
// =====================================================

// PATCH /api/appointments/:id/cancel

router.patch(
  "/:id/cancel",
  authMiddleware.requireRole("student"),
  cancelAppointment
);

// =====================================================
// RESCHEDULE APPOINTMENT
// =====================================================

// PATCH /api/appointments/:id/reschedule
//
// Required body:
// {
//   appointment_date,
//   start_time,
//   end_time
// }

router.patch(
  "/:id/reschedule",
  authMiddleware.requireRole("student"),
  rescheduleAppointment
);

module.exports = router;