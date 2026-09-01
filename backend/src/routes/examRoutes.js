const express = require("express");
const { getExams } = require("../controllers/examController");

const router = express.Router();

router.get("/", getExams);

module.exports = router;