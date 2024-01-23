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

  console.log('Socket.io server started.');

  io.on('connect', (socket) => {
    console.log('Someone connected to socket.');

    socket.on('join-room', (room) => {
      console.log('Someone joined a room.');
      // Let client join room, but only if they have not been added already
      if (socket.rooms.size === 1) {
        socket.join(room);
      }
    });

    socket.on('listen-for-messages', () => {
      // Watch the database, emit new messages in this room.
      // NOTE: This won't scale well: the watch function watches ALL rooms.
      Room.watch().on('change', async (data) => {
        /* Ignore change if any of these 3 things are the case */
        // The change didn't happen in this room
        const roomId = data.documentKey._id.toString();
        if (!Array.from(socket.rooms).includes(roomId)) return;
        // The room no longer exists
        if (data.updateDescription === undefined) return;
        // The change is not a message (for example, the member list changed)
        const { updatedFields } = data.updateDescription;
        if (!Object.keys(updatedFields).toString().match('message')) return;

        // Deconstruct the message from the updatedFields
        const { __v, ...nestedMessage } = updatedFields;

        // If there are no messages yet, mongoose passes an array with the new
        // message in it
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
      });
    });
  });
}

module.exports = startSocket;
