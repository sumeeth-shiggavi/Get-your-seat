const express = require("express");

const {
  register,
  login,
} = require("../controllers/authController");

const router = express.Router();

// =====================================================
// PUBLIC STUDENT AUTHENTICATION ROUTES
// =====================================================

// Student registration
router.post(
  "/register",
  register
);

// Student login
router.post(
  "/login",
  login
);

module.exports = router;