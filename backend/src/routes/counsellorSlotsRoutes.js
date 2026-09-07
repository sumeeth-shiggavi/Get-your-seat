const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getAvailableSlots,
} = require("../controllers/counsellorSlotsController");

const router = express.Router();

const requireRole =
  authMiddleware.requireRole;

// =====================================================
// GET AVAILABLE COUNSELLING SLOTS
// =====================================================
//
// GET /api/counsellor-slots/:counsellor_id?date=YYYY-MM-DD
//
// Example:
// /api/counsellor-slots/1?date=2026-09-10
//
// This route is protected because appointment
// availability is part of the authenticated
// student booking flow.
//

router.get(
  "/:counsellor_id",
  authMiddleware,
  requireRole("student"),
  getAvailableSlots
);

module.exports = router;