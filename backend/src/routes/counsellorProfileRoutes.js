const express = require("express");

const {
  getCounsellorProfile,
  updateCounsellorProfile,
} = require("../controllers/counsellorProfileController");

const router = express.Router();

// GET counsellor profile
router.get(
  "/:user_id",
  getCounsellorProfile
);

// UPDATE counsellor profile
router.put(
  "/:user_id",
  updateCounsellorProfile
);

module.exports = router;