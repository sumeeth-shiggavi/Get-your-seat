const express = require("express");

const {
  getCollegeDetails,
} = require("../controllers/collegeDetailsController");

const router = express.Router();

router.get("/:id", getCollegeDetails);

module.exports = router;