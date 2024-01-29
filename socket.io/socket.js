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

  // TODO: authentication?

  // Connect each user to their own private room. Any non-room-specific changes
  // are emitted to it.
  const userIo = io.of('/user');
  userIo.on('connect', (socket) => {
    socket.on('join-user-room', (userId) => {
      socket.join(userId);
    });
  });

  function handleRoomDeletion(roomId, data) {
    // Emit to users
    const documentBeforeChange = data.fullDocumentBeforeChange;
    const { members } = documentBeforeChange;
    const memberStrings = members.map((member) => member.toString());
    memberStrings.forEach((member) => {
      userIo.to(member).emit('rooms-changed');
    });

    // Emit to room
    io.to(roomId).emit('room-deleted');
  }

  function handleRoomUpdate(roomId, data) {
    async function emitNewMessage(updatedFields, localRoomId) {
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
      io.to(localRoomId).emit('new-message', {
        dateCreated,
        author: { _id: authorId, username },
        content,
        _id,
      });
      console.log(`Emitted new message to room ${localRoomId}`);
    }

    function handleMembersChanged(members, localRoomId) {
      // Emit to users
      members.forEach((member) => {
        userIo.to(member.toString()).emit('rooms-changed');
      });

      // Emit to room
      io.to(localRoomId).emit('members-changed');
    }

    // Detect the type of update
    const { updatedFields } = data.updateDescription;
    if (Object.keys(updatedFields).toString().match('members')) {
      // The members have changed
      const { members } = data.fullDocument;
      handleMembersChanged(members, roomId);
    } else if (Object.keys(updatedFields).toString().match('message')) {
      // Received new mesage
      emitNewMessage(updatedFields, roomId);
    }

    // Other cases may occur that are not triggered by these conditionals, but
    // they are safe to leave unhandled.
  }

  // Watch the rooms in the database and act accordingly to changes
  Room.watch([], {
    fullDocumentBeforeChange: 'required',
    fullDocument: 'whenAvailable',
  }).on('change', async (data) => {
    const roomId = data.documentKey._id.toString();
    // Detect type of change to room document
    switch (data.operationType) {
      case 'delete':
        handleRoomDeletion(roomId, data);
        break;
      case 'update':
        handleRoomUpdate(roomId, data);
        break;
      // Other types of changes need not be handled
      // 'insert' need not be handled; it will be followed by an update event
      default:
        break;
    }
  });
}

console.log('Socket.io server started.');

module.exports = startSocket;
