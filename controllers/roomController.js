const asyncHandler = require('express-async-handler');
const findUser = require('../utils/findUser');
const Room = require('../models/room');

exports.getUserRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const rooms = await Room.find({ members: userId }).select(
    'dateCreated members',
  );

  return res.send({ rooms });
});

exports.createRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { username } = req.user;

  // Check whether requesting user still exists
  const user = await findUser(username);
  if (!user)
    return res.status(404).send({
      errors: [{ title: 'The user creating this room was not found' }],
    });

  const newRoom = new Room({
    dateCreated: Date.now(),
    members: [],
    messages: [],
  });

  newRoom.members.push(userId);

  try {
    await newRoom.save();
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }

  return res.send(newRoom);
});

exports.getRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { roomId } = req.params;

  try {
    const room = await Room.findOne({
      _id: roomId,
      members: userId,
    });

    if (!room)
      return res.status(400).send({
        errors: [
          {
            title: 'The room does not exist or you are not a member of it.',
          },
        ],
      });

    return res.send(room);
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});
