const express = require('express');
// const verifyAuthorization = require('../utils/verifyAuthorization');

const router = express.Router();

const authController = require('../controllers/authController');
const verifyAuthorization = require('../passport/verifyAuthorization');

// Login user
router.post('/', authController.login);

// Test route
router.get('/test', verifyAuthorization, (req, res) => res.send());

module.exports = router;
