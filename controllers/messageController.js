const asyncHandler = require('express-async-handler');
const getAuthorizedRoom = require('../utils/getAuthorizedRoom');
const handleBadRoomRequest = require('../utils/handleBadRoomRequest');

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

exports.sendMessage = asyncHandler(async (req, res) => {
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

    return res.send({ message });
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});

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
