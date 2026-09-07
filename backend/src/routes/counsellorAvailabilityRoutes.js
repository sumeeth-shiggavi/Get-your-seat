const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/counsellorAvailabilityController");

const router = express.Router();

const requireRole =
  authMiddleware.requireRole;

// =====================================================
// ALL AVAILABILITY ROUTES REQUIRE COUNSELLOR LOGIN
// =====================================================

router.use(authMiddleware);

router.use(
  requireRole("counsellor")
);

// =====================================================
// GET COUNSELLOR AVAILABILITY
// =====================================================
//
// GET /api/counsellor-availability/:user_id
//
// The user_id parameter is retained for
// frontend compatibility.
// The authenticated JWT user is used
// by the controller for security.
//

router.get(
  "/:user_id",
  getAvailability
);

// =====================================================
// CREATE AVAILABILITY
// =====================================================
//
// POST /api/counsellor-availability/:user_id
//
// Example body:
//
// {
//   "day_of_week": "Monday",
//   "start_time": "09:00",
//   "end_time": "12:00",
//   "is_available": true
// }

router.post(
  "/:user_id",
  createAvailability
);

// =====================================================
// UPDATE AVAILABILITY
// =====================================================
//
// PUT /api/counsellor-availability/slot/:id
//
// Example body:
//
// {
//   "day_of_week": "Monday",
//   "start_time": "10:00",
//   "end_time": "13:00",
//   "is_available": true
// }

router.put(
  "/slot/:id",
  updateAvailability
);

// =====================================================
// DELETE AVAILABILITY
// =====================================================
//
// DELETE /api/counsellor-availability/slot/:id

router.delete(
  "/slot/:id",
  deleteAvailability
);

module.exports = router;