const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const requireRole =
  authMiddleware.requireRole;

const router = express.Router();

// =====================================================
// STUDENT PROFILE ROUTES
// All routes require:
// 1. Valid JWT
// 2. Student role
// =====================================================

// Get profile
router.get(
  "/:user_id",
  authMiddleware,
  requireRole("student"),
  getProfile
);

// Update profile
router.put(
  "/:user_id",
  authMiddleware,
  requireRole("student"),
  updateProfile
);

module.exports = router;