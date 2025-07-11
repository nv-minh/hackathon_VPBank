const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applications.controllers');

router.post('/', applicationsController.createApplication);

module.exports = router;