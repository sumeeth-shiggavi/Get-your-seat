const express = require("express");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const router = express.Router();


// Get profile
router.get("/:user_id", getProfile);


// Update profile
router.put("/:user_id", updateProfile);


module.exports = router;