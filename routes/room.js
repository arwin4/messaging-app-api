const express = require('express');

const router = express.Router();

const roomController = require('../controllers/roomController');
const verifyAuthorization = require('../passport/verifyAuthorization');

// Create room. Creator will be added to the room's members on creation.
router.post('/', verifyAuthorization, roomController.createRoom);

module.exports = router;
