const asyncHandler = require('express-async-handler');
const findUser = require('../utils/findUser');

exports.addFriend = asyncHandler(async (req, res) => {
  const { newFriend } = req.body;

  const newFriendExists = await findUser(newFriend);
  if (!newFriendExists) {
    return res
      .status(404)
      .send({ errors: [{ title: 'This user does not exist.' }] });
  }

  const currentUser = await findUser(req.user.username);
  const { friends } = currentUser;

  if (currentUser.username === newFriend) {
    return res
      .status(400)
      .send({ errors: [{ title: 'You cannot add yourself as a friend.' }] });
  }

  if (friends.includes(newFriend)) {
    return res
      .status(400)
      .send({ errors: [{ title: 'This user is already your friend.' }] });
  }

  currentUser.friends.push(newFriend);
  await currentUser.save();

  return res.send({ friends: currentUser.friends });
});

exports.deleteFriend = asyncHandler(async (req, res) => {
  const { friendToDelete } = req.body;
});
