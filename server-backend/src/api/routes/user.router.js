const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controllers');

router.post('/', userController.getUserInfo);

module.exports = router;