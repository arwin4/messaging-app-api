const asyncHandler = require('express-async-handler');
const { checkSchema } = require('express-validator');
const getAuthorizedRoom = require('../utils/getAuthorizedRoom');
const handleBadRoomRequest = require('../utils/handleBadRoomRequest');
const sleep = require('../utils/sleep');
const messageSchema = require('../express-validator-schemas/message');
const respondOnValidationError = require('../utils/respondOnValidationError');

exports.getMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id.toString();

  try {
    const room = await getAuthorizedRoom(roomId, userId, res);
    if (!room) return handleBadRoomRequest(res);

    const { messages } = room;

    return res.send({ messages });
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});

exports.sendMessage = [
  checkSchema(messageSchema),

  asyncHandler(async (req, res, next) => {
    respondOnValidationError(req, res, next);
  }),

  asyncHandler(async (req, res) => {
    const { isText, isImage, textContent, imageUrl } = req.body;
    const { roomId } = req.params;
    const userId = req.user._id.toString();

    try {
      const room = await getAuthorizedRoom(roomId, userId, res);
      if (!room) return handleBadRoomRequest(res);

      const message = {
        dateCreated: Date.now(),
        author: req.user._id,
        content: {
          isText: !!isText,
          isImage: !!isImage,
          textContent,
          imageUrl,
        },
      };

      room.messages.push(message);

      await room.save();

      // The Count bot. Respond with a bot message if 'The Count' is present in the room.
      const theCountUserId = '65a3ca1d625894cbba68610e';

      // The second condition prevents The Count from responding to its own messages
      if (room.members.includes(theCountUserId) && userId !== theCountUserId) {
        // Calculate count
        const totalMessagesInRoom = room.messages.length;
        const messagesByTheCount = room.messages.filter(
          (curMessage) => curMessage.author.toString() === theCountUserId,
        ).length;
        const messagesNotByTheCount = totalMessagesInRoom - messagesByTheCount;

        // Compose message
        let countMessage;
        if (messagesNotByTheCount === 3) {
          countMessage = '3! Ah ah ah!!';
        } else {
          countMessage = `${messagesNotByTheCount}!`;
        }

        const newReq = {
          body: {
            isText: true,
            isImage: false,
            textContent: countMessage,
          },
          user: {
            _id: theCountUserId,
          },
          params: {
            roomId,
          },
        };

        await sleep(500);

        return this.sendMessage(newReq, res);
      }

      return res.send({ message });
    } catch (error) {
      return res.status(500).send({ errors: [{ title: 'Database error' }] });
    }
  }),
];

exports.deleteMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id.toString();

  try {
    const room = await getAuthorizedRoom(roomId, userId, res);
    if (!room) return handleBadRoomRequest(res);

    room.messages = [];

    await room.save();

    const { messages } = room;
    return res.send({ messages });
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});
