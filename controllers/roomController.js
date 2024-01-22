const asyncHandler = require('express-async-handler');
const findUser = require('../utils/findUser');
const Room = require('../models/room');
const getAuthorizedRoom = require('../utils/getAuthorizedRoom');
const handleBadRoomRequest = require('../utils/handleBadRoomRequest');

exports.getUserRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const rooms = await Room.find({ members: userId })
      .select('dateCreated members isGroup')
      .populate('members', 'username');
    // .populate('messages.author', 'username');

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
    isGroup: false,
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
    // Find the room. Populate the members of the room and the messages'
    // authors. For members/authors, include only usernames to prevent leaking
    // data.
    const room = await Room.findOne({
      _id: roomId,
      members: userId,
    })
      .populate('members', 'username')
      .populate('messages.author', 'username');

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

exports.getDuo = asyncHandler(async (req, res) => {
  // TODO: add try..catch
  const currentUserId = req.user._id;
  const otherParticipantUsername = req.params.username;

  // Find the non-group rooms that the current user is in
  const userRooms = await Room.find()
    .where('members', currentUserId)
    .where('isGroup', false)
    .select('members') // Pick relevant data
    .populate('members', 'username');

  // From the user's rooms, find the room that the other participant is also in
  const duoRoom = userRooms.find((room) =>
    room.members.some((member) => member.username === otherParticipantUsername),
  );

  if (!duoRoom) {
    // The room was not found, but 404 is not appropriate, since there is no
    // error here. There's no duo room with these users and that's valid.
    return res.status(204).send();
  }
  return res.send(duoRoom);
});

exports.convertToGroup = asyncHandler(async (req, res) => {
  // Groups cannot be converted back to duo rooms, because there must only be a
  // maximum of 1 conversation between the same users.
  const userId = req.user._id.toString();
  const { roomId } = req.params;

  try {
    const room = await getAuthorizedRoom(roomId, userId);
    if (!room) return handleBadRoomRequest(res);

    room.isGroup = true;
    await room.save();
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

    // Ensure non-group rooms are restricted to a 2 member maximum
    if (
      !room.isGroup &&
      (room.members.length === 2 ||
        (room.members.length === 1 && newMembers.length > 1))
    ) {
      return res.status(400).send({
        errors: [
          {
            title:
              'Cannot add members because it would exceed the maximum of 2 members for non-group rooms.',
          },
        ],
      });
    }

    // Ensure only 1 non-group conversation exists per duo. Only need to check
    // this if there's just 1 member being added, because group rooms have no
    // member limits.
    if (newMembers.length === 1) {
      // Find the non-group rooms that the current user is in
      const userRooms = await Room.find()
        .where('members', userId)
        .where('isGroup', false)
        .select('members') // Pick relevant data
        .populate('members', 'username');

      // Check whether there already is a non-group with the new member also in it
      const newMember = newMembers[0];
      const duoRoomExistsAlready = userRooms.find((curRoom) =>
        curRoom.members.some((member) => member._id.toString() === newMember),
      );

      if (duoRoomExistsAlready) {
        return res.status(409).send({
          errors: [
            {
              title:
                'Cannot add member, because a non-group room with these same members exists already.',
            },
          ],
        });
      }
    }

    // Add members, ignoring duplicates
    newMembers.forEach((newMember) => {
      if (!room.members.includes(newMember)) room.members.push(newMember);
    });

    await room.save();

    // const { members } = room;
    // const filteredRoom = { _id: room._id, members: room.members}
    return res.send(room);
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
