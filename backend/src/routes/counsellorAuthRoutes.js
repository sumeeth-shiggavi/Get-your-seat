const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  registerCounsellor,
  loginCounsellor,
  getCurrentCounsellor,
} = require("../controllers/counsellorAuthController");

const router = express.Router();

// =====================================================
// PUBLIC COUNSELLOR AUTH ROUTES
// =====================================================

// Counsellor registration
router.post(
  "/register",
  registerCounsellor
);

// Counsellor login
router.post(
  "/login",
  loginCounsellor
);

// =====================================================
// PROTECTED COUNSELLOR AUTH ROUTES
// =====================================================

// Get currently logged-in counsellor
router.get(
  "/me",
  authMiddleware,
  authMiddleware.requireRole(
    "counsellor"
  ),
  getCurrentCounsellor
);

module.exports = router;