const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

// Get username
router.get('/:username', userController.getUser);

// Sign up
router.post('/', userController.signUp);

module.exports = router;
