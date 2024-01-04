const express = require('express');

const router = express.Router();

const roomController = require('../controllers/roomController');
const verifyAuthorization = require('../passport/verifyAuthorization');

// Get rooms of which user is member. Does not include messages.
router.get('/', verifyAuthorization, roomController.getUserRooms);

// Create room. Creator will be added to the room's members on creation.
router.post('/', verifyAuthorization, roomController.createRoom);

/* Rooms by ID */
// Get room by ID
router.get('/:roomId', verifyAuthorization, roomController.getRoom);

// Delete room by ID
router.delete('/:roomId', verifyAuthorization, roomController.deleteRoom);

/* Members */
router.patch('/:roomId', verifyAuthorization, roomController.addMembers);

module.exports = router;
