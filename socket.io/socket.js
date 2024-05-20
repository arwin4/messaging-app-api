/* eslint-disable no-console */
const { Server } = require('socket.io');
const Room = require('../models/room');
const User = require('../models/user');

let resumeToken;

function startSocket(httpServer) {
  console.log('Starting socket.io server');

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
    },
  });

  io.on('connect', (socket) => {
    console.log('Someone connected to socket.');

    socket.on('join-room', (room) => {
      console.log('Someone joined room', room);
      // Let client join room, but only if they have not been added already
      if (socket.rooms.size === 1) {
        socket.join(room);
      }
    });
  });

  /**
   * Connect each user to their own private room. Any non-room-specific changes
   * are emitted to it.
   *
   * NOTE: there is no authorization here! A client could request to join any
   * arbitrary user's private socket room using another user's id, allowing them
   * to spy on anything transmitted to that user.
   */
  const userIo = io.of('/user');
  userIo.on('connect', (socket) => {
    socket.on('join-user-room', (userId) => {
      console.log('Someone joined user room', userId);
      socket.join(userId);
    });
  });

  function handleRoomUpdate(roomId, data) {
    async function emitNewMessage(updatedFields, localRoomId) {
      console.log('Handling new message in', roomId);
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
    }

    function emitMembersChanged(members, localRoomId) {
      console.log('Handling member change in', roomId);
      // Emit to users
      members.forEach((member) => {
        userIo.to(member.toString()).emit('rooms-changed');
      });

      // Emit to room
      io.to(localRoomId).emit('members-changed');
    }

    function emitClearMessages(localRoomId) {
      console.log('Handling message clear in', roomId);
      io.to(localRoomId).emit('messages-cleared');
    }

    // Detect the type of update
    console.log('Detecting type of room update...');
    const { updatedFields } = data.updateDescription;
    if (Object.keys(updatedFields).toString().match('members')) {
      console.log('Detected members change in', roomId);
      const { members } = data.fullDocument;
      emitMembersChanged(members, roomId);
    } else if (
      Object.entries(updatedFields).some(
        ([key, value]) => key === 'messages' && value.length === 0,
      )
    ) {
      console.log('Messages were cleared in', roomId);
      emitClearMessages(roomId);
    } else if (Object.keys(updatedFields).toString().match('message')) {
      console.log('New message received in', roomId);
      emitNewMessage(updatedFields, roomId);
    }

    // Other cases may occur that are not matched by these conditionals, but
    // these don't need to be emitted.
  }

  function handleRoomDeletion(roomId, data) {
    console.log('Handling room deletion', roomId);
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

  // Watch the rooms in the database and act accordingly to changes
  function watchRooms() {
    const changeStream = Room.watch([], {
      fullDocumentBeforeChange: 'whenAvailable',
      fullDocument: 'updateLookup',
    });

    changeStream.on('change', async (data) => {
      const roomId = data.documentKey._id.toString();
      // Detect type of change to room document
      console.log('Detecting type of room change...');
      switch (data.operationType) {
        case 'delete':
          console.log('Room was deleted', roomId);
          handleRoomDeletion(roomId, data);
          break;
        case 'update':
          console.log('Room was updated', roomId);
          handleRoomUpdate(roomId, data);
          break;
        // Other types of changes need not be handled
        // 'insert' need not be handled; it will be followed by an update event
        default:
          console.log('A different type of change occurred.');
          break;
      }
    });

    changeStream.once('close', async () => {
      console.log(
        'Close event detected in change stream. Closing current stream.',
      );
      changeStream.close();
      watchRooms();
    });

    console.log('Started watching rooms.');
  }

  watchRooms();
}

console.log('Socket.io server started.');

module.exports = startSocket;
