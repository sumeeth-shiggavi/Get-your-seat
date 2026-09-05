const express = require("express");

const {
  getCollegeDetails,
} = require("../controllers/collegeDetailsController");

const router = express.Router();

// =====================================================
// PUBLIC COLLEGE DETAILS ROUTE
// =====================================================

// Get details of a specific college
router.get(
  "/:id",
  getCollegeDetails
);

module.exports = router;