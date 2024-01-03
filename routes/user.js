const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');
const verifyAuthorization = require('../passport/verifyAuthorization');

// Get username
router.get('/:username', verifyAuthorization, userController.getUser);

// Sign up
router.post('/', userController.signUp);

module.exports = router;
