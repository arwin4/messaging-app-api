const asyncHandler = require('express-async-handler');
const findUser = require('../utils/findUser');
const Room = require('../models/room');
const getAuthorizedRoom = require('../utils/getAuthorizedRoom');
const handleBadRoomRequest = require('../utils/handleBadRoomRequest');

exports.getUserRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const rooms = await Room.find({ members: userId }).select(
      'dateCreated members',
    );

    return res.send({ rooms });
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
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
    return res.send(newRoom);
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});

exports.getRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { roomId } = req.params;

  try {
    const room = await getAuthorizedRoom(roomId, userId, res);
    if (!room) return handleBadRoomRequest(res);

    return res.send(room);
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});

exports.deleteRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { roomId } = req.params;

  try {
    const room = await getAuthorizedRoom(roomId, userId);
    if (!room) return handleBadRoomRequest(res);

    await room.deleteOne();
    return res.send();
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});

exports.addMembers = asyncHandler(async (req, res) => {
  const { newMembers } = req.body;
  const { roomId } = req.params;
  const userId = req.user._id.toString();

  try {
    const room = await getAuthorizedRoom(roomId, userId, res);
    if (!room) return handleBadRoomRequest(res);

    newMembers.forEach((newMember) => {
      if (!room.members.includes(newMember)) room.members.push(newMember);
    });

    await room.save();

    const { members } = room;
    return res.send({ members });
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});

exports.deleteMembers = asyncHandler(async (req, res) => {
  const { membersToDelete } = req.body;
  const { roomId } = req.params;
  const userId = req.user._id.toString();

  try {
    const room = await getAuthorizedRoom(roomId, userId, res);
    if (!room) return handleBadRoomRequest(res);

    const updatedMemberList = room.members.filter((member) => {
      const memberString = member.toString();
      return !membersToDelete.includes(memberString);
    });

    // Prevent ghost rooms
    if (updatedMemberList.length < 1)
      return res.status(400).send({
        errors: [
          {
            title:
              'This request would remove all members from the room, but rooms must have at least one member.',
          },
        ],
      });

    room.members = updatedMemberList;
    await room.save();

    const { members } = room;
    return res.send({ members });
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});
