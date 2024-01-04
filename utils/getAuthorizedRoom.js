const Room = require('../models/room');

// Get a room by ID
// Only members of the room are authorized.
async function getAuthorizedRoom(roomId, userId) {
  const room = await Room.findOne({
    _id: roomId,
    members: userId,
  });

  return room;
}

module.exports = getAuthorizedRoom;
