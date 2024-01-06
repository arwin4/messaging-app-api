const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');
const verifyAuthorization = require('../passport/verifyAuthorization');

// Get user
router.get('/:username', verifyAuthorization, userController.getUser);

// Get current user's info
router.get('/', verifyAuthorization, userController.getCurrentUser);

// Sign up
router.post('/', userController.signUp);

module.exports = router;
