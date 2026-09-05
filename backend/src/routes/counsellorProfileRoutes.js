const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getCounsellorProfile,
  updateCounsellorProfile,
} = require("../controllers/counsellorProfileController");

const requireRole =
  authMiddleware.requireRole;

const router = express.Router();

// =====================================================
// COUNSELLOR PROFILE ROUTES
// All routes require:
// 1. Valid JWT
// 2. Counsellor role
// =====================================================

// GET COUNSELLOR PROFILE
router.get(
  "/:user_id",
  authMiddleware,
  requireRole("counsellor"),
  getCounsellorProfile
);

// UPDATE COUNSELLOR PROFILE
router.put(
  "/:user_id",
  authMiddleware,
  requireRole("counsellor"),
  updateCounsellorProfile
);

module.exports = router;