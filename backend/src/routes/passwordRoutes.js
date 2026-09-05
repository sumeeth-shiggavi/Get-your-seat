const express = require("express");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  changePassword,
} = require("../controllers/passwordController");

const requireRole =
  authMiddleware.requireRole;

const router = express.Router();

// =====================================================
// STUDENT PASSWORD ROUTE
// Requires:
// 1. Valid JWT
// 2. Student role
// =====================================================

// Change password
router.put(
  "/:user_id",
  authMiddleware,
  requireRole("student"),
  changePassword
);

module.exports = router;