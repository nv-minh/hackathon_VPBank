const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile_applications");

router.post("/", profileController.createProfileApplication);

module.exports = router;
