const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");

const router = express.Router();

// =====================================================
// PUBLIC AUTH ROUTES
// =====================================================

// Student registration
router.post(
  "/register",
  register
);

// Student / general user login
router.post(
  "/login",
  login
);

// =====================================================
// PROTECTED AUTH ROUTES
// =====================================================

// Get currently authenticated user
router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

module.exports = router;