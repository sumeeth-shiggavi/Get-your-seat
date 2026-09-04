const express = require("express");

const {
  registerCounsellor,
} = require("../controllers/counsellorAuthController");

const router = express.Router();

// Counsellor registration
router.post(
  "/register",
  registerCounsellor
);

module.exports = router;