const express = require("express");

const {
  getCounsellors,
  getCounsellorById,
} = require("../controllers/counsellorController");

const router = express.Router();

// =====================================================
// PUBLIC COUNSELLOR ROUTES
// =====================================================

// Get all verified counsellors
// GET /api/counsellors
router.get(
  "/",
  getCounsellors
);

// Get one verified counsellor
// GET /api/counsellors/:id
router.get(
  "/:id",
  getCounsellorById
);

module.exports = router;