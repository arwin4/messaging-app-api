const express = require('express');

const router = express.Router();

const friendController = require('../controllers/friendController');
const verifyAuthorization = require('../passport/verifyAuthorization');

// Add friends to current user
router.patch('/', verifyAuthorization, friendController.addFriend);

// Delete a friend of current user
router.delete('/', verifyAuthorization, friendController.deleteFriend);

module.exports = router;
