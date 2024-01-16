const express = require('express');

const router = express.Router();

const roomController = require('../controllers/roomController');
const messageController = require('../controllers/messageController');
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

// Convert room to group room
router.patch(
  '/:roomId/convert-to-group',
  verifyAuthorization,
  roomController.convertToGroup,
);

/* Members */
// Add members
router.patch(
  '/:roomId/members',
  verifyAuthorization,
  roomController.addMembers,
);

// Delete members
router.delete(
  '/:roomId/members',
  verifyAuthorization,
  roomController.deleteMembers,
);

/* Messages */
// Get messages
router.get(
  '/:roomId/messages',
  verifyAuthorization,
  messageController.getMessages,
);

// Send message
router.post(
  '/:roomId/messages',
  verifyAuthorization,
  messageController.sendMessage,
);

// Delete all messages in a room, regardless of author
router.delete(
  '/:roomId/messages',
  verifyAuthorization,
  messageController.deleteMessages,
);

module.exports = router;
