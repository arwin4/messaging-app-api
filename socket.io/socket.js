/* eslint-disable no-console */
const { Server } = require('socket.io');
const Room = require('../models/room');
const User = require('../models/user');

function startSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
    },
  });

  io.on('connect', (socket) => {
    console.log('Someone connected to socket.');

    socket.on('join-room', (room) => {
      console.log('Someone joined a room.');
      // Let client join room, but only if they have not been added already
      if (socket.rooms.size === 1) {
        socket.join(room);
      }
    });
  });

  function handleRoomDeleted(roomId) {
    io.to(roomId).emit('room-deleted');
  }

  function handleMembersChanged(roomId) {
    io.to(roomId).emit('members-changed');
  }

  async function handleNewMessage(updatedFields, roomId) {
    // Deconstruct the message from the updatedFields
    const { __v, ...nestedMessage } = updatedFields;

    // If there are no messages yet, mongoose passes an array with the new
    // message in it, so we must deconstruct it slightly differently
    const newMessage = updatedFields.messages
      ? Object.values(nestedMessage)[0]
      : Object.values(nestedMessage);

    // Prepare the data to be emitted
    // 'Populate' the author username manually
    const authorId = newMessage[0].author.toString();
    const author = await User.findById(authorId);
    const { username } = author;

    const { dateCreated, content } = newMessage[0];
    const _id = newMessage[0]._id.toString();

    // Emit message to room
    io.to(roomId).emit('new-message', {
      dateCreated,
      author: { _id: authorId, username },
      content,
      _id,
    });
    console.log(`Emitted new message to room ${roomId}`);
  }

  // Watch the rooms in the database and act accordingly to changes
  Room.watch().on('change', async (data) => {
    const roomId = data.documentKey._id.toString();

    // The room was deleted. This check must happen first because it checks for
    // an undefined updateDescription.
    if (data.updateDescription === undefined) {
      handleRoomDeleted(roomId);
      return;
    }

    // The members have changed
    const { updatedFields } = data.updateDescription;
    if (Object.keys(updatedFields).toString().match('members')) {
      handleMembersChanged(roomId);
      return;
    }

    // Safeguard against possible other changes that might occur. The message
    // handler won't be able to process that.
    if (!Object.keys(updatedFields).toString().match('message')) return;

    // Received new mesage
    handleNewMessage(updatedFields, roomId);
  });
}

console.log('Socket.io server started.');

module.exports = startSocket;
