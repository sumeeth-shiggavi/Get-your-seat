const express = require("express");

const {
  predictColleges,
} = require("../controllers/predictorController");

const router = express.Router();

// =====================================================
// PUBLIC COLLEGE PREDICTOR
// =====================================================

// Predict colleges based on rank / exam details
router.post(
  "/",
  predictColleges
);

module.exports = router;