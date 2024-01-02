const express = require('express');
// const verifyAuthorization = require('../utils/verifyAuthorization');

const router = express.Router();

const authController = require('../controllers/authController');

// Login user
router.post('/', authController.login);

// Test route
// router.get('/protected', verifyAuthorization, (req, res) =>
//   res.status(200).send('youre in'),
// );

module.exports = router;
