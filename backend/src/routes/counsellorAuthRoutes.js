const express = require("express");

const {
  registerCounsellor,
  loginCounsellor,
} = require("../controllers/counsellorAuthController");

const router = express.Router();

// =====================================================
// PUBLIC COUNSELLOR AUTHENTICATION ROUTES
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

module.exports = router;