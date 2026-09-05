const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getCounsellorAvailability,
  addCounsellorAvailability,
  updateCounsellorAvailability,
  deleteCounsellorAvailability,
} = require("../controllers/counsellorAvailabilityController");

const requireRole =
  authMiddleware.requireRole;

const router = express.Router();

// =====================================================
// COUNSELLOR AVAILABILITY ROUTES
// All routes require:
// 1. Valid JWT
// 2. Counsellor role
// =====================================================

// GET COUNSELLOR AVAILABILITY
router.get(
  "/:user_id",
  authMiddleware,
  requireRole("counsellor"),
  getCounsellorAvailability
);

// ADD COUNSELLOR AVAILABILITY
router.post(
  "/:user_id",
  authMiddleware,
  requireRole("counsellor"),
  addCounsellorAvailability
);

// UPDATE COUNSELLOR AVAILABILITY
router.put(
  "/slot/:id",
  authMiddleware,
  requireRole("counsellor"),
  updateCounsellorAvailability
);

// DELETE COUNSELLOR AVAILABILITY
router.delete(
  "/slot/:id",
  authMiddleware,
  requireRole("counsellor"),
  deleteCounsellorAvailability
);

module.exports = router;