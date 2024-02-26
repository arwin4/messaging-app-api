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

// The Count bot. Respond with a bot message if 'The Count' is present in the room.
async function runTheCountBot(room, userId) {
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
    let countMessageContent;
    if (messagesNotByTheCount === 3) {
      countMessageContent = '3! Ah ah ah!!';
    } else {
      countMessageContent = `${messagesNotByTheCount}!`;
    }

    const countMessage = {
      dateCreated: Date.now(),
      author: theCountUserId,
      content: {
        isText: true,
        isImage: false,
        textContent: countMessageContent,
      },
    };

    room.messages.push(countMessage);

    // Delay slightly for visual clarity
    await sleep(500);
    await room.save();
  }
}

exports.sendMessage = [
  checkSchema(messageSchema),

  asyncHandler(async (req, res, next) => {
    respondOnValidationError(req, res, next);
  }),

  asyncHandler(async (req, res) => {
    const { isText, isImage, textContent, imageUrl } = req.body;
    const { roomId } = req.params;
    const userId = req.user._id.toString();

    if ((!isText && !isImage) || (isText && isImage)) {
      return res.status(400).send({
        errors: [{ title: 'Exactly one of isText and isImage must be true' }],
      });
    }

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

      runTheCountBot(room, userId);

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
