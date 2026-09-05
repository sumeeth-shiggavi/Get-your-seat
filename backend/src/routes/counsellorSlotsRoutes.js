const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getAvailableSlots,
} = require("../controllers/counsellorSlotsController");

const requireRole =
  authMiddleware.requireRole;

const router = express.Router();

// =====================================================
// AVAILABLE COUNSELLOR SLOTS
// Requires:
// 1. Valid JWT
// 2. Student role
// =====================================================

router.get(
  "/:counsellor_id",
  authMiddleware,
  requireRole("student"),
  getAvailableSlots
);

module.exports = router;