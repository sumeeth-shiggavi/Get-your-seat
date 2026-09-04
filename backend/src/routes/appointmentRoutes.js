const express = require("express");

const {
  createAppointment,
  getStudentAppointments,
  cancelAppointment,
  rescheduleAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();


// Book appointment
router.post("/", createAppointment);


// Get student's appointments
router.get(
  "/student/:user_id",
  getStudentAppointments
);


// Cancel appointment
router.patch(
  "/:id/cancel",
  cancelAppointment
);


// Reschedule appointment
router.patch(
  "/:id/reschedule",
  rescheduleAppointment
);


module.exports = router;