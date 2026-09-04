const express = require("express");

const {
  getCounsellors,
} = require("../controllers/counsellorController");

const router = express.Router();

router.get("/", getCounsellors);

module.exports = router;