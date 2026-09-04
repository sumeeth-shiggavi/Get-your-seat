const express = require("express");

const {
  changePassword,
} = require("../controllers/passwordController");

const router = express.Router();


// Change password
router.put(
  "/:user_id",
  changePassword
);


module.exports = router;